import userService from '../services/user.service.js';
import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const { role, page, limit, sort } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10, sort: sort || '-createdAt' };
    const result = await userService.getAllUsers(filter, options);
    res.json(result);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const result = await userService.registerUser({ name, email, password });
    res.status(201).json(result);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dashboard functions
export const getDashboardData = async (req, res) => {
  try {
    // Try User collection first
    let user = await User.findById(req.userId).select('-password');
    
    // If not found in User, try Student collection
    if (!user) {
      user = await Student.findById(req.userId).select('-password');
    }
    
    // If still not found, try Teacher collection
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
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Profile functions - FIXED to check all collections
export const getProfile = async (req, res) => {
  try {
    console.log('🔍 Getting profile for userId:', req.userId);
    
    // Try User collection first
    let user = await User.findById(req.userId).select('-password');
    let collectionName = 'User';
    
    // If not found in User, try Student collection
    if (!user) {
      user = await Student.findById(req.userId).select('-password');
      collectionName = 'Student';
    }
    
    // If still not found, try Teacher collection
    if (!user) {
      user = await Teacher.findById(req.userId).select('-password');
      collectionName = 'Teacher';
    }
    
    if (!user) {
      console.error('❌ User not found in any collection. userId:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${collectionName} collection:`, user.email);

    // Return complete profile data with all fields
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

    console.log('📤 Sending profile data:', profileData);
    res.status(200).json(profileData);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update profile information
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Try User collection first
    let user = await User.findById(req.userId);
    
    // If not in User, try Student collection
    if (!user) {
      user = await Student.findById(req.userId);
    }
    
    // If still not found, try Teacher collection
    if (!user) {
      user = await Teacher.findById(req.userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExistsInUser = await User.findOne({ email, _id: { $ne: req.userId } });
      const emailExistsInStudent = await Student.findOne({ email, _id: { $ne: req.userId } });
      const emailExistsInTeacher = await Teacher.findOne({ email, _id: { $ne: req.userId } });
      
      if (emailExistsInUser || emailExistsInStudent || emailExistsInTeacher) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
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
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
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

    // Get user with password field - try all collections
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
      console.error('❌ User not found for password change. userId:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ User found in ${collectionName} collection for password change`);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      console.log('❌ Current password incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, inAppNotifications } = req.body;
    
    // Try all collections
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
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update privacy settings
export const updatePrivacySettings = async (req, res) => {
  try {
    const { emotionDataConsent } = req.body;
    
    // Try all collections
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
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export user data
export const exportUserData = async (req, res) => {
  try {
    // Try all collections
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
    console.error('Error exporting user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload profile image (for future implementation)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Try all collections
    let user = await User.findById(req.userId);
    if (!user) user = await Student.findById(req.userId);
    if (!user) user = await Teacher.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build absolute URL to the uploaded file so clients can consume it directly
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;

    // Normalize role for legacy/incorrectly-cased values on User documents
    try {
      if (user && user.constructor && user.constructor.modelName === 'User' && user.role) {
        user.role = String(user.role).toLowerCase();
      }
    } catch (normErr) {
      console.warn('Could not normalize role before saving profile image:', normErr);
    }

    user.profileImage = imageUrl;
    await user.save();

    res.json({ 
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};