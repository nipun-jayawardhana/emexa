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
      $or: [
        { status: 'active', isScheduled: true },
        { status: 'scheduled' }
      ],
      isDeleted: false 
    }).select('-__v');
    
    console.log('📚 Fetched shared quizzes for students:', sharedQuizzes.length);
    
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

// Protected routes - require authentication
router.use(protect);

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
