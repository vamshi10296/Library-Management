/**
 * Authentication Routes
 * Endpoints for login, registration, and session logout.
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');

// Validation rules for Registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
];

// Validation rules for Login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

// Routes
router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, loginValidation, authController.postLogin);

router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, registerValidation, authController.postRegister);

router.post('/logout', isAuthenticated, authController.postLogout);

module.exports = router;
