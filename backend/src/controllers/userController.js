import userService from '../services/user.service.js';
import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import { QuizResult } from '../models/quiz.js';
import TeacherQuiz from '../models/teacherQuiz.js';
import Notification from '../models/notification.js';
import { 
  sendEmailNotification, 
  sendProfileUpdateEmail,
  sendSettingsChangeEmail 
} from '../services/notificationEmail.service.js';
import bcrypt from 'bcrypt';

// ============================================
// GET ALL APPROVED USERS (FIXED VERSION)
// ============================================
export const getUsers = async (req, res) => {
  try {
    console.log('🔍 GET /api/users called');
    console.log('Query params:', req.query);
    
    const { role, page, limit, sort } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
      console.log('Role filter applied:', role);
    }
    
    const options = { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 1000, 
      sort: sort || '-createdAt' 
    };
    
    console.log('📋 Fetching users with filter:', filter);
    console.log('Options:', options);
    
    const result = await userService.getAllUsers(filter, options);
    
    console.log('✅ Users fetched successfully:', {
      totalUsers: result.total,
      students: result.students?.length || 0,
      teachers: result.teachers?.length || 0,
      admins: result.admins?.length || 0
    });
    
    // Return just the users array for frontend compatibility
    res.status(200).json(result.users || []);
  } catch (err) {
    console.error('❌ Get users error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// ============================================
// CREATE USER
// ============================================
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const result = await userService.registerUser({ name, email, password });
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// HELPER FUNCTION TO CALCULATE DASHBOARD STATS
// ============================================
const calculateDashboardStats = async (userId) => {
  console.log('📊 Calculating dashboard stats for userId:', userId);

  // Get all quiz results for this user
  const quizResults = await QuizResult.find({ userId: userId }).lean();
  console.log('📝 Found quiz results:', quizResults.length);

  // Calculate Total Quizzes (completed quizzes)
  const totalQuizzes = quizResults.length;

  // Calculate Average Score
  let averageScore = 0;
  if (quizResults.length > 0) {
    const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
    averageScore = Math.round(totalScore / quizResults.length);
  }

  // Calculate Study Time (in hours)
  let studyTime = 0;
  if (quizResults.length > 0) {
    const totalSeconds = quizResults.reduce((sum, result) => sum + (result.timeTaken || 0), 0);
    studyTime = Math.round(totalSeconds / 3600); // Convert seconds to hours
  }

  // Get upcoming quizzes
  const now = new Date();
  
  // Get quiz notifications for this student
  const quizNotifications = await Notification.find({
    recipientId: userId,
    type: 'quiz_assigned',
    recipientRole: 'student'
  }).lean();

  console.log('🔔 Found quiz notifications:', quizNotifications.length);

  // Get the actual quiz details for each notification
  const upcomingQuizzesPromises = quizNotifications.map(async (notification) => {
    try {
      const quizId = notification.quizId;
      const quiz = await TeacherQuiz.findById(quizId).lean();
      
      if (!quiz || quiz.isDeleted) return null;
      
      // Check if already completed
      const hasCompleted = await QuizResult.findOne({
        userId: userId,
        quizId: quizId
      });
      
      if (hasCompleted) return null; // Don't show completed quizzes
      
      // Check time status
      let timeStatus = 'active';
      let isCurrentlyActive = true;
      
      if (quiz.isScheduled && quiz.scheduleDate && quiz.startTime && quiz.endTime) {
        const scheduleDate = new Date(quiz.scheduleDate);
        const [startHour, startMinute] = quiz.startTime.split(':').map(Number);
        const [endHour, endMinute] = quiz.endTime.split(':').map(Number);
        
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        if (now < startDateTime) {
          timeStatus = 'upcoming';
          isCurrentlyActive = false;
        } else if (now >= startDateTime && now < endDateTime) {
          timeStatus = 'active';
          isCurrentlyActive = true;
        } else {
          timeStatus = 'expired';
          isCurrentlyActive = false;
        }
      }
      
      return {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        description: `${quiz.questions?.length || 0} question${quiz.questions?.length !== 1 ? 's' : ''}`,
        date: quiz.dueDate,
        dueDate: quiz.dueDate,
        scheduleDate: quiz.scheduleDate,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        questions: quiz.questions,
        timeStatus: timeStatus,
        isCurrentlyActive: isCurrentlyActive
      };
    } catch (err) {
      console.error('Error fetching quiz:', err);
      return null;
    }
  });

  const upcomingQuizzesResults = await Promise.all(upcomingQuizzesPromises);
  const upcomingQuizzes = upcomingQuizzesResults.filter(q => q !== null);

  console.log('📚 Upcoming quizzes processed:', upcomingQuizzes.length);

  // Get recent activity
  const recentResults = await QuizResult.find({ userId: userId })
    .sort({ submittedAt: -1 })
    .limit(5)
    .lean();

  const recentActivity = await Promise.all(
    recentResults.map(async (result) => {
      // Try to find the quiz details
      let quizTitle = 'Quiz';
      try {
        const quiz = await TeacherQuiz.findById(result.quizId).lean();
        if (quiz) quizTitle = quiz.title;
      } catch (err) {
        console.log('Could not find quiz:', result.quizId);
      }

      return {
        type: 'Completed Quiz',
        title: quizTitle,
        date: result.submittedAt,
        score: result.score,
        status: 'completed'
      };
    })
  );

  return {
    totalQuizzes,
    averageScore,
    studyTime,
    upcomingQuizzes,
    recentActivity
  };
};

// ============================================
// DASHBOARD DATA FOR LOGGED-IN USER
// ============================================
export const getDashboardData = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard data for userId:', req.userId);
    
    // Find the user
    let user = await User.findById(req.userId).select('-password');
    let userCollection = 'User';
    
    if (!user) {
      user = await Student.findById(req.userId).select('-password');
      userCollection = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId).select('-password');
      userCollection = 'Teacher';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${userCollection}:`, user.email);

    // Calculate stats
    const stats = await calculateDashboardStats(req.userId);

    // Update user model with calculated values
    user.totalQuizzes = stats.totalQuizzes;
    user.averageScore = stats.averageScore;
    user.studyTime = stats.studyTime;
    await user.save();

    console.log('✅ Dashboard stats calculated:', stats);

    // Return response
    res.status(200).json({
      name: user.name,
      email: user.email,
      totalQuizzes: stats.totalQuizzes,
      averageScore: stats.averageScore,
      studyTime: stats.studyTime,
      upcomingQuizzes: stats.upcomingQuizzes,
      recentActivity: stats.recentActivity,
    });
  } catch (error) {
    console.error('❌ Get dashboard data error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
};

// ============================================
// NEW: GET DASHBOARD DATA FOR SPECIFIC USER (ADMIN USE)
// ============================================
export const getUserDashboardById = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    console.log('📊 Admin fetching dashboard data for userId:', targetUserId);
    
    // Find the target user
    let user = await User.findById(targetUserId).select('-password');
    let userCollection = 'User';
    
    if (!user) {
      user = await Student.findById(targetUserId).select('-password');
      userCollection = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(targetUserId).select('-password');
      userCollection = 'Teacher';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${userCollection}:`, user.email);

    // Calculate stats for this user
    const stats = await calculateDashboardStats(targetUserId);

    // Update user model with calculated values
    user.totalQuizzes = stats.totalQuizzes;
    user.averageScore = stats.averageScore;
    user.studyTime = stats.studyTime;
    await user.save();

    console.log('✅ Dashboard stats calculated for user:', stats);

    // Return response
    res.status(200).json({
      name: user.name,
      email: user.email,
      totalQuizzes: stats.totalQuizzes,
      averageScore: stats.averageScore,
      studyTime: stats.studyTime,
      upcomingQuizzes: stats.upcomingQuizzes,
      recentActivity: stats.recentActivity,
    });
  } catch (error) {
    console.error('❌ Get user dashboard by ID error:', error);
    res.status(500).json({ 
      message: 'Error fetching user dashboard data', 
      error: error.message 
    });
  }
};

// ============================================
// GET PROFILE
// ============================================
export const getProfile = async (req, res) => {
  try {
    console.log('🔍 Getting profile for userId:', req.userId);
    
    let user = await User.findById(req.userId).select('-password');
    let collectionName = 'User';
    
    if (!user) {
      user = await Student.findById(req.userId).select('-password');
      collectionName = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId).select('-password');
      collectionName = 'Teacher';
    }
    
    if (!user) {
      console.error('❌ User not found. userId:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${collectionName} collection:`, user.email);

    const profileData = {
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      profileImage: user.profileImage || null,
      year: user.year || null,
      semester: user.semester || null,
      notificationSettings: {
        emailNotifications: user.notificationSettings?.emailNotifications ?? true,
        smsNotifications: user.notificationSettings?.smsNotifications ?? false,
        inAppNotifications: user.notificationSettings?.inAppNotifications ?? true
      },
      privacySettings: {
        emotionDataConsent: user.privacySettings?.emotionDataConsent ?? true
      },
      recentActivity: user.recentActivity || [],
      totalQuizzes: user.totalQuizzes || 0,
      averageScore: user.averageScore || 0,
      studyTime: user.studyTime || 0,
      upcomingQuizzes: user.upcomingQuizzes || []
    };

    console.log('📤 Sending profile with image:', profileData.profileImage);
    res.status(200).json(profileData);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    let user = await User.findById(req.userId);
    
    if (!user) {
      user = await Student.findById(req.userId);
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExistsInUser = await User.findOne({ email, _id: { $ne: req.userId } });
      const emailExistsInStudent = await Student.findOne({ email, _id: { $ne: req.userId } });
      const emailExistsInTeacher = await Teacher.findOne({ email, _id: { $ne: req.userId } });
      
      if (emailExistsInUser || emailExistsInStudent || emailExistsInTeacher) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();

    // Send email notification if enabled
    try {
      const emailHtml = await sendProfileUpdateEmail(user.email, user.name || 'User');
      await sendEmailNotification(
        req.userId,
        user.email,
        '✏️ Profile Updated - EMEXA',
        emailHtml
      );
    } catch (emailError) {
      console.error('❌ Error sending profile update email:', emailError.message);
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔐 Password change request for userId:', req.userId);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    let user = await User.findById(req.userId).select('+password');
    let collectionName = 'User';
    
    if (!user) {
      user = await Student.findById(req.userId).select('+password');
      collectionName = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId).select('+password');
      collectionName = 'Teacher';
    }
    
    if (!user) {
      console.error('❌ User not found. userId:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${collectionName} collection`);

    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      console.log('❌ Current password incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================
export const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, inAppNotifications } = req.body;
    
    let user = await User.findById(req.userId);
    if (!user) user = await Student.findById(req.userId);
    if (!user) user = await Teacher.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store previous settings for comparison
    const previousSettings = { ...user.notificationSettings };

    user.notificationSettings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.notificationSettings?.emailNotifications ?? true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : user.notificationSettings?.smsNotifications ?? false,
      inAppNotifications: inAppNotifications !== undefined ? inAppNotifications : user.notificationSettings?.inAppNotifications ?? true
    };
    
    await user.save();

    // Prepare changed settings for email
    const changedSettings = {};
    if (emailNotifications !== undefined && emailNotifications !== previousSettings.emailNotifications) {
      changedSettings.emailNotifications = emailNotifications;
    }
    if (smsNotifications !== undefined && smsNotifications !== previousSettings.smsNotifications) {
      changedSettings.smsNotifications = smsNotifications;
    }
    if (inAppNotifications !== undefined && inAppNotifications !== previousSettings.inAppNotifications) {
      changedSettings.inAppNotifications = inAppNotifications;
    }

    // Send email notification if settings were changed (only if email notifications are still enabled)
    if (Object.keys(changedSettings).length > 0 && user.notificationSettings.emailNotifications) {
      try {
        const emailHtml = await sendSettingsChangeEmail(
          user.email,
          user.name || 'User',
          changedSettings
        );
        await sendEmailNotification(
          req.userId,
          user.email,
          '⚙️ Settings Updated - EMEXA',
          emailHtml
        );
      } catch (emailError) {
        console.error('❌ Error sending settings change email:', emailError.message);
      }
    }

    res.json({ 
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// UPDATE PRIVACY SETTINGS
// ============================================
export const updatePrivacySettings = async (req, res) => {
  try {
    const { emotionDataConsent } = req.body;
    
    let user = await User.findById(req.userId);
    if (!user) user = await Student.findById(req.userId);
    if (!user) user = await Teacher.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.privacySettings = {
      emotionDataConsent: emotionDataConsent !== undefined ? emotionDataConsent : user.privacySettings?.emotionDataConsent ?? true
    };
    
    await user.save();

    res.json({ 
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// EXPORT USER DATA
// ============================================
export const exportUserData = async (req, res) => {
  try {
    let user = await User.findById(req.userId).select('-password');
    if (!user) user = await Student.findById(req.userId).select('-password');
    if (!user) user = await Teacher.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      settings: {
        notifications: user.notificationSettings || {},
        privacy: user.privacySettings || {}
      },
      statistics: {
        totalQuizzes: user.totalQuizzes || 0,
        averageScore: user.averageScore || 0,
        studyTime: user.studyTime || 0
      },
      upcomingQuizzes: user.upcomingQuizzes || [],
      recentActivity: user.recentActivity || []
    };

    res.json(exportData);
  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// UPLOAD PROFILE IMAGE (FIXED FOR ADMIN VIEWING)
// ============================================
export const uploadProfileImage = async (req, res) => {
  try {
    console.log('📸 ===== PROFILE IMAGE UPLOAD STARTED =====');
    console.log('userId:', req.userId);
    console.log('file:', req.file);
    console.log('body:', req.body);
    
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        message: 'Please select an image file' 
      });
    }

    console.log('📁 File details:');
    console.log('  - Filename:', req.file.filename);
    console.log('  - Path:', req.file.path);
    console.log('  - Size:', req.file.size);

    // IMPORTANT: Check if admin is uploading for another user
    const targetUserId = req.body.targetUserId || req.userId;
    const targetRole = req.body.userRole;
    
    console.log('🎯 Target user:', targetUserId);
    console.log('🎯 Target role:', targetRole);
    console.log('🔐 Current user (uploader):', req.userId);
    
    // Find the target user
    let user;
    let collection;
    
    if (targetRole) {
      // If role is specified, search in that collection first
      if (targetRole === 'student') {
        user = await Student.findById(targetUserId);
        collection = 'Student';
      } else if (targetRole === 'teacher') {
        user = await Teacher.findById(targetUserId);
        collection = 'Teacher';
      } else if (targetRole === 'admin') {
        user = await User.findById(targetUserId);
        collection = 'User';
      }
    }
    
    // If not found with specified role, search all collections
    if (!user) {
      user = await User.findById(targetUserId);
      collection = 'User';
    }
    
    if (!user) {
      user = await Student.findById(targetUserId);
      collection = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(targetUserId);
      collection = 'Teacher';
    }
    
    if (!user) {
      console.error('❌ User not found. targetUserId:', targetUserId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'User not found in database' 
      });
    }

    console.log(`✅ User found in ${collection} collection: ${user.email}`);

    const imageUrl = req.file.path;
    console.log('🔗 Cloudinary URL:', imageUrl);

    user.profileImage = imageUrl;
    const savedUser = await user.save();

    console.log(`✅ Profile image saved to ${collection}`);
    console.log('   New profileImage:', savedUser.profileImage);
    console.log('   Is admin upload:', targetUserId !== req.userId);

    res.json({ 
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: savedUser.profileImage,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        profileImage: savedUser.profileImage
      }
    });
  } catch (error) {
    console.error('❌ ===== ERROR UPLOADING PROFILE IMAGE =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to upload profile image'
    });
  }
};