import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
<<<<<<< HEAD
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Student', 'Teacher', 'Admin'],
    default: 'Student'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  }
}, {
  timestamps: true
=======
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
>>>>>>> new-auth-pages
});

// Compare plain password with hashed
userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: this._id }, secret, { expiresIn });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
