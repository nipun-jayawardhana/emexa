import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './services/dbService.js';
import userRoutes from './routes/userRoutes.js';

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

// Health
app.get('/', (req, res) => res.json({ ok: true, message: 'API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
