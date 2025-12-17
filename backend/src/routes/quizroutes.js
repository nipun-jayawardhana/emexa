import express from 'express';
import { 
  getQuizById, 
  getAllQuizzes, 
  submitQuizAnswers,
  getQuizResults,
  requestHint,        // AI hint generation
  submitQuizWithAI    //  AI-powered quiz submission

} from '../controllers/quizcontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all available quizzes for a student
router.get('/', protect, getAllQuizzes);

// Get specific quiz by ID
router.get('/:quizId', protect, getQuizById);

// Submit quiz answers
router.post('/:quizId/submit', protect, submitQuizAnswers);

// Get quiz results
router.get('/:quizId/results', protect, getQuizResults);

// Request AI-generated hint
router.post('/hint/request', protect, requestHint);

// Submit quiz with AI feedback
router.post('/submit-ai', protect, submitQuizWithAI);

export default router;