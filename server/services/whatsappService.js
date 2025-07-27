const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1';
    this.token = process.env.WHATSAPP_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.token || !this.phoneNumberId) {
      console.log('WhatsApp not configured, skipping message:', message);
      return;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('WhatsApp message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendOrderConfirmation(order, user) {
    const message = `🎉 Order Confirmed!

Order #${order.orderNumber}
Total: ₹${order.total}
Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}

Thank you for choosing BazaarBuddy!
We'll keep you updated on your order status.`;

    return this.sendMessage(user.phone, message);
  }

  async sendOrderStatusUpdate(order, user, status) {
    const statusMessages = {
      'accepted': '✅ Your order has been accepted and is being prepared.',
      'preparing': '👨‍🍳 Your order is being prepared.',
      'in-transit': '🚚 Your order is on the way!',
      'delivered': '🎉 Your order has been delivered! Please rate your experience.'
    };

    const message = `📦 Order Update

Order #${order.orderNumber}
Status: ${status.toUpperCase()}

${statusMessages[status] || 'Your order status has been updated.'}

Track your order at: ${process.env.CLIENT_URL}/vendor/orders/${order._id}`;

    return this.sendMessage(user.phone, message);
  }

  async sendNewOrderNotification(order, supplier) {
    const message = `🆕 New Order Received!

Order #${order.orderNumber}
From: ${order.vendor.name}
Total: ₹${order.total}
Items: ${order.items.length}

Please review and update the order status.
View order details at: ${process.env.CLIENT_URL}/supplier/orders/${order._id}`;

    return this.sendMessage(supplier.phone, message);
  }
}

module.exports = new WhatsAppService(); 