import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';

import authRoutes from './routes/authRoutes.js';
import computeRoutes from './routes/computeRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import databaseRoutes from './routes/databaseRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CloudSphere Enterprise API Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: getDBStatus(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/databases', databaseRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/security', securityRoutes);

// Fallback 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Resource endpoint not found: ${req.originalUrl}` });
});

// Serve production static frontend if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[CloudSphere Server] Serving production client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[CloudSphere API Server Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` CloudSphere API Server Running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
};

startServer().catch((err) => {
  console.error('Fatal initialization error in CloudSphere server:', err);
});
