require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socket');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
app.set('trust proxy', 1);

// Better CORS origins handling
const origins = [
  'https://flowboard-self.vercel.app',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean).map(o => o.replace(/\/$/, ''));
const allowedOrigins = [...new Set(origins)];

// 1. CORS first (crucial for preflight)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const httpServer = http.createServer(app);

// Socket.IO sync
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});
app.set('io', io);
socketHandler(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin assets
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again in 15 minutes.' }
});
app.use('/api', globalLimiter);

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts. Please try again in 30 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Connect DB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Keep Render alive (self-pinging every 14 minutes)
  const cronUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(() => {
    http.get(`${cronUrl}/api/health`, (res) => {
      console.log('💓 Heartbeat: Keeping server alive');
    }).on('error', (err) => {
      console.error('💓 Heartbeat error:', err.message);
    });
  }, 14 * 60 * 1000); 
});
