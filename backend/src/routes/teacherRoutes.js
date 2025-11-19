const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * Teacher Dashboard Routes
 * All routes require authentication and teacher role
 */

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, teacherController.getDashboardStats);

// Class progress data for chart
router.get('/dashboard/class-progress', authenticateToken, teacherController.getClassProgress);

// Engagement trend data for chart
router.get('/dashboard/engagement-trend', authenticateToken, teacherController.getEngagementTrend);

// Emotional state distribution
router.get('/dashboard/emotional-state', authenticateToken, teacherController.getEmotionalState);

// Student overview list
router.get('/dashboard/students', authenticateToken, teacherController.getStudentOverview);

// Recent quizzes
router.get('/dashboard/quizzes', authenticateToken, teacherController.getRecentQuizzes);

module.exports = router;
