import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartIcon = ({ onClick, className = '' }) => {
  const { itemCount } = useCart();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-primary-700 transition-all hover:scale-[1.02] ${className}`}
      aria-label="Open cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scaleIn">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon; 