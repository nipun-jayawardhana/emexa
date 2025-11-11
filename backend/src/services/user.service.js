import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/apiError.js';

class UserService {
  async registerUser(userData) {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Create user
    const user = await userRepository.create(userData);
    const token = user.generateAuthToken();

    return { user, token };
  }

  async loginUser(email, password) {
    // Check if user exists
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user._id);

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getAllUsers(filter, options) {
    return await userRepository.findAll(filter, options);
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