const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import socket service
const SocketService = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const supplierRoutes = require('./routes/suppliers');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = createServer(app);
const isVercel = !!process.env.VERCEL;

// Connect to MongoDB
connectDB();

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Initialize socket service
const socketService = new SocketService(io);

// Make socket service available globally
global.socketService = socketService;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// No Express CORS middleware

// Add cache control headers
app.use((req, res, next) => {
  // Set cache control headers for API responses
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/suppliers', supplierRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BazaarBuddy API is running',
    timestamp: new Date().toISOString(),
    connectedUsers: socketService.getConnectedUsersCount()
  });
});

// Test products endpoint (for debugging)
app.get('/api/test/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({}).populate('supplier', 'name email');
    res.json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        unit: p.unit,
        supplier: p.supplier?.name || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Test products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

if (!isVercel) {
  server.listen(PORT, () => {
    console.log(`🚀 BazaarBuddy Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Export Vercel-compatible handler
if (isVercel) {
  module.exports = (req, res) => app(req, res);
} else {
  module.exports = { app, io };
}