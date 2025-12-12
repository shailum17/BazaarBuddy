class SocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map to store user ID -> socket ID
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('Socket error for user:', socket.id, error);
      });

      // Join user to their personal room
      socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        this.userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined room: user-${userId}`);
      });

      // Join supplier to their orders room
      socket.on('join-supplier', (supplierId) => {
        socket.join(`supplier-${supplierId}`);
        console.log(`Supplier ${supplierId} joined room: supplier-${supplierId}`);
      });

      // Handle order status updates
      socket.on('order-status-update', (data) => {
        const { orderId, status, vendorId, supplierId } = data;
        
        // Notify vendor about order status change
        if (vendorId) {
          this.io.to(`user-${vendorId}`).emit('order-updated', {
            orderId,
            status,
            timestamp: new Date()
          });
        }

        // Notify supplier about order status change
        if (supplierId) {
          this.io.to(`supplier-${supplierId}`).emit('order-updated', {
            orderId,
            status,
            timestamp: new Date()
          });
        }

        console.log(`Order ${orderId} status updated to ${status}`);
      });

      // Handle new order notifications
      socket.on('new-order', (data) => {
        const { orderId, supplierId, vendorId } = data;
        
        // Notify supplier about new order
        if (supplierId) {
          this.io.to(`supplier-${supplierId}`).emit('new-order-received', {
            orderId,
            timestamp: new Date()
          });
        }

        // Notify vendor about order confirmation
        if (vendorId) {
          this.io.to(`user-${vendorId}`).emit('order-confirmed', {
            orderId,
            timestamp: new Date()
          });
        }

        console.log(`New order ${orderId} notification sent`);
      });

      // Handle chat messages
      socket.on('send-message', (data) => {
        const { orderId, message, senderId, receiverId, senderType } = data;
        
        const messageData = {
          orderId,
          message,
          senderId,
          senderType,
          timestamp: new Date()
        };

        // Send to vendor
        if (senderType === 'supplier') {
          this.io.to(`user-${receiverId}`).emit('new-message', messageData);
        } else {
          this.io.to(`supplier-${receiverId}`).emit('new-message', messageData);
        }

        console.log(`Message sent for order ${orderId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from socket map
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
      });
    });
  }

  // Method to emit order status update
  emitOrderStatusUpdate(orderId, status, vendorId, supplierId) {
    this.io.emit('order-status-update', {
      orderId,
      status,
      vendorId,
      supplierId,
      timestamp: new Date()
    });
  }

  // Method to emit new order notification
  emitNewOrder(orderId, supplierId, vendorId) {
    this.io.emit('new-order', {
      orderId,
      supplierId,
      vendorId,
      timestamp: new Date()
    });
  }

  // Method to emit chat message
  emitChatMessage(orderId, message, senderId, receiverId, senderType) {
    this.io.emit('send-message', {
      orderId,
      message,
      senderId,
      receiverId,
      senderType,
      timestamp: new Date()
    });
  }

  // Method to get connected users count
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Method to check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
}

module.exports = SocketService; 