import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.post('/', createUser);

export default router;
