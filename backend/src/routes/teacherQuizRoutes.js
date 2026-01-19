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
  getQuizStats,
  submitQuizAnswers,
  getQuizSubmission
} from '../controllers/teacherQuizController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - students can access shared quizzes
router.get('/shared', async (req, res) => {
  try {
    const TeacherQuiz = (await import('../models/teacherQuiz.js')).default;
    const sharedQuizzes = await TeacherQuiz.find({ 
      isScheduled: true,
      isDeleted: false 
    }).select('-__v');
    
    // Add timeStatus to each quiz and filter out expired ones older than 24 hours
    const now = new Date();
    const quizzesWithStatus = sharedQuizzes
      .map(quiz => {
        const quizObj = quiz.toObject();
        quizObj.timeStatus = quiz.getTimeStatus();
        quizObj.isCurrentlyActive = quiz.isCurrentlyActive();
        return quizObj;
      })
      .filter(quiz => {
        // If quiz is expired, check if it's been more than 24 hours since end time
        if (quiz.timeStatus === 'expired' && quiz.scheduleDate && quiz.endTime) {
          const scheduleDate = new Date(quiz.scheduleDate);
          const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
          const endDateTime = new Date(scheduleDate);
          endDateTime.setHours(endHour, endMinute, 0, 0);
          
          // Calculate hours since quiz ended
          const hoursSinceEnd = (now - endDateTime) / (1000 * 60 * 60);
          
          // Only include if less than 24 hours have passed since quiz ended
          return hoursSinceEnd < 24;
        }
        // Include all non-expired quizzes
        return true;
      });
    
    console.log('📚 Fetched shared quizzes for students:', quizzesWithStatus.length);
    
    res.status(200).json({
      success: true,
      count: quizzesWithStatus.length,
      quizzes: quizzesWithStatus
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

// Student submission
router.post('/:id/submit', submitQuizAnswers);         // Submit quiz answers (students)
router.get('/:id/submission', getQuizSubmission);      // Get saved submission results (students)

export default router;
