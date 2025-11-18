const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const ApiError = require('../utils/apiError');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      throw ApiError.unauthorized('Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from token - check student, teacher, or user collections
      let user = await Student.findById(decoded.id).select('-password');
      if (!user) {
        user = await Teacher.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await User.findById(decoded.id).select('-password');
      }

      if (!user) {
        throw ApiError.unauthorized('User no longer exists');
      }

      req.user = user;
      next();
    } catch (error) {
      throw ApiError.unauthorized('Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };