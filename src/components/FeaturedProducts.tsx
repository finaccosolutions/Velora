import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';

interface FeaturedProductsProps {
  showAll?: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ showAll = false }) => {
  const { products, loading, error } = useSupabaseProducts();

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-600 font-medium mb-2">Failed to load products</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = showAll ? products : products.slice(0, 4);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {showAll ? 'All' : 'Featured'} <span className="text-[#815536]">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {showAll ? 'Browse our complete collection of premium fragrances' : 'Discover our handpicked selection of premium fragrances'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
