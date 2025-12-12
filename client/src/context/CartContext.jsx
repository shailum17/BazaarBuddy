import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Cart item structure
const initialCartState = {
  items: [],
  total: 0,
  itemCount: 0,
  suppliers: [], // Fixed: Use Array instead of Set
  deliveryFee: 0,
  freeDeliveryThreshold: 500
};

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      
      // Safety check for product
      if (!product || !product._id) {
        console.error('Invalid product in ADD_ITEM:', product);
        return state;
      }
      
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === product._id
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Add new item - Fixed: Store only supplier ID with safety check
        const newItem = {
          product,
          quantity,
          supplierId: product.supplier?._id || null, // Fixed: Safe access to supplier ID
          addedAt: new Date().toISOString()
        };
        
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      const filteredItems = state.items.filter(
        item => item.product._id !== productId
      );
      
      return {
        ...state,
        items: filteredItems
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      const updatedItems = state.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity
      
      return {
        ...state,
        items: updatedItems
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialCartState
      };

    case CART_ACTIONS.LOAD_CART: {
      const { cartData } = action.payload;
      // Fixed: Validate cart data structure
      if (cartData && typeof cartData === 'object' && Array.isArray(cartData.items)) {
        return {
          ...state,
          ...cartData,
          suppliers: Array.isArray(cartData.suppliers) ? cartData.suppliers : []
        };
      }
      return state;
    }

    case CART_ACTIONS.CALCULATE_TOTALS: {
      const items = state.items;
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Fixed: Use Array instead of Set
      const supplierIds = [...new Set(items.map(item => item.supplierId))];
      
      // Calculate delivery fee based on suppliers and total
      let deliveryFee = 0;
      if (subtotal < state.freeDeliveryThreshold) {
        deliveryFee = supplierIds.length * 50; // 50 per supplier if under threshold
      }

      const total = subtotal + deliveryFee;

      return {
        ...state,
        total,
        subtotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        suppliers: supplierIds,
        deliveryFee
      };
    }

    default:
      return state;
  }
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bazaarbuddy_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Fixed: Validate data structure before loading
        if (cartData && typeof cartData === 'object' && Array.isArray(cartData.items)) {
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { cartData } });
        } else {
          console.warn('Invalid cart data structure, clearing localStorage');
          localStorage.removeItem('bazaarbuddy_cart');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('bazaarbuddy_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bazaarbuddy_cart', JSON.stringify(cartState));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartState]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.CALCULATE_TOTALS });
  }, [cartState.items]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    // Safety check for product
    if (!product || !product._id || !product.name) {
      console.error('Invalid product in addToCart:', product);
      toast.error('Cannot add invalid product to cart');
      return;
    }
    
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    const item = cartState.items.find(item => item.product._id === productId);
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
    if (item) {
      toast.success(`${item.product.name} removed from cart`);
    }
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Cart cleared');
  };

  const getItemQuantity = (productId) => {
    if (!productId) return 0;
    const item = cartState.items.find(item => item.product?._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    if (!productId) return false;
    return cartState.items.some(item => item.product?._id === productId);
  };

  const getCartBySupplier = () => {
    const supplierGroups = {};
    cartState.items.forEach(item => {
      // Safety checks
      if (!item || !item.product || !item.supplierId) {
        console.warn('Invalid cart item:', item);
        return;
      }
      
      const supplierId = item.supplierId; // This is the supplier ID we stored
      if (!supplierGroups[supplierId]) {
        supplierGroups[supplierId] = {
          supplier: item.product.supplier || { name: 'Unknown Supplier', _id: supplierId }, // Fallback supplier object
          items: [],
          subtotal: 0
        };
      }
      supplierGroups[supplierId].items.push(item);
      supplierGroups[supplierId].subtotal += (item.product.price || 0) * (item.quantity || 0);
    });
    return supplierGroups;
  };

  const value = {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    getCartBySupplier
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 