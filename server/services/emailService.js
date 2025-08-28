const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development, prioritize Gmail if configured, otherwise use Ethereal
    if (process.env.NODE_ENV === 'development') {
      if (process.env.DEV_SMTP_USER && process.env.DEV_SMTP_PASS) {
        console.log('📧 Using Gmail for development email...');
        this.transporter = nodemailer.createTransport({
          host: process.env.DEV_SMTP_HOST,
          port: process.env.DEV_SMTP_PORT || 587,
          secure: process.env.DEV_SMTP_SECURE === 'true',
          auth: {
            user: process.env.DEV_SMTP_USER,
            pass: process.env.DEV_SMTP_PASS
          }
        });
      } else {
        console.log('📧 Using Ethereal for development email...');
        // Use Ethereal Email for testing
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.ETHEREAL_USER || 'test@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'test123'
          }
        });
      }
    } else {
      // For production, use configured email service
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendOTP(email, otp, type = 'registration') {
    try {
      const subject = this.getSubject(type);
      const html = this.getEmailTemplate(otp, type);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@bazaarbuddy.com',
        to: email,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent (development):', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  getSubject(type) {
    switch (type) {
      case 'registration':
        return 'Verify your BazaarBuddy account';
      case 'login':
        return 'Your BazaarBuddy login code';
      case 'password_reset':
        return 'Reset your BazaarBuddy password';
      default:
        return 'Your BazaarBuddy verification code';
    }
  }

  getEmailTemplate(otp, type) {
    const action = type === 'registration' ? 'verify your account' : 
                   type === 'login' ? 'login to your account' : 
                   'reset your password';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BazaarBuddy Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍔 BazaarBuddy</h1>
            <p>Your verification code is here!</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You requested a verification code to ${action}. Here's your 6-digit code:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p><strong>This code will expire in 10 minutes</strong></p>
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
            <p>Best regards,<br>The BazaarBuddy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 BazaarBuddy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
