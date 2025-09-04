import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle, Search, MessageCircle, Eye, Star, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Chat from '../../components/Chat';
import { useLoading } from '../../context/LoadingContext';

const VendorOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, showLoading, hideLoading } = useLoading();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    showLoading();
    try {
      const response = await api.get('/vendors/orders');
      setOrders(response.data.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Fetch orders error:', error);
    } finally {
      hideLoading();
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-transit':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openChat = (order) => {
    setChatOrder(order);
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setChatOrder(null);
  };

  const rateOrder = async (orderId, rating, review) => {
    try {
      await api.post(`/vendors/orders/${orderId}/rate`, { rating, review });
      toast.success('Order rated successfully!');
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error('Failed to rate order');
    }
  };

  const cancelOrder = async (orderId, reason) => {
    try {
      await api.put(`/vendors/orders/${orderId}/cancel`, { reason });
      toast.success('Order cancelled successfully!');
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 animate-slideUp">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Start by placing your first order!</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-600">{order.supplier.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="text-sm text-gray-900">{order.items.length} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/vendor/orders/${order._id}/track`)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Track Order</span>
                      </button>
                      <button
                        onClick={() => openChat(order)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.status === 'delivered' && !order.rating?.rating && (
                        <button
                          onClick={() => {
                            const rating = prompt('Rate this order (1-5):');
                            const review = prompt('Write a review (optional):');
                            if (rating && rating >= 1 && rating <= 5) {
                              rateOrder(order._id, parseInt(rating), review);
                            }
                          }}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-yellow-600 hover:text-yellow-700"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate</span>
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'accepted') && (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for cancellation:');
                            if (reason) {
                              cancelOrder(order._id, reason);
                            }
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Component */}
        {showChat && chatOrder && (
          <Chat
            orderId={chatOrder._id}
            otherParty={chatOrder.supplier}
            isOpen={showChat}
            onClose={closeChat}
          />
        )}
      </div>
    </div>
  );
};

export default VendorOrders; 