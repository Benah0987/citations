const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/fileController');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + '-' + file.originalname);
  },
});

const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.bib', '.ris', '.nbib', '.enw'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .bib, .ris, .nbib, and .enw files are allowed'), false);
  }
};


const upload = multer({ storage, fileFilter });

// Routes
router.post('/upload', protect(['user', 'admin']), upload.single('citation'), uploadFile);

module.exports = router;
