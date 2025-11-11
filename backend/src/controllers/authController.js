import userService from '../services/user.service.js';

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

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = user.generateAuthToken();
    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.json({ user: safeUser, token });
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
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If the email exists we sent a link' });

    // TODO: generate reset token and send email
    return res.json({ message: 'If the email exists we sent a link' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { register, login, forgotPassword };
