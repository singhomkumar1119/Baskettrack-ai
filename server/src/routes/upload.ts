import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported format "${ext}". Supported formats: MP4, MOV, AVI, WebM`));
    }
  }
});

export const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('video'), (req, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const { originalname, size, filename } = req.file;

    // Extract basic metadata or user-supplied metadata
    const duration = parseFloat(req.body.duration || '22.0');
    const width = parseInt(req.body.width || '1920', 10);
    const height = parseInt(req.body.height || '1080', 10);
    const fps = parseInt(req.body.fps || '60', 10);

    const videoId = uuidv4();

    res.status(200).json({
      success: true,
      videoId,
      fileName: originalname,
      storedFileName: filename,
      fileSizeBytes: size,
      videoUrl: `/api/videos/${filename}`,
      durationSec: duration,
      resolution: `${width}x${height}`,
      fps,
      message: 'Video uploaded and validated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Upload processing failed' });
  }
});
