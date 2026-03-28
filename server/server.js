require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
app.set('trust proxy', 1);

// 1. CORS ALWAYS FIRST
const allowedOrigins = [
  'https://flowboard-self.vercel.app',
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in prod temporarily to fix 502/CORS death
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Preflight handling
app.options('*', cors());

// 3. Security (relaxed for stability)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect DB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const httpServer = http.createServer(app);
const socketHandler = require('./socket/socket');
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ['websocket', 'polling']
});
app.set('io', io);
socketHandler(io);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  const cronUrl = process.env.RENDER_EXTERNAL_URL;
  if (cronUrl) {
    const protocol = cronUrl.startsWith('https') ? require('https') : require('http');
    setInterval(() => {
      protocol.get(`${cronUrl.replace(/\/$/, '')}/api/health`, () => {
        console.log('💓 Heartbeat');
      }).on('error', () => {});
    }, 10 * 60 * 1000);
  }
});
