import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import User from '../models/user.js';
import ApiError from '../utils/apiError.js';

class UserService {
  async registerStudent(userData) {
    // Normalize email to lowercase
    const email = userData.email.toLowerCase().trim();
    
    // Check if email exists in student or teacher collection
    const existingStudent = await Student.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });
    
    if (existingStudent || existingTeacher) {
      throw ApiError.conflict('Email already registered');
    }

    // Create student with normalized email
    const student = await Student.create({ ...userData, email });
    const token = student.generateAuthToken();

    // Return clean user object with name
    const userResponse = {
      _id: student._id,
      id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      isActive: student.isActive,
      studentId: student.studentId
    };

    return { user: userResponse, token };
  }

  async registerTeacher(userData) {
    // Normalize email to lowercase
    const email = userData.email.toLowerCase().trim();
    
    // Check if email exists in student or teacher collection
    const existingStudent = await Student.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });
    
    if (existingStudent || existingTeacher) {
      throw ApiError.conflict('Email already registered');
    }

    // Create teacher with normalized email
    const teacher = await Teacher.create({ ...userData, email });
    const token = teacher.generateAuthToken();

    // Return clean user object with name
    const userResponse = {
      _id: teacher._id,
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: 'teacher',
      isActive: teacher.isActive,
      teacherId: teacher.teacherId
    };

    return { user: userResponse, token };
  }

  async registerUser(userData) {
    // Legacy method - redirect to appropriate registration
    if (userData.role === 'teacher') {
      return this.registerTeacher(userData);
    } else {
      return this.registerStudent(userData);
    }
  }

  async findByEmail(email) {
    // Search in both student and teacher collections
    const student = await Student.findOne({ email });
    if (student) return student;
    
    const teacher = await Teacher.findOne({ email });
    if (teacher) return teacher;
    
    return null;
  }

  async loginUser(email, password) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in student collection first
    let user = await Student.findOne({ email: normalizedEmail }).select('+password');
    let userRole = 'student';
    
    // If not found in students, check teachers
    if (!user) {
      user = await Teacher.findOne({ email: normalizedEmail }).select('+password');
      userRole = 'teacher';
    }
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated. Please contact support.');
    }

    // Verify password - THIS IS THE KEY CHECK
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Incorrect password. Please try again.');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // CRITICAL: Create clean response object with name, profileImage, and settings explicitly included
    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name || user.fullName || user.full_name || '',
      email: user.email,
      role: user.role || userRole || 'student',
      isActive: user.isActive,
      profileImage: user.profileImage || null,
      notificationSettings: user.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true
      },
      privacySettings: user.privacySettings || {
        emotionDataConsent: true
      },
      ...(user.studentId && { studentId: user.studentId }),
      ...(user.teacherId && { teacherId: user.teacherId })
    };

    return { user: userResponse, token };
  }

  async getUserById(id) {
    // Try to find in student collection first
    let user = await Student.findById(id);
    if (user) return user;
    
    // Try teacher collection
    user = await Teacher.findById(id);
    if (user) return user;
    
    // Try admin/user collection
    user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getAllUsers(filter, options) {
    // Get both students and teachers
    const students = await Student.find(filter).limit(options?.limit || 100);
    const teachers = await Teacher.find(filter).limit(options?.limit || 100);
    
    return {
      students: students || [],
      teachers: teachers || [],
      total: students.length + teachers.length
    };
  }

  async updateUser(id, updateData) {
    // Try to find in student collection first
    let user = await Student.findById(id);
    let Model = Student;
    
    if (!user) {
      user = await Teacher.findById(id);
      Model = Teacher;
    }
    
    if (!user) {
      user = await User.findById(id);
      Model = User;
    }
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingStudent = await Student.findOne({ email: updateData.email });
      const existingTeacher = await Teacher.findOne({ email: updateData.email });
      if (existingStudent || existingTeacher) {
        throw ApiError.conflict('Email already in use');
      }
    }

    return await Model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id) {
    // Try to find in student collection first
    let user = await Student.findById(id);
    let Model = Student;
    
    if (!user) {
      user = await Teacher.findById(id);
      Model = Teacher;
    }
    
    if (!user) {
      user = await User.findById(id);
      Model = User;
    }
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return await Model.findByIdAndDelete(id);
  }
}

export default new UserService();