// src/pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useAuth } from '../context/AuthContext';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'cod' | 'online';
}

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useSupabaseCart();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getProductById } = useSupabaseProducts();

  const [isProcessing, setIsProcessing] = useState(false);
  // Initialize to null, and let the useEffect determine if it's a buy-now product
  const [singleProductCheckout, setSingleProductCheckout] = useState<any | null>(null); 
  // This state tracks if we are actively fetching a single product for "Buy Now"
  const [loadingSingleProduct, setLoadingSingleProduct] = useState(true); // Start as true, assuming we might need to fetch

  // Effect to handle "Buy Now" from product page
  useEffect(() => {
    let currentProductId: string | undefined = location.state?.productId;
    if (!currentProductId) {
      // If not from location.state, check sessionStorage
      currentProductId = sessionStorage.getItem('buyNowProductId') || undefined;
    }

    if (currentProductId) {
      setLoadingSingleProduct(true); // Indicate that we are fetching a single product
      const fetchSingleProduct = async () => {
        try {
          const { data, error } = await getProductById(currentProductId!);
          if (data) {
            setSingleProductCheckout(data);
          } else {
            console.error('Failed to fetch product for buy now:', error);
            setSingleProductCheckout(null); // Explicitly set to null if not found or error
          }
        } finally {
          setLoadingSingleProduct(false); // Fetching is complete
          sessionStorage.removeItem('buyNowProductId'); // Clean up sessionStorage
        }
      };
      fetchSingleProduct();
    } else {
      // If no productId, then it's not a single product checkout
      setLoadingSingleProduct(false); 
      setSingleProductCheckout(null); // Confirm it's not a single product checkout
    }
  }, [location.state, getProductById]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      email: userProfile?.email || '',
      firstName: userProfile?.full_name?.split(' ')[0] || '',
      lastName: userProfile?.full_name?.split(' ')[1] || '',
      phone: userProfile?.phone || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      paymentMethod: 'cod'
    }
  });

  const paymentMethod = watch('paymentMethod');

  // Determine items to checkout based on resolved loading states
  let itemsToCheckout = [];
  if (!loadingSingleProduct && singleProductCheckout) {
    // If single product is loaded and exists
    itemsToCheckout = [{ product: singleProductCheckout, quantity: 1 }];
  } else if (!cartLoading && cartItems.length > 0) {
    // If cart is loaded and has items, and it's not a single product checkout
    itemsToCheckout = cartItems;
  }

  const subtotal = singleProductCheckout ? singleProductCheckout.price : getCartTotal();
  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // NEW: useEffect for navigation logic
  useEffect(() => {
    // Only proceed with navigation check if all loading is complete
    // This means both cartLoading and loadingSingleProduct are false
    if (!cartLoading && !loadingSingleProduct) {
      // If there are no items to checkout (neither cart nor single product)
      if (itemsToCheckout.length === 0) { // Simplified condition
        console.log('Redirecting to cart: No items to checkout after all loading is complete.');
        navigate('/cart');
      }
    }
  }, [cartLoading, loadingSingleProduct, itemsToCheckout.length, navigate]);


  // Render loading state if data is still being fetched
  // This condition should catch initial loading states for both cart and single product
  if (cartLoading || loadingSingleProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout details...</p>
          </div>
        </div>
      </div>
    );
  }

  // If we reach here, it means loading is complete and itemsToCheckout is correctly populated.
  // The useEffect above would have already redirected if there were no items.
  // So, if we are here, it means there are items to display for checkout.

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart only if it was a multi-item cart checkout
    if (!singleProductCheckout) { // This check is now more reliable
      clearCart();
    }
    navigate('/order-success', { state: { orderData: data, total } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <User className="h-6 w-6 text-[#815536]" />
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="h-6 w-6 text-[#815536]" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      {...register('address', { required: 'Address is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        {...register('zipCode', { required: 'ZIP code is required' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="h-6 w-6 text-[#815536]" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="cod"
                      {...register('paymentMethod')}
                      className="mr-3 text-[#815536]"
                    />
                    <Truck className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="online"
                      {...register('paymentMethod')}
                      className="mr-3 text-[#815536]"
                    />
                    <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay securely with card or UPI</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {itemsToCheckout.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isProcessing}
                  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Place Order - ₹${total.toLocaleString()}`}
                </motion.button>

                {paymentMethod === 'online' && (
                  <div className="mt-4 p-4 bg-[#c9baa8]/20 rounded-lg">
                    <p className="text-sm text-[#815536] text-center">
                      You will be redirected to payment gateway after placing order
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

