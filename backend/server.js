import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';
import { connectDB } from './src/services/dbService.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import quizRoutes from './src/routes/quizroutes.js';
import cameraRoutes from './src/routes/cameraRoutes.js';
import teacherRoutes from './src/routes/teacherRoutes.js';

dotenv.config();
const app = express();

// Connect to DB
// Initialize DB connection (service will skip if MONGO_URI is not set)
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/camera', cameraRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'EMEXA API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const ifaces = os.networkInterfaces();
  return res.json({ 
    ok: true, 
    host: req.hostname, 
    interfaces: Object.keys(ifaces),
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    database: 'connected' // You can add actual DB check here
  });
});

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ 
    ok: false, 
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 EMEXA Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
  console.log('\n📋 Available Routes:');
  console.log('   - GET  /                          Health check');
  console.log('   - GET  /health                    Detailed health info');
  console.log('   - POST /api/auth/register         User registration');
  console.log('   - POST /api/auth/login            User login');
  console.log('   - POST /api/auth/forgot-password  Password reset');
  console.log('   - GET  /api/users                 User management');
  console.log('   - GET  /api/quiz                  Quiz management');
  console.log('   - POST /api/camera                Camera endpoints');
  console.log('   - GET  /api/teacher               Teacher dashboard');
  console.log('\n🌐 Network Interfaces:');
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach(iface => {
    interfaces[iface].forEach(details => {
      if (details.family === 'IPv4') {
        console.log(`   - ${iface}: http://${details.address}:${PORT}`);
      }
    });
  });
  console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});