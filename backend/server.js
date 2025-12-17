import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import os from 'os';
import { fileURLToPath } from 'url';
import { cloudinary } from './src/config/cloudinary.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database connection
import { connectDB } from './src/services/dbService.js';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import quizRoutes from './src/routes/quizroutes.js';
import cameraRoutes from './src/routes/cameraRoutes.js';
import teacherRoutes from './src/routes/teacherRoutes.js';
import wellnessRoutes from './src/routes/wellnessRoutes.js';
import teacherQuizRoutes from './src/routes/teacherQuizRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js'; // NEW: AI routes

// Import socket handler
import setupSocketHandler from './src/socket/socketHandler.js'; // NEW: WebSocket handler

const app = express();


// CREATE HTTP SERVER & SOCKET.IO

const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to DB
connectDB();


// MIDDLEWARE

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - INCREASED LIMIT for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
try {
  const uploadsPath = path.resolve(__dirname, 'uploads');
  fs.mkdirSync(uploadsPath, { recursive: true });
  app.use('/uploads', express.static(uploadsPath));
  console.log('📁 Uploads directory:', uploadsPath);
} catch (err) {
  console.error('Failed to create uploads folder:', err);
}

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// ROUTES
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/camera', cameraRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/teacher-quizzes', teacherQuizRoutes);
app.use('/api/ai', aiRoutes); // NEW: AI routes for emotion tracking and hints


// WEBSOCKET SETUP

// Setup WebSocket handlers for real-time emotion tracking
setupSocketHandler(io);

// Store io instance for use in other modules if needed
app.set('io', io);


// HEALTH CHECK ROUTES

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'EMEXA API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      aiEnabled: !!process.env.HUGGINGFACE_API_KEY,
      websocket: true
    }
  });
});

app.get('/health', (req, res) => {
  const ifaces = os.networkInterfaces();
  return res.json({ 
    ok: true, 
    host: req.hostname, 
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    ai: {
      huggingFace: !!process.env.HUGGINGFACE_API_KEY
    },
    websocket: {
      enabled: true,
      connections: io.engine.clientsCount
    }
  });
});

// ERROR HANDLING

// 404 handler
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

// START SERVER

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 EMEXA Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ ' + process.env.CLOUDINARY_CLOUD_NAME : '❌ Not configured'}`);
  console.log(`🤖 AI Features: ${process.env.HUGGINGFACE_API_KEY ? '✅ Enabled' : '❌ Disabled - Add HUGGINGFACE_API_KEY to .env'}`);
  console.log(`🔌 WebSocket: ✅ Ready on same port (Socket.IO)`);
  console.log('='.repeat(60));
  console.log('\n📋 Available Routes:');
  console.log('  - /api/auth          (Authentication)');
  console.log('  - /api/users         (User management)');
  console.log('  - /api/quiz          (Quiz system)');
  console.log('  - /api/camera        (Camera & Emotion tracking)');
  console.log('  - /api/teacher       (Teacher features)');
  console.log('  - /api/wellness      (Wellness features)');
  console.log('  - /api/ai            (AI services - NEW)');
  console.log('='.repeat(60) + '\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM: closing server gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT: closing server gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

export default app;