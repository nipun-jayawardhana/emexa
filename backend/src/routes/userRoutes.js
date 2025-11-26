import express from 'express';
import { getUsers, createUser, getDashboardData, getProfile, updateProfileSettings } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';

const router = express.Router();

// Existing routes
router.get('/', protect, getUsers);
router.post('/', createUser);

// New dashboard routes
router.get('/dashboard', protect, getDashboardData);
router.get('/profile', protect, getProfile);
// Update profile settings (notifications)
router.put('/profile/settings', protect, updateProfileSettings);

// === NEW ROUTES FOR USER MANAGEMENT ===

// Get all users from all collections (User, Student, Teacher)
router.get('/all-users', async (req, res) => {
  try {
    // Fetch from all three collections
    const admins = await User.find({ role: { $in: ['Admin', 'admin'] } }).select('-password').lean();
    const students = await Student.find().select('-password').lean();
    const teachers = await Teacher.find().select('-password').lean();
    
    // Combine and normalize the data
    const allUsers = [
      ...admins.map(u => ({ ...u, role: 'Admin', status: u.status || 'Active' })),
      ...students.map(u => ({ ...u, role: 'Student', status: u.isActive ? 'Active' : 'Inactive' })),
      ...teachers.map(u => ({ ...u, role: 'Teacher', status: u.isActive ? 'Active' : 'Inactive' }))
    ];
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Update user (works for all collections)
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Try to find and update in User collection first
    let updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    // If not found, try Student collection
    if (!updatedUser) {
      updatedUser = await Student.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    
    // If still not found, try Teacher collection
    if (!updatedUser) {
      updatedUser = await Teacher.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Delete user (works for all collections)
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to delete from User collection first
    let deletedUser = await User.findByIdAndDelete(id);
    
    // If not found, try Student collection
    if (!deletedUser) {
      deletedUser = await Student.findByIdAndDelete(id);
    }
    
    // If still not found, try Teacher collection
    if (!deletedUser) {
      deletedUser = await Teacher.findByIdAndDelete(id);
    }
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// Get teacher approvals
router.get('/teacher-approvals', async (req, res) => {
  try {
    // Fetch teachers with pending/approved/rejected status
    const teachers = await Teacher.find().select('-password').lean();
    
    // Map to include approval status
    const approvals = teachers.map(t => ({
      _id: t._id,
      name: t.name,
      email: t.email,
      qualifications: t.qualifications || 'Not provided',
      requestedOn: t.createdAt || t.dateAdded,
      status: t.approvalStatus || (t.isActive ? 'Approved' : null)
    }));
    
    res.json(approvals);
  } catch (error) {
    console.error('Error fetching teacher approvals:', error);
    res.status(500).json({ message: 'Server error fetching teacher approvals' });
  }
});

// Approve teacher
router.put('/teacher-approvals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { approvalStatus: 'approved', isActive: true },
      { new: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error('Error approving teacher:', error);
    res.status(500).json({ message: 'Server error approving teacher' });
  }
});

// Reject teacher
router.put('/teacher-approvals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { approvalStatus: 'rejected', isActive: false },
      { new: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    res.status(500).json({ message: 'Server error rejecting teacher' });
  }
});

export default router;