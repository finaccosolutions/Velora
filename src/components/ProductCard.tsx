import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: any;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useSupabaseCart();
  const { addToWishlist } = useSupabaseWishlist();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await addToCart(product.id, 1);
    if (!result.error) {
      showToast('Product added to cart!');
    } else {
      showToast(result.error.message, 'error');
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await addToWishlist(product.id);
    if (!result.error) {
      showToast(`${product.name} added to wishlist!`);
    } else {
      showToast(result.error.message, 'error');
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
            onClick={handleAddToWishlist}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#c9baa8]"
          >
            <Heart className="h-4 w-4 text-[#815536]" />
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
              {product.category}
            </span>
          </div>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;