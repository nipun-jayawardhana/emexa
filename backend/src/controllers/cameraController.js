import fs from 'fs';
import path from 'path';
import EmotionLog from '../models/emotionLog.js';
import aiService from '../services/aiService.js';


export const postFrame = async (req, res) => {
  try {
    const { image, quizId, userId, timestamp } = req.body || {};

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ ok: false, message: 'Missing image data' });
    }

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ ok: false, message: 'Invalid image data' });
    }

    const mime = matches[1];
    const base64Data = matches[2];
    const ext = mime.split('/')[1] || 'jpg';

    const uploadsDir = path.resolve(process.cwd(), 'backend', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}_${quizId || 'quiz'}_${userId || 'anon'}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    return res.status(201).json({ ok: true, file: fileName, timestamp: timestamp || Date.now() });
  } catch (err) {
    console.error('postFrame error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

// AI Emotion Analysis

export const analyzeEmotion = async (req, res) => {
  try {
    const { userId, quizId, sessionId, questionIndex, image } = req.body;

    // Validate required fields
    if (!userId || !quizId || !sessionId || questionIndex === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, quizId, sessionId, questionIndex, image'
      });
    }

    // Analyze emotion using AI service
    const emotionResult = await aiService.analyzeEmotion(image);

    // Save to database
    const emotionLog = new EmotionLog({
      userId,
      quizId,
      sessionId,
      questionIndex,
      emotion: emotionResult.emotion,
      confidence: emotionResult.confidence
    });

    await emotionLog.save();

    res.json({
      success: true,
      data: {
        emotion: emotionResult.emotion,
        confidence: emotionResult.confidence
      }
    });
  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze emotion',
      error: error.message
    });
  }
};


export const getEmotionHistory = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    if (!userId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or sessionId'
      });
    }

    const emotions = await EmotionLog.find({ userId, sessionId })
      .sort({ timestamp: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: emotions
    });
  } catch (error) {
    console.error('Get emotion history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emotion history'
    });
  }
};


export default { 
  postFrame,           
  analyzeEmotion,      
  getEmotionHistory    
};