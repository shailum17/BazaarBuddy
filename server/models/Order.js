const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'preparing', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'upi', 'card'],
    default: 'cod'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  deliveryInstructions: {
    type: String,
    maxlength: [200, 'Delivery instructions cannot be more than 200 characters']
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  deliveryTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'anytime'],
    default: 'anytime'
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  notes: {
    vendor: String,
    supplier: String
  },
  rating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot be more than 500 characters']
    },
    date: {
      type: Date
    }
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ vendor: 1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

// Order number is now generated in the API route for better control

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return `${this.items.length} item(s) - ₹${this.total}`;
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  const now = new Date();
  if (this.status === 'delivered') return 'delivered';
  if (this.estimatedDeliveryTime && now > this.estimatedDeliveryTime) return 'delayed';
  if (this.status === 'in-transit') return 'in-transit';
  return 'pending';
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    if (newStatus === 'rejected' || newStatus === 'cancelled') {
      this.cancellationReason = notes;
    } else {
      this.notes.supplier = notes;
    }
  }
  
  // Update timestamps based on status
  if (newStatus === 'accepted') {
    this.estimatedDeliveryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  } else if (newStatus === 'delivered') {
    this.actualDeliveryTime = new Date();
  }
  
  return this.save();
};

// Method to add rating
orderSchema.methods.addRating = function(rating, review) {
  this.rating = {
    rating,
    review,
    date: new Date()
  };
  return this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId, role) {
  const query = role === 'vendor' ? { vendor: userId } : { supplier: userId };
  return this.find(query).populate('vendor supplier items.product').sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getStats = function(userId, role) {
  const query = role === 'vendor' ? { vendor: userId } : { supplier: userId };
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        uniqueSuppliers: {
          $addToSet: '$supplier'
        },
        uniqueCustomers: {
          $addToSet: '$vendor'
        }
      }
    },
    {
      $project: {
        totalOrders: 1,
        totalRevenue: 1,
        pendingOrders: 1,
        deliveredOrders: 1,
        uniqueSuppliers: { $size: '$uniqueSuppliers' },
        uniqueCustomers: { $size: '$uniqueCustomers' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema); 