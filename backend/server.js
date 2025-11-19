import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';
import { connectDB } from './src/services/dbService.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import cameraRoutes from './src/routes/cameraRoutes.js';

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
// Camera frames endpoint
app.use('/api/camera', cameraRoutes);

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
