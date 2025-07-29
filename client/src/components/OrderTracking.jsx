import React from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const OrderTracking = ({ order, showTimeline = true, showActions = false, onStatusUpdate }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'in-transit':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been placed successfully' },
      { key: 'accepted', label: 'Order Accepted', description: 'Supplier has accepted your order' },
      { key: 'preparing', label: 'Preparing', description: 'Your order is being prepared' },
      { key: 'in-transit', label: 'In Transit', description: 'Your order is on its way' },
      { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'accepted',
      'accepted': 'preparing',
      'preparing': 'in-transit',
      'in-transit': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = (currentStatus) => {
    return ['pending', 'accepted', 'preparing', 'in-transit'].includes(currentStatus);
  };

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No order data available</p>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <h3 className="font-semibold text-gray-900">Order Status</h3>
            <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
        </span>
      </div>

      {/* Status Update Actions */}
      {showActions && canUpdateStatus(order.status) && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Update Order Status</h4>
          <div className="flex gap-3">
            <button
              onClick={() => onStatusUpdate?.(nextStatus)}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            </button>
            
            {order.status === 'pending' && (
              <button
                onClick={() => onStatusUpdate?.('rejected')}
                className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                Reject Order
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {showTimeline && (
        <div className="space-y-4">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${
                    step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  {step.current && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
                {step.current && order.estimatedDeliveryTime && (
                  <p className="text-sm text-blue-600 mt-1">
                    Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium">₹{order.total}</p>
          </div>
          <div>
            <p className="text-gray-600">Items</p>
            <p className="font-medium">{order.items.length} items</p>
          </div>
          <div>
            <p className="text-gray-600">Order Date</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Delivery Date</p>
            <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 