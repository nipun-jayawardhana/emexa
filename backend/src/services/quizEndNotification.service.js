import TeacherQuiz from '../models/teacherQuiz.js';
import Student from '../models/student.js';
import { QuizResult } from '../models/quiz.js';
import { createQuizEndedNotification } from '../controllers/notificationController.js';

// Track which quizzes have already had end notifications sent
const notifiedQuizzes = new Set();

/**
 * Check for ended quizzes and send notifications to teachers
 */
export const checkEndedQuizzes = async () => {
  try {
    const now = new Date();
    
    // Find all scheduled quizzes that have ended but haven't been notified yet
    const endedQuizzes = await TeacherQuiz.find({
      isScheduled: true,
      isDeleted: false,
      scheduleDate: { $exists: true },
      endTime: { $exists: true }
    });

    console.log(`🔍 Checking ${endedQuizzes.length} scheduled quizzes for end notifications...`);

    for (const quiz of endedQuizzes) {
      try {
        // Skip if already notified
        if (notifiedQuizzes.has(quiz._id.toString())) {
          continue;
        }

        // Parse quiz end time
        const scheduleDate = new Date(quiz.scheduleDate);
        const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        // Check if quiz has ended within the last 5 minutes (to avoid duplicate notifications)
        const minutesSinceEnd = (now - endDateTime) / (1000 * 60);

        if (minutesSinceEnd >= 0 && minutesSinceEnd <= 5) {
          console.log(`📊 Quiz "${quiz.title}" just ended. Calculating statistics...`);

          // Map grade level codes to year and semester
          // Grade codes format: ["1-1", "2-2"] means 1st year 1st sem, 2nd year 2nd sem
          const gradeMap = {
            "1-1": { year: "1st year", semester: "1st semester" },
            "1-2": { year: "1st year", semester: "2nd semester" },
            "2-1": { year: "2nd year", semester: "1st semester" },
            "2-2": { year: "2nd year", semester: "2nd semester" },
            "3-1": { year: "3rd year", semester: "1st semester" },
            "3-2": { year: "3rd year", semester: "2nd semester" },
            "4-1": { year: "4th year", semester: "1st semester" },
            "4-2": { year: "4th year", semester: "2nd semester" }
          };

          // Build query to find students in the assigned grade levels
          const targetGrades = quiz.gradeLevel || [];
          const studentQuery = { $or: [] };

          targetGrades.forEach(gradeCode => {
            const gradeInfo = gradeMap[gradeCode];
            if (gradeInfo) {
              studentQuery.$or.push({
                year: gradeInfo.year,
                semester: gradeInfo.semester
              });
            }
          });

          // Count students in the assigned grade levels (only approved students)
          const allStudents = studentQuery.$or.length > 0 
            ? await Student.countDocuments({ 
                ...studentQuery,
                approvalStatus: 'approved'
              })
            : 0;

          console.log(`👥 Found ${allStudents} students in assigned grade levels:`, targetGrades);

          // Count students who completed this quiz (submitted answers)
          const completedCount = await QuizResult.countDocuments({
            quizId: quiz._id,
            submitted: true
          });

          const notCompletedCount = allStudents - completedCount;

          // Send notification to teacher
          const stats = {
            completed: completedCount,
            notCompleted: notCompletedCount,
            totalStudents: allStudents
          };

          await createQuizEndedNotification(
            quiz._id,
            quiz.title,
            quiz.teacherId,
            stats
          );

          // Mark as notified
          notifiedQuizzes.add(quiz._id.toString());

          console.log(`✅ End notification sent for quiz "${quiz.title}": ${completedCount}/${allStudents} completed`);
        }
      } catch (error) {
        console.error(`❌ Error processing quiz ${quiz._id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error checking ended quizzes:', error);
  }
};

/**
 * Start the quiz end notification checker (runs every minute)
 */
export const startQuizEndNotificationService = () => {
  console.log('🚀 Starting quiz end notification service...');
  
  // Run immediately
  checkEndedQuizzes();
  
  // Then run every minute
  setInterval(checkEndedQuizzes, 60 * 1000);
  
  console.log('✅ Quiz end notification service started (checks every 1 minute)');
};
