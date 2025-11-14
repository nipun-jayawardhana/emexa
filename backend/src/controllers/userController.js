const User = require('../models/user');

// @desc    Get all users with filtering
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    console.log('🔍 Fetching users with query:', req.query);
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'All Roles') {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    console.log(`✅ Found ${users.length} users`);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    console.log('🔍 Fetching user by ID:', req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('✅ User found');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    console.log('📝 ===== CREATE USER REQUEST =====');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, role, status } = req.body;

    // Validate required fields
    if (!name || !email || !role || !status) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, role: !!role, status: !!status });
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, role, status)'
      });
    }

    console.log('🔍 Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('🔄 Creating new user in database...');
    const user = await User.create({ name, email, role, status });
    
    console.log('✅ User created successfully! ID:', user._id);
    console.log('===================================');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ ===== ERROR CREATING USER =====');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', error);
    console.error('===================================');
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res) => {
  try {
    console.log('📝 Updating user:', req.params.id);
    const { name, email, role, status } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('❌ Email already exists');
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true, runValidators: true }
    );

    console.log('✅ User updated successfully');
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res) => {
  try {
    console.log('🗑️ Deleting user:', req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log('✅ User deleted successfully');
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get teacher approvals
// @route   GET /api/users/teacher-approvals
// @access  Public
const getTeacherApprovals = async (req, res) => {
  try {
    console.log('🔍 Fetching teacher approvals');
    const teachers = await User.find({ 
      role: 'Teacher', 
      status: 'Pending' 
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${teachers.length} pending teachers`);
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('❌ Error in getTeacherApprovals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher approvals',
      error: error.message
    });
  }
};

// EXPORT ALL
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTeacherApprovals
};