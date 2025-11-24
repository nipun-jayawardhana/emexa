import userService from '../services/user.service.js';
import userRepository from '../repositories/user.repository.js';

export const register = async (req, res) => {
  try {
    // Frontend sends fullName and accountType (student/teacher)
    const { fullName, name, email, password, accountType } = req.body;
    const userName = fullName || name;
    if (!userName || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const payload = { name: userName, email, password, role: accountType || 'student' };
    const result = await userService.registerUser(payload);

    // userService.registerUser returns { user, token }
    res.status(201).json(result);
  } catch (err) {
    console.error('Register error:', err);
    // If ApiError-like object, try to surface message
    if (err && err.message) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    // Delegate login logic to userService
    const result = await userService.loginUser(email, password);
    // userService.loginUser returns { user, token }
    return res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    // For now just respond success if user exists (no email sending implemented)
    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(200).json({ message: 'If the email exists we sent a link' });

    // TODO: generate reset token and send email
    return res.json({ message: 'If the email exists we sent a link' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { register, login, forgotPassword };
