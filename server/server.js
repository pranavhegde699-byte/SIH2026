require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/db');
const businessProfileRoutes = require('./routes/businessProfileRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const documentRoutes = require('./routes/documentRoutes');
const statusRoutes = require('./routes/statusRoutes');
const chatRoutes = require('./routes/chatRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const path = require('path');
const officerRoutes = require('./routes/officerRoutes');
const { checkAndSendReminders } = require('./services/reminderService');

const app = express();

// Connect to database
connectDB();

// Middleware
// Production-ready CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// 503 Service Unavailable Middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Service unavailable. Database connection is down.' });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});


// Static file serving for uploads with path traversal protection
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
  const safePath = path.normalize(path.join(uploadsPath, decodeURIComponent(req.path)));
  if (!safePath.startsWith(uploadsPath)) {
    return res.status(403).json({ success: false, message: 'Access denied: Path traversal detected' });
  }
  next();
}, express.static(uploadsPath));

// Routes
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/officer', officerRoutes);
app.get('/api/verify/:certificateId', (req, res) => {
  res.redirect(307, `/api/officer/verify/${encodeURIComponent(req.params.certificateId)}`);
});
app.use('/api', statusRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/auth', authRoutes);

// Centralized error handler (must be last)
app.use(errorHandler);

// Schedule reminder cron — every 24 hours at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('[Cron] Running daily reminder check...');
  try {
    await checkAndSendReminders();
  } catch (err) {
    console.error('[Cron] Reminder job failed:', err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
