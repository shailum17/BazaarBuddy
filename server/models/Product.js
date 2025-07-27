const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'dairy', 'spices', 'grains', 'oils', 'other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'pack']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  specifications: {
    weight: String,
    brand: String,
    origin: String,
    expiryDate: Date,
    organic: {
      type: Boolean,
      default: false
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    bulkDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    bulkThreshold: {
      type: Number,
      default: 10
    }
  },
  delivery: {
    sameDay: {
      type: Boolean,
      default: true
    },
    nextDay: {
      type: Boolean,
      default: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 500
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ supplier: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price}/${this.unit}`;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity < 10) return 'low-stock';
  return 'in-stock';
});

// Method to update rating
productSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to calculate bulk price
productSchema.methods.getBulkPrice = function(quantity) {
  if (quantity >= this.pricing.bulkThreshold && this.pricing.bulkDiscount > 0) {
    const discount = this.price * (this.pricing.bulkDiscount / 100);
    return this.price - discount;
  }
  return this.price;
};

// Static method to find available products
productSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true, quantity: { $gt: 0 } });
};

// Static method to find by supplier
productSchema.statics.findBySupplier = function(supplierId) {
  return this.find({ supplier: supplierId });
};

// Pre-save middleware to update availability
productSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.isAvailable = false;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 