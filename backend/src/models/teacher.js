import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'teacher', immutable: true },
  isActive: { type: Boolean, default: true },
  // Profile image stored as relative path (e.g. /uploads/profiles/xxx.jpg)
  profileImage: { type: String, default: null },
  // Teacher-specific fields
  teacherId: { type: String, unique: true, sparse: true },
  department: { type: String },
  specialization: { type: String },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

// Hash password before saving
teacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-generate teacher ID before saving
teacherSchema.pre('save', async function(next) {
  if (!this.teacherId) {
    const count = await mongoose.model('Teacher').countDocuments();
    this.teacherId = `TCH${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Compare plain password with hashed
teacherSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Generate JWT token
teacherSchema.methods.generateAuthToken = function() {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: this._id, role: 'teacher' }, secret, { expiresIn });
};

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export default Teacher;
