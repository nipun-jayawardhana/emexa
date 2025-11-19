const db = require('../config/db');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * Get teacher dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // Get total students count
    const [studentsResult] = await db.query(
      `SELECT COUNT(DISTINCT s.id) as totalStudents 
       FROM students s 
       INNER JOIN teacher_students ts ON s.id = ts.student_id 
       WHERE ts.teacher_id = ?`,
      [teacherId]
    );

    // Get present students today
    const [presentResult] = await db.query(
      `SELECT COUNT(DISTINCT a.student_id) as presentToday 
       FROM attendance a
       INNER JOIN teacher_students ts ON a.student_id = ts.student_id
       WHERE ts.teacher_id = ? 
       AND DATE(a.attendance_date) = CURDATE() 
       AND a.status = 'present'`,
      [teacherId]
    );

    // Get average progress
    const [progressResult] = await db.query(
      `SELECT AVG(sp.progress_percentage) as avgProgress 
       FROM student_progress sp
       INNER JOIN teacher_students ts ON sp.student_id = ts.student_id
       WHERE ts.teacher_id = ?`,
      [teacherId]
    );

    // Get engagement level
    const [engagementResult] = await db.query(
      `SELECT AVG(se.engagement_score) as avgEngagement 
       FROM student_engagement se
       INNER JOIN teacher_students ts ON se.student_id = ts.student_id
       WHERE ts.teacher_id = ? 
       AND se.week_start >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [teacherId]
    );

    const stats = {
      totalStudents: studentsResult[0].totalStudents || 0,
      presentToday: presentResult[0].presentToday || 0,
      averageProgress: Math.round(progressResult[0].avgProgress || 0),
      engagementLevel: engagementResult[0].avgEngagement >= 75 ? 'High' : 
                       engagementResult[0].avgEngagement >= 50 ? 'Medium' : 'Low',
      engagementScore: Math.round(engagementResult[0].avgEngagement || 0)
    };

    res.json(ApiResponse.success(stats, 'Dashboard stats retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch dashboard stats', [error.message]));
  }
};

/**
 * Get class progress data for chart
 */
exports.getClassProgress = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const [progressData] = await db.query(
      `SELECT 
        WEEK(wp.week_start) as week,
        wp.completed_percentage,
        wp.target_percentage,
        DATE_FORMAT(wp.week_start, '%b %d') as weekLabel
       FROM weekly_progress wp
       INNER JOIN teacher_students ts ON wp.class_id = ts.class_id
       WHERE ts.teacher_id = ?
       AND wp.week_start >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
       GROUP BY wp.week_start, wp.completed_percentage, wp.target_percentage
       ORDER BY wp.week_start ASC
       LIMIT 4`,
      [teacherId]
    );

    const formattedData = progressData.map((item, index) => ({
      label: `Week ${index + 1}`,
      completed: Math.round(item.completed_percentage || 0),
      target: Math.round(item.target_percentage || 80)
    }));

    res.json(ApiResponse.success(formattedData, 'Class progress retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch class progress', [error.message]));
  }
};

/**
 * Get engagement trend data for chart
 */
exports.getEngagementTrend = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const [trendData] = await db.query(
      `SELECT 
        DAYNAME(se.date) as day,
        AVG(se.engagement_score) as avgScore
       FROM student_engagement se
       INNER JOIN teacher_students ts ON se.student_id = ts.student_id
       WHERE ts.teacher_id = ?
       AND se.date >= DATE_SUB(CURDATE(), INTERVAL 5 DAY)
       GROUP BY se.date, DAYNAME(se.date)
       ORDER BY se.date ASC`,
      [teacherId]
    );

    const formattedData = trendData.map(item => ({
      day: item.day.substring(0, 3), // Mon, Tue, etc.
      score: Math.round(item.avgScore || 0)
    }));

    res.json(ApiResponse.success(formattedData, 'Engagement trend retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch engagement trend', [error.message]));
  }
};

/**
 * Get emotional state distribution
 */
exports.getEmotionalState = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const [emotionalData] = await db.query(
      `SELECT 
        es.emotion_type,
        COUNT(*) as count
       FROM emotional_state es
       INNER JOIN teacher_students ts ON es.student_id = ts.student_id
       WHERE ts.teacher_id = ?
       AND es.recorded_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY es.emotion_type`,
      [teacherId]
    );

    const total = emotionalData.reduce((sum, item) => sum + item.count, 0);
    
    const distribution = {
      happy: 0,
      confused: 0,
      frustrated: 0,
      neutral: 0
    };

    emotionalData.forEach(item => {
      const percentage = Math.round((item.count / total) * 100);
      distribution[item.emotion_type.toLowerCase()] = percentage;
    });

    res.json(ApiResponse.success(distribution, 'Emotional state retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch emotional state', [error.message]));
  }
};

/**
 * Get student overview list
 */
exports.getStudentOverview = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const limit = parseInt(req.query.limit) || 4;

    const [students] = await db.query(
      `SELECT 
        s.id,
        s.first_name,
        s.last_name,
        sp.progress_percentage,
        se.engagement_level,
        u.profile_image
       FROM students s
       INNER JOIN teacher_students ts ON s.id = ts.student_id
       INNER JOIN users u ON s.user_id = u.id
       LEFT JOIN student_progress sp ON s.id = sp.student_id
       LEFT JOIN (
         SELECT student_id, 
           CASE 
             WHEN AVG(engagement_score) >= 75 THEN 'High'
             WHEN AVG(engagement_score) >= 50 THEN 'Medium'
             ELSE 'Low'
           END as engagement_level
         FROM student_engagement
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         GROUP BY student_id
       ) se ON s.id = se.student_id
       WHERE ts.teacher_id = ?
       ORDER BY sp.progress_percentage DESC
       LIMIT ?`,
      [teacherId, limit]
    );

    const formattedStudents = students.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      engagement: student.engagement_level || 'Medium',
      progress: Math.round(student.progress_percentage || 0),
      image: student.profile_image || '👤'
    }));

    res.json(ApiResponse.success(formattedStudents, 'Student overview retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch student overview', [error.message]));
  }
};

/**
 * Get teacher's recent quizzes
 */
exports.getRecentQuizzes = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const [quizzes] = await db.query(
      `SELECT 
        q.id,
        q.title,
        q.due_date,
        COUNT(DISTINCT qs.student_id) as totalStudents,
        COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.student_id END) as completedCount
       FROM quizzes q
       LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
       WHERE q.teacher_id = ?
       AND q.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY q.id, q.title, q.due_date
       ORDER BY q.created_at DESC
       LIMIT 5`,
      [teacherId]
    );

    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      dueDate: quiz.due_date,
      totalStudents: quiz.totalStudents || 0,
      completed: quiz.completedCount || 0
    }));

    res.json(ApiResponse.success(formattedQuizzes, 'Recent quizzes retrieved successfully'));
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch recent quizzes', [error.message]));
  }
};
