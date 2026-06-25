import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environmental variables
dotenv.config();

// Initialize Database connection & schemas
import './database/db.js';

// Route Imports
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import clientRouter from './routes/client.js';
import contentRouter from './routes/content.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/client', clientRouter);
app.use('/api/content', contentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Serve Static Frontend Assets (Vite build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback for React SPA routing (Send index.html for all non-API paths)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Boot Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` SVR Construction Server listening on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
