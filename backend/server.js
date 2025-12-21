import dotenv from 'dotenv';

// Load environment variables FIRST
const dotenvResult = dotenv.config();

// CRITICAL: Debug environment loading
console.log('\n🔍 ===== ENVIRONMENT LOADING DEBUG =====');
console.log('dotenv.config() result:', dotenvResult.error ? `❌ ${dotenvResult.error}` : '✅ Success');
console.log('Current directory:', process.cwd());
console.log('.env file location:', dotenvResult.parsed ? '✅ Found' : '❌ Not found');

// Check critical environment variables
console.log('\n📋 Environment Variables Check:');
console.log('  PORT:', process.env.PORT || '❌ Missing (will use 5000)');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('  HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Set' : '❌ Missing');
if (process.env.HUGGINGFACE_API_KEY) {
  console.log('    - Length:', process.env.HUGGINGFACE_API_KEY.length);
  console.log('    - Starts with:', process.env.HUGGINGFACE_API_KEY.substring(0, 10) + '...');
}
console.log('  TEXT_MODEL_URL:', process.env.TEXT_MODEL_URL ? '✅ Set' : '❌ Missing');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('=======================================\n');

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
import aiRoutes from './src/routes/aiRoutes.js';

// Import socket handler
import setupSocketHandler from './src/socket/socketHandler.js';

const app = express();

// CREATE HTTP SERVER & SOCKET.IO
const server = http.createServer(app);

// Setup Socket.IO with enhanced CORS and configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Connect to DB
connectDB();

// MIDDLEWARE

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - INCREASED LIMIT for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  if (!req.path.startsWith('/uploads')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
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
app.use('/api/ai', aiRoutes);

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
      websocket: true,
      emotionDetection: true,
      textGeneration: !!process.env.TEXT_MODEL_URL
    }
  });
});

app.get('/health', (req, res) => {
  return res.json({
    ok: true,
    host: req.hostname,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      used: `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    ai: {
      huggingFaceConfigured: !!process.env.HUGGINGFACE_API_KEY,
      apiKeyLength: process.env.HUGGINGFACE_API_KEY?.length,
      apiKeyPrefix: process.env.HUGGINGFACE_API_KEY?.substring(0, 10),
      emotionModel: 'CLIP (openai/clip-vit-base-patch32)',
      textModelUrl: process.env.TEXT_MODEL_URL || 'not configured'
    },
    websocket: {
      enabled: true,
      connections: io.engine.clientsCount
    },
    database: {
      connected: true
    }
  });
});

// ENHANCED Test endpoint for AI service
app.get('/api/test-ai', async (req, res) => {
  try {
    console.log('\n🧪 === AI TEST ENDPOINT CALLED ===');
    console.log('Environment check:');
    console.log('  HUGGINGFACE_API_KEY present:', !!process.env.HUGGINGFACE_API_KEY);
    console.log('  API Key length:', process.env.HUGGINGFACE_API_KEY?.length);
    console.log('  API Key first 10 chars:', process.env.HUGGINGFACE_API_KEY?.substring(0, 10));
    
    const aiService = (await import('./src/services/aiService.js')).default;
    
    console.log('Testing connection...');
    const connected = await aiService.testConnection();
    
    console.log('Connection result:', connected ? '✅ Success' : '❌ Failed');
    
    res.json({
      ok: true,
      aiServiceAvailable: connected,
      apiKeyConfigured: !!process.env.HUGGINGFACE_API_KEY,
      apiKeyLength: process.env.HUGGINGFACE_API_KEY?.length,
      emotionModel: 'CLIP (openai/clip-vit-base-patch32)',
      textModel: process.env.TEXT_MODEL_URL?.split('/').pop() || 'not configured'
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error.message);
    res.status(500).json({
      ok: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ERROR HANDLING

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
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
const HOST = process.env.HOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 EMEXA Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ ' + process.env.CLOUDINARY_CLOUD_NAME : '❌ Not configured'}`);
  console.log(`🤖 Hugging Face API: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Missing - Add HUGGINGFACE_API_KEY to .env'}`);
  console.log('🎭 Emotion Model: ✅ CLIP (openai/clip-vit-base-patch32)');
  console.log(`💬 Text Model: ${process.env.TEXT_MODEL_URL ? '✅ ' + process.env.TEXT_MODEL_URL.split('/').pop() : '❌ Using default'}`);
  console.log(`🔌 WebSocket: ✅ Ready (Socket.IO v4)`);
  console.log('='.repeat(60));
  console.log('\n📋 Available Routes:');
  console.log('  - GET  /                 (Server status)');
  console.log('  - GET  /health           (Health check)');
  console.log('  - GET  /api/test-ai      (Test AI connection)');
  console.log('  - POST /api/auth         (Authentication)');
  console.log('  - *    /api/users        (User management)');
  console.log('  - *    /api/quiz         (Quiz system)');
  console.log('  - *    /api/camera       (Camera & Emotion tracking)');
  console.log('  - *    /api/teacher      (Teacher features)');
  console.log('  - *    /api/wellness     (Wellness features)');
  console.log('  - *    /api/ai           (AI services - Emotion & Hints)');
  console.log('='.repeat(60));
  console.log('\n🔌 WebSocket Events:');
  console.log('  - analyze-emotion        (Send image for emotion detection)');
  console.log('  - emotion-result         (Receive emotion analysis)');
  console.log('  - get-emotion-history    (Request emotion history)');
  console.log('  - emotion-history        (Receive emotion history)');
  console.log('='.repeat(60) + '\n');
  
  console.log('💡 Quick Tests:');
  console.log(`   curl http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/health`);
  console.log(`   curl http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/test-ai`);
  console.log('');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// GRACEFUL SHUTDOWN
const gracefulShutdown = (signal) => {
  console.log(`\n👋 ${signal}: Closing server gracefully...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    io.close(() => {
      console.log('✅ Socket.IO closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('⚠️ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV !== 'production') {
    // Don't exit in development to keep server running
  }
});

export default app;