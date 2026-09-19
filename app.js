/**
 * Library Management & Book Lending System
 * Main Application Server
 * 
 * College Assignment-2 (PS 0)
 * Author: Vamshi Yarragorla
 */

const path = require('path');

// 1. Load Environment Variables with explicit path resolution
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

// Database Models
const Book = require('./models/Book');
const Borrow = require('./models/Borrow');

// Application Route Handlers
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

// Initialize Express Application
const app = express();

// Enable trust proxy for secure sessions on production platforms (e.g., Render)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 2. Database Connection Setup
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://libraryadmin:vamshi2026@cluster0.ydcofmu.mongodb.net/library_management_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(mongoUri)
  .then((conn) => {
    console.log(`[MongoDB Connected]: Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
  })
  .catch((err) => {
    console.error(`[MongoDB Connection Error]: ${err.message}`);
    process.exit(1);
  });

// 3. EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Global Middleware Pipeline
// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming form data and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Support HTTP verbs such as PUT and DELETE from forms
app.use(methodOverride('_method'));

// Session store configuration with persistent MongoDB storage
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'library_management_secret_key_fallback',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Flash messaging middleware
app.use(flash());

// Global Context Middleware: Expose auth state, flash messages, and path to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? (req.session.user || null) : null;
  res.locals.success = req.flash ? req.flash('success') : [];
  res.locals.error = req.flash ? req.flash('error') : [];
  res.locals.warning = req.flash ? req.flash('warning') : [];
  res.locals.info = req.flash ? req.flash('info') : [];
  res.locals.currentPath = req.path || '';
  next();
});

// 5. Root Landing Page Route (GET /)
app.get('/', async (req, res) => {
  try {
    const [totalBooks, totalAvailable, activeBorrowings, featuredBooks, categories] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ availableCopies: { $gt: 0 } }),
      Borrow.countDocuments({ status: 'Issued' }),
      Book.find().sort({ createdAt: -1 }).limit(3),
      Book.distinct('category')
    ]);

    res.render('home', {
      pageTitle: 'Home - Library Management & Book Lending System',
      stats: {
        totalBooks,
        totalAvailable,
        activeBorrowings,
        categoryCount: categories.length
      },
      featuredBooks
    });
  } catch (error) {
    console.error('Error rendering landing page:', error);
    res.render('home', {
      pageTitle: 'Home - Library Management & Book Lending System',
      stats: { totalBooks: 0, totalAvailable: 0, activeBorrowings: 0, categoryCount: 0 },
      featuredBooks: []
    });
  }
});

// 6. Mount Feature Routers
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', bookRoutes);
app.use('/', borrowRoutes);

// 7. Error Handling Middleware
// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).render('errors/404', {
    pageTitle: '404 - Page Not Found',
    path: req.originalUrl || req.path || '',
    currentPath: req.originalUrl || req.path || '',
    currentUser: req.session ? (req.session.user || null) : null,
    success: req.flash ? req.flash('success') : [],
    error: req.flash ? req.flash('error') : [],
    warning: req.flash ? req.flash('warning') : [],
    info: req.flash ? req.flash('info') : []
  });
});

// 500 Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error Stack]:', err);
  res.status(err.status || 500).render('errors/500', {
    pageTitle: '500 - Internal Server Error',
    path: req.originalUrl || req.path || '',
    currentPath: req.originalUrl || req.path || '',
    currentUser: req.session ? (req.session.user || null) : null,
    success: req.flash ? req.flash('success') : [],
    error: req.flash ? req.flash('error') : [],
    warning: req.flash ? req.flash('warning') : [],
    info: req.flash ? req.flash('info') : [],
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server. Please try again later.'
      : err.message
  });
});

// 8. Start Application Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Library Management System Server Running`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

module.exports = app;