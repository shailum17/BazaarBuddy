const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
    minlength: [2, 'Name must be at least 2 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    default: undefined,
    lowercase: true,
    trim: true,
    maxlength: [255, 'Email is too long'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [128, 'Password is too long'],
    validate: {
      validator: function(password) {
        // Enhanced password complexity validation
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    default: undefined,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters'],
    minlength: [2, 'Location must be at least 2 characters']
  },
  role: {
    type: String,
    enum: ['vendor', 'supplier', 'admin'],
    default: 'vendor'
  },
  acceptTerms: {
    type: Boolean,
    required: [true, 'Terms and conditions must be accepted'],
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  profileImage: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        return /^https?:\/\/.+/.test(v); // Must be a valid URL
      },
      message: 'Profile image must be a valid URL'
    }
  },
  businessDetails: {
    businessName: {
      type: String,
      maxlength: [100, 'Business name cannot be more than 100 characters']
    },
    businessType: {
      type: String,
      maxlength: [50, 'Business type cannot be more than 50 characters']
    },
    gstNumber: {
      type: String,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot be more than 500 characters']
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false }
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    }
  },
  stats: {
    totalOrders: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Custom validation to ensure at least one of email or phone is provided
userSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone number is required');
  }
  next();
});

// Indexes for better query performance and uniqueness constraints that
// align with the new registration/login flow (either email OR phone)
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true } },
    name: 'email_unique_if_present'
  }
);
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true } },
    name: 'phone_unique_if_present'
  }
);
userSchema.index({ role: 1 });
userSchema.index({ location: 1 });
userSchema.index({ isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  if (!email) return null;
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find by phone
userSchema.statics.findByPhone = function(phone) {
  if (!phone) return null;
  return this.findOne({ phone: phone.trim() });
};

// Instance method to update stats
userSchema.methods.updateStats = function(stats) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 