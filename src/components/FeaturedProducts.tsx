import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, ArrowRight } from 'lucide-react';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts: React.FC = () => {
  const { products, loading } = useSupabaseProducts();
  const { addToCart } = useSupabaseCart();
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useSupabaseWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const featuredProducts = products.slice(0, 6);

  const handleAddToCart = async (productId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const result = await addToCart(productId, 1);
    if (!result.error) {
      showToast('Product added to cart!', 'success');
    } else {
      showToast(result.error.error_description || result.error.message, 'error');
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyInWishlist = isInWishlist(productId);

    if (isCurrentlyInWishlist) {
      const result = await removeFromWishlistByProductId(productId);
      if (!result.error) {
        showToast(`${productName} removed from wishlist!`, 'success');
      } else {
        if (result.error.message === 'Please login to add items to wishlist' || result.error.message === 'Please login') {
          showToast('Please login to manage your wishlist', 'error');
        } else {
          showToast(result.error.error_description || result.error.message, 'error');
        }
      }
    } else {
      const result = await addToWishlist(productId);
      if (!result.error) {
        showToast(`${productName} added to wishlist!`, 'success');
      } else {
        if (result.error.message === 'Please login to add items to wishlist' || result.error.message === 'Please login') {
          showToast('Please login to add items to wishlist', 'error');
        } else {
          showToast(result.error.error_description || result.error.message, 'error');
        }
      }
    }
  };

  const handleBuyNow = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowProductId: productId } });
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Fragrances</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium perfumes, each crafted to perfection
            and designed to make you unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <button
                    onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-20"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isInWishlist(product.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {product.original_price && (
                    <div className="absolute top-4 left-4 bg-[#815536] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.reviews_count})</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#815536] transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-[#815536]">₹{product.price.toLocaleString()}</span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                    <span className="bg-[#c9baa8]/20 text-[#815536] px-2 py-1 rounded-full text-xs font-medium">
                      {product.category_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product.id, e);
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white text-sm font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleBuyNow(e, product.id)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 border-2 border-[#815536] text-[#815536] text-sm font-semibold rounded-lg hover:bg-[#815536] hover:text-white transition-all duration-200"
                    >
                      <span>Buy Now</span>
                    </motion.button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 space-x-2"
          >
            <span>View All Products</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
