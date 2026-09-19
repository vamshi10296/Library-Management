/**
 * Role-Based Access Control Middleware
 * Restricts route access based on user roles (admin vs member).
 */

// Restrict access strictly to administrator accounts
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied: Admin privileges required.');
  return res.redirect('/dashboard');
};

// Restrict access strictly to member accounts (e.g. for borrowing books)
const isMember = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'member') {
    return next();
  }
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    req.flash('warning', 'Admins can manage the library catalogue from the Admin panel.');
    return res.redirect('/admin/dashboard');
  }
  req.flash('error', 'Only library members can perform this action.');
  return res.redirect('/login');
};

module.exports = {
  isAdmin,
  isMember
};
