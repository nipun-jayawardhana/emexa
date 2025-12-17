import express from 'express';
import { analyzeEmotion, getEmotionHistory } from '../controllers/cameraController.js';
import { requestHint, submitQuizWithAI } from '../controllers/quizcontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// EMOTION TRACKING ROUTES
// ============================================

// Analyze emotion from webcam image
router.post('/emotion/analyze', protect, analyzeEmotion);

// Get emotion history for a quiz session
router.get('/emotion/history/:userId/:sessionId', protect, getEmotionHistory);

// ============================================
// HINT & FEEDBACK ROUTES
// ============================================

// Request AI-generated hint
router.post('/hint/request', protect, requestHint);

// Submit quiz with AI feedback
router.post('/quiz/submit-ai', protect, submitQuizWithAI);

export default router;