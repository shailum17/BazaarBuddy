const express = require('express');
const { body, validationResult } = require('express-validator');
const OTP = require('../models/OTP');
const User = require('../models/User');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @desc    Send OTP for registration
// @route   POST /api/otp/send-registration
// @access  Public
router.post('/send-registration', otpLimiter, [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone number is required')
    .custom((value) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[0-9]{10}$/.test(value);
      
      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email or 10-digit phone number');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          path: err.path,
          msg: err.msg
        }))
      });
    }

    const { emailOrPhone } = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);

    // Check if user already exists
    let existingUser;
    if (isEmail) {
      existingUser = await User.findByEmail(emailOrPhone);
    } else {
      existingUser = await User.findByPhone(emailOrPhone);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: isEmail ? 'User already exists with this email' : 'Phone number already registered'
      });
    }

    let otpRecord;
    let sendResult;

    if (isEmail) {
      // Send OTP via email
      otpRecord = await OTP.createForEmail(emailOrPhone, 'registration');
      sendResult = await emailService.sendOTP(emailOrPhone, otpRecord.otp, 'registration');
    } else {
      // Send OTP via SMS
      const formattedPhone = smsService.formatPhoneNumber(emailOrPhone);
      otpRecord = await OTP.createForPhone(emailOrPhone, 'registration');
      sendResult = await smsService.sendOTP(formattedPhone, otpRecord.otp, 'registration');
    }

    if (!sendResult.success) {
      // Delete the OTP record if sending failed
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP. Please try again.`
      });
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to your ${isEmail ? 'email' : 'phone number'}`,
      identifier: emailOrPhone,
      type: 'registration'
    });

  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Send OTP for login
// @route   POST /api/otp/send-login
// @access  Public
router.post('/send-login', otpLimiter, [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone number is required')
    .custom((value) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[0-9]{10}$/.test(value);
      
      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email or 10-digit phone number');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          path: err.path,
          msg: err.msg
        }))
      });
    }

    const { emailOrPhone } = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);

    // Check if user exists
    let existingUser;
    if (isEmail) {
      existingUser = await User.findByEmail(emailOrPhone);
    } else {
      existingUser = await User.findByPhone(emailOrPhone);
    }

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    let otpRecord;
    let sendResult;

    if (isEmail) {
      // Send OTP via email
      otpRecord = await OTP.createForEmail(emailOrPhone, 'login');
      sendResult = await emailService.sendOTP(emailOrPhone, otpRecord.otp, 'login');
    } else {
      // Send OTP via SMS
      const formattedPhone = smsService.formatPhoneNumber(emailOrPhone);
      otpRecord = await OTP.createForPhone(emailOrPhone, 'login');
      sendResult = await smsService.sendOTP(formattedPhone, otpRecord.otp, 'login');
    }

    if (!sendResult.success) {
      // Delete the OTP record if sending failed
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP. Please try again.`
      });
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to your ${isEmail ? 'email' : 'phone number'}`,
      identifier: emailOrPhone,
      type: 'login'
    });

  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
router.post('/verify', [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('type')
    .isIn(['registration', 'login'])
    .withMessage('Invalid OTP type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          path: err.path,
          msg: err.msg
        }))
      });
    }

    const { emailOrPhone, otp, type } = req.body;

    const verificationResult = await OTP.verifyOTP(emailOrPhone, otp, type);

    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      identifier: emailOrPhone,
      type: type
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Public
router.post('/resend', otpLimiter, [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('type')
    .isIn(['registration', 'login'])
    .withMessage('Invalid OTP type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          path: err.path,
          msg: err.msg
        }))
      });
    }

    const { emailOrPhone, type } = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);

    // For login, check if user exists
    if (type === 'login') {
      let existingUser;
      if (isEmail) {
        existingUser = await User.findByEmail(emailOrPhone);
      } else {
        existingUser = await User.findByPhone(emailOrPhone);
      }

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }
    }

    // For registration, check if user doesn't exist
    if (type === 'registration') {
      let existingUser;
      if (isEmail) {
        existingUser = await User.findByEmail(emailOrPhone);
      } else {
        existingUser = await User.findByPhone(emailOrPhone);
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: isEmail ? 'User already exists with this email' : 'Phone number already registered'
        });
      }
    }

    let otpRecord;
    let sendResult;

    if (isEmail) {
      // Send OTP via email
      otpRecord = await OTP.createForEmail(emailOrPhone, type);
      sendResult = await emailService.sendOTP(emailOrPhone, otpRecord.otp, type);
    } else {
      // Send OTP via SMS
      const formattedPhone = smsService.formatPhoneNumber(emailOrPhone);
      otpRecord = await OTP.createForPhone(emailOrPhone, type);
      sendResult = await smsService.sendOTP(formattedPhone, otpRecord.otp, type);
    }

    if (!sendResult.success) {
      // Delete the OTP record if sending failed
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP. Please try again.`
      });
    }

    res.status(200).json({
      success: true,
      message: `OTP resent successfully to your ${isEmail ? 'email' : 'phone number'}`,
      identifier: emailOrPhone,
      type: type
    });

  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

module.exports = router;

