import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Package, Filter } from 'lucide-react';
import api from '../../services/api';
import { useLoading } from '../../context/LoadingContext';

const VendorSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { loading, showLoading, hideLoading } = useLoading();

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'spices', name: 'Spices' },
    { id: 'grains', name: 'Grains' },
    { id: 'oils', name: 'Oils' }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchTerm, selectedCategory, suppliers]);

  const fetchSuppliers = async () => {
    showLoading();
    try {
      
      // Fetch real suppliers from API
      const response = await api.get('/vendors/suppliers');
      const suppliersData = response.data.data || [];
      
      // Transform the data to match the expected format
      const transformedSuppliers = suppliersData.map(supplier => ({
        id: supplier._id,
        name: supplier.name,
        rating: supplier.stats?.rating || 0,
        reviews: supplier.stats?.reviews || 0,
        distance: '2-5 km', // This would need to be calculated based on location
        categories: supplier.categories || ['general'],
        products: supplier.products || [],
        minOrder: supplier.minOrder || 500,
        deliveryTime: supplier.deliveryTime || 'Same day',
        image: '🏪',
        location: supplier.location,
        trustScore: supplier.trustScore || 0
      }));

      setSuppliers(transformedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Fallback to empty array if API fails
      setSuppliers([]);
    } finally {
      hideLoading();
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.products.some(product => 
          product.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplier =>
        supplier.categories.includes(selectedCategory)
      );
    }

    setFilteredSuppliers(filtered);
  };

  const handleOrder = (supplierId) => {
    // Navigate to order page or open order modal
    console.log('Order from supplier:', supplierId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Suppliers</h1>
        <p className="text-gray-600 mt-2">
          Discover reliable suppliers for your ingredients
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="card hover:shadow-lg transition-shadow">
            {/* Supplier Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mr-3">
                  {supplier.image}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{supplier.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({supplier.reviews})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location and Distance */}
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{supplier.distance} away</span>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Available Products:</h4>
              <div className="flex flex-wrap gap-1">
                {supplier.products.slice(0, 3).map((product, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {product}
                  </span>
                ))}
                {supplier.products.length > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    +{supplier.products.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Min Order:</span>
                <span className="font-medium">₹{supplier.minOrder}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery:</span>
                <span className="font-medium">{supplier.deliveryTime}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleOrder(supplier.id)}
              className="w-full btn-primary"
            >
              <Package className="w-4 h-4 mr-2" />
              Place Order
            </button>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorSuppliers; 