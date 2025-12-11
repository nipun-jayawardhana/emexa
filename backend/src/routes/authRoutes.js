import express from 'express';
import { 
  register, 
  login, 
  forgotPassword,
  resetPassword,
  changePassword, 
  getStudentApprovals,
  getTeacherApprovals,
  approveStudent,
  approveTeacher,
  rejectStudent,
  rejectTeacher
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);

// Admin approval routes
router.get('/student-approvals', getStudentApprovals);
router.get('/teacher-approvals', getTeacherApprovals);
router.put('/student-approvals/:id/approve', approveStudent);
router.put('/teacher-approvals/:id/approve', approveTeacher);
router.put('/student-approvals/:id/reject', rejectStudent);
router.put('/teacher-approvals/:id/reject', rejectTeacher);

export default router;