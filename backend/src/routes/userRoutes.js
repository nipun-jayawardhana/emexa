const express = require('express');
const router = express.Router();
const { logout } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth'); // if you have auth middleware

// Logout route
router.post('/logout', logout);

// Or with authentication middleware:
// router.post('/logout', authenticate, logout);

module.exports = router;