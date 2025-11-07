const User = require('../models/user.model');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(id, { lastLogin: new Date() });
  }
}

module.exports = new UserRepository();