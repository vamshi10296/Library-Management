/**
 * Dashboard Controller
 * Aggregates real MongoDB statistics for Member and Admin dashboards.
 */
const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const { calculateOverdueDays, calculateFine } = require('../utils/fineCalculator');

// GET /dashboard - Role-based router for dashboard
exports.getDashboard = (req, res) => {
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  return exports.getMemberDashboard(req, res);
};

// GET /dashboard (Member Dashboard View)
exports.getMemberDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const now = new Date();

    // 1. Calculate Real Member Statistics
    const currentlyBorrowedCount = await Borrow.countDocuments({
      user: userId,
      status: 'Issued'
    });

    const totalAvailableBooks = await Book.countDocuments({
      availableCopies: { $gt: 0 }
    });

    const overdueCount = await Borrow.countDocuments({
      user: userId,
      status: 'Issued',
      dueDate: { $lt: now }
    });

    const totalBorrowedCount = await Borrow.countDocuments({
      user: userId
    });

    // 2. Fetch Active Borrow Records with Live Fine Calculation
    const activeBorrows = await Borrow.find({
      user: userId,
      status: 'Issued'
    }).populate('book').sort({ dueDate: 1 });

    const currentBooks = activeBorrows.map(borrow => {
      const overdueDays = calculateOverdueDays(borrow.dueDate, now);
      const currentFine = calculateFine(borrow.dueDate, now);
      return {
        ...borrow.toObject(),
        overdueDays,
        currentFine,
        isOverdue: overdueDays > 0
      };
    });

    // 3. Books Due Soon (within the next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const dueSoonBooks = currentBooks.filter(item => {
      const due = new Date(item.dueDate);
      return due >= now && due <= threeDaysFromNow;
    });

    // 4. Overdue Books
    const overdueBooks = currentBooks.filter(item => item.isOverdue);

    // 5. Recently Added Books (latest 4)
    const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(4);

    res.render('member/dashboard', {
      pageTitle: 'Member Dashboard - Library Management',
      user: req.session.user,
      stats: {
        currentlyBorrowed: currentlyBorrowedCount,
        availableBooks: totalAvailableBooks,
        overdueBooks: overdueCount,
        totalBorrowed: totalBorrowedCount
      },
      currentBooks,
      dueSoonBooks,
      overdueBooks,
      recentBooks
    });
  } catch (error) {
    console.error('Error fetching member dashboard:', error);
    req.flash('error', 'Unable to load member dashboard.');
    res.status(500).render('errors/500', {
      pageTitle: 'Server Error',
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};

// GET /admin/dashboard (Admin Dashboard View)
exports.getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    // 1. Core Statistics
    const [totalBooks, totalMembers, issuedBooks, overdueBooks] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'member' }),
      Borrow.countDocuments({ status: 'Issued' }),
      Borrow.countDocuments({ status: 'Issued', dueDate: { $lt: now } })
    ]);

    // 2. Most Borrowed Books (Aggregation Pipeline)
    const mostBorrowedAgg = await Borrow.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populate book details for aggregated results
    const mostBorrowedBooks = await Promise.all(
      mostBorrowedAgg.map(async (item) => {
        const bookDetails = await Book.findById(item._id);
        return {
          book: bookDetails,
          borrowCount: item.count
        };
      })
    );

    // 3. Recent Borrowing Activity (Latest 6 records)
    const recentActivityRaw = await Borrow.find()
      .populate('user', 'name email')
      .populate('book', 'title author category')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentActivity = recentActivityRaw.map(record => {
      const overdueDays = record.status === 'Issued' ? calculateOverdueDays(record.dueDate, now) : 0;
      const currentFine = record.status === 'Issued' ? calculateFine(record.dueDate, now) : record.fine;
      return {
        ...record.toObject(),
        overdueDays,
        liveFine: currentFine
      };
    });

    // 4. Low Availability Books (Copies <= 2)
    const lowStockBooks = await Book.find({
      availableCopies: { $lte: 2 }
    }).sort({ availableCopies: 1 }).limit(5);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - Library Management',
      user: req.session.user,
      stats: {
        totalBooks,
        totalMembers,
        issuedBooks,
        overdueBooks
      },
      mostBorrowedBooks: mostBorrowedBooks.filter(item => item.book !== null),
      recentActivity,
      lowStockBooks
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    req.flash('error', 'Unable to load admin dashboard.');
    res.status(500).render('errors/500', {
      pageTitle: 'Server Error',
      message: 'Failed to retrieve admin dashboard metrics.'
    });
  }
};
