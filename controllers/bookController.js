/**
 * Book Controller
 * Handles book catalogue browsing, searching, filtering, and Admin CRUD operations.
 */
const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

// Helper to determine book availability status badge
const getBookStatus = (availableCopies) => {
  if (availableCopies === 0) return { label: 'Out of Stock', class: 'badge-danger' };
  if (availableCopies <= 2) return { label: 'Low Stock', class: 'badge-warning' };
  return { label: 'Available', class: 'badge-success' };
};

// GET /books - Public / Member Book Catalogue with Search & Filter
exports.getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Filter by category if selected
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title, author, or ISBN
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex }
      ];
    }

    const books = await Book.find(query).sort({ title: 1 });
    const categories = await Book.distinct('category');

    const formattedBooks = books.map(book => ({
      ...book.toObject(),
      statusBadge: getBookStatus(book.availableCopies)
    }));

    res.render('member/books', {
      pageTitle: 'Book Catalogue - Library Management',
      books: formattedBooks,
      categories,
      selectedCategory: category || 'All',
      searchQuery: search || ''
    });
  } catch (error) {
    console.error('Error fetching books catalogue:', error);
    req.flash('error', 'Unable to load book catalogue.');
    res.redirect('/');
  }
};

// GET /books/:id - View single book details
exports.getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }

    // Check if the current logged-in user already borrowed this book
    let hasBorrowed = false;
    if (req.session.user && req.session.user.role === 'member') {
      const activeBorrow = await Borrow.findOne({
        user: req.session.user.id,
        book: book._id,
        status: 'Issued'
      });
      if (activeBorrow) {
        hasBorrowed = true;
      }
    }

    const statusBadge = getBookStatus(book.availableCopies);

    res.render('member/book-details', {
      pageTitle: `${book.title} - Book Details`,
      book,
      statusBadge,
      hasBorrowed
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    req.flash('error', 'Invalid book identifier.');
    res.redirect('/books');
  }
};

// ==========================================
// ADMIN BOOK CRUD OPERATIONS
// ==========================================

// GET /admin/books - View all books in administrative table
exports.getAdminBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex }
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    const categories = await Book.distinct('category');

    const formattedBooks = books.map(book => ({
      ...book.toObject(),
      statusBadge: getBookStatus(book.availableCopies)
    }));

    res.render('admin/books', {
      pageTitle: 'Manage Books - Admin Panel',
      books: formattedBooks,
      categories,
      selectedCategory: category || 'All',
      searchQuery: search || ''
    });
  } catch (error) {
    console.error('Error fetching admin books:', error);
    req.flash('error', 'Unable to retrieve books list.');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/books/add - Render Add Book Form
exports.getAddBook = (req, res) => {
  res.render('admin/add-book', {
    pageTitle: 'Add New Book - Admin Panel',
    oldInput: {},
    errors: []
  });
};

// POST /admin/books/add - Create a new book
exports.postAddBook = async (req, res) => {
  const { title, author, isbn, category, totalCopies } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-book', {
      pageTitle: 'Add New Book - Admin Panel',
      oldInput: { title, author, isbn, category, totalCopies },
      errors: errors.array()
    });
  }

  try {
    const cleanIsbn = isbn.toUpperCase().trim();
    const existingBook = await Book.findOne({ isbn: cleanIsbn });

    if (existingBook) {
      return res.status(422).render('admin/add-book', {
        pageTitle: 'Add New Book - Admin Panel',
        oldInput: { title, author, isbn, category, totalCopies },
        errors: [{ msg: `A book with ISBN ${cleanIsbn} already exists.` }]
      });
    }

    const copies = parseInt(totalCopies, 10);
    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      isbn: cleanIsbn,
      category: category.trim(),
      totalCopies: copies,
      availableCopies: copies // On creation, availableCopies = totalCopies
    });

    await newBook.save();

    req.flash('success', `Book "${newBook.title}" added successfully.`);
    return res.redirect('/admin/books');
  } catch (error) {
    console.error('Error adding book:', error);
    req.flash('error', 'Failed to add book. Please try again.');
    return res.redirect('/admin/books/add');
  }
};

// GET /admin/books/:id/edit - Render Edit Book Form
exports.getEditBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/books');
    }

    res.render('admin/edit-book', {
      pageTitle: `Edit ${book.title} - Admin Panel`,
      book,
      oldInput: {},
      errors: []
    });
  } catch (error) {
    console.error('Error opening edit book form:', error);
    req.flash('error', 'Invalid book ID.');
    res.redirect('/admin/books');
  }
};

// PUT /admin/books/:id - Update an existing book
exports.putEditBook = async (req, res) => {
  const { title, author, isbn, category, totalCopies } = req.body;
  const bookId = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Edit Book - Admin Panel',
      book: { _id: bookId, title, author, isbn, category, totalCopies },
      oldInput: { title, author, isbn, category, totalCopies },
      errors: errors.array()
    });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/books');
    }

    const cleanIsbn = isbn.toUpperCase().trim();
    // Check if another book is using the same ISBN
    const duplicateIsbn = await Book.findOne({ isbn: cleanIsbn, _id: { $ne: bookId } });
    if (duplicateIsbn) {
      return res.status(422).render('admin/edit-book', {
        pageTitle: 'Edit Book - Admin Panel',
        book,
        oldInput: { title, author, isbn, category, totalCopies },
        errors: [{ msg: `Another book with ISBN ${cleanIsbn} already exists.` }]
      });
    }

    const newTotalCopies = parseInt(totalCopies, 10);
    // Number of copies currently issued to members
    const currentlyIssuedCount = book.totalCopies - book.availableCopies;

    if (newTotalCopies < currentlyIssuedCount) {
      return res.status(422).render('admin/edit-book', {
        pageTitle: 'Edit Book - Admin Panel',
        book,
        oldInput: { title, author, isbn, category, totalCopies },
        errors: [{
          msg: `Cannot set total copies to ${newTotalCopies}. There are currently ${currentlyIssuedCount} copies lent to members.`
        }]
      });
    }

    // Update fields and adjust availableCopies atomically
    book.title = title.trim();
    book.author = author.trim();
    book.isbn = cleanIsbn;
    book.category = category.trim();
    book.totalCopies = newTotalCopies;
    book.availableCopies = newTotalCopies - currentlyIssuedCount;

    await book.save();

    req.flash('success', `Book "${book.title}" updated successfully.`);
    return res.redirect('/admin/books');
  } catch (error) {
    console.error('Error updating book:', error);
    req.flash('error', 'Failed to update book.');
    return res.redirect(`/admin/books/${bookId}/edit`);
  }
};

// DELETE /admin/books/:id - Delete a book safely
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/books');
    }

    // Safety check: Prevent deletion if actively borrowed
    const activeLendingCount = await Borrow.countDocuments({
      book: bookId,
      status: 'Issued'
    });

    if (activeLendingCount > 0) {
      req.flash('error', `Cannot delete "${book.title}". There are ${activeLendingCount} copies currently issued to members.`);
      return res.redirect('/admin/books');
    }

    // Delete associated returned borrow records or clean up
    await Borrow.deleteMany({ book: bookId });
    await Book.findByIdAndDelete(bookId);

    req.flash('success', `Book "${book.title}" deleted successfully.`);
    return res.redirect('/admin/books');
  } catch (error) {
    console.error('Error deleting book:', error);
    req.flash('error', 'Failed to delete book.');
    return res.redirect('/admin/books');
  }
};
