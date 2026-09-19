/**
 * Borrow Controller
 * Handles book borrowing (issue), book returning, fine calculation,
 * and member / admin lending audit trails.
 */
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const {
  MAX_BOOKS_PER_MEMBER,
  BORROW_DAYS,
  calculateOverdueDays,
  calculateFine
} = require('../utils/fineCalculator');

// POST /books/:id/issue - Issue a book to a library member
exports.issueBook = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.user.id;

  try {
    // 1. Find book
    const book = await Book.findById(bookId);
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }

    // 2. Check available copies
    if (book.availableCopies <= 0) {
      req.flash('error', 'This book is currently unavailable.');
      return res.redirect(`/books/${bookId}`);
    }

    // 3. Check member active borrowing limit (Max 3)
    const activeBorrowCount = await Borrow.countDocuments({
      user: userId,
      status: 'Issued'
    });

    if (activeBorrowCount >= MAX_BOOKS_PER_MEMBER) {
      req.flash('error', 'You have reached your maximum borrowing limit.');
      return res.redirect(`/books/${bookId}`);
    }

    // 4. Check if member has already borrowed this specific book
    const duplicateBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: 'Issued'
    });

    if (duplicateBorrow) {
      req.flash('error', 'You have already borrowed this book.');
      return res.redirect(`/books/${bookId}`);
    }

    // 5. Atomic decrement of available copies (prevents race conditions)
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      req.flash('error', 'This book is currently unavailable.');
      return res.redirect(`/books/${bookId}`);
    }

    // 6. Calculate Due Date (Issue Date + 14 days)
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    // 7. Create Borrow Record
    const borrowRecord = new Borrow({
      user: userId,
      book: bookId,
      issueDate,
      dueDate,
      status: 'Issued',
      fine: 0
    });

    await borrowRecord.save();

    req.flash('success', `Book issued successfully. Please return by ${dueDate.toLocaleDateString('en-GB')}.`);
    return res.redirect('/my-books');
  } catch (error) {
    console.error('Error issuing book:', error);
    req.flash('error', 'An error occurred while issuing the book.');
    return res.redirect(`/books/${bookId}`);
  }
};

// POST /borrow/:id/return - Return a borrowed book and compute fine
exports.returnBook = async (req, res) => {
  const borrowId = req.params.id;
  const currentUser = req.session.user;

  try {
    const borrow = await Borrow.findById(borrowId).populate('book');
    if (!borrow) {
      req.flash('error', 'Borrow record not found.');
      return res.redirect('/dashboard');
    }

    // Ensure book is not already returned
    if (borrow.status === 'Returned') {
      req.flash('warning', 'This book has already been returned.');
      return res.redirect(currentUser.role === 'admin' ? '/admin/borrow-records' : '/my-books');
    }

    // Authorization: Member can only return their own books; Admins can process any return
    if (currentUser.role !== 'admin' && borrow.user.toString() !== currentUser.id) {
      req.flash('error', 'Unauthorized to return this book.');
      return res.redirect('/my-books');
    }

    const returnDate = new Date();
    const overdueDays = calculateOverdueDays(borrow.dueDate, returnDate);
    const fine = calculateFine(borrow.dueDate, returnDate);

    // Update Borrow Record
    borrow.returnDate = returnDate;
    borrow.status = 'Returned';
    borrow.fine = fine;
    await borrow.save();

    // Increment available copies safely (not exceeding totalCopies)
    await Book.findOneAndUpdate(
      { _id: borrow.book._id, availableCopies: { $lt: borrow.book.totalCopies } },
      { $inc: { availableCopies: 1 } }
    );

    if (fine > 0) {
      req.flash('warning', `Book returned successfully. Overdue by ${overdueDays} day(s). Late fine applied: ₹${fine}.`);
    } else {
      req.flash('success', 'Book returned successfully on time. Thank you!');
    }

    if (currentUser.role === 'admin') {
      return res.redirect('/admin/borrow-records');
    }
    return res.redirect('/my-books');
  } catch (error) {
    console.error('Error returning book:', error);
    req.flash('error', 'An error occurred while returning the book.');
    return res.redirect('/dashboard');
  }
};

// GET /my-books - Member's borrowing history and current active books
exports.getMyBooks = async (req, res) => {
  const userId = req.session.user.id;
  const now = new Date();

  try {
    const records = await Borrow.find({ user: userId })
      .populate('book')
      .sort({ createdAt: -1 });

    const activeBorrows = [];
    const returnedBorrows = [];

    records.forEach(item => {
      const plain = item.toObject();
      if (item.status === 'Issued') {
        plain.overdueDays = calculateOverdueDays(item.dueDate, now);
        plain.currentFine = calculateFine(item.dueDate, now);
        plain.isOverdue = plain.overdueDays > 0;
        activeBorrows.push(plain);
      } else {
        returnedBorrows.push(plain);
      }
    });

    res.render('member/my-books', {
      pageTitle: 'My Borrowed Books - Library Management',
      activeBorrows,
      returnedBorrows
    });
  } catch (error) {
    console.error('Error fetching member books:', error);
    req.flash('error', 'Unable to retrieve your borrowing records.');
    res.redirect('/dashboard');
  }
};

// GET /admin/members - View all registered members
exports.getAdminMembers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'member' };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const members = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach currently active borrowed books count to each member
    const membersWithData = await Promise.all(
      members.map(async (member) => {
        const activeBorrowsCount = await Borrow.countDocuments({
          user: member._id,
          status: 'Issued'
        });
        return {
          ...member.toObject(),
          activeBorrowsCount,
          accountStatus: 'Active'
        };
      })
    );

    res.render('admin/members', {
      pageTitle: 'Manage Members - Admin Panel',
      members: membersWithData,
      searchQuery: search || ''
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    req.flash('error', 'Unable to retrieve members list.');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/borrow-records - View all circulation records with filters
exports.getAdminBorrowRecords = async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();
    let query = {};

    if (filter === 'issued') {
      query.status = 'Issued';
    } else if (filter === 'returned') {
      query.status = 'Returned';
    } else if (filter === 'overdue') {
      query.status = 'Issued';
      query.dueDate = { $lt: now };
    }

    const recordsRaw = await Borrow.find(query)
      .populate('user', 'name email')
      .populate('book', 'title author isbn category')
      .sort({ createdAt: -1 });

    const records = recordsRaw.map(record => {
      const plain = record.toObject();
      if (record.status === 'Issued') {
        plain.overdueDays = calculateOverdueDays(record.dueDate, now);
        plain.liveFine = calculateFine(record.dueDate, now);
        plain.isOverdue = plain.overdueDays > 0;
      } else {
        plain.liveFine = record.fine;
        plain.isOverdue = false;
      }
      return plain;
    });

    res.render('admin/borrow-records', {
      pageTitle: 'Borrow Records & Circulation Audit - Admin Panel',
      records,
      activeFilter: filter || 'all'
    });
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    req.flash('error', 'Unable to load borrow records.');
    res.redirect('/admin/dashboard');
  }
};
