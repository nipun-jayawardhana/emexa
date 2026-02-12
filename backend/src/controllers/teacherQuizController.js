import TeacherQuiz from '../models/teacherQuiz.js';
import Teacher from '../models/teacher.js';
import Notification from '../models/notification.js';
import { createQuizNotification } from './notificationController.js';
import { QuizResult } from '../models/quiz.js';
import { 
  sendEmailNotification, 
  sendQuizSubmissionEmail,
  sendQuizShareConfirmationEmail,
  sendMajorityCompletionEmail
} from '../services/notificationEmail.service.js';
import Student from '../models/student.js';

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
    
    // ✅ NEW: Update status based on current time
    const now = new Date();
    const updatedQuizzes = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      
      // Calculate real-time status
      if (quiz.isScheduled && quiz.scheduleDate && quiz.startTime && quiz.endTime) {
        const scheduleDate = new Date(quiz.scheduleDate);
        const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
        const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
        
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        // ✅ Handle midnight crossover
        if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        // ✅ Set real-time status
        if (now < startDateTime) {
          quizObj.status = 'scheduled';
        } else if (now >= startDateTime && now < endDateTime) {
          quizObj.status = 'active';
        } else {
          quizObj.status = 'closed';
        }
      }
      
      return quizObj;
    });
    
    res.status(200).json({
      success: true,
      count: updatedQuizzes.length,
      quizzes: updatedQuizzes
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
    const { scheduleDate, startTime, endTime, dueDate, semester, academicYear, maxAttempts } = req.body;
    console.log('🗓️ Schedule Quiz:', id, { scheduleDate, startTime, endTime, dueDate, semester, academicYear });
    
    // Validate schedule data
    if (!scheduleDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing schedule data: scheduleDate, startTime, or endTime'
      });
    }
    
    // Validate semester if provided
    if (semester && !['1st semester', '2nd semester'].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester. Must be "1st semester" or "2nd semester"'
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
    if (dueDate) {
      quiz.dueDate = new Date(dueDate);
    }
    // Store semester and academic year for filtering
    if (semester) {
      quiz.semester = semester;
    }
    if (academicYear) {
      quiz.academicYear = academicYear;
    }
    if (maxAttempts) {
     quiz.maxAttempts = parseInt(maxAttempts);
    }
    quiz.status = 'scheduled'; // Set to scheduled, not active
    
    await quiz.save();
    
    console.log('✅ Quiz scheduled:', quiz._id);
    
    // Get teacher and count students with matching semester/academic year
    const teacher = await Teacher.findById(quiz.teacherId);
    const teacherName = teacher ? teacher.name : 'Teacher';
    
    // Build filter for students based on semester and academic year
    const studentFilter = {};
    if (semester) {
      studentFilter.semester = semester;
    }
    if (academicYear) {
      // Convert numeric year to string format (1 -> '1st year', 2 -> '2nd year', etc.)
      const yearStrings = {
        1: '1st year',
        2: '2nd year',
        3: '3rd year',
        4: '4th year'
      };
      const yearString = yearStrings[parseInt(academicYear)];
      if (yearString) {
        studentFilter.year = yearString;
      }
    }
    
    const students = await Student.countDocuments(studentFilter);
    console.log(`📚 Filtered students by semester: ${semester}, year: ${academicYear} - Count: ${students}`);
    
    // Create notifications for filtered students
    const formattedDueDate = `${scheduleDate}, ${endTime}`;
    const notificationResult = await createQuizNotification(quiz._id, {
      title: quiz.title,
      subject: quiz.subject,
      dueDate: formattedDueDate,
      semester: semester,
      academicYear: academicYear
    }, teacherName);
    
    console.log('🔔 Notification result:', notificationResult);
    
    // ✅ FIXED: Create in-app notification for teacher (removed incorrect require())
    try {
      await Notification.create({
        recipientId: quiz.teacherId,
        recipientRole: 'teacher',
        type: 'quiz_assigned',
        title: `Quiz Shared: ${quiz.title}`,
        description: `Your quiz "${quiz.title}" has been shared with ${students} students. Scheduled for ${scheduleDate} from ${startTime} to ${endTime}.`,
        quizId: quiz._id,
        instructor: teacherName,
        dueDate: formattedDueDate,
        status: 'completed',
        isRead: false
      });
      console.log('✅ In-app notification created for teacher');
    } catch (notifError) {
      console.error('❌ Error creating in-app notification for teacher:', notifError.message);
      // Don't fail the request if notification creation fails
    }
    
    // Send confirmation email to teacher
    try {
      if (teacher && teacher.email) {
        const emailHtml = await sendQuizShareConfirmationEmail(
          teacher.email,
          teacherName,
          quiz.title,
          students,
          scheduleDate,
          startTime,
          endTime
        );
        
        await sendEmailNotification(
          quiz.teacherId,
          teacher.email,
          `✅ Quiz Shared: ${quiz.title}`,
          emailHtml
        );
        console.log('✅ Quiz share confirmation email sent to teacher:', teacher.email);
      }
    } catch (emailError) {
      console.error('❌ Error sending quiz share confirmation email to teacher:', emailError.message);
      // Don't fail the request if email fails
    }
    
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
    
    console.log(`🗑️ Deleting quiz: "${quiz.title}" (ID: ${id})`);
    
    // Soft delete the quiz
    quiz.isDeleted = true;
    await quiz.save();
    
    // Delete all related notifications for students
    const notificationResult = await Notification.deleteMany({ quizId: id });
    console.log(`🔔 Deleted ${notificationResult.deletedCount} notifications for quiz: ${id}`);
    
    // Trigger a refresh event for students (if you have socket.io set up)
    // This would notify connected students to refresh their quiz list
    console.log('✅ Quiz and related data deleted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Quiz and related notifications deleted successfully',
      deletedNotifications: notificationResult.deletedCount
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
    
    // Get quiz info before deleting
    const quiz = await TeacherQuiz.findById(id);
    if (quiz) {
      console.log(`⚠️ Permanently deleting quiz: "${quiz.title}" (ID: ${id})`);
    }
    
    const result = await TeacherQuiz.findOneAndDelete({
      _id: id
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Delete all related notifications for students
    const notificationResult = await Notification.deleteMany({ quizId: id });
    console.log(`🔔 Deleted ${notificationResult.deletedCount} notifications for permanently deleted quiz: ${id}`);
    
    res.status(200).json({
      success: true,
      message: 'Quiz and related notifications permanently deleted',
      deletedNotifications: notificationResult.deletedCount
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
    
    // Debug: Log each quiz's status
    allQuizzes.forEach((quiz, index) => {
      console.log(`Quiz ${index + 1}:`, {
        id: quiz._id,
        title: quiz.title,
        status: quiz.status,
        isScheduled: quiz.isScheduled,
        scheduleDate: quiz.scheduleDate,
        startTime: quiz.startTime,
        endTime: quiz.endTime
      });
    });
    
    // Count by status with custom logic for scheduled
    const formattedStats = {
      total: allQuizzes.length,
      drafts: 0,
      scheduled: 0,
      active: 0,
      closed: 0
    };
    
    allQuizzes.forEach(quiz => {
      // Check if scheduled quiz is currently active or expired
      const now = new Date();
      let isCurrentlyActive = false;
      let isExpired = false;
      let isUpcoming = false;
      
      if (quiz.isScheduled && quiz.scheduleDate && quiz.startTime && quiz.endTime) {
        const scheduleDate = new Date(quiz.scheduleDate);
        const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
        const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
        
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        // ✅ CRITICAL: Handle case where quiz spans across midnight (e.g., today 8pm to tomorrow 8pm)
        if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        isUpcoming = now < startDateTime;
        isCurrentlyActive = now >= startDateTime && now < endDateTime;
        isExpired = now >= endDateTime;
        
        console.log(`📊 Quiz "${quiz.title}": now=${now.toISOString()}, start=${startDateTime.toISOString()}, end=${endDateTime.toISOString()}, isActive=${isCurrentlyActive}, isExpired=${isExpired}`);
      }
      
      // ✅ FIXED: Priority-based counting - TIME-BASED status takes precedence over DB status
      // 1. Draft = draft status and no schedule info
      if (quiz.status === 'draft' && !quiz.isScheduled) {
        formattedStats.drafts++;
      }
      // 2. Active = TIME-BASED: scheduled quiz currently in its time window (REGARDLESS of DB status)
      else if (quiz.isScheduled && isCurrentlyActive) {
        formattedStats.active++;
      }
      // 3. Closed/Recent = TIME-BASED: expired scheduled quizzes OR closed status
      else if ((quiz.isScheduled && isExpired) || quiz.status === 'closed' || quiz.status === 'completed') {
        formattedStats.closed++;
      }
      // 4. Scheduled = TIME-BASED: future scheduled quizzes (not started yet)
      else if (quiz.isScheduled && isUpcoming) {
        formattedStats.scheduled++;
      }
      // 5. Fallback for non-scheduled quizzes with explicit status
      else if (quiz.status === 'active') {
        formattedStats.active++;
      }
      else if (quiz.status === 'scheduled') {
        formattedStats.scheduled++;
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

/**
 * Get shared quizzes for students
 * FIXED: Now filters by student's year and semester
 */
export const getSharedQuizzes = async (req, res) => {
  try {
    const userId = req.user.id; // Student ID from JWT token
    
    console.log('📚 Fetching shared quizzes for student:', userId);

    // CRITICAL: Get the student's year and semester
    const student = await Student.findById(userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log('👤 Student details:', {
      id: student._id,
      name: student.name,
      year: student.year,           // Using 'year' field from Student model
      semester: student.semester     // Using 'semester' field from Student model
    });

    const now = new Date();

    // Build the filter query
    const filterQuery = {
      isScheduled: true,  // Must be scheduled
      isDeleted: false,   // Not deleted
    };

    // CRITICAL FIX: Match student's year to quiz's academicYear
    // Convert student.year ("2nd year") to academicYear number (2)
    if (student.year) {
      const yearMapping = {
        '1st year': 1,
        '2nd year': 2,
        '3rd year': 3,
        '4th year': 4
      };
      
      const academicYearNum = yearMapping[student.year];
      if (academicYearNum) {
        filterQuery.academicYear = academicYearNum;
        console.log(`🔍 Filtering by academicYear: ${academicYearNum} (from student.year: ${student.year})`);
      }
    }

    // CRITICAL FIX: Match student's semester to quiz's semester
    if (student.semester) {
      filterQuery.semester = student.semester;
      console.log(`🔍 Filtering by semester: ${student.semester}`);
    }

    console.log('🔍 Final filter query:', filterQuery);

    // Query quizzes with the filter
    const quizzes = await TeacherQuiz.find(filterQuery)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${quizzes.length} quizzes for ${student.year} - ${student.semester}`);

    // ✅ UPDATED: Process each quiz to add time status AND attempt tracking
    const processedQuizzes = await Promise.all(quizzes.map(async quiz => {
      const quizObj = quiz.toObject();
      
      let timeStatus = 'active';
      let isCurrentlyActive = true;

      if (quiz.scheduleDate && quiz.startTime && quiz.endTime) {
        const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
        const scheduleDate = new Date(quiz.scheduleDate);
        scheduleDate.setHours(startHour, startMinute, 0, 0);

        if (now < scheduleDate) {
          timeStatus = 'upcoming';
          isCurrentlyActive = false;
        }
      }

      if (quiz.dueDate && now > new Date(quiz.dueDate)) {
        timeStatus = 'expired';
        isCurrentlyActive = false;
      }

      // ✅ NEW: Get attempt tracking info for this student
      const attemptsUsed = await QuizResult.countDocuments({
        userId: req.user.id,
        quizId: quiz._id
      });

      const canAttempt = attemptsUsed < (quiz.maxAttempts || 1);

      return {
        ...quizObj,
        timeStatus,
        isCurrentlyActive,
        // ✅ NEW: Attempt tracking fields
        maxAttempts: quiz.maxAttempts || 1,
        attemptsUsed,
        canAttempt,
        attemptsRemaining: Math.max(0, (quiz.maxAttempts || 1) - attemptsUsed)
      };
    }));

    res.json({
      success: true,
      quizzes: processedQuizzes,
      studentInfo: {
        year: student.year,
        semester: student.semester
      }
    });

  } catch (error) {
    console.error('❌ Error fetching shared quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shared quizzes',
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
    const quiz = await TeacherQuiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // ✅ STEP 1: Check for duplicate submission FIRST (prevent double-click)
const recentSubmission = await QuizResult.findOne({
  userId,
  quizId: id,
  submittedAt: { $gte: new Date(Date.now() - 5000) }
});

if (recentSubmission) {
  console.log('⚠️ Duplicate submission detected, returning existing result');
  return res.json({
    success: true,
    message: 'Quiz already submitted',
    result: {
      userId,
      quizId: id,
      score: recentSubmission.score,
      correctAnswers: recentSubmission.correctAnswers,
      totalQuestions: recentSubmission.totalQuestions,
      timeTaken: recentSubmission.timeTaken,
      answers: recentSubmission.answers,
      submittedAt: recentSubmission.submittedAt
    }
  });
}


const existingAttempts = await QuizResult.countDocuments({
  userId,
  quizId: id
});

console.log(`📊 Attempt check: ${existingAttempts} of ${quiz.maxAttempts} attempts used`);

// ✅ STEP 3: Check if student has exceeded attempt limit
if (existingAttempts >= quiz.maxAttempts) {
  return res.status(403).json({
    success: false,
    message: `You have already used all ${quiz.maxAttempts} attempt(s) for this quiz.`,
    attemptsUsed: existingAttempts,
    maxAttempts: quiz.maxAttempts
  });
}
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
      // Find the index of the correct answer (where isCorrect is true)
      const correctAnswerIndex = question.options?.findIndex(opt => opt.isCorrect);
      const correctAnswer = correctAnswerIndex !== -1 ? correctAnswerIndex : null;
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: index + 1,  // Use question number instead of ObjectId
        userAnswer: userAnswer !== undefined ? userAnswer : -1,
        correctAnswer: correctAnswer !== null ? correctAnswer : -1,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    console.log(`✅ Quiz graded: ${correctAnswers}/${quiz.questions.length} correct (${score}%)`);

    // Save submission to database
    const quizResult = await QuizResult.create({
      userId,
      quizId: id,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeTaken,
      answers: results,
      submittedAt: new Date()
    });

    console.log('✅ Quiz result saved to database:', quizResult._id);

    // Create submission confirmation notification for student
    // Check if notification already exists for this specific submission
    try {
      const existingNotification = await Notification.findOne({
        recipientId: userId,
        quizId: id,
        type: 'quiz_graded',
        createdAt: { $gte: new Date(Date.now() - 5000) } // Within last 5 seconds
      });

      if (!existingNotification) {
        await Notification.create({
          recipientId: userId,
          recipientRole: 'student',
          type: 'quiz_graded',
          title: quiz.title,
          description: `Your submission has been received. You scored ${score}% (${correctAnswers}/${quiz.questions.length} correct).`,
          quizId: id,
          score: `${score}/100`,
          status: 'graded',
          isRead: false,
          metadata: {
            submissionId: quizResult._id.toString()
          }
        });
        console.log('✅ Submission notification created for student:', userId);
      } else {
        console.log('⚠️ Notification already exists for this submission, skipping duplicate');
      }

      // Send email notification if enabled
      try {
        const student = await Student.findById(userId);
        if (student && student.email) {
          const emailHtml = await sendQuizSubmissionEmail(
            student.email,
            student.name || 'Student',
            quiz.title,
            `${score}%`
          );

          await sendEmailNotification(
            userId,
            student.email,
            `✅ Quiz Submitted: ${quiz.title}`,
            emailHtml
          );
          console.log('✅ Quiz submission email sent to student:', student.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending submission email:', emailError.message);
      }
    } catch (notifError) {
      console.error('❌ Error creating submission notification:', notifError);
    }

    // Check if majority of students have now completed the quiz
    try {
      const totalStudents = await Student.countDocuments({});
      const completedCount = await QuizResult.countDocuments({ quizId: id });
      const completionPercentage = Math.round((completedCount / totalStudents) * 100);
      const majorityThreshold = 50; // 50% or more is considered majority

      console.log(`📊 Quiz completion: ${completedCount}/${totalStudents} students (${completionPercentage}%)`);

      // Check if we've just crossed the majority threshold
      if (completionPercentage >= majorityThreshold && completionPercentage - Math.round(((completedCount - 1) / totalStudents) * 100) > 0) {
        console.log(`📊 Majority threshold reached! Sending notification to teacher...`);
        
        // Get teacher info
        const teacher = await Teacher.findById(quiz.teacherId);
        
        if (teacher && teacher.email) {
          try {
            const emailHtml = await sendMajorityCompletionEmail(
              teacher.email,
              teacher.name || 'Teacher',
              quiz.title,
              completedCount,
              totalStudents,
              completionPercentage
            );

            await sendEmailNotification(
              quiz.teacherId,
              teacher.email,
              `📊 Quiz Status: ${quiz.title} - ${completionPercentage}% Complete`,
              emailHtml
            );
            console.log('✅ Majority completion email sent to teacher:', teacher.email);

            // Also create in-app notification for teacher
            await Notification.create({
              recipientId: quiz.teacherId,
              recipientRole: 'teacher',
              type: 'quiz_majority_complete',
              title: `Majority Completion: ${quiz.title}`,
              description: `${completedCount} out of ${totalStudents} students (${completionPercentage}%) have completed the quiz.`,
              quizId: id,
              status: 'completed',
              isRead: false
            });
            console.log('✅ Majority completion notification created for teacher');
          } catch (emailError) {
            console.error('❌ Error sending majority completion email:', emailError.message);
          }
        }
      }
    } catch (majorityError) {
      console.error('❌ Error checking majority completion:', majorityError);
      // Don't fail the submission if majority check fails
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        userId,
        quizId: id,
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeTaken,
        answers: results,
        submittedAt: quizResult.submittedAt
      }
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

// Get quiz submission results for a student
export const getQuizSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('📊 Fetching quiz submission:', id, 'for user:', userId);

    // Find the quiz submission
    const submission = await QuizResult.findOne({
      quizId: id,
      userId: userId
    }).sort({ submittedAt: -1 }); // Get the most recent submission

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this quiz'
      });
    }

    // Also get the quiz details
    const quiz = await TeacherQuiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    console.log('✅ Found submission:', submission._id);

    res.json({
      success: true,
      submission: {
        userId: submission.userId,
        quizId: submission.quizId,
        score: submission.score,
        correctAnswers: submission.correctAnswers,
        totalQuestions: submission.totalQuestions,
        timeTaken: submission.timeTaken,
        answers: submission.answers,
        submittedAt: submission.submittedAt
      },
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        questions: quiz.questions
      }
    });
  } catch (error) {
    console.error('Error fetching quiz submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz submission',
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
  getSharedQuizzes,
  submitQuizAnswers,
  getQuizSubmission
};