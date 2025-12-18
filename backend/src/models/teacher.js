import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'teacher', immutable: true },
  isActive: { type: Boolean, default: true },
  // Profile image stored as Cloudinary URL or relative path
  profileImage: { type: String, default: null },
  // Teacher-specific fields
  teacherId: { type: String, unique: true, sparse: true },
  department: { type: String },
  specialization: { type: String },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  
  // NEW: Settings field for cross-device sync
  settings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    inAppNotifications: { type: Boolean, default: true },
    emotionConsent: { type: Boolean, default: true }
  }
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
    try {
      // Find the highest existing teacher ID
      const lastTeacher = await mongoose.model('Teacher')
        .findOne({}, { teacherId: 1 })
        .sort({ teacherId: -1 })
        .lean();
      
      let nextNumber = 1;
      if (lastTeacher && lastTeacher.teacherId) {
        // Extract the number from the last teacher ID (e.g., "TCH00066" -> 66)
        const lastNumber = parseInt(lastTeacher.teacherId.replace('TCH', ''), 10);
        nextNumber = lastNumber + 1;
      }
      
      this.teacherId = `TCH${String(nextNumber).padStart(5, '0')}`;
    } catch (error) {
      console.error('Error generating teacher ID:', error);
      // Fallback to timestamp-based ID if there's an error
      this.teacherId = `TCH${Date.now().toString().slice(-5)}`;
    }
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