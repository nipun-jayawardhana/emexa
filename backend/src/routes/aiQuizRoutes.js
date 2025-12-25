// backend/src/routes/aiQuizRoutes.js
import express from 'express';
import aiQuizController from '../controllers/aiQuizController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/ai-quiz/generate
 * @desc    Generate quiz using AI
 * @access  Teacher only
 */
router.post('/generate', aiQuizController.generateQuiz.bind(aiQuizController));

/**
 * @route   POST /api/ai-quiz/:quizId/regenerate
 * @desc    Regenerate specific questions
 * @access  Teacher only
 */
router.post('/:quizId/regenerate', aiQuizController.regenerateQuestions.bind(aiQuizController));

/**
 * @route   GET /api/ai-quiz/:quizId/enhance/:questionNumber
 * @desc    Get AI suggestions to enhance a specific question
 * @access  Teacher only
 */
router.get('/:quizId/enhance/:questionNumber', aiQuizController.enhanceQuestion.bind(aiQuizController));

/**
 * @route   PUT /api/ai-quiz/:quizId
 * @desc    Update AI-generated quiz
 * @access  Teacher only
 */
router.put('/:quizId', aiQuizController.updateGeneratedQuiz.bind(aiQuizController));

/**
 * @route   GET /api/ai-quiz/suggestions
 * @desc    Get AI generation suggestions
 * @access  Teacher only
 */
router.get('/suggestions', aiQuizController.getGenerationSuggestions.bind(aiQuizController));

export default router;