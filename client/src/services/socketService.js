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
    let baseUrl;
    if (import.meta.env.DEV) {
      baseUrl = 'http://localhost:5000';
    } else {
      // In production, use the configured API URL or fallback to current origin
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl && apiUrl !== 'https://your-backend-domain.com') {
        baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
      } else {
        baseUrl = window.location.origin;
      }
    }

    console.log('Connecting to socket server:', baseUrl);

    this.socket = io(baseUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
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
      
      // Show user-friendly error message
      if (error.message.includes('timeout')) {
        toast.error('Connection timeout. Please check your internet connection.');
      } else {
        toast.error('Unable to connect to real-time services. Some features may be limited.');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Connection restored!');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
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