// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useToast } from '../context/ToastContext'; // NEW: Import useToast

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useSupabaseProducts();
  const { addToCart } = useSupabaseCart();
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useSupabaseWishlist();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await getProductById(id);
    
    if (error) {
      console.error('Error fetching product:', error);
    } else {
      setProduct(data);
    }
    
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (product) {
      const result = await addToCart(product.id, quantity);
      if (!result.error) {
        showToast('Product added to cart!', 'success'); // NEW: Use global showToast
      } else {
        showToast(result.error.message, 'error'); // NEW: Use global showToast
      }
    }
  };

  // REMOVED: Local showToast function

  const handleWishlistToggle = async () => {
    if (!product) return;
    const isCurrentlyInWishlist = isInWishlist(product.id);

    if (isCurrentlyInWishlist) {
      const result = await removeFromWishlistByProductId(product.id);
      if (!result.error) {
        showToast(`${product.name} removed from wishlist!`, 'success');
      } else {
        showToast(result.error.message, 'error');
      }
    } else {
      const result = await addToWishlist(product.id);
      if (!result.error) {
        showToast(`${product.name} added to wishlist!`, 'success');
      } else {
        showToast(result.error.message, 'error');
      }
    }
  };

  const handleBuyNow = () => {
    if (product) {
      navigate('/checkout', { state: { productId: product.id } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="h-96 lg:h-full bg-gray-300"></div>
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-[#815536] hover:underline"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#815536] mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </motion.button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 lg:h-full object-cover"
              />
              {product.original_price && (
                <div className="absolute top-6 left-6 bg-[#815536] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 lg:p-12"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviews_count} reviews)</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-[#815536]">₹{product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-gray-400 line-through">₹{product.original_price}</span>
                )}
                <span className="bg-[#c9baa8]/20 text-[#815536] px-3 py-1 rounded-full text-sm font-medium">
                  {product.category_name} {/* Display category_name */}
                </span>
              </div>

              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 flex items-center justify-center space-x-2  border-2 border-[#815536]"
                >
                  
                  <span>Add to Cart</span>
                </motion.button>

                {/* NEW: Buy Now Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="flex-1 border-2 border-[#815536] text-[#815536] py-4 px-6 rounded-lg font-semibold hover:bg-[#815536] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Buy Now</span>
                </motion.button>

                <button 
                  onClick={handleWishlistToggle} // NEW: Add wishlist toggle handler
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} /> {/* NEW: Conditional styling */}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-6 w-6 text-[#815536] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Authentic</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="h-6 w-6 text-[#815536] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Free Shipping</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <RotateCcw className="h-6 w-6 text-[#815536] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Easy Returns</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'description', label: 'Description' },
                { key: 'features', label: 'Features' },
                { key: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-[#815536] text-[#815536]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                  {product.ingredients && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Notes:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {product.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="bg-[#c9baa8]/20 text-[#815536] px-3 py-1 rounded-full text-sm"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Features</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[#815536] rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                  <div className="text-center py-8 text-gray-500">
                    <p>Reviews feature coming soon...</p>
                    <p className="text-sm mt-2">Be the first to review this product!</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

