import express from 'express';
import { getUsers, createUser, getDashboardData, getProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Existing routes
router.get('/', protect, getUsers);
router.post('/', createUser);

// New dashboard routes
router.get('/dashboard', protect, getDashboardData);
router.get('/profile', protect, getProfile);

export default router;