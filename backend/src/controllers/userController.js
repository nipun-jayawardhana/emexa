import userService from '../services/user.service.js';
import User from '../models/user.js';


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
    // registerUser returns { user, token }
    res.status(201).json(result);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New dashboard functions
export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      totalQuizzes: user.totalQuizzes,
      averageScore: user.averageScore,
      studyTime: user.studyTime,
      upcomingQuizzes: user.upcomingQuizzes,
      recentActivity: user.recentActivity,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfileSettings = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, inAppNotifications } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: {
        'settings.notifications.email': !!emailNotifications,
        'settings.notifications.sms': !!smsNotifications,
        'settings.notifications.inApp': !!inAppNotifications,
      } },
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ settings: updated.settings });
  } catch (error) {
    console.error('Update profile settings error:', error);
    return res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};