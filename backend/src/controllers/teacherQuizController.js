import TeacherQuiz from '../models/teacherQuiz.js';
import Teacher from '../models/teacher.js';
import Notification from '../models/notification.js';
import { createQuizNotification } from './notificationController.js';


// Create a new quiz (draft)
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      subject,
      gradeLevel,
      questions
    } = req.body;

    console.log('📝 Create Quiz Request:', { title, subject, gradeLevel, questions: questions?.length });

    // Validate required fields
    if (!title || !subject || !gradeLevel) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, subject, or gradeLevel'
      });
    }

    // Get teacher ID from authenticated user
    const teacherId = req.user?.id || req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login as a teacher.'
      });
    }

    console.log('👤 Teacher ID:', teacherId);

    // Create new quiz
    const newQuiz = new TeacherQuiz({
      teacherId,
      title,
      subject,
      gradeLevel,
      questions: questions || [],
      status: 'draft',
      isScheduled: false
    });

    // Calculate initial progress
    newQuiz.calculateProgress();

    // Save to database
    await newQuiz.save();

    console.log('✅ Quiz saved to database:', newQuiz._id);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: newQuiz
    });
  } catch (error) {
    console.error('❌ Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Get all quizzes for a teacher
export const getTeacherQuizzes = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const quizzes = await TeacherQuiz.findByTeacher(teacherId);
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get all draft quizzes
export const getDrafts = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const drafts = await TeacherQuiz.findDrafts(teacherId);
    
    console.log('📋 Fetched drafts:', drafts.length);
    
    res.status(200).json({
      success: true,
      count: drafts.length,
      drafts
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drafts',
      error: error.message
    });
  }
};

// Get all scheduled quizzes
export const getScheduledQuizzes = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const scheduled = await TeacherQuiz.findScheduled(teacherId);
    
    console.log('📅 Fetched scheduled quizzes:', scheduled.length);
    
    res.status(200).json({
      success: true,
      count: scheduled.length,
      quizzes: scheduled
    });
  } catch (error) {
    console.error('Error fetching scheduled quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled quizzes',
      error: error.message
    });
  }
};

// Get a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Get Quiz By ID:', id);
    
    // For testing without auth, just find by ID
    const quiz = await TeacherQuiz.findOne({
      _id: id,
      isDeleted: false
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('✏️ Update Quiz:', id, updateData);
    
    // Find quiz (skip ownership check for testing)
    const quiz = await TeacherQuiz.findOne({
      _id: id,
      isDeleted: false
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'teacherId' && key !== 'createdAt') {
        quiz[key] = updateData[key];
      }
    });
    
    // Recalculate progress if questions were updated
    if (updateData.questions) {
      quiz.calculateProgress();
    }
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Schedule a quiz
export const scheduleQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleDate, startTime, endTime } = req.body;
    console.log('🗓️ Schedule Quiz:', id, { scheduleDate, startTime, endTime });
    
    // Validate schedule data
    if (!scheduleDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing schedule data: scheduleDate, startTime, or endTime'
      });
    }
    
    // Find quiz (skip ownership check for testing)
    const quiz = await TeacherQuiz.findOne({
      _id: id,
      isDeleted: false
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Update schedule information
    quiz.isScheduled = true;
    quiz.scheduleDate = new Date(scheduleDate);
    quiz.startTime = startTime;
    quiz.endTime = endTime;
quiz.status = 'scheduled'; // Set to scheduled, not active

await quiz.save();

console.log('✅ Quiz scheduled:', quiz._id);

// Get teacher name for notification
const teacher = await Teacher.findById(quiz.teacherId);
const teacherName = teacher ? teacher.name : 'Teacher';

// Create notifications for all students
const formattedDueDate = `${scheduleDate}, ${endTime}`;
const notificationResult = await createQuizNotification(quiz._id, {
  title: quiz.title,
  subject: quiz.subject,
  dueDate: formattedDueDate
}, teacherName);

console.log('🔔 Notification result:', notificationResult);

res.status(200).json({
  success: true,
  message: 'Quiz scheduled successfully and notifications sent',
  quiz,
  notificationsSent: notificationResult.count || 0
});

  } catch (error) {
    console.error('Error scheduling quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule quiz',
      error: error.message
    });
  }
};

// Delete a quiz (soft delete)
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete Quiz:', id);
    
    const quiz = await TeacherQuiz.findOne({
      _id: id,
      isDeleted: false
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Soft delete
    quiz.isDeleted = true;
    await quiz.save();
    
// Delete all related notifications
await Notification.deleteMany({ quizId: id });
console.log('🗑️ Deleted notifications for quiz:', id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// Permanent delete (admin only or for cleanup)
export const permanentDeleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('⚠️ Permanent Delete Quiz:', id);
    
    const result = await TeacherQuiz.findOneAndDelete({
      _id: id
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
// Delete all related notifications
await Notification.deleteMany({ quizId: id });
console.log('🗑️ Deleted notifications for permanently deleted quiz:', id);

    res.status(200).json({
      success: true,
      message: 'Quiz permanently deleted'
    });
  } catch (error) {
    console.error('Error permanently deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// Get quiz statistics for teacher
export const getQuizStats = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    console.log('📊 Get Quiz Stats for teacher:', teacherId);
    
    // Get all quizzes for this teacher
    const allQuizzes = await TeacherQuiz.find({
      teacherId: teacherId,
      isDeleted: false
    });
    
    console.log('📊 Total quizzes found:', allQuizzes.length);
    
    // Count by status with custom logic for scheduled
    const formattedStats = {
      total: allQuizzes.length,
      drafts: 0,
      scheduled: 0,
      active: 0,
      closed: 0
    };
    
    allQuizzes.forEach(quiz => {
// Check if scheduled quiz is currently active
const isCurrentlyActive = quiz.isScheduled && quiz.isCurrentlyActive && quiz.isCurrentlyActive();

// Scheduled = has schedule info but not currently in active time window
if ((quiz.status === 'draft' || quiz.status === 'scheduled') && quiz.isScheduled && !isCurrentlyActive) {
  formattedStats.scheduled++;
}
// Active = active status OR scheduled quiz that is currently in its time window
else if (quiz.status === 'active' || (quiz.status === 'scheduled' && isCurrentlyActive)) {
  formattedStats.active++;
}

      // Draft = draft status and no schedule info
      else if (quiz.status === 'draft' && !quiz.isScheduled) {
        formattedStats.drafts++;
      }
      // Active = active status
      else if (quiz.status === 'active') {
        formattedStats.active++;
      }
      // Closed
      else if (quiz.status === 'closed') {
        formattedStats.closed++;
      }
    });
    
    console.log('📊 Formatted stats:', formattedStats);
    
    res.status(200).json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: error.message
    });
  }
};

// Submit quiz answers (for students)
export const submitQuizAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;

    console.log('📝 Student submitting quiz:', id, 'User:', userId);

    // Find the quiz
    const quiz = await TeacherQuiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if quiz is currently active
    if (!quiz.isCurrentlyActive()) {
      const timeStatus = quiz.getTimeStatus();
      let message = 'This quiz is not currently available.';
      
      if (timeStatus === 'upcoming') {
        message = 'This quiz has not started yet. Please wait until the scheduled time.';
      } else if (timeStatus === 'expired') {
        message = 'This quiz has ended. The submission deadline has passed.';
      }
      
      return res.status(403).json({
        success: false,
        message,
        timeStatus
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    console.log(`✅ Quiz graded: ${correctAnswers}/${quiz.questions.length} correct (${score}%)`);

    // Create submission confirmation notification for student
    try {
      await Notification.create({
        recipientId: userId,
        recipientRole: 'student',
        type: 'quiz_graded',
        title: quiz.title,
        description: `Your submission has been received. You scored ${score}% (${correctAnswers}/${quiz.questions.length} correct).`,
        quizId: id,
        score: `${score}/100`,
        status: 'graded',
        isRead: false
      });
      console.log('✅ Submission notification created for student:', userId);
    } catch (notifError) {
      console.error('❌ Error creating submission notification:', notifError);
    }

    // TODO: Save submission to database
    const quizResult = {
      userId,
      quizId: id,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeTaken,
      answers: results,
      submittedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: quizResult
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

export default {
  createQuiz,
  getTeacherQuizzes,
  getDrafts,
  getScheduledQuizzes,
  getQuizById,
  updateQuiz,
  scheduleQuiz,
  deleteQuiz,
  permanentDeleteQuiz,
  getQuizStats,
  submitQuizAnswers,
};
