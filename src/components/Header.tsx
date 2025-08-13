import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, Search, LogOut } from 'lucide-react';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { getCartItemsCount } = useSupabaseCart();
  const { getWishlistItemsCount } = useSupabaseWishlist();
  const { user, userProfile, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
    setIsProfileOpen(false);
  };

  const handleSearchClick = () => {
    alert('Search functionality coming soon!');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-[#815536] to-[#c9baa8] p-2 rounded-lg">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#815536]">Velora</h1>
              <p className="text-xs text-[#c9baa8] -mt-1">TRADINGS</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#815536] transition-colors duration-200">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-[#815536] transition-colors duration-200">
              Products
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-[#815536] transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#815536] transition-colors duration-200">
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/products')}
              className="p-2 text-gray-700 hover:text-[#815536] transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </motion.button>
            
            <Link to="/wishlist">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-700 hover:text-[#815536] transition-colors duration-200"
              >
                <Heart className="h-5 w-5" />
                {getWishlistItemsCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {getWishlistItemsCount()}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            <Link to="/cart">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-700 hover:text-[#815536] transition-colors duration-200"
              >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#815536] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {getCartItemsCount()}
                </motion.span>
              )}
              </motion.div>
            </Link>

            {/* User Profile */}
            <div className="relative flex items-center space-x-2">
              {user && userProfile && (
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {userProfile.full_name}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-gray-700 hover:text-[#815536] transition-colors duration-200"
              >
                <User className="h-5 w-5" />
              </motion.button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
                          <p className="text-xs text-gray-500">{userProfile?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Orders
                        </Link>
                        {userProfile?.is_admin && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-[#815536] transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-4 border-t"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-[#815536] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-[#815536] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-[#815536] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-[#815536] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;