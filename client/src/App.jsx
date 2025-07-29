import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './components/Cart';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Vendor Pages
import VendorDashboard from './pages/Vendor/Dashboard';
import VendorSuppliers from './pages/Vendor/Suppliers';
import VendorProducts from './pages/Vendor/Products';
import VendorOrders from './pages/Vendor/Orders';
import VendorProfile from './pages/Vendor/Profile';
import Checkout from './pages/Vendor/Checkout';

// Supplier Pages
import SupplierDashboard from './pages/Supplier/Dashboard';
import SupplierProducts from './pages/Supplier/Products';
import SupplierOrders from './pages/Supplier/Orders';
import SupplierProfile from './pages/Supplier/Profile';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/suppliers"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorSuppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/products"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* Supplier Routes */}
            <Route
              path="/supplier/dashboard"
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/products"
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/orders"
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/profile"
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>
      
      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App; 