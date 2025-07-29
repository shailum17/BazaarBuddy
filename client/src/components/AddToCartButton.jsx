import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ product, className = '' }) => {
  const { addToCart, getItemQuantity, updateQuantity, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);

  const currentQuantity = getItemQuantity(product._id);
  const inCart = isInCart(product._id);

  const handleAddToCart = () => {
    if (inCart) {
      // If already in cart, show quantity selector
      setShowQuantity(true);
    } else {
      // Add to cart with current quantity
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, product.quantity || 999));
    setQuantity(validQuantity);
  };

  const handleUpdateQuantity = () => {
    updateQuantity(product._id, currentQuantity + quantity);
    setQuantity(1);
    setShowQuantity(false);
  };

  const handleRemoveFromCart = () => {
    updateQuantity(product._id, 0);
    setShowQuantity(false);
  };

  if (showQuantity) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 border-x border-gray-300 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleUpdateQuantity}
          className="btn-primary text-sm px-4 py-2"
        >
          Add {quantity}
        </button>
        <button
          onClick={handleRemoveFromCart}
          className="btn-outline text-sm px-4 py-2"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {inCart && (
        <span className="text-sm text-green-600 font-medium">
          {currentQuantity} in cart
        </span>
      )}
      <button
        onClick={handleAddToCart}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          inCart
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {inCart ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default AddToCartButton; 