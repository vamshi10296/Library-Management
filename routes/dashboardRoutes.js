/**
 * Dashboard Routes
 * Endpoints for Member and Admin dashboards.
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Member / General Dashboard
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

// Admin Dashboard
router.get('/admin/dashboard', isAuthenticated, isAdmin, dashboardController.getAdminDashboard);

module.exports = router;
