import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI not set in environment - skipping DB connect in dev');
    return;
  }

  try {
<<<<<<< HEAD
    // Remove useNewUrlParser and useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
=======
    await mongoose.connect(uri, {
      // useNewUrlParser, useUnifiedTopology not needed with mongoose v6+
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
>>>>>>> new-auth-pages
    process.exit(1);
  }
};
