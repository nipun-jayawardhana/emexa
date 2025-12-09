import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import User from '../models/user.js';

/**
 * Get teacher dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📊 Fetching dashboard stats for teacher:', teacherId);

    const stats = {
      totalStudents: 24,
      presentToday: 22,
      averageProgress: 78,
      targetProgress: 80,
      engagementLevel: 'High',
      weeklyChange: 5
    };

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
 * Get class progress data for chart
 */
const getClassProgress = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📈 Fetching class progress for teacher:', teacherId);

    const progressData = [
      { label: 'Week 1', completed: 65, target: 82 },
      { label: 'Week 2', completed: 72, target: 80 },
      { label: 'Week 3', completed: 80, target: 82 },
      { label: 'Week 4', completed: 88, target: 80 }
    ];

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
 * Get engagement trend data for chart
 */
const getEngagementTrend = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📊 Fetching engagement trend for teacher:', teacherId);

    const engagementData = [
      { day: 'Mon', score: 65 },
      { day: 'Tue', score: 70 },
      { day: 'Wed', score: 75 },
      { day: 'Thu', score: 85 },
      { day: 'Fri', score: 80 }
    ];

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
 */
const getEmotionalState = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('😊 Fetching emotional state for teacher:', teacherId);

    const emotionalData = {
      happy: 40,
      confused: 30,
      frustrated: 20,
      neutral: 10
    };

    res.json({
      success: true,
      data: emotionalData,
      message: 'Emotional state retrieved successfully'
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
 * Get student overview list
 */
const getStudentOverview = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    const limit = parseInt(req.query.limit) || 4;
    
    console.log('👨‍🎓 Fetching student overview for teacher:', teacherId);

    const students = [
      {
        id: '1',
        name: 'Emma Thompson',
        engagement: 'High',
        progress: 92,
        image: '👩'
      },
      {
        id: '2',
        name: 'Liam Johnson',
        engagement: 'Medium',
        progress: 88,
        image: '👨'
      },
      {
        id: '3',
        name: 'Olivia Davis',
        engagement: 'High',
        progress: 95,
        image: '👩'
      },
      {
        id: '4',
        name: 'Noah Williams',
        engagement: 'Medium',
        progress: 85,
        image: '👨'
      }
    ];

    res.json({
      success: true,
      data: students.slice(0, limit),
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
 * Get teacher's recent quizzes
 */
const getRecentQuizzes = async (req, res) => {
  try {
    const teacherId = req.userId || req.user._id;
    
    console.log('📝 Fetching recent quizzes for teacher:', teacherId);

    const quizzes = [
      {
        id: '1',
        title: 'Mathematics Final Exam',
        dueDate: '2024-03-15',
        totalStudents: 24,
        completed: 18
      },
      {
        id: '2',
        title: 'Physics Quiz 3',
        dueDate: '2024-03-10',
        totalStudents: 28,
        completed: 28
      },
      {
        id: '3',
        title: 'Chemistry Lab Test',
        dueDate: '2024-03-08',
        totalStudents: 22,
        completed: 15
      }
    ];

    res.json({
      success: true,
      data: quizzes,
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
        profileImage: teacher.profileImage || null
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

export default {
  getDashboardStats,
  getClassProgress,
  getEngagementTrend,
  getEmotionalState,
  getStudentOverview,
  getRecentQuizzes,
  changePassword,
  getProfile,
  updateProfile,
  uploadProfileImage
};