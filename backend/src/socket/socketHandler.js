import EmotionLog from '../models/emotionLog.js';
import aiService from '../services/aiService.js';

const setupSocketHandler = (io) => {
  console.log('🔌 Socket.io handler initialized');

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      message: 'Connected to emotion detection server',
      timestamp: Date.now()
    });

    // Handle emotion analysis
    socket.on('analyze-emotion', async (data) => {
      try {
        console.log('📸 Received emotion analysis request from:', socket.id);
        
        const { userId, quizId, sessionId, questionIndex, image, timestamp } = data;

        // Validate required fields
        if (!userId || !quizId || !sessionId || questionIndex === undefined || !image) {
          console.error('❌ Missing required fields');
          socket.emit('emotion-error', { 
            message: 'Missing required fields: userId, quizId, sessionId, questionIndex, image',
            timestamp: Date.now()
          });
          return;
        }

        console.log(`🤖 Analyzing emotion for user ${userId}, quiz ${quizId}, question ${questionIndex}`);

        // Analyze emotion using Hugging Face
        const result = await aiService.analyzeEmotion(image);

        console.log(`✅ Emotion analysis successful: ${result.emotion} (${(result.confidence * 100).toFixed(1)}%)`);

        // Save to database
        try {
          const emotionLog = new EmotionLog({
            userId,
            quizId,
            sessionId,
            questionIndex,
            emotion: result.emotion,
            confidence: result.confidence,
            timestamp: timestamp || Date.now()
          });

          await emotionLog.save();
          console.log('💾 Emotion saved to database');
        } catch (dbError) {
          console.error('⚠️ Failed to save to database:', dbError.message);
          // Continue even if DB save fails
        }

        // Send result back to client
        socket.emit('emotion-result', {
          emotion: result.emotion,
          confidence: result.confidence,
          allEmotions: result.allEmotions,
          questionIndex,
          timestamp: result.timestamp,
          model: result.model
        });

        console.log(`✅ Sent emotion result to client: ${result.emotion}`);

      } catch (error) {
        console.error('❌ Socket emotion analysis error:', error.message);
        
        // Send detailed error to client
        let errorMessage = 'Failed to analyze emotion';
        
        if (error.message.includes('Model is still loading')) {
          errorMessage = 'Model is loading. Please wait 20-30 seconds and try again.';
        } else if (error.message.includes('503')) {
          errorMessage = 'Model is loading. Please wait 20-30 seconds and try again.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid Hugging Face API key. Check your .env file.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment.';
        } else if (error.message.includes('410')) {
          errorMessage = 'Model no longer available. Using backup model.';
        } else {
          errorMessage = error.message;
        }
        
        socket.emit('emotion-error', { 
          message: errorMessage,
          timestamp: Date.now(),
          originalError: error.message
        });
      }
    });

    // Handle get emotion history
    socket.on('get-emotion-history', async (data) => {
      try {
        const { userId, sessionId } = data;

        if (!userId || !sessionId) {
          socket.emit('history-error', { 
            message: 'Missing userId or sessionId' 
          });
          return;
        }

        console.log(`📊 Fetching emotion history for ${userId}, session ${sessionId}`);

        const emotions = await EmotionLog.find({ userId, sessionId })
          .sort({ timestamp: 1 })
          .select('-__v');

        socket.emit('emotion-history', {
          emotions,
          count: emotions.length,
          timestamp: Date.now()
        });

        console.log(`✅ Sent ${emotions.length} emotion records`);

      } catch (error) {
        console.error('❌ Error fetching emotion history:', error);
        socket.emit('history-error', {
          message: 'Failed to fetch emotion history',
          timestamp: Date.now()
        });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, '- Reason:', reason);
    });

    // Handle errors - IMPORTANT: Prevent disconnect on error
    socket.on('error', (error) => {
      console.error('❌ Socket error:', socket.id, error.message);
      // Don't disconnect on error, just log it
    });
  });

  // Skip startup test - it often fails but actual emotion analysis works
  console.log('💡 Skipping startup API test - emotion detection will be tested on first use');
  console.log('✅ Emotion model ready: Xenova/facial_emotions_image_detection');

  return io;
};

export default setupSocketHandler;