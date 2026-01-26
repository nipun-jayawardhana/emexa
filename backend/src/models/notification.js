import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  recipientRole: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  type: {
    type: String,
    enum: ['quiz_assigned', 'quiz_graded', 'reminder', 'announcement', 'data_export'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  instructor: {
    type: String
  },
  dueDate: {
    type: String
  },
  score: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'graded', 'overdue', 'completed'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { 
  timestamps: true 
});

// Index for faster queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

// Unique compound index to prevent duplicate quiz assignment notifications
// This ensures each student can only have ONE 'quiz_assigned' notification per quiz
notificationSchema.index(
  { recipientId: 1, quizId: 1, type: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      type: 'quiz_assigned',
      quizId: { $exists: true } 
    },
    name: 'unique_quiz_assignment'
  }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
