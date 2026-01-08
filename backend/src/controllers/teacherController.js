import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import User from '../models/user.js';
import TeacherQuiz from '../models/teacherQuiz.js';
import Notification from '../models/notification.js';

// Import QuizResult - adjust path based on your project structure
// If you have a separate quiz.js model file with QuizResult export
import { QuizResult } from '../models/quiz.js';
// OR if QuizResult is in a different file, adjust the path:
// import QuizResult from '../models/quizResult.js';

/**
 * HELPER: Calculate actual dashboard statistics
 */
const calculateTeacherStats = async (teacherId) => {
  console.log('📊 Calculating teacher stats for:', teacherId);

  // Get all quizzes created by this teacher
  const teacherQuizzes = await TeacherQuiz.find({
    teacherId: teacherId,
    isDeleted: false
  }).lean();

  console.log('📚 Found teacher quizzes:', teacherQuizzes.length);

  // Get all quiz IDs
  const quizIds = teacherQuizzes.map(q => q._id);

  // Get all students who have been assigned these quizzes
  const notifications = await Notification.find({
    quizId: { $in: quizIds },
    type: 'quiz_assigned',
    recipientRole: 'student'
  }).lean();

  // Get unique student IDs
  const studentIds = [...new Set(notifications.map(n => n.recipientId))];
  const totalStudents = studentIds.length;

  console.log('👥 Total students assigned quizzes:', totalStudents);

  // Get all quiz results for these quizzes
  const quizResults = await QuizResult.find({
    quizId: { $in: quizIds }
  }).lean();

  console.log('📝 Found quiz results:', quizResults.length);

  // Calculate average progress (average score from all quiz results)
  let averageProgress = 0;
  if (quizResults.length > 0) {
    const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
    averageProgress = Math.round(totalScore / quizResults.length);
  }

  // Calculate engagement level based on quiz completion rate
  let engagementLevel = 'Low';
  let engagementPercentage = 0;
  
  if (totalStudents > 0) {
    const totalAssignments = notifications.length;
    const completedAssignments = quizResults.length;
    engagementPercentage = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;
    
    if (engagementPercentage >= 80) {
      engagementLevel = 'High';
    } else if (engagementPercentage >= 60) {
      engagementLevel = 'Medium';
    } else {
      engagementLevel = 'Low';
    }
  }

  // Calculate present today (students who took a quiz today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const presentToday = await QuizResult.countDocuments({
    quizId: { $in: quizIds },
    submittedAt: { $gte: today, $lt: tomorrow }
  });

  return {
    totalStudents,
    presentToday,
    averageProgress,
    targetProgress: 80,
    engagementLevel,
    engagementPercentage,
    weeklyChange: 5 // This would need historical data to calculate accurately
  };
};

/**
 * Get teacher dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📊 Fetching dashboard stats for teacher:', teacherId);

    const stats = await calculateTeacherStats(teacherId);

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

/**
 * Get class progress data for chart (last 4 weeks)
 */
const getClassProgress = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📈 Fetching class progress for teacher:', teacherId);

    // Get all quizzes by this teacher
    const teacherQuizzes = await TeacherQuiz.find({
      teacherId: teacherId,
      isDeleted: false
    }).lean();

    const quizIds = teacherQuizzes.map(q => q._id);

    // Calculate progress for last 4 weeks
    const progressData = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      // Get quiz results for this week
      const weekResults = await QuizResult.find({
        quizId: { $in: quizIds },
        submittedAt: { $gte: weekStart, $lte: weekEnd }
      }).lean();

      // Calculate average score for this week
      let completed = 0;
      if (weekResults.length > 0) {
        const totalScore = weekResults.reduce((sum, r) => sum + r.score, 0);
        completed = Math.round(totalScore / weekResults.length);
      }

      progressData.push({
        label: `Week ${4 - i}`,
        completed: completed,
        target: 80 // Fixed target
      });
    }

    res.json({
      success: true,
      data: progressData,
      message: 'Class progress retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching class progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class progress',
      error: error.message
    });
  }
};

/**
 * Get engagement trend data for chart (last 5 days)
 */
const getEngagementTrend = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📊 Fetching engagement trend for teacher:', teacherId);

    // Get all quizzes by this teacher
    const teacherQuizzes = await TeacherQuiz.find({
      teacherId: teacherId,
      isDeleted: false
    }).lean();

    const quizIds = teacherQuizzes.map(q => q._id);

    // Get total assignments
    const totalAssignments = await Notification.countDocuments({
      quizId: { $in: quizIds },
      type: 'quiz_assigned',
      recipientRole: 'student'
    });

    const engagementData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const currentDay = today.getDay();
    
    // Calculate Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Get quiz results for this day
      const dayResults = await QuizResult.countDocuments({
        quizId: { $in: quizIds },
        submittedAt: { $gte: dayStart, $lte: dayEnd }
      });

      // Calculate engagement percentage for this day
      let score = totalAssignments > 0 
        ? Math.round((dayResults / totalAssignments) * 100)
        : 0;
      
      // Ensure score is between 0-100
      score = Math.min(Math.max(score, 0), 100);

      engagementData.push({
        day: days[i],
        score: score
      });
    }

    res.json({
      success: true,
      data: engagementData,
      message: 'Engagement trend retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching engagement trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement trend',
      error: error.message
    });
  }
};

/**
 * Get emotional state distribution
 * NOTE: This requires emotion tracking to be implemented
 * For now, returns placeholder data
 */
const getEmotionalState = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('😊 Fetching emotional state for teacher:', teacherId);

    // TODO: Implement actual emotion tracking
    // For now, return placeholder data
    const emotionalData = {
      happy: 40,
      confused: 30,
      frustrated: 20,
      neutral: 10
    };

    res.json({
      success: true,
      data: emotionalData,
      message: 'Emotional state retrieved successfully (placeholder data)'
    });
  } catch (error) {
    console.error('❌ Error fetching emotional state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emotional state',
      error: error.message
    });
  }
};

/**
 * Get student overview list with actual data
 */
const getStudentOverview = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const limit = parseInt(req.query.limit) || 4;
    
    console.log('👨‍🎓 Fetching student overview for teacher:', teacherId);

    // Get all quizzes by this teacher
    const teacherQuizzes = await TeacherQuiz.find({
      teacherId: teacherId,
      isDeleted: false
    }).lean();

    const quizIds = teacherQuizzes.map(q => q._id);

    // Get all students who have been assigned quizzes
    const notifications = await Notification.find({
      quizId: { $in: quizIds },
      type: 'quiz_assigned',
      recipientRole: 'student'
    }).lean();

    // Get unique student IDs
    const studentIds = [...new Set(notifications.map(n => n.recipientId))];

    // Get student details and their quiz results
    const studentsData = await Promise.all(
      studentIds.slice(0, limit).map(async (studentId) => {
        // Find student
        let student = await Student.findById(studentId).select('name email profileImage').lean();
        if (!student) {
          student = await User.findById(studentId).select('name email profileImage').lean();
        }

        if (!student) return null;

        // Get all quiz results for this student
        const studentResults = await QuizResult.find({
          userId: studentId,
          quizId: { $in: quizIds }
        }).lean();

        // Calculate average progress
        let progress = 0;
        if (studentResults.length > 0) {
          const totalScore = studentResults.reduce((sum, r) => sum + r.score, 0);
          progress = Math.round(totalScore / studentResults.length);
        }

        // Calculate engagement level
        const totalAssigned = notifications.filter(n => n.recipientId.toString() === studentId.toString()).length;
        const completionRate = totalAssigned > 0 
          ? Math.round((studentResults.length / totalAssigned) * 100)
          : 0;
        
        let engagement = 'Low';
        if (completionRate >= 80) {
          engagement = 'High';
        } else if (completionRate >= 60) {
          engagement = 'Medium';
        }

        return {
          id: student._id,
          name: student.name,
          engagement: engagement,
          progress: progress,
          profileImage: student.profileImage || null
        };
      })
    );

    // Filter out null values
    const students = studentsData.filter(s => s !== null);

    res.json({
      success: true,
      data: students,
      total: studentIds.length,
      message: 'Student overview retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching student overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student overview',
      error: error.message
    });
  }
};

/**
 * Get teacher's recent quizzes with actual data
 */
const getRecentQuizzes = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const limit = parseInt(req.query.limit) || 3;
    
    console.log('📝 Fetching recent quizzes for teacher:', teacherId);

    // Get recent quizzes
    const quizzes = await TeacherQuiz.find({
      teacherId: teacherId,
      isDeleted: false,
      status: { $ne: 'draft' }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get completion stats for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        // Count total students assigned
        const totalStudents = await Notification.countDocuments({
          quizId: quiz._id,
          type: 'quiz_assigned',
          recipientRole: 'student'
        });

        // Count completed attempts
        const completed = await QuizResult.countDocuments({
          quizId: quiz._id
        });

        return {
          id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          dueDate: quiz.dueDate,
          scheduleDate: quiz.scheduleDate,
          totalStudents: totalStudents,
          completed: completed,
          status: quiz.status
        };
      })
    );

    res.json({
      success: true,
      data: quizzesWithStats,
      message: 'Recent quizzes retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching recent quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent quizzes',
      error: error.message
    });
  }
};

/**
 * Get teacher profile
 */
const getProfile = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const teacher = await Teacher.findById(teacherId).select('-password');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        department: teacher.department,
        specialization: teacher.specialization,
        role: teacher.role,
        profileImage: teacher.profileImage || null,
        settings: teacher.settings || {
          emailNotifications: true,
          smsNotifications: false,
          inAppNotifications: true,
          emotionConsent: true
        }
      },
      profileImage: teacher.profileImage || null
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update teacher profile (name)
 */
const updateProfile = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        department: teacher.department,
        specialization: teacher.specialization,
        role: teacher.role
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Change password for authenticated teacher
 */
const changePassword = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const teacher = await Teacher.findById(teacherId).select('+password');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const isMatch = await teacher.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    teacher.password = newPassword;
    await teacher.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Upload teacher profile image to Cloudinary
 */
const uploadProfileImage = async (req, res) => {
  try {
    console.log('📸 Upload profile image request received');
    console.log('User:', req.user || req.userId);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const teacherId = req.userId || req.user._id || req.user.id;

    // Cloudinary URL from multer-storage-cloudinary
    const profileImageUrl = req.file.path;
    console.log('☁️  Cloudinary URL:', profileImageUrl);

    // Update teacher's profile image in database
    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    console.log('✅ Profile image updated in database');

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: profileImageUrl,
      data: {
        profileImage: profileImageUrl
      }
    });

  } catch (error) {
    console.error('❌ Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
};

/**
 * Get teacher settings (notifications & privacy)
 */
const getSettings = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    const teacher = await Teacher.findById(teacherId).select('settings');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Default settings if none exist
    const settings = teacher.settings || {
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      emotionConsent: true
    };

    console.log('✅ Settings retrieved from database:', settings);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * Update teacher settings (notifications & privacy)
 */
const updateSettings = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const { 
      emailNotifications, 
      smsNotifications, 
      inAppNotifications, 
      emotionConsent 
    } = req.body;

    console.log('📝 Updating settings for teacher:', teacherId);
    console.log('Received settings:', req.body);

    // Get current settings first to preserve existing values
    const teacher = await Teacher.findById(teacherId).select('settings');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Merge with existing settings - only update provided fields
    const currentSettings = teacher.settings || {};
    const settings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : (currentSettings.emailNotifications ?? true),
      smsNotifications: smsNotifications !== undefined ? smsNotifications : (currentSettings.smsNotifications ?? false),
      inAppNotifications: inAppNotifications !== undefined ? inAppNotifications : (currentSettings.inAppNotifications ?? true),
      emotionConsent: emotionConsent !== undefined ? emotionConsent : (currentSettings.emotionConsent ?? true)
    };

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { settings },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Settings saved to database:', updatedTeacher.settings);

    res.json({
      success: true,
      data: updatedTeacher.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

export default {
  getDashboardStats,
  getClassProgress,
  getEngagementTrend,
  getEmotionalState,
  getStudentOverview,
  getRecentQuizzes,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  getSettings,
  updateSettings
};