/**
 * Authentication Controller
 * Handles user registration, login, session creation, and logout.
 */
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// GET /login - Render login form
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login - Library Management System',
    oldInput: {},
    errors: []
  });
};

// POST /login - Authenticate user credentials & establish session
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login - Library Management System',
      oldInput: { email },
      errors: errors.array()
    });
  }

  try {
    // 1. Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Login - Library Management System',
        oldInput: { email },
        errors: [{ msg: 'Invalid email or password.' }]
      });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Login - Library Management System',
        oldInput: { email },
        errors: [{ msg: 'Invalid email or password.' }]
      });
    }

    // 3. Create session (store safe user details)
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome back, ${user.name}!`);

    // 4. Role-based redirect
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'An error occurred during login. Please try again.');
    return res.redirect('/login');
  }
};

// GET /register - Render registration form
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Register - Library Management System',
    oldInput: {},
    errors: []
  });
};

// POST /register - Register a new member account
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/register', {
      pageTitle: 'Register - Library Management System',
      oldInput: { name, email },
      errors: errors.array()
    });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(422).render('auth/register', {
        pageTitle: 'Register - Library Management System',
        oldInput: { name, email },
        errors: [{ msg: 'An account with this email address already exists.' }]
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create member user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'member'
    });

    await newUser.save();

    req.flash('success', 'Registration successful! Please log in with your credentials.');
    return res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    req.flash('error', 'Failed to register account. Please try again.');
    return res.redirect('/register');
  }
};

// POST /logout - Terminate session & clear cookies
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
