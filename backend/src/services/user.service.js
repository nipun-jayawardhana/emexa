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
    
    // Check in student collection first
    let user = await studentRepository.findByEmail(normalizedEmail);
    let repository = studentRepository;
    
    // If not found in students, check teachers
    if (!user) {
      user = await teacherRepository.findByEmail(normalizedEmail);
      repository = teacherRepository;
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

    // Update last login
    await repository.updateLastLogin(user._id);

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

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