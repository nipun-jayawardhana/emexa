import express from 'express';
import {
  createQuiz,
  getTeacherQuizzes,
  getDrafts,
  getScheduledQuizzes,
  getQuizById,
  updateQuiz,
  scheduleQuiz,
  deleteQuiz,
  permanentDeleteQuiz,
  getQuizStats
} from '../controllers/teacherQuizController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - students can access shared quizzes
router.get('/shared', async (req, res) => {
  try {
    const TeacherQuiz = (await import('../models/teacherQuiz.js')).default;
    const sharedQuizzes = await TeacherQuiz.find({ 
      status: 'active',
      isScheduled: true,
      isDeleted: false 
    }).select('-__v');
    
    res.status(200).json({
      success: true,
      count: sharedQuizzes.length,
      quizzes: sharedQuizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared quizzes',
      error: error.message
    });
  }
});

// Temporarily public for testing - TODO: Add protect middleware back
// router.use(protect); // Commented out for testing

// Quiz CRUD operations
router.post('/create', createQuiz);                    // Create new quiz
router.get('/my-quizzes', getTeacherQuizzes);         // Get all teacher's quizzes
router.get('/drafts', getDrafts);                      // Get draft quizzes
router.get('/scheduled', getScheduledQuizzes);        // Get scheduled quizzes
router.get('/stats', getQuizStats);                    // Get quiz statistics
router.get('/:id', getQuizById);                       // Get single quiz by ID
router.put('/:id', updateQuiz);                        // Update quiz
router.delete('/:id', deleteQuiz);                     // Soft delete quiz
router.delete('/:id/permanent', permanentDeleteQuiz);  // Permanent delete (admin)

// Scheduling
router.post('/:id/schedule', scheduleQuiz);            // Schedule a quiz

export default router;
