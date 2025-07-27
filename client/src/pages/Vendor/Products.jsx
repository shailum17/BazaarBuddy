import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, MapPin, Package, Plus, Minus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'spices', label: 'Spices' },
    { value: 'grains', label: 'Grains' },
    { value: 'oils', label: 'Oils' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Best Rated' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.current]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page: pagination.current,
        limit: 20
      });

      const response = await api.get(`/vendors/products/search?${params}`);
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId, supplierId) => {
    setCart(prev => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        [productId]: (prev[supplierId]?.[productId] || 0) + 1
      }
    }));
    toast.success('Added to cart');
  };

  const removeFromCart = (productId, supplierId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[supplierId]?.[productId]) {
        newCart[supplierId][productId] -= 1;
        if (newCart[supplierId][productId] <= 0) {
          delete newCart[supplierId][productId];
        }
        if (Object.keys(newCart[supplierId]).length === 0) {
          delete newCart[supplierId];
        }
      }
      return newCart;
    });
    toast.success('Removed from cart');
  };

  const removeAllFromCart = (productId, supplierId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[supplierId]?.[productId]) {
        delete newCart[supplierId][productId];
        if (Object.keys(newCart[supplierId]).length === 0) {
          delete newCart[supplierId];
        }
      }
      return newCart;
    });
    toast.success('Removed from cart');
  };

  const getCartQuantity = (productId, supplierId) => {
    return cart[supplierId]?.[productId] || 0;
  };

  const getCartTotal = (supplierId) => {
    if (!cart[supplierId]) return 0;
    return Object.entries(cart[supplierId]).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p._id === productId);
      return total + (product?.price * quantity || 0);
    }, 0);
  };

  const getCartItemCount = (supplierId) => {
    if (!cart[supplierId]) return 0;
    return Object.values(cart[supplierId]).reduce((sum, quantity) => sum + quantity, 0);
  };

  const placeOrder = async (supplierId) => {
    if (!cart[supplierId]) return;

    const items = Object.entries(cart[supplierId]).map(([productId, quantity]) => ({
      productId,
      quantity
    }));

    try {
      const orderData = {
        supplierId,
        items,
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryTime: 'morning',
        notes: 'Please deliver as soon as possible'
      };

      await api.post('/vendors/orders', orderData);

      // Clear cart for this supplier
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[supplierId];
        return newCart;
      });

      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'rating'
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearCart = () => {
    setCart({});
    toast.success('Cart cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">Find and order products from local suppliers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => {
              const cartQuantity = getCartQuantity(product._id, product.supplier._id);
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.supplier.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {product.supplier.stats?.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{product.supplier.location}</span>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Available: <span className="font-medium">{product.quantity} {product.unit}</span>
                    </p>
                  </div>

                  {/* Cart Controls */}
                  <div className="flex items-center justify-between">
                    {cartQuantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(product._id, product.supplier._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove one"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={() => addToCart(product._id, product.supplier._id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Add one"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAllFromCart(product._id, product.supplier._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                          title="Remove all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product._id, product.supplier._id)}
                        disabled={product.quantity <= 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-600">
                Page {pagination.current} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Cart Summary */}
        {Object.keys(cart).length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Cart Summary</h3>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Clear All
              </button>
            </div>
            {Object.entries(cart).map(([supplierId, items]) => {
              const supplier = products.find(p => p.supplier._id === supplierId)?.supplier;
              const total = getCartTotal(supplierId);
              const itemCount = getCartItemCount(supplierId);

              return (
                <div key={supplierId} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{supplier?.name}</span>
                    <span className="text-sm text-gray-600">{itemCount} items</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total: ₹{total}</span>
                    <button
                      onClick={() => placeOrder(supplierId)}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 