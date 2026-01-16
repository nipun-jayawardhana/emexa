import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI;
  console.log('🔍 MONGO_URI from env:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
  console.log('🔍 Using URI:', mongoUri ? 'SET' : 'NOT SET');
  if (!mongoUri) {
    console.warn('⚠️  MONGO_URI not set in environment - skipping DB connect in dev');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
    throw err;
  }
};

export default { connectDB, closeDB };
