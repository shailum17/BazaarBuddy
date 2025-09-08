import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle, Search, MessageCircle, Eye, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Chat from '../../components/Chat';

const SupplierOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/suppliers/orders');
      setOrders(response.data.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Fetch orders error:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate.status) return;

    try {
      await api.put(`/suppliers/orders/${selectedOrder._id}/status`, {
        status: statusUpdate.status,
        notes: statusUpdate.notes
      });

      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusUpdate({ status: '', notes: '' });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({ status: order.status, notes: '' });
    setShowStatusModal(true);
  };

  const openChat = (order) => {
    setChatOrder(order);
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setChatOrder(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'in-transit':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'preparing':
        return 'Preparing';
      case 'in-transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const canUpdateStatus = (status) => {
    return ['pending', 'accepted', 'preparing', 'in-transit'].includes(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">
          Manage and track incoming orders from vendors
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6 animate-slideUp">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Orders</option>
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
      <div className="space-y-4">
        {filteredOrders.map((order, idx) => (
          <div key={order._id} className="card animate-scaleIn" style={{animationDelay: `${idx*60}ms`}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">{order.vendor.name}</h3>
                  <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{order.total}</p>
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/supplier/orders/${order._id}/track`)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Track order"
                  >
                    <Truck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openChat(order)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Chat with vendor"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                    title="View order details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canUpdateStatus(order.status) && (
                    <button
                      onClick={() => openStatusModal(order)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity} {item.product.unit}
                    </span>
                    <span className="font-medium">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            {order.deliveryAddress && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address:</h4>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                {order.deliveryInstructions && (
                  <p className="text-sm text-gray-500 mt-1">
                    Instructions: {order.deliveryInstructions}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {order.notes?.vendor && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Vendor Notes:</h4>
                <p className="text-sm text-gray-600">{order.notes.vendor}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No orders have been placed yet'
            }
          </p>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
            <p className="text-sm text-gray-600 mb-4">
              Order #{selectedOrder.orderNumber} - {selectedOrder.vendor.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status *
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select status</option>
                  <option value="accepted">Accept Order</option>
                  <option value="rejected">Reject Order</option>
                  <option value="preparing">Start Preparing</option>
                  <option value="in-transit">Mark as In Transit</option>
                  <option value="delivered">Mark as Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="input-field"
                  placeholder="Add any notes about the status update..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={!statusUpdate.status}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setStatusUpdate({ status: '', notes: '' });
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && chatOrder && (
        <Chat
          orderId={chatOrder._id}
          otherParty={chatOrder.vendor}
          isOpen={showChat}
          onClose={closeChat}
        />
      )}
    </div>
  );
};

export default SupplierOrders; 