import express from 'express';
import teacherController from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Teacher Dashboard Routes
 * All routes require authentication and teacher role
 */

// Dashboard statistics
router.get(
  '/dashboard/stats', 
  protect, 
  authorize('teacher'), 
  teacherController.getDashboardStats
);

// Class progress data for chart
router.get(
  '/dashboard/class-progress', 
  protect, 
  authorize('teacher'), 
  teacherController.getClassProgress
);

// Engagement trend data for chart
router.get(
  '/dashboard/engagement-trend', 
  protect, 
  authorize('teacher'), 
  teacherController.getEngagementTrend
);

// Emotional state distribution
router.get(
  '/dashboard/emotional-state', 
  protect, 
  authorize('teacher'), 
  teacherController.getEmotionalState
);

// Student overview list
router.get(
  '/dashboard/students', 
  protect, 
  authorize('teacher'), 
  teacherController.getStudentOverview
);

// Recent quizzes
router.get(
  '/dashboard/quizzes', 
  protect, 
  authorize('teacher'), 
  teacherController.getRecentQuizzes
);

// Profile routes
router.get('/profile', protect, authorize('teacher'), teacherController.getProfile);

// Password change route
router.put('/change-password', protect, authorize('teacher'), teacherController.changePassword);

export default router;