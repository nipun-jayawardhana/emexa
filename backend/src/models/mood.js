import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"],
  },
  emoji: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
});

// Create index for faster queries by userId and timestamp
moodSchema.index({ userId: 1, timestamp: -1 });

const Mood = mongoose.model("Mood", moodSchema);

export default Mood;