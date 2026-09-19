/**
 * Book Routes
 * Endpoints for public catalogue browsing and administrative CRUD.
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookController = require('../controllers/bookController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Book validation rules
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Book title is required.')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters.'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required.')
    .isLength({ min: 2 }).withMessage('Author must be at least 2 characters.'),
  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required.')
    .isLength({ min: 3 }).withMessage('ISBN must be at least 3 characters.'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),
  body('totalCopies')
    .notEmpty().withMessage('Total copies count is required.')
    .isInt({ min: 1 }).withMessage('Total copies must be an integer of at least 1.')
];

// Public & Member Routes
router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookDetails);

// Admin Book Management Routes
router.get('/admin/books', isAuthenticated, isAdmin, bookController.getAdminBooks);
router.get('/admin/books/add', isAuthenticated, isAdmin, bookController.getAddBook);
router.post('/admin/books/add', isAuthenticated, isAdmin, bookValidation, bookController.postAddBook);
router.get('/admin/books/:id/edit', isAuthenticated, isAdmin, bookController.getEditBook);
router.put('/admin/books/:id', isAuthenticated, isAdmin, bookValidation, bookController.putEditBook);
router.delete('/admin/books/:id', isAuthenticated, isAdmin, bookController.deleteBook);

module.exports = router;
