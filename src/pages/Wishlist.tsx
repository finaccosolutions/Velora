// src/pages/Wishlist.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, HeartCrack, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useToast } from '../context/ToastContext';

const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist, loading } = useSupabaseWishlist();
  const { addToCart } = useSupabaseCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleMoveToCart = async (productId: string, wishlistItemId: string) => {
    const result = await addToCart(productId, 1);
    if (!result.error) {
      await removeFromWishlist(wishlistItemId);
      showToast('Product moved to cart!', 'success');
    } else {
      showToast(result.error.message, 'error');
    }
  };

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    const result = await removeFromWishlist(wishlistItemId);
    if (!result.error) {
      showToast('Product removed from wishlist', 'success');
    } else {
      showToast(result.error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <HeartCrack className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-xl text-gray-600 mb-8">
              Save your favorite fragrances here to easily find them later!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 space-x-2"
            >
              <span>Discover Products</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#815536] mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Wishlist</h1>

          <div className="space-y-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm">{item.product.category_name}</p> {/* MODIFIED: Use category_name */}
                  <p className="font-bold text-[#815536] mt-1">₹{item.product.price}</p>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoveToCart(item.product.id, item.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Move to Cart</span>
                  </motion.button>

                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;

