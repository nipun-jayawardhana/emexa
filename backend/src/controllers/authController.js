import userService from '../services/user.service.js';
import userRepository from '../repositories/user.repository.js';
import studentRepository from '../repositories/student.repository.js';
import teacherRepository from '../repositories/teacher.repository.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    // Frontend sends fullName and accountType (student/teacher)
    const { fullName, name, email, password, accountType } = req.body;
    const userName = fullName || name;
    if (!userName || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const role = accountType || 'student';
    const payload = { name: userName, email, password, role };
    
    // Register based on account type - store in separate collections
    let result;
    if (role === 'teacher') {
      result = await userService.registerTeacher(payload);
    } else {
      result = await userService.registerStudent(payload);
    }

    // userService returns { user, token }
    res.status(201).json(result);
  } catch (err) {
    console.error('Register error:', err);
    // If ApiError-like object, try to surface message
    if (err && err.message) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Login attempt for:', normalizedEmail);
    
    // FIRST: Check if user is admin (from User collection)
    const adminUser = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('👤 Checking admin in User collection:', adminUser ? 'FOUND' : 'NOT FOUND');
    
    if (adminUser) {
      console.log('🎭 User role:', adminUser.role);
      console.log('🔐 Password exists:', adminUser.password ? 'YES' : 'NO');
      
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
          return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
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
        
        console.log('✅ Admin login successful! Token generated.');
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      }
    }
    
    // If not admin, try regular user login (student/teacher)
    console.log('👨‍🎓 Not admin, trying student/teacher login...');
    const result = await userService.loginUser(normalizedEmail, password);
    
    // userService.loginUser returns { user, token }
    return res.json(result);
  } catch (err) {
    console.error('❌ Login error:', err);
    
    // Return the specific error message from the service
    const statusCode = err.statusCode || 401;
    const message = err.message || 'Invalid email or password';
    
    return res.status(statusCode).json({ message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in both student and teacher collections
    let user = await studentRepository.findByEmail(normalizedEmail);
    let repository = studentRepository;
    let userType = 'student';
    
    if (!user) {
      user = await teacherRepository.findByEmail(normalizedEmail);
      repository = teacherRepository;
      userType = 'teacher';
    }
    
    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, we sent a reset link' });
    }

    // Generate reset token (6-digit code for simplicity)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save hashed token and expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // In production, send email here with resetToken
    console.log('🔐 Password reset token for', email, ':', resetToken);
    console.log('⏰ Token expires at:', new Date(user.resetPasswordExpires));
    
    // For development: return token in response (remove in production!)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    return res.json({ 
      message: 'If the email exists, we sent a reset link',
      ...(isDevelopment && { resetToken, email }) // Only in development
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    console.log('🔐 Reset password request:', { email, token: token?.substring(0, 3) + '***' });
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('🔑 Hashed token:', hashedToken.substring(0, 10) + '...');
    
    // Find user with matching token and not expired
    let user = await studentRepository.findByEmail(normalizedEmail);
    let repository = studentRepository;
    let userType = 'student';
    
    if (!user) {
      user = await teacherRepository.findByEmail(normalizedEmail);
      repository = teacherRepository;
      userType = 'teacher';
    }
    
    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log('👤 User found:', userType, normalizedEmail);
    console.log('📝 Stored token:', user.resetPasswordToken?.substring(0, 10) + '...');
    console.log('⏰ Token expires:', user.resetPasswordExpires);
    console.log('🕐 Current time:', new Date(Date.now()));

    // Verify token matches and not expired
    if (!user.resetPasswordToken || user.resetPasswordToken !== hashedToken) {
      console.log('❌ Token mismatch');
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      console.log('❌ Token expired');
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', email);

    return res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Student Approvals
export const getStudentApprovals = async (req, res) => {
  try {
    // Fetch students pending approval from User collection
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

export default { register, login, forgotPassword, resetPassword, getStudentApprovals, approveStudent, rejectStudent };