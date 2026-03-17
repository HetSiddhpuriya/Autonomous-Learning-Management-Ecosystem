import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max limit
});

// POST /api/upload
router.post('/', protect, authorize('instructor', 'admin'), upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return the URL where the file can be accessed
        // We will serve the 'uploads' folder statically
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ url: fileUrl });
    } catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ message: 'Internal server error during upload' });
    }
});

// POST /api/upload/attachment
router.post('/attachment', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ 
            url: fileUrl, 
            name: req.file.originalname,
            size: req.file.size
        });
    } catch (err) {
        console.error('Attachment upload error:', err);
        res.status(500).json({ message: 'Internal server error during attachment upload' });
    }
});

export default router;
