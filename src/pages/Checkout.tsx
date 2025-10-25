import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useAuth } from '../context/AuthContext';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useAddresses } from '../hooks/useAddresses';
import { useToast } from '../context/ToastContext';
import AddressForm from '../components/AddressForm';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useSupabaseCart();
  const { user, userProfile } = useAuth();
  const { products } = useSupabaseProducts();
  const { addresses, addAddress, updateAddress, deleteAddress, loading: addressLoading } = useAddresses();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  const buyNowProductId = location.state?.buyNowProductId;
  const buyNowProduct = buyNowProductId ? products.find(p => p.id === buyNowProductId) : null;

  const displayItems = buyNowProduct ? [{
    id: 'buy-now-temp',
    product_id: buyNowProduct.id,
    quantity: 1,
    product: buyNowProduct
  }] : cartItems;

  const subtotal = buyNowProduct ? buyNowProduct.price : getCartTotal();
  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // Only redirect if we're NOT in buy now mode and cart is empty after loading
  useEffect(() => {
    // Skip redirect logic if in buy now mode
    if (buyNowProduct) {
      return;
    }

    // Only redirect if cart is loaded and empty
    if (!cartLoading && cartItems.length === 0) {
      console.log('Cart is empty, redirecting to cart page');
      navigate('/cart', { replace: true });
    }
  }, [buyNowProduct, cartLoading, cartItems.length, navigate]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddressSubmit = async (data: any) => {
    setIsSubmittingAddress(true);
    try {
      if (editingAddress) {
        const result = await updateAddress(editingAddress.id, data);
        if (!result.error) {
          showToast('Address updated successfully', 'success');
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          showToast('Failed to update address', 'error');
        }
      } else {
        const result = await addAddress(data);
        if (!result.error) {
          showToast('Address added successfully', 'success');
          setShowAddressForm(false);
          if (result.data) {
            setSelectedAddressId(result.data.id);
          }
        } else {
          showToast('Failed to add address', 'error');
        }
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const result = await deleteAddress(addressId);
    if (!result.error) {
      showToast('Address deleted successfully', 'success');
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    } else {
      showToast('Failed to delete address', 'error');
    }
  };

  const sendOrderEmails = async (order: any, selectedAddress: any) => {
    try {
      const orderItems = displayItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const emailData = {
        to: userProfile?.email || user?.email || '',
        subject: `Order Confirmation - #${order.id.slice(-8)}`,
        orderData: {
          orderId: order.id,
          customerName: userProfile?.full_name || 'Customer',
          orderItems,
          totalAmount: total,
          shippingAddress: selectedAddress,
          paymentMethod: paymentMethod,
          orderDate: order.created_at || new Date().toISOString()
        }
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`;

      const customerEmailPromise = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const ownerEmailPromise = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          to: 'orders@veloratradings.com',
          subject: `New Order Received - #${order.id.slice(-8)}`
        })
      });

      const [customerResult, ownerResult] = await Promise.allSettled([
        customerEmailPromise,
        ownerEmailPromise
      ]);

      if (customerResult.status === 'fulfilled') {
        console.log('Customer email sent successfully');
      } else {
        console.error('Failed to send customer email:', customerResult.reason);
      }

      if (ownerResult.status === 'fulfilled') {
        console.log('Owner email sent successfully');
      } else {
        console.error('Failed to send owner email:', ownerResult.reason);
      }
    } catch (error) {
      console.error('Error sending order emails:', error);
    }
  };

  const createOrder = async () => {
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) {
        showToast('Please select a delivery address', 'error');
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: total,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          shipping_address: selectedAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = displayItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await sendOrderEmails(orderData, selectedAddress);

      return orderData;
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast('Failed to create order', 'error');
      return null;
    }
  };

  const handleRazorpayPayment = async (order: any) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
      amount: total * 100,
      currency: 'INR',
      name: 'Velora Tradings',
      description: 'Purchase from Velora Tradings',
      order_id: order.id,
      handler: async function (response: any) {
        try {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed'
            })
            .eq('id', order.id);

          if (!buyNowProduct) {
            await clearCart();
          }

          navigate('/order-success', {
            state: {
              orderId: order.id,
              razorpay_payment_id: response.razorpay_payment_id
            }
          });
        } catch (error) {
          showToast('Payment verification failed', 'error');
        }
      },
      prefill: {
        name: userProfile?.full_name || '',
        email: userProfile?.email || '',
        contact: userProfile?.phone || ''
      },
      theme: {
        color: '#815536'
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          showToast('Payment cancelled', 'error');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder();
      if (!order) {
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === 'online') {
        await handleRazorpayPayment(order);
      } else {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        if (!buyNowProduct) {
          await clearCart();
        }

        navigate('/order-success', {
          state: { orderId: order.id }
        });
      }
    } catch (error) {
      showToast('Failed to place order', 'error');
      setIsProcessing(false);
    }
  };

  // Check if user is logged in first
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">Please login to continue with checkout</p>
            <button
              onClick={() => navigate('/login', { state: { from: '/checkout' } })}
              className="bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state only when NOT in buy now mode and cart is still loading
  if (!buyNowProduct && cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // If NOT in buy now mode and cart is empty, show message (will redirect)
  if (!buyNowProduct && cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-[#815536]" />
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#815536] text-white rounded-lg hover:bg-[#6d4429] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New</span>
                </motion.button>
              </div>

              {addressLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#815536] mx-auto"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-[#815536] font-semibold hover:underline"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-[#815536] bg-[#815536]/5'
                          : 'border-gray-200 hover:border-[#815536]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">{address.title}</span>
                            {address.is_default && (
                              <span className="px-2 py-1 bg-[#815536] text-white text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 font-medium">{address.full_name}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedAddressId === address.id && (
                            <div className="w-6 h-6 bg-[#815536] rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              setShowAddressForm(true);
                            }}
                            className="p-2 text-gray-600 hover:text-[#815536] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-[#815536]" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#815536] bg-[#815536]/5'
                      : 'border-gray-200 hover:border-[#815536]/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="mr-3 text-[#815536]"
                  />
                  <Truck className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-[#815536] bg-[#815536]/5'
                      : 'border-gray-200 hover:border-[#815536]/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                    className="mr-3 text-[#815536]"
                  />
                  <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">UPI, Cards, NetBanking</p>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
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
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddressId || addresses.length === 0}
                whileHover={{ scale: !isProcessing && selectedAddressId ? 1.02 : 1 }}
                whileTap={{ scale: !isProcessing && selectedAddressId ? 0.98 : 1 }}
                className="w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? 'Processing...'
                  : paymentMethod === 'online'
                  ? `Pay ₹${total.toLocaleString()}`
                  : `Place Order - ₹${total.toLocaleString()}`}
              </motion.button>

              {!selectedAddressId && addresses.length > 0 && (
                <p className="text-red-500 text-sm text-center mt-3">
                  Please select a delivery address
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <AddressForm
            address={editingAddress}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            isSubmitting={isSubmittingAddress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
