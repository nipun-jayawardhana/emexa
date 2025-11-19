import userService from '../services/user.service.js';
import userRepository from '../repositories/user.repository.js';
import studentRepository from '../repositories/student.repository.js';
import teacherRepository from '../repositories/teacher.repository.js';

export const register = async (req, res) => {
  try {
    // Frontend sends fullName and accountType (student/teacher)
    const { fullName, name, email, password, accountType } = req.body;
    const userName = fullName || name;
    if (!userName || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const role = accountType || 'student';
    const payload = { name: userName, email, password, role };
    
    // Register based on account type - store in separate collections
    let result;
    if (role === 'teacher') {
      result = await userService.registerTeacher(payload);
    } else {
      result = await userService.registerStudent(payload);
    }

    // userService returns { user, token }
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
    
    // Try to login as student or teacher
    const result = await userService.loginUser(email, password);
    
    // userService.loginUser returns { user, token }
    return res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    
    // Return the specific error message from the service
    const statusCode = err.statusCode || 401;
    const message = err.message || 'Invalid email or password';
    
    return res.status(statusCode).json({ message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in both student and teacher collections
    const student = await studentRepository.findByEmail(normalizedEmail);
    const teacher = await teacherRepository.findByEmail(normalizedEmail);
    
    if (!student && !teacher) {
      return res.status(200).json({ message: 'If the email exists we sent a link' });
    }

    // TODO: generate reset token and send email
    return res.json({ message: 'If the email exists we sent a link' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { register, login, forgotPassword };
