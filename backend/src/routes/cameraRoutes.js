import express from 'express';
import cameraController from '../controllers/cameraController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/frame', cameraController.postFrame);

// Analyze emotion from webcam frame
router.post('/emotion/analyze', protect, cameraController.analyzeEmotion);

// Get emotion history for a quiz session
router.get('/emotion/history/:userId/:sessionId', protect, cameraController.getEmotionHistory);

export default router;