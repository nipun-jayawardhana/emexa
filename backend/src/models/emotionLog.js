import mongoose from 'mongoose';

const emotionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  },
  emotion: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
emotionLogSchema.index({ userId: 1, sessionId: 1 });
emotionLogSchema.index({ quizId: 1, userId: 1 });

const EmotionLog = mongoose.model('EmotionLog', emotionLogSchema);

export default EmotionLog;