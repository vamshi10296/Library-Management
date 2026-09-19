/**
 * Borrow & Lending Routes
 * Endpoints for book issuance, returns, member history, and admin circulation audits.
 */
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin, isMember } = require('../middleware/roleMiddleware');

// Member: Issue a book
router.post('/books/:id/issue', isAuthenticated, isMember, borrowController.issueBook);

// Member / Admin: Return a book
router.post('/borrow/:id/return', isAuthenticated, borrowController.returnBook);

// Member: View personal borrowing history & active loans
router.get('/my-books', isAuthenticated, isMember, borrowController.getMyBooks);

// Admin: View all members & member search
router.get('/admin/members', isAuthenticated, isAdmin, borrowController.getAdminMembers);

// Admin: View all circulation/borrow records with filters
router.get('/admin/borrow-records', isAuthenticated, isAdmin, borrowController.getAdminBorrowRecords);

module.exports = router;
