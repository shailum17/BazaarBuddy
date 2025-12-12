const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
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
const otpRoutes = require('./routes/otp');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');
const { sanitizeInput } = require('./middleware/sanitizeMiddleware');

const app = express();
const server = createServer(app);
const isVercel = !!process.env.VERCEL;

// Connect to MongoDB
connectDB();

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Initialize socket service
const socketService = new SocketService(io);

// Make socket service available globally
global.socketService = socketService;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" }
}));

// CORS middleware with more restrictive settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3001',
      'http://localhost:3000',
      'https://bazaar-buddy-eight.vercel.app'
    ].filter(Boolean).map(origin => origin.replace(/\/$/, ''));
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With"
  ],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight
app.options('*', cors(corsOptions));

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased from 5 to 10 for better UX
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Add cache control headers
app.use((req, res, next) => {
  // Set cache control headers for API responses
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' })); // Reduced from 10mb for security
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Add input sanitization middleware
app.use(sanitizeInput);

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Routes
// Root route for uptime checks and to avoid 404s on '/'
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BazaarBuddy API root',
    health: '/api/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/suppliers', supplierRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Check database connectivity
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthData = {
      status: 'OK',
      message: 'BazaarBuddy API is running',
      timestamp: new Date().toISOString(),
      connectedUsers: socketService.getConnectedUsersCount(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // If database is not connected, return 503
    if (dbStatus !== 'connected') {
      return res.status(503).json({
        ...healthData,
        status: 'ERROR',
        message: 'Database not connected'
      });
    }

    res.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
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

// Public products search endpoint (for browsing without authentication)
app.get('/api/products/search', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { search, category, location, minPrice, maxPrice, sortBy = 'rating', page = 1, limit = 20 } = req.query;
    
    let query = { 
      isAvailable: true, 
      quantity: { $gt: 0 },
      supplier: { $exists: true, $ne: null }
    };
    
    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortQuery = {};
    switch (sortBy) {
      case 'price':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'rating':
        sortQuery = { 'rating.average': -1 };
        break;
      case 'name':
        sortQuery = { name: 1 };
        break;
      default:
        sortQuery = { 'rating.average': -1 };
    }

    const products = await Product.find(query)
      .populate('supplier', 'name location trustScore stats')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Filter by location if specified
    let filteredProducts = products.filter(product => 
      product && product.supplier && product.supplier._id
    );
    
    if (location) {
      const sanitizedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filteredProducts = filteredProducts.filter(product => 
        product.supplier && 
        product.supplier.location && 
        product.supplier.location.toLowerCase().includes(sanitizedLocation.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Public products search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
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