// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext'; // NEW: Import useToast

interface ProductCardProps {
  product: any;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useSupabaseCart();
  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useSupabaseWishlist();
  const { showToast } = useToast(); // NEW: Use useToast hook

  // REMOVED: Local showToast function

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCurrentlyInWishlist = isInWishlist(product.id);
    
    if (isCurrentlyInWishlist) {
      const wishlistItem = wishlistItems.find(item => item.product_id === product.id);
      if (wishlistItem) {
        const result = await removeFromWishlist(wishlistItem.id);
        if (!result.error) {
          showToast(`${product.name} removed from wishlist!`, 'success'); // NEW: Use global showToast
        } else {
          showToast(result.error.message, 'error'); // NEW: Use global showToast
        }
      }
    } else {
      const result = await addToWishlist(product.id);
      if (!result.error) {
        showToast(`${product.name} added to wishlist!`, 'success'); // NEW: Use global showToast
      } else {
        showToast(result.error.message, 'error'); // NEW: Use global showToast
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.original_price && (
            <div className="absolute top-4 left-4 bg-[#815536] text-white px-2 py-1 rounded-lg text-sm font-semibold">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </div>
          )}
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          >
            <Heart 
              className={`h-4 w-4 ${
                isInWishlist(product.id) 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-600'
              }`} 
            />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews_count})</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#815536] transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-[#815536]">₹{product.price}</span>
              {product.original_price && (
                <span className="text-lg text-gray-400 line-through ml-2">₹{product.original_price}</span>
              )}
            </div>
            <span className="text-sm text-[#c9baa8] bg-[#c9baa8]/20 px-3 py-1 rounded-full">
              {product.category_name} {/* Display category_name */}
            </span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="block w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 text-center"
          >
            View Details
          </Link>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
