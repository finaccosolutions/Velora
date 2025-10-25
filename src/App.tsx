// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Addresses from './pages/Addresses';
import { supabase } from './lib/supabase'; // Import supabase client
import AdminLayout from './components/admin/AdminLayout';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import { ToastProvider } from './context/ToastContext';


function App() {
  return (
    <Router>
      <ToastProvider> {/* NEW: Wrap with ToastProvider */}
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            {/* Public routes that should not have Header/Footer on admin pages */}
            <Route path="/adminlogin" element={null} /> {/* Admin login page does not need Header/Footer */}
            <Route path="*" element={<Header />} />
          </Routes>
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/adminlogin" element={<AdminLogin />} /> {/* UPDATED PATH */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/order-success" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center bg-white p-12 rounded-lg shadow-md"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </motion.svg>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                      <p className="text-xl text-gray-600 mb-6">
                        Thank you for your order. You will receive a confirmation email shortly.
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          onClick={() => window.location.href = '/'}
                          className="bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
                        >
                          Continue Shopping
                        </button>
                      </motion.div>
                    </motion.div>
                  </div>
                } />
              </Routes>
            </AnimatePresence>
          </main>
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
      </ToastProvider> {/* NEW: Close ToastProvider */}
    </Router>
  );
}

export default App;
