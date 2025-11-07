import * as userService from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await userService.findUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const exists = await userService.findUserByEmail(email);
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await userService.createUser({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
