const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = phoneNumber;
    } else {
      console.warn('⚠️  Twilio credentials not configured. SMS service will be disabled.');
    }
  }

  async sendOTP(phone, otp, type = 'registration') {
    try {
      if (!this.client) {
        // In development, just log the OTP
        if (process.env.NODE_ENV === 'development') {
          console.log('📱 SMS OTP (development):', { phone, otp, type });
          return { success: true, messageId: 'dev-' + Date.now() };
        }
        return { success: false, error: 'SMS service not configured' };
      }

      const message = this.getMessageTemplate(otp, type);

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phone
      });

      console.log('📱 SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  getMessageTemplate(otp, type) {
    const action = type === 'registration' ? 'verify your account' : 
                   type === 'login' ? 'login to your account' : 
                   'reset your password';

    return `🍔 BazaarBuddy: Your verification code is ${otp}. Use this code to ${action}. Valid for 10 minutes. Do not share this code.`;
  }

  // Method to validate phone number format
  validatePhoneNumber(phone) {
    // Basic validation for Indian phone numbers
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // Method to format phone number for Twilio
  formatPhoneNumber(phone) {
    // Add +91 prefix for Indian numbers if not present
    if (phone.startsWith('+91')) {
      return phone;
    }
    if (phone.startsWith('91') && phone.length === 12) {
      return '+' + phone;
    }
    if (phone.length === 10) {
      return '+91' + phone;
    }
    return phone;
  }
}

module.exports = new SMSService();

