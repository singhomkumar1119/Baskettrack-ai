import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadRouter } from './routes/upload.js';
import { analysisRouter } from './routes/analysis.js';
import { exportRouter } from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded videos statically
app.use('/api/videos', express.static(uploadsPath));

// API Routes
app.use('/api/upload', uploadRouter);
app.use('/api/analyses', analysisRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'BasketTrack AI Server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🏀 BasketTrack AI Backend Server running on http://localhost:${PORT}`);
});
