import io from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    // Use frontend domain in production; dev falls back to localhost server
    const baseUrl = import.meta.env.DEV
      ? 'http://localhost:5000'
      : (import.meta.env.VITE_API_URL || window.location.origin);

    this.socket = io(baseUrl, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Set up default event listeners
    this.setupDefaultListeners();
  }

  setupDefaultListeners() {
    // Order status updates
    this.socket.on('order-updated', (data) => {
      toast.success(`Order #${data.orderId} status updated to ${data.status}`);
      this.emit('order-updated', data);
    });

    // New order notifications
    this.socket.on('new-order-received', (data) => {
      toast.success(`New order #${data.orderId} received!`);
      this.emit('new-order-received', data);
    });

    // Order confirmation
    this.socket.on('order-confirmed', (data) => {
      toast.success(`Order #${data.orderId} confirmed!`);
      this.emit('order-confirmed', data);
    });

    // Chat messages
    this.socket.on('new-message', (data) => {
      toast.success(`New message for order #${data.orderId}`);
      this.emit('new-message', data);
    });
  }

  joinUser(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user', userId);
    }
  }

  joinSupplier(supplierId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-supplier', supplierId);
    }
  }

  // Generic event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Generic event emitter
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Remove event listener
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Send chat message
  sendMessage(orderId, message, senderId, receiverId, senderType) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', {
        orderId,
        message,
        senderId,
        receiverId,
        senderType
      });
    }
  }

  // Update order status
  updateOrderStatus(orderId, status, vendorId, supplierId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order-status-update', {
        orderId,
        status,
        vendorId,
        supplierId
      });
    }
  }

  // Notify new order
  notifyNewOrder(orderId, supplierId, vendorId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new-order', {
        orderId,
        supplierId,
        vendorId
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  isConnected() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 