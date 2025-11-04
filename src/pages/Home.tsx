// src/pages/Home.tsx
import React, { useEffect } from 'react'; // Remove useEffect if not used elsewhere
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, Shield, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import FeaturedProducts from '../components/FeaturedProducts';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase'; // Import Supabase config
import { useSiteSettings } from '../hooks/useSiteSettings'; // NEW: Import useSiteSettings

const Home: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#815536] via-[#a67c52] to-[#c9baa8] overflow-hidden">
        {settings.hero_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.hero_image_url})` }}
          ></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                {settings.heroTitle || 'Discover Your'}
                <span className="block bg-gradient-to-r from-[#c9baa8] to-white bg-clip-text text-transparent">
                  {settings.heroTitle ? (settings.heroTitle.includes('Signature Scent') ? '' : 'Signature Scent') : 'Signature Scent'}
                </span>
              </h1>
              <p className="text-base sm:text-xl text-[#c9baa8] mb-6 sm:mb-8 leading-relaxed">
                {settings.heroSubtitle || 'Experience luxury fragrances that define your personality. From fresh daily wear to sophisticated evening scents, find your perfect match at Velora Tradings.'}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#815536] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 space-x-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>Shop Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto hidden sm:block"
                >
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#815536] transition-all duration-200"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Luxury Perfume"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-[#c9baa8]/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-[#815536] to-[#c9baa8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay in the Scent
            </h2>
            <p className="text-xl text-[#c9baa8] mb-8">
              Subscribe to get updates on new arrivals, exclusive offers, and fragrance tips.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg sm:rounded-r-none border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#815536] font-semibold rounded-lg sm:rounded-l-none hover:bg-gray-100 transition-colors duration-200"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
