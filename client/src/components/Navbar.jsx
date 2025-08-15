import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart, Package, User, LogOut, Settings } from 'lucide-react';
import CartIcon from './CartIcon';
import {
  DashboardIcon,
  ShoppingCartIcon as CartIconNav,
  SearchIcon,
  InventoryIcon,
  ReceiptIcon
} from './Icons';

const Navbar = ({ onCartClick }) => {
  const { user, logout, isAuthenticated, isVendor, isSupplier } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const vendorMenuItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: 'DashboardIcon' },
    { path: '/vendor/products', label: 'Browse Products', icon: 'ShoppingCartIcon' },
    { path: '/vendor/suppliers', label: 'Find Suppliers', icon: 'SearchIcon' },
    { path: '/vendor/orders', label: 'My Orders', icon: 'InventoryIcon' },
    { path: '/vendor/profile', label: 'Profile', icon: 'User' },
  ];

  const supplierMenuItems = [
    { path: '/supplier/dashboard', label: 'Dashboard', icon: 'DashboardIcon' },
    { path: '/supplier/products', label: 'My Products', icon: 'InventoryIcon' },
    { path: '/supplier/orders', label: 'Orders', icon: 'ReceiptIcon' },
    { path: '/supplier/profile', label: 'Profile', icon: 'User' },
  ];

  const menuItems = isVendor ? vendorMenuItems : supplierMenuItems;

  return (
    <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm border-b border-gray-200 sticky top-0 z-40 animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <img src="/vite.svg" alt="BazaarBuddy" className="w-8 h-8 rounded transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xl font-extrabold tracking-tight text-gray-900">BazaarBuddy</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Cart Icon for Vendors */}
                {isVendor && (
                  <CartIcon onClick={onCartClick} />
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shadow-inner">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon === 'DashboardIcon' && <DashboardIcon className="w-5 h-5" />}
                  {item.icon === 'ShoppingCartIcon' && <CartIconNav className="w-5 h-5" />}
                  {item.icon === 'SearchIcon' && <SearchIcon className="w-5 h-5" />}
                  {item.icon === 'InventoryIcon' && <InventoryIcon className="w-5 h-5" />}
                  {item.icon === 'ReceiptIcon' && <ReceiptIcon className="w-5 h-5" />}
                  {item.icon === 'User' && <User className="w-5 h-5" />}
                  <span>{item.label}</span>
                </Link>
              ))}
              {/* Cart for Vendors in Mobile */}
              {isVendor && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => {
                      onCartClick();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:text-primary-600"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart ({itemCount} items)</span>
                  </button>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 