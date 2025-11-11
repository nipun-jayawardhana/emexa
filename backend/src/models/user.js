const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    role: {
      type: String,
      enum: ['Admin', 'Teacher', 'Student'],
      default: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      required: true
    },
    dateAdded: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US')
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);



