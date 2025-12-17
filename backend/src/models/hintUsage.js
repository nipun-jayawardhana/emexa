import mongoose from 'mongoose';

const hintUsageSchema = new mongoose.Schema({
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
  hintText: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'manual'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
hintUsageSchema.index({ userId: 1, sessionId: 1 });

const HintUsage = mongoose.model('HintUsage', hintUsageSchema);

// Make sure this line is at the bottom
export default HintUsage;