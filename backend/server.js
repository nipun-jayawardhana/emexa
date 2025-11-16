<<<<<<< HEAD
// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('express-async-errors'); // ← MUST BE BEFORE app

const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

// Load env
dotenv.config();

// Start server only after DB is connected
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected Successfully');

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Logging
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    // Routes
    app.use('/api/users', userRoutes);

    // Health
    app.get('/api/health', (req, res) => {
      res.json({ success: true, message: 'Server running' });
    });

    // Root
    app.get('/', (req, res) => {
      res.json({ message: 'EMEXA API v1.0' });
    });

    // 404
    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
=======
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';
import { connectDB } from './src/services/dbService.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();
const app = express();

// Connect to DB
// Initialize DB connection (service will skip if MONGO_URI is not set)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
// Auth routes mounted at /api/auth
app.use('/api/auth', authRoutes);

// Health
app.get('/', (req, res) => res.json({ ok: true, message: 'API is running' }));
app.get('/health', (req, res) => {
	const ifaces = os.networkInterfaces();
	return res.json({ ok: true, host: req.hostname, interfaces: Object.keys(ifaces) });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`);
	console.log('Available network interfaces:', Object.keys(os.networkInterfaces()).join(', '));
});
>>>>>>> new-auth-pages
