import EmotionLog from '../models/emotionLog.js';
import aiService from '../services/aiService.js';

const setupSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('analyze-emotion', async (data) => {
      try {
        const { userId, quizId, sessionId, questionIndex, image } = data;

        if (!userId || !quizId || !sessionId || questionIndex === undefined || !image) {
          socket.emit('emotion-error', { 
            message: 'Missing required fields' 
          });
          return;
        }

        const result = await aiService.analyzeEmotion(image);

        const emotionLog = new EmotionLog({
          userId,
          quizId,
          sessionId,
          questionIndex,
          emotion: result.emotion,
          confidence: result.confidence
        });

        await emotionLog.save();

        socket.emit('emotion-result', {
          emotion: result.emotion,
          confidence: result.confidence,
          questionIndex
        });

        console.log(`✅ Emotion analyzed: ${result.emotion} (${Math.round(result.confidence * 100)}%)`);
      } catch (error) {
        console.error('Socket emotion analysis error:', error);
        socket.emit('emotion-error', { 
          message: error.message 
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
};

export default setupSocketHandler;