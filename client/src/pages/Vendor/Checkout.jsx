import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, 
    total, 
    subtotal, 
    deliveryFee, 
    clearCart,
    getCartBySupplier 
  } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'vendor') {
      navigate('/');
      return;
    }
    
    if (items.length === 0) {
      navigate('/vendor/products');
      return;
    }

    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
  }, [user, items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Check if form is complete and ready for submission
  const isFormComplete = () => {
    return deliveryAddress.trim() && 
           deliveryDate && 
           items.length > 0 && 
           new Date(deliveryDate) >= new Date().setHours(0, 0, 0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation for all required fields
    const validationErrors = [];
    
    // Check delivery address
    if (!deliveryAddress.trim()) {
      validationErrors.push('Delivery address is required');
    }
    
    // Check delivery date
    if (!deliveryDate) {
      validationErrors.push('Delivery date is required');
    } else {
      // Check if delivery date is not in the past
      const selectedDate = new Date(deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        validationErrors.push('Delivery date cannot be in the past');
      }
    }
    
    // Check if cart has items
    if (items.length === 0) {
      validationErrors.push('Cart is empty. Please add items before checkout');
    }
    
    // Check if all items have valid quantities
    const invalidItems = items.filter(item => !item.quantity || item.quantity <= 0);
    if (invalidItems.length > 0) {
      validationErrors.push('All items must have valid quantities');
    }
    
    // Check if user is logged in
    if (!user) {
      validationErrors.push('Please login to place an order');
    }
    
    // Check if user is a vendor
    if (user && user.role !== 'vendor') {
      validationErrors.push('Only vendors can place orders');
    }
    
    // Show all validation errors if any
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Group items by supplier
      const supplierGroups = getCartBySupplier();
      console.log('Supplier groups:', supplierGroups); // Debug log
      
      // Create orders for each supplier
      const orderPromises = Object.entries(supplierGroups).map(([supplierId, group]) => {
        const orderData = {
          supplierId: supplierId,
          items: group.items.map(item => ({
            productId: item.product._id,
            quantity: item.quantity
          })),
          deliveryAddress,
          deliveryDate,
          deliveryTime: 'anytime',
          notes: specialInstructions || ''
        };

        console.log('Order data being sent:', orderData);
        console.log('Supplier ID:', supplierId);
        console.log('Items count:', group.items.length);
        
        return api.post('/vendors/orders', orderData);
      });

      await Promise.all(orderPromises);
      
      toast.success('Orders placed successfully!');
      clearCart();
      navigate('/vendor/orders');
      
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle specific validation errors from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        // If it's a validation error with multiple messages, show them separately
        if (errorMessage.includes(', ')) {
          const errors = errorMessage.split(', ');
          errors.forEach(err => toast.error(err));
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to place orders. Please check your information and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const supplierGroups = getCartBySupplier();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items in cart</h2>
          <p className="text-gray-600 mb-6">Add some products to proceed with checkout</p>
          <button
            onClick={() => navigate('/vendor/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/vendor/products')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items by Supplier */}
          {Object.entries(supplierGroups).map(([supplierId, group]) => (
            <div key={supplierId} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {group.supplier?.name || 'Supplier'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.product.price)} per {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(group.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows="3"
                  className={`input-field ${!deliveryAddress.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Enter your complete delivery address"
                  required
                />
                {!deliveryAddress.trim() && (
                  <p className="text-red-500 text-sm mt-1">Delivery address is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`input-field ${!deliveryDate ? 'border-red-300 focus:border-red-500' : ''}`}
                  required
                />
                {!deliveryDate && (
                  <p className="text-red-500 text-sm mt-1">Delivery date is required</p>
                )}
                {deliveryDate && new Date(deliveryDate) < new Date().setHours(0, 0, 0, 0) && (
                  <p className="text-red-500 text-sm mt-1">Delivery date cannot be in the past</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows="2"
                  className="input-field"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>
          </div>

          {/* Validation Summary */}
          {(!deliveryAddress.trim() || !deliveryDate || items.length === 0) && (
            <div className="card border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Missing Information
              </h3>
              <ul className="space-y-1 text-red-700">
                {!deliveryAddress.trim() && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Delivery address is required
                  </li>
                )}
                {!deliveryDate && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Delivery date is required
                  </li>
                )}
                {items.length === 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Cart is empty
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Payment Method */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary-600"
                />
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary-600"
                />
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Online Payment</p>
                  <p className="text-sm text-gray-600">Pay securely online (Coming Soon)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}
                </span>
              </div>
              
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormComplete()}
                className={`w-full flex items-center justify-center gap-2 ${
                  isFormComplete() 
                    ? 'btn-primary' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/vendor/products')}
                className="w-full btn-outline"
              >
                Continue Shopping
              </button>
            </div>

            {/* Important Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Orders will be confirmed by suppliers</li>
                    <li>• Delivery times may vary by supplier</li>
                    <li>• You'll receive updates via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 