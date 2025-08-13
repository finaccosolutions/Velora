import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, ArrowRight } from 'lucide-react';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';

const FeaturedProducts: React.FC = () => {
  const { products, loading } = useSupabaseProducts();
  const { addToCart } = useSupabaseCart();
  const { addToWishlist } = useSupabaseWishlist();
  
  const featuredProducts = products.slice(0, 4);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId, 1);
    if (!result.error) {
      showToast('Product added to cart!');
    } else {
      showToast(result.error.message, 'error');
    }
  };

  const handleAddToWishlist = async (productId: string, productName: string) => {
    const result = await addToWishlist(productId);
    if (!result.error) {
      showToast(`${productName} added to wishlist!`);
    } else {
      showToast(result.error.message, 'error');
    }
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
          <div className="space-y-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="h-96 bg-gray-300 rounded-2xl"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-8 bg-gray-300 rounded w-32"></div>
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

        <div className="space-y-24">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Product Image */}
              <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl group"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                  >
                    <div className="absolute bottom-4 left-4 right-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex space-x-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddToCart(product.id)}
                          className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddToWishlist(product.id, product.name)}
                          className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-lg hover:bg-white transition-all duration-200"
                        >
                          <Heart className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {product.original_price && (
                    <div className="absolute top-6 left-6 bg-[#815536] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </div>
                  )}
                </motion.div>
                
                {/* Floating decorative elements */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 w-24 h-24 bg-[#c9baa8]/20 rounded-full blur-2xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#815536]/10 rounded-full blur-2xl"
                ></motion.div>
              </div>

              {/* Product Details */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews_count} reviews)</span>
                  <span className="bg-[#c9baa8]/20 text-[#815536] px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h3>

                <p className="text-lg text-gray-700 leading-relaxed">
                  {product.description}
                </p>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-gray-700">
                          <div className="w-2 h-2 bg-[#815536] rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-[#815536]">₹{product.price.toLocaleString()}</span>
                  {product.original_price && (
                    <span className="text-xl text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product.id)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToWishlist(product.id, product.name)}
                    className="flex items-center space-x-2 px-6 py-3 border-2 border-[#815536] text-[#815536] font-semibold rounded-lg hover:bg-[#815536] hover:text-white transition-all duration-200"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                  </motion.button>

                </div>
              </div>
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