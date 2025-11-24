import userService from '../services/user.service.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    // Frontend sends fullName and accountType (student/teacher)
    const { fullName, name, email, password, accountType } = req.body;
    const userName = fullName || name;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const role = accountType || 'student';
    const payload = { name: userName, email, password, role };
    
    // Register based on account type - store in separate collections
    let result;
    if (role === 'teacher') {
      result = await userService.registerTeacher(payload);
    } else {
      result = await userService.registerStudent(payload);
    }

    // Normalize user response - ensure name is always present
    const userResponse = {
      id: result.user._id || result.user.id,
      name: result.user.name || result.user.fullName || result.user.full_name || userName,
      email: result.user.email,
      role: role
    };

    // Return normalized response
    const response = {
      token: result.token,
      user: userResponse
    };
    
    console.log('✅ Registration response:', userResponse);
    res.status(201).json(response);
  } catch (err) {
    console.error('Register error:', err);
    if (err && err.message) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Login attempt for:', normalizedEmail);
    
    // FIRST: Check if user is admin (from User collection)
    const adminUser = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('👤 Checking admin in User collection:', adminUser ? 'FOUND' : 'NOT FOUND');
    
    if (adminUser) {
      console.log('🎭 User role:', adminUser.role);
      
      // Check if this is an admin user
      if (adminUser.role === 'admin' || adminUser.role === 'Admin') {
        console.log('✅ Admin detected, processing admin login...');
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, adminUser.password);
        console.log('🔑 Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('❌ Invalid password for admin');
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check if admin is active
        if (adminUser.status && adminUser.status !== 'Active') {
          console.log('⚠️ Admin account is inactive');
          return res.status(403).json({ 
            message: 'Account is inactive. Please contact support.' 
          });
        }
        
        // Generate JWT token for admin
        const token = jwt.sign(
          { 
            id: adminUser._id, 
            email: adminUser.email, 
            role: adminUser.role 
          },
          process.env.JWT_SECRET || 'dev_secret',
          { expiresIn: '24h' }
        );
        
        // Normalize admin user response
        const adminResponse = {
          id: adminUser._id,
          name: adminUser.name || adminUser.fullName || adminUser.full_name || 'Admin',
          email: adminUser.email,
          role: 'admin'
        };
        
        console.log('✅ Admin login successful! Response:', adminResponse);
        return res.json({
          message: 'Login successful',
          token,
          user: adminResponse
        });
      }
    }
    
    // If not admin, try regular user login (student/teacher)
    console.log('👨‍🎓 Not admin, trying student/teacher login...');
    const result = await userService.loginUser(normalizedEmail, password);
    
    console.log('🔍 Raw user from service:', {
      keys: Object.keys(result.user),
      name: result.user.name,
      email: result.user.email
    });
    
    // User response is already normalized in userService.loginUser
    // Just pass it through
    const response = {
      message: 'Login successful',
      token: result.token,
      user: result.user // Already has name field from service
    };
    
    console.log('✅ User login successful! Response:', response.user);
    console.log('📤 Sending to frontend:', response);
    return res.json(response);
  } catch (err) {
    console.error('❌ Login error:', err);
    
    const statusCode = err.statusCode || 401;
    const message = err.message || 'Invalid email or password';
    
    return res.status(statusCode).json({ message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Missing email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in both student and teacher collections
    const student = await studentRepository.findByEmail(normalizedEmail);
    const teacher = await teacherRepository.findByEmail(normalizedEmail);
    
    if (!student && !teacher) {
      return res.status(200).json({ message: 'If the email exists we sent a link' });
    }

    // TODO: generate reset token and send email
    return res.json({ message: 'If the email exists we sent a link' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Student Approvals
export const getStudentApprovals = async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'Student',
      approvalStatus: { $in: ['pending', 'approved', 'rejected'] }
    }).select('-password');
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching student approvals:', error);
    res.status(500).json({ message: 'Server error fetching student approvals' });
  }
};

// Approve Student
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findByIdAndUpdate(
      id,
      { 
        approvalStatus: 'approved',
        status: 'Active'
      },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student approved successfully', student });
  } catch (error) {
    console.error('Error approving student:', error);
    res.status(500).json({ message: 'Server error approving student' });
  }
};

// Reject Student
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findByIdAndUpdate(
      id,
      { 
        approvalStatus: 'rejected',
        status: 'Inactive'
      },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student rejected', student });
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: 'Server error rejecting student' });
  }
};

export default { register, login, forgotPassword, getStudentApprovals, approveStudent, rejectStudent };
