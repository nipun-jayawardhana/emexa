import userRepository from '../repositories/user.repository.js';
import studentRepository from '../repositories/student.repository.js';
import teacherRepository from '../repositories/teacher.repository.js';
import ApiError from '../utils/apiError.js';

class UserService {
  async registerStudent(userData) {
    // Normalize email to lowercase
    const email = userData.email.toLowerCase().trim();
    
    // Check if email exists in student or teacher collection
    const existingStudent = await studentRepository.findByEmail(email);
    const existingTeacher = await teacherRepository.findByEmail(email);
    
    if (existingStudent || existingTeacher) {
      throw ApiError.conflict('Email already registered');
    }

    // Create student with normalized email
    const student = await studentRepository.create({ ...userData, email });
    const token = student.generateAuthToken();

    return { user: student, token };
  }

  async registerTeacher(userData) {
    // Normalize email to lowercase
    const email = userData.email.toLowerCase().trim();
    
    // Check if email exists in student or teacher collection
    const existingStudent = await studentRepository.findByEmail(email);
    const existingTeacher = await teacherRepository.findByEmail(email);
    
    if (existingStudent || existingTeacher) {
      throw ApiError.conflict('Email already registered');
    }

    // Create teacher with normalized email
    const teacher = await teacherRepository.create({ ...userData, email });
    const token = teacher.generateAuthToken();

    return { user: teacher, token };
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
    const student = await studentRepository.findByEmail(email);
    if (student) return student;
    
    const teacher = await teacherRepository.findByEmail(email);
    if (teacher) return teacher;
    
    return null;
  }

  async loginUser(email, password) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔍 LoginUser service called for:', normalizedEmail);
    
    // Check in student collection first
    let user = await studentRepository.findByEmail(normalizedEmail);
    let repository = studentRepository;
    
    // If not found in students, check teachers
    if (!user) {
      console.log('👨‍🎓 Not in students, checking teachers...');
      user = await teacherRepository.findByEmail(normalizedEmail);
      repository = teacherRepository;
    }
    
    if (!user) {
      console.log('❌ User not found in either collection');
      throw ApiError.unauthorized('Invalid email or password');
    }

    console.log('✅ User found:', user.role, user.email);
    console.log('🔐 Password field present:', !!user.password);
    console.log('👤 User active status:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      console.log('⚠️ User account is deactivated');
      throw ApiError.forbidden('Account is deactivated. Please contact support.');
    }

    // Verify password - THIS IS THE KEY CHECK
    console.log('🔑 Attempting password comparison...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password comparison failed');
      throw ApiError.unauthorized('Incorrect password. Please try again.');
    }

    // Update last login
    await repository.updateLastLogin(user._id);

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    console.log('✅ Login successful, returning user and token');
    return { user, token };
  }

  async getUserById(id) {
    // Try to find in student collection first
    let user = await studentRepository.findById(id);
    if (user) return user;
    
    // Try teacher collection
    user = await teacherRepository.findById(id);
    if (user) return user;
    
    // Fallback to user repository
    user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getAllUsers(filter, options) {
    // Get both students and teachers
    const students = await studentRepository.findAll(filter, options);
    const teachers = await teacherRepository.findAll(filter, options);
    
    return {
      students: students.students || [],
      teachers: teachers.teachers || [],
      total: (students.pagination?.total || 0) + (teachers.pagination?.total || 0)
    };
  }

  async updateUser(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }
    }

    return await userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return await userRepository.delete(id);
  }
}

export default new UserService();