import { HfInference } from '@huggingface/inference';
import EmotionLog from '../models/emotionLog.js';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HF_API_KEY);

// Create a WebSocket server that receives webcam snapshots
// every 1 minute, sends them to the emotion detection API,
// and stores only emotion label and timestamp in MongoDB.

export const initializeEmotionSocket = (io) => {
  // Create a namespace for emotion tracking
  const emotionNamespace = io.of('/emotion');

  emotionNamespace.on('connection', (socket) => {
    console.log(`✅ Emotion socket connected: ${socket.id}`);

    // Handle emotion snapshot
    socket.on('emotion-snapshot', async (data) => {
      try {
        const { image, userId, sessionId, questionIndex } = data;

        if (!image || !userId || !sessionId || questionIndex === undefined) {
          socket.emit('emotion-error', {
            message: 'Missing required fields'
          });
          return;
        }

        // Convert base64 to buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Call Hugging Face emotion recognition
        const result = await hf.imageClassification({
          data: imageBuffer,
          model: 'dima806/facial_emotions_image_detection'
        });

        if (!result || result.length === 0) {
          socket.emit('emotion-error', {
            message: 'Failed to detect emotion'
          });
          return;
        }

        // Get top prediction
        const topPrediction = result[0];
        const emotion = topPrediction.label.toLowerCase();
        const confidence = topPrediction.score;

        // Save to database (NOT the image)
        const emotionLog = new EmotionLog({
          userId,
          sessionId,
          questionIndex,
          emotion,
          confidence,
          timestamp: new Date()
        });

        await emotionLog.save();

        // Send result back to client
        socket.emit('emotion-detected', {
          emotion,
          confidence,
          questionIndex,
          timestamp: emotionLog.timestamp
        });

        console.log(`😊 Emotion detected for user ${userId}: ${emotion} (${Math.round(confidence * 100)}%)`);

      } catch (error) {
        console.error('Emotion detection error:', error);
        socket.emit('emotion-error', {
          message: 'Error processing emotion',
          error: error.message
        });
      }
    });

    // Handle join session room
    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`User joined session: ${sessionId}`);
    });

    // Handle leave session room
    socket.on('leave-session', (sessionId) => {
      socket.leave(sessionId);
      console.log(`User left session: ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Emotion socket disconnected: ${socket.id}`);
    });
  });

  return emotionNamespace;
};
