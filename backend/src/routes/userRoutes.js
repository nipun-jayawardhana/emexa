const express = require('express');
const router = express.Router();
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

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;