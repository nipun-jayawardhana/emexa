import express from 'express';
import {
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
  getQuizSubmission
} from '../controllers/teacherQuizController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - students can access shared quizzes filtered by their grade level
router.get('/shared', protect, async (req, res) => {
  try {
    const TeacherQuiz = (await import('../models/teacherQuiz.js')).default;
    const Student = (await import('../models/student.js')).default;
    
    // Get the student's grade level
    const studentId = req.user.id || req.user._id;
    const student = await Student.findById(studentId).select('year semester');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    console.log('👤 Student grade level:', { year: student.year, semester: student.semester });
    
    // Find all scheduled quizzes
    const allQuizzes = await TeacherQuiz.find({ 
      isScheduled: true,
      isDeleted: false 
    }).select('-__v');
    
    // Filter quizzes by student's grade level
    const matchingQuizzes = allQuizzes.filter(quiz => {
      if (!quiz.gradeLevel || quiz.gradeLevel.length === 0) {
        return false; // Skip quizzes without grade level
      }
      
      // Check if any of the quiz's grade levels match the student's grade
      return quiz.gradeLevel.some(grade => {
        // Handle format "1-1" -> convert to "1st year" + "1st semester"
        if (grade.includes('-')) {
          const [yearNum, semNum] = grade.split('-');
          const yearSuffix = yearNum === '1' ? 'st' : yearNum === '2' ? 'nd' : yearNum === '3' ? 'rd' : 'th';
          const semSuffix = semNum === '1' ? 'st' : semNum === '2' ? 'nd' : 'rd';
          const expectedYear = `${yearNum}${yearSuffix} year`;
          const expectedSem = `${semNum}${semSuffix} semester`;
          
          return student.year === expectedYear && student.semester === expectedSem;
        }
        return false;
      });
    });
    
    // Add timeStatus to each quiz and filter out expired ones older than 24 hours
    const now = new Date();
    const quizzesWithStatus = matchingQuizzes
      .map(quiz => {
        const quizObj = quiz.toObject();
        quizObj.timeStatus = quiz.getTimeStatus();
        quizObj.isCurrentlyActive = quiz.isCurrentlyActive();
        return quizObj;
      })
      .filter(quiz => {
        // If quiz is expired, check if it's been more than 24 hours since end time
        if (quiz.timeStatus === 'expired' && quiz.scheduleDate && quiz.endTime && quiz.startTime) {
          const scheduleDate = new Date(quiz.scheduleDate);
          const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
          const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
          
          const startDateTime = new Date(scheduleDate);
          startDateTime.setHours(startHour, startMinute, 0, 0);
          
          let endDateTime = new Date(scheduleDate);
          endDateTime.setHours(endHour, endMinute, 0, 0);
          
          // Handle cross-midnight quizzes
          if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }
          
          // Calculate hours since quiz ended
          const hoursSinceEnd = (now - endDateTime) / (1000 * 60 * 60);
          
          // Only include if less than 24 hours have passed since quiz ended
          return hoursSinceEnd < 24;
        }
        // Include all non-expired quizzes
        return true;
      });
    
    console.log(`📚 Fetched ${quizzesWithStatus.length} quizzes matching student's grade level (${student.year} ${student.semester})`);
    
    res.status(200).json({
      success: true,
      count: quizzesWithStatus.length,
      quizzes: quizzesWithStatus
    });
  } catch (error) {
    console.error('❌ Error fetching shared quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared quizzes',
      error: error.message
    });
  }
});

// Protected routes - require authentication
router.use(protect);

// Quiz CRUD operations
router.post('/create', createQuiz);                    // Create new quiz
router.get('/my-quizzes', getTeacherQuizzes);         // Get all teacher's quizzes
router.get('/drafts', getDrafts);                      // Get draft quizzes
router.get('/scheduled', getScheduledQuizzes);        // Get scheduled quizzes
router.get('/stats', getQuizStats);                    // Get quiz statistics
router.get('/:id', getQuizById);                       // Get single quiz by ID
router.put('/:id', updateQuiz);                        // Update quiz
router.delete('/:id', deleteQuiz);                     // Soft delete quiz
router.delete('/:id/permanent', permanentDeleteQuiz);  // Permanent delete (admin)

// Scheduling
router.post('/:id/schedule', scheduleQuiz);            // Schedule a quiz

// Student submission
router.post('/:id/submit', submitQuizAnswers);         // Submit quiz answers (students)
router.get('/:id/submission', getQuizSubmission);      // Get saved submission results (students)

export default router;
