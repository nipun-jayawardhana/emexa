import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  // Support both MONGO_URI and MONGODB_URI environment variable names
  const mongoUri = uri || process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('MongoDB URI not set in environment - skipping DB connect in dev');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      // useNewUrlParser, useUnifiedTopology are defaults in mongoose v6+
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
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
