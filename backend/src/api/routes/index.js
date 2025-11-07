const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// API welcome message
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EMEXA API v1',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        profile: 'GET /api/v1/auth/profile'
      },
      users: {
        list: 'GET /api/v1/users',
        get: 'GET /api/v1/users/:id',
        update: 'PUT /api/v1/users/:id',
        delete: 'DELETE /api/v1/users/:id'
      },
      health: 'GET /api/v1/health'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);

module.exports = router;