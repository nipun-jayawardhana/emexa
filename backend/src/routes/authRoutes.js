import express from 'express';
import { 
  register, 
  login, 
  forgotPassword,
  resetPassword,
  getStudentApprovals, 
  approveStudent, 
  rejectStudent 
} from '../controllers/authController.js';

const router = express.Router();

// Existing routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// New admin/student approval routes
router.get('/student-approvals', getStudentApprovals);
router.put('/student-approvals/:id/approve', approveStudent);
router.put('/student-approvals/:id/reject', rejectStudent);

export default router;