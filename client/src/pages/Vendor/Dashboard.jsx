import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign,
  Clock,
  Star,
  ArrowRight,
  Users,
  MapPin
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    suppliersCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await api.get('/vendors/dashboard');
      const dashboardData = statsResponse.data.data;
      
      setStats({
        totalOrders: dashboardData.stats?.totalOrders || 0,
        activeOrders: dashboardData.stats?.pendingOrders || 0,
        totalSpent: dashboardData.stats?.totalRevenue || 0,
        suppliersCount: dashboardData.stats?.uniqueSuppliers || 0
      });

      setRecentOrders(dashboardData.recentOrders || []);

      // Fetch top suppliers
      const suppliersResponse = await api.get('/vendors/suppliers?limit=5');
      setTopSuppliers(suppliersResponse.data.data || []);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your orders and suppliers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card animate-slideUp" style={{animationDelay: '0ms'}}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="card animate-slideUp" style={{animationDelay: '80ms'}}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="card animate-slideUp" style={{animationDelay: '160ms'}}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card animate-slideUp" style={{animationDelay: '240ms'}}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.suppliersCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/vendor/orders"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{order.supplier?.name || 'Supplier'}</h3>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • Order #{order.orderNumber}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.total}</p>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start by browsing products from suppliers</p>
                <Link
                  to="/vendor/products"
                  className="btn-primary"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="card animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Top Suppliers</h2>
            <Link
              to="/vendor/suppliers"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {topSuppliers.length > 0 ? (
              topSuppliers.map((supplier) => (
                <div key={supplier._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {supplier.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{supplier.location}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-gray-500">
                          {supplier.stats?.rating?.toFixed(1) || '0.0'} ({supplier.stats?.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Trust Score: {supplier.trustScore || 0}%
                    </p>
                    <Link
                      to={`/vendor/suppliers/${supplier._id}/products`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View Products
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600 mb-4">Discover suppliers in your area</p>
                <Link
                  to="/vendor/suppliers"
                  className="btn-primary"
                >
                  Find Suppliers
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/vendor/products"
            className="card hover:shadow-md transition-all cursor-pointer animate-scaleIn"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-600">Search and order from suppliers</p>
              </div>
            </div>
          </Link>

          <Link
            to="/vendor/suppliers"
            className="card hover:shadow-md transition-all cursor-pointer animate-scaleIn"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Find Suppliers</h3>
                <p className="text-sm text-gray-600">Discover new suppliers</p>
              </div>
            </div>
          </Link>

          <Link
            to="/vendor/orders"
            className="card hover:shadow-md transition-all cursor-pointer animate-scaleIn"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Track Orders</h3>
                <p className="text-sm text-gray-600">View order status and history</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard; 