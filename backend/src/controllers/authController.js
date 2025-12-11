import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================
// REGISTER - Saves to User collection with pending status
// ============================================
export const register = async (req, res) => {
  try {
    const { fullName, name, email, password, accountType } = req.body;
    const userName = fullName || name;
    
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const role = accountType || 'student';
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('📝 Registration attempt:', { userName, email: normalizedEmail, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingStudent = await Student.findOne({ email: normalizedEmail });
    const existingTeacher = await Teacher.findOne({ email: normalizedEmail });
    
    if (existingUser || existingStudent || existingTeacher) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with PENDING status
    const newUser = new User({
      name: userName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role,
      approvalStatus: 'pending',
      status: 'Pending',
      isActive: false
    });

    await newUser.save();

    console.log('✅ User registered with pending status:', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      approvalStatus: newUser.approvalStatus
    });

    res.status(201).json({
      message: 'Registration successful! Your account is pending approval.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Pending',
        approvalStatus: 'pending'
      },
      pendingApproval: true
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ============================================
// LOGIN - Check approval status
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Login attempt for:', normalizedEmail);
    
    // Check User collection first
    const userInUserCollection = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (userInUserCollection) {
      console.log('👤 Found in User collection:', {
        role: userInUserCollection.role,
        approvalStatus: userInUserCollection.approvalStatus
      });
      
      // ADMIN LOGIN
      if (userInUserCollection.role === 'admin' || userInUserCollection.role === 'Admin') {
        console.log('✅ Admin login');
        
        const isPasswordValid = await bcrypt.compare(password, userInUserCollection.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
          { id: userInUserCollection._id, email: userInUserCollection.email, role: userInUserCollection.role },
          process.env.JWT_SECRET || 'dev_secret',
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: userInUserCollection._id,
            name: userInUserCollection.name || 'Admin',
            email: userInUserCollection.email,
            role: 'admin',
            profileImage: userInUserCollection.profileImage
          }
        });
      }
      
      // REGULAR USER - Check if still pending
      if (userInUserCollection.approvalStatus === 'pending') {
        console.log('⏳ User pending approval');
        return res.status(403).json({ 
          message: 'Your account is pending approval. Please wait for admin approval.',
          pendingApproval: true 
        });
      }
      
      if (userInUserCollection.approvalStatus === 'rejected') {
        console.log('❌ User rejected');
        return res.status(403).json({ 
          message: 'Your account registration was rejected. Please contact support.',
          rejected: true 
        });
      }
    }
    
    // Check Student/Teacher collections
    console.log('🔍 Checking Student/Teacher collections...');
    
    let foundUser;
    let foundModel;
    
    foundUser = await Student.findOne({ email: normalizedEmail }).select('+password');
    if (foundUser) {
      foundModel = 'Student';
      console.log('✅ Found in Student collection');
    }
    
    if (!foundUser) {
      foundUser = await Teacher.findOne({ email: normalizedEmail }).select('+password');
      if (foundUser) {
        foundModel = 'Teacher';
        console.log('✅ Found in Teacher collection');
      }
    }
    
    if (!foundUser) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await foundUser.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check approval status
    if (foundUser.approvalStatus !== 'approved') {
      console.log('⏳ User not approved');
      if (foundUser.approvalStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your account is pending approval.',
          pendingApproval: true 
        });
      } else if (foundUser.approvalStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Your account was rejected.',
          rejected: true 
        });
      }
    }
    
    // Generate token
    const token = foundUser.generateAuthToken();
    
    const userResponse = {
      id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      profileImage: foundUser.profileImage,
      notificationSettings: foundUser.notificationSettings,
      privacySettings: foundUser.privacySettings
    };
    
    console.log('✅ Login successful');
    return res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ============================================
// GET APPROVALS
// ============================================
export const getStudentApprovals = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    console.log('📋 Student approvals:', students.length);
    res.json(students);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherApprovals = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    console.log('📋 Teacher approvals:', teachers.length);
    res.json(teachers);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// APPROVE STUDENT
// ============================================
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRecord = await User.findById(id).select('+password');
    
    if (!userRecord) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (userRecord.role !== 'student') {
      return res.status(400).json({ message: 'Not a student account' });
    }
    
    console.log('✅ Approving student:', userRecord.email);
    console.log('🔑 Password exists:', !!userRecord.password);
    
    // Check if already exists
    const existingStudent = await Student.findOne({ email: userRecord.email });
    if (existingStudent) {
      userRecord.approvalStatus = 'approved';
      userRecord.status = 'Active';
      userRecord.isActive = true;
      await userRecord.save();
      
      return res.json({ 
        message: 'Student already approved',
        student: {
          id: existingStudent._id,
          name: existingStudent.name,
          email: existingStudent.email
        }
      });
    }
    
    // Create in Student collection
    const newStudent = new Student({
      name: userRecord.name,
      email: userRecord.email,
      password: userRecord.password, // Already hashed
      role: 'student',
      approvalStatus: 'approved',
      status: 'Active',
      isActive: true,
      profileImage: userRecord.profileImage,
      notificationSettings: userRecord.notificationSettings,
      privacySettings: userRecord.privacySettings
    });
    
    await newStudent.save();
    
    console.log('✅ Student created');
    
    // Update User record
    userRecord.approvalStatus = 'approved';
    userRecord.status = 'Active';
    userRecord.isActive = true;
    await userRecord.save();
    
    res.json({ 
      message: 'Student approved successfully',
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// APPROVE TEACHER
// ============================================
export const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRecord = await User.findById(id).select('+password');
    
    if (!userRecord) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (userRecord.role !== 'teacher') {
      return res.status(400).json({ message: 'Not a teacher account' });
    }
    
    console.log('✅ Approving teacher:', userRecord.email);
    console.log('🔑 Password exists:', !!userRecord.password);
    
    // Check if already exists
    const existingTeacher = await Teacher.findOne({ email: userRecord.email });
    if (existingTeacher) {
      userRecord.approvalStatus = 'approved';
      userRecord.status = 'Active';
      userRecord.isActive = true;
      await userRecord.save();
      
      return res.json({ 
        message: 'Teacher already approved',
        teacher: {
          id: existingTeacher._id,
          name: existingTeacher.name,
          email: existingTeacher.email
        }
      });
    }
    
    // Create in Teacher collection
    const newTeacher = new Teacher({
      name: userRecord.name,
      email: userRecord.email,
      password: userRecord.password, // Already hashed
      role: 'teacher',
      approvalStatus: 'approved',
      status: 'Active',
      isActive: true,
      profileImage: userRecord.profileImage
    });
    
    await newTeacher.save();
    
    console.log('✅ Teacher created');
    
    // Update User record
    userRecord.approvalStatus = 'approved';
    userRecord.status = 'Active';
    userRecord.isActive = true;
    await userRecord.save();
    
    res.json({ 
      message: 'Teacher approved successfully',
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// REJECT
// ============================================
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findByIdAndUpdate(
      id,
      { approvalStatus: 'rejected', status: 'Inactive', isActive: false },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('❌ Student rejected');
    res.json({ message: 'Student rejected', student });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await User.findByIdAndUpdate(
      id,
      { approvalStatus: 'rejected', status: 'Inactive', isActive: false },
      { new: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log('❌ Teacher rejected');
    res.json({ message: 'Teacher rejected', teacher });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// OTHER FUNCTIONS
// ============================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Missing email' });
    }
    console.log('📧 Password reset requested');
    return res.status(200).json({ 
      message: 'If the email exists, we will send a password reset link' 
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    let user = await Student.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      user = await Teacher.findOne({ email: normalizedEmail }).select('+password');
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    
    if (!resetCode || resetCode.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }
    
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password reset successful');
    return res.status(200).json({ 
      message: 'Password reset successful.' 
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    let user = await Student.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      user = await Teacher.findOne({ email: normalizedEmail }).select('+password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password changed');
    return res.status(200).json({ 
      message: 'Password changed successfully' 
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  getStudentApprovals, 
  getTeacherApprovals,
  approveStudent, 
  approveTeacher,
  rejectStudent,
  rejectTeacher
};