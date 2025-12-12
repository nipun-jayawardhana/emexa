import userService from '../services/user.service.js';
import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
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
// DASHBOARD DATA
// ============================================
export const getDashboardData = async (req, res) => {
  try {
    let user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      user = await Student.findById(req.userId).select('-password');
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      totalQuizzes: user.totalQuizzes || 0,
      averageScore: user.averageScore || 0,
      studyTime: user.studyTime || 0,
      upcomingQuizzes: user.upcomingQuizzes || [],
      recentActivity: user.recentActivity || [],
    });
  } catch (error) {
    console.error('❌ Get dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
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

    user.notificationSettings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.notificationSettings?.emailNotifications ?? true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : user.notificationSettings?.smsNotifications ?? false,
      inAppNotifications: inAppNotifications !== undefined ? inAppNotifications : user.notificationSettings?.inAppNotifications ?? true
    };
    
    await user.save();

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
// UPLOAD PROFILE IMAGE
// ============================================
export const uploadProfileImage = async (req, res) => {
  try {
    console.log('📸 ===== PROFILE IMAGE UPLOAD STARTED =====');
    console.log('userId:', req.userId);
    console.log('file:', req.file);
    
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

    let user = await User.findById(req.userId);
    let collection = 'User';
    
    if (!user) {
      user = await Student.findById(req.userId);
      collection = 'Student';
    }
    
    if (!user) {
      user = await Teacher.findById(req.userId);
      collection = 'Teacher';
    }
    
    if (!user) {
      console.error('❌ User not found. userId:', req.userId);
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

    res.json({ 
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: savedUser.profileImage,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        profileImage: savedUser.profileImage
      }
    });
  } catch (error) {
    console.error('❌ ===== ERROR UPLOADING PROFILE IMAGE =====');
    console.error('Error:', error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to upload profile image'
    });
  }
};