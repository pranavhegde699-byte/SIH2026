const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getChecklist } = require('../controllers/documentController');
const validateObjectId = require('../middleware/validateObjectId');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Wrapper to catch Multer errors and pass to centralized error handler
const uploadMiddleware = (req, res, next) => {
  const uploader = upload.single('document');
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post('/upload', uploadMiddleware, uploadDocument);
router.get('/checklist/:profileId/:approvalId', validateObjectId('profileId'), validateObjectId('approvalId'), getChecklist);

module.exports = router;
