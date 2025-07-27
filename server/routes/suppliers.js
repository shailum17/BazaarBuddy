const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Apply supplier authorization to all routes
router.use(protect);
router.use(authorize('supplier'));

// @desc    Get supplier dashboard stats
// @route   GET /api/suppliers/dashboard
// @access  Private (Supplier only)
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Order.getStats(req.user._id, 'supplier');
    const recentOrders = await Order.findByUser(req.user._id, 'supplier').limit(5);
    const topProducts = await Product.find({ supplier: req.user._id })
      .sort({ 'rating.average': -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0
        },
        recentOrders,
        topProducts
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

// @desc    Get supplier products
// @route   GET /api/suppliers/products
// @access  Private (Supplier only)
router.get('/products', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    
    let query = { supplier: req.user._id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status === 'available') {
      query.isAvailable = true;
      query.quantity = { $gt: 0 };
    } else if (status === 'out-of-stock') {
      query.$or = [{ isAvailable: false }, { quantity: 0 }];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Add new product
// @route   POST /api/suppliers/products
// @access  Private (Supplier only)
router.post('/products', [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isIn(['vegetables', 'fruits', 'dairy', 'spices', 'grains', 'oils', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, category, price, unit, quantity, isAvailable = true } = req.body;

    const product = await Product.create({
      supplier: req.user._id,
      name,
      description,
      category,
      price,
      unit,
      quantity,
      isAvailable
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/suppliers/products/:id
// @access  Private (Supplier only)
router.put('/products/:id', [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('category').optional().isIn(['vegetables', 'fruits', 'dairy', 'spices', 'grains', 'oils', 'other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, supplier: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/suppliers/products/:id
// @access  Private (Supplier only)
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndDelete({
      _id: id,
      supplier: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get supplier orders
// @route   GET /api/suppliers/orders
// @access  Private (Supplier only)
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { supplier: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('vendor', 'name phone location')
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
// @route   GET /api/suppliers/orders/:id
// @access  Private (Supplier only)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      supplier: req.user._id
    })
    .populate('vendor', 'name phone location')
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

// @desc    Update order status
// @route   PUT /api/suppliers/orders/:id/status
// @access  Private (Supplier only)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['accepted', 'rejected', 'preparing', 'in-transit', 'delivered'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      supplier: req.user._id
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    await order.updateStatus(status, notes);

    // Send WhatsApp notification to vendor
    try {
      const populatedOrder = await Order.findById(order._id)
        .populate('vendor', 'name phone');
      await whatsappService.sendOrderStatusUpdate(populatedOrder, populatedOrder.vendor, status);
    } catch (error) {
      console.error('WhatsApp notification error:', error);
    }

    // Emit socket event for order status update
    if (global.socketService) {
      global.socketService.emitOrderStatusUpdate(
        order._id,
        status,
        order.vendor,
        order.supplier
      );
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router; 