import React from 'react'; // Remove useState
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, Shield, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import FeaturedProducts from '../components/FeaturedProducts';
// Remove import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
  // Remove useState for directProducts and handleDirectFetchProducts
  // const [directProducts, setDirectProducts] = useState<any[] | null>(null); 

  // const handleDirectFetchProducts = async () => {
  //   console.log('Attempting direct product fetch...');
  //   try {
  //     // Get the current session to extract the access token
  //     const { data: { session } } = await supabase.auth.getSession();

  //     if (!session) {
  //       console.error('No active session found. Please log in.');
  //       return;
  //     }

  //     const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  //     const productsEndpoint = `${supabaseUrl}/rest/v1/products?select=*`;

  //     console.log('Attempting raw fetch to:', productsEndpoint);
  //     console.log('Using access token (first 5 chars):', session.access_token.substring(0, 5) + '...');

  //     const response = await fetch(productsEndpoint, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, // Your anon key
  //         'Authorization': `Bearer ${session.access_token}`, // The authenticated token
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  //     }

  //     const data = await response.json();
  //     console.log('Raw fetch successful:', data);
  //     setDirectProducts(data);

  //   } catch (e: any) {
  //     console.error('Direct product fetch caught exception:', e.message);
  //   }
  // };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#815536] via-[#a67c52] to-[#c9baa8] overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-[#c9baa8] to-white bg-clip-text text-transparent">
                  Signature Scent
                </span>
              </h1>
              <p className="text-xl text-[#c9baa8] mb-8 leading-relaxed">
                Experience luxury fragrances that define your personality. From fresh daily wear 
                to sophisticated evening scents, find your perfect match at Velora Tradings.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/products"
                    className="inline-flex items-center px-8 py-4 bg-white text-[#815536] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 space-x-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>Shop Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/about"
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#815536] transition-all duration-200"
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

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹2000' },
              { icon: Shield, title: 'Authentic Products', desc: '100% genuine fragrances' },
              { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here to help' },
              { icon: Star, title: 'Premium Quality', desc: 'Luxury at its finest' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#815536] to-[#c9baa8] rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Temporary Direct Fetch Button */}
      {/* Remove this section */}
      {/* <section className="py-8 bg-gray-100 text-center">
        <button
          onClick={handleDirectFetchProducts}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Fetch Products Directly (Debug)
        </button>
        {directProducts && (
          <div className="mt-4 text-gray-800">
            <p>Directly fetched {directProducts.length} products.</p>
          </div>
        )}
      </section> */}

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
            <div className="flex flex-col sm:flex-row max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-l-lg sm:rounded-r-none rounded-r-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#815536] font-semibold rounded-r-lg sm:rounded-l-none rounded-l-lg hover:bg-gray-100 transition-colors duration-200"
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
