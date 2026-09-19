/**
 * Authentication Middleware
 * Protects routes from unauthenticated access.
 */

// Ensure the user is logged into an active session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  return res.redirect('/login');
};

// Ensure user is NOT logged in (for login and register pages)
const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/dashboard');
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isGuest
};
