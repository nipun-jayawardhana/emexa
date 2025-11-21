// auth.middleware.js (ESM, merged with admin verification)
import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';
import User from '../models/user.js';

// Protect middleware — verifies JWT, finds user in Student | Teacher | User, sets req.user and req.userId
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const secret = process.env.JWT_SECRET || 'dev_secret';
      const decoded = jwt.verify(token, secret);

      // Get user from token - check student, teacher, or user collections
      let user = await Student.findById(decoded.id).select('-password');
      if (!user) {
        user = await Teacher.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await User.findById(decoded.id).select('-password');
      }

      if (!user) {
        // Keep the ApiError semantics from auth-fix
        // If you prefer plain JSON responses instead, replace with res.status(...)
        throw ApiError.unauthorized('User no longer exists');
      }

      // Set both req.user and req.userId for compatibility with older and new routes
      req.user = user;
      req.userId = decoded.id;

      next();
    } catch (error) {
      // For token verification errors or ApiError.unauthorized above
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize middleware — ensures role is allowed
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Simple auth middleware for some dashboard routes (alternative)
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);

    req.userId = decoded.id;
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// NEW: Verify Admin middleware - for protecting admin-only routes
export const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);

    // Get user from User collection
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'Admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Attach user info to request
    req.user = user;
    req.userId = decoded.id;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error verifying token' });
  }
};

export default protect;