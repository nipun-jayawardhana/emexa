import userService from '../services/user.service.js';
import userRepository from '../repositories/user.repository.js';
import studentRepository from '../repositories/student.repository.js';
import teacherRepository from '../repositories/teacher.repository.js';
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

    // userService returns { user, token }
    // Make sure to return the role in the response for frontend routing
    const response = {
      ...result,
      user: {
        ...result.user,
        role: role // Ensure role is explicitly included
      }
    };
    
    res.status(201).json(response);
  } catch (err) {
    console.error('Register error:', err);
    // If ApiError-like object, try to surface message
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
        
        console.log('✅ Admin login successful! Token generated.');
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: 'admin' // Explicitly return admin role
          }
        });
      }
    }
    
    // If not admin, try regular user login (student/teacher)
    console.log('👨‍🎓 Not admin, trying student/teacher login...');
    const result = await userService.loginUser(normalizedEmail, password);
    
    // userService.loginUser returns { user, token }
    // Ensure role is explicitly included in the response
    const response = {
      ...result,
      message: 'Login successful',
      user: {
        ...result.user,
        role: result.user.role || 'student' // Ensure role is always present
      }
    };
    
    console.log('✅ User login successful! Role:', response.user.role);
    return res.json(response);
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
    if (!email) {
      return res.status(400).json({ message: 'Missing email' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in both student and teacher collections
    const student = await studentRepository.findByEmail(normalizedEmail);
    const teacher = await teacherRepository.findByEmail(normalizedEmail);
    
    if (!student && !teacher) {
      return res.status(200).json({ 
        message: 'If the email exists we sent a link' 
      });
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

export default { 
  register, 
  login, 
  forgotPassword, 
  getStudentApprovals, 
  approveStudent, 
  rejectStudent 
};