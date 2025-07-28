const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Apply vendor authorization to all routes
router.use(protect);
router.use(authorize('vendor'));

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private (Vendor only)
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Order.getStats(req.user._id, 'vendor');
    const recentOrders = await Order.findByUser(req.user._id, 'vendor').limit(5);
    
    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          uniqueSuppliers: 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get all suppliers
// @route   GET /api/vendors/suppliers
// @access  Private (Vendor only)
router.get('/suppliers', async (req, res) => {
  try {
    const { search, category, location } = req.query;
    
    let query = { role: 'supplier' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'businessDetails.businessName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const suppliers = await User.find(query)
      .select('name location businessDetails stats trustScore')
      .limit(20);

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get supplier products
// @route   GET /api/vendors/suppliers/:id/products
// @access  Private (Vendor only)
router.get('/suppliers/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { search, category } = req.query;
    
    let query = { supplier: id, isAvailable: true, quantity: { $gt: 0 } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('supplier', 'name location')
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Search products across all suppliers
// @route   GET /api/vendors/products/search
// @access  Private (Vendor only)
router.get('/products/search', async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, sortBy = 'rating', page = 1, limit = 20 } = req.query;
    
    let query = { isAvailable: true, quantity: { $gt: 0 } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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
    let filteredProducts = products;
    if (location) {
      filteredProducts = products.filter(product => 
        product.supplier.location.toLowerCase().includes(location.toLowerCase())
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
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get vendor orders
// @route   GET /api/vendors/orders
// @access  Private (Vendor only)
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { vendor: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('supplier', 'name location')
      .populate('items.product', 'name price unit')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get single order
// @route   GET /api/vendors/orders/:id
// @access  Private (Vendor only)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user._id
    })
    .populate('supplier', 'name phone location')
    .populate('items.product', 'name price unit');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Rate order
// @route   POST /api/vendors/orders/:id/rate
// @access  Private (Vendor only)
router.post('/orders/:id/rate', async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5' 
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found or not delivered' 
      });
    }

    if (order.rating.rating) {
      return res.status(400).json({ 
        success: false,
        message: 'Order already rated' 
      });
    }

    await order.addRating(rating, review);

    res.json({
      success: true,
      message: 'Order rated successfully'
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Create new order
// @route   POST /api/vendors/orders
// @access  Private (Vendor only)
router.post('/orders', async (req, res) => {
  try {
    const { supplierId, items, deliveryAddress, deliveryDate, deliveryTime, notes } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID and items are required'
      });
    }

    // Validate supplier exists
    const supplier = await User.findOne({ _id: supplierId, role: 'supplier' });
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Calculate order totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        supplier: supplierId,
        isAvailable: true,
        quantity: { $gte: item.quantity }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not available or insufficient quantity`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calculate delivery fee
    const deliveryFee = subtotal >= 500 ? 0 : 50; // Free delivery for orders >= ₹500
    const total = subtotal + deliveryFee;

    // Create order
    const order = await Order.create({
      vendor: req.user._id,
      supplier: supplierId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      deliveryDate: new Date(deliveryDate),
      deliveryTime,
      notes: { vendor: notes }
    });

    // Update product quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('supplier', 'name phone location')
      .populate('items.product', 'name price unit');

    // Send WhatsApp notification to supplier
    try {
      await whatsappService.sendNewOrderNotification(populatedOrder, populatedOrder.supplier);
    } catch (error) {
      console.error('WhatsApp notification error:', error);
    }

    // Emit socket event for new order
    if (global.socketService) {
      global.socketService.emitNewOrder(
        populatedOrder._id,
        populatedOrder.supplier._id,
        populatedOrder.vendor._id
      );
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/vendors/orders/:id/cancel
// @access  Private (Vendor only)
router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user._id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found or cannot be cancelled' 
      });
    }

    await order.updateStatus('cancelled', reason);

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router; 