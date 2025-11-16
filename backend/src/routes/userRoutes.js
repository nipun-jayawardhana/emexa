import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
<<<<<<< HEAD
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTeacherApprovals
} = require('../controllers/userController');

// TEACHER APPROVALS — BEFORE :id
router.get('/teacher-approvals', getTeacherApprovals);

// CRUD ROUTES
router.route('/')
  .get(getUsers)
  .post(createUser);
=======

router.get('/', protect, getUsers);
router.post('/', createUser);
>>>>>>> new-auth-pages

export default router;
