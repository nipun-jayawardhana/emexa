import userService from '../services/user.service.js';

export const getUsers = async (req, res) => {
  try {
    const { role, page, limit, sort } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10, sort: sort || '-createdAt' };
    const result = await userService.getAllUsers(filter, options);
    res.json(result);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const result = await userService.registerUser({ name, email, password });
    // registerUser returns { user, token }
    res.status(201).json(result);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

