const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Index for quick lookups
otpSchema.index({ email: 1, type: 1, isUsed: 1 });
otpSchema.index({ phone: 1, type: 1, isUsed: 1 });
otpSchema.index({ expiresAt: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP for email
otpSchema.statics.createForEmail = async function(email, type = 'registration') {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Invalidate any existing unused OTPs for this email and type
  await this.updateMany(
    { email, type, isUsed: false },
    { isUsed: true }
  );
  
  return await this.create({
    email,
    otp,
    type,
    expiresAt
  });
};

// Static method to create OTP for phone
otpSchema.statics.createForPhone = async function(phone, type = 'registration') {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Invalidate any existing unused OTPs for this phone and type
  await this.updateMany(
    { phone, type, isUsed: false },
    { isUsed: true }
  );
  
  return await this.create({
    phone,
    otp,
    type,
    expiresAt
  });
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(identifier, otp, type) {
  const query = {};
  
  // Determine if identifier is email or phone
  if (identifier.includes('@')) {
    query.email = identifier.toLowerCase();
  } else {
    query.phone = identifier;
  }
  
  query.type = type;
  query.isUsed = false;
  query.expiresAt = { $gt: new Date() };
  
  const otpRecord = await this.findOne(query);
  
  if (!otpRecord) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }
  
  if (otpRecord.attempts >= 5) {
    return { valid: false, message: 'Too many attempts. Please request a new OTP' };
  }
  
  if (otpRecord.otp !== otp) {
    // Increment attempts
    await this.updateOne(
      { _id: otpRecord._id },
      { $inc: { attempts: 1 } }
    );
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // Mark OTP as used
  await this.updateOne(
    { _id: otpRecord._id },
    { isUsed: true }
  );
  
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('OTP', otpSchema);

