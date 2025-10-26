import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, MapPin, Plus, CreditCard as Edit2, Trash2, Check, Info, X } from 'lucide-react';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useAuth } from '../context/AuthContext';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useAddresses } from '../hooks/useAddresses';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import AddressForm from '../components/AddressForm';
import { supabase } from '../lib/supabase';
import { calculateGSTBreakdown, getGSTLabel } from '../utils/gstCalculator';

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
  const [billingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const { settings } = useSiteSettings();

  const isRazorpayConfigured = import.meta.env.VITE_RAZORPAY_KEY_ID &&
    import.meta.env.VITE_RAZORPAY_KEY_ID.startsWith('rzp_');

  const buyNowProductId = location.state?.buyNowProductId;
  const buyNowProduct = buyNowProductId ? products.find(p => p.id === buyNowProductId) : null;

  const displayItems = buyNowProduct ? [{
    id: 'buy-now-temp',
    product_id: buyNowProduct.id,
    quantity: 1,
    product: buyNowProduct
  }] : cartItems;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const customerState = selectedAddress?.state || 'Maharashtra';
  const businessState = settings.business_state || 'Maharashtra';

  const subtotal = buyNowProduct ? buyNowProduct.price : getCartTotal();
  const shipping = subtotal > 2000 ? 0 : 100;

  const gstBreakdown = calculateGSTBreakdown(
    displayItems,
    customerState,
    shipping,
    0,
    businessState
  );

  const total = gstBreakdown.total;

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
      const addrId = defaultAddr?.id || addresses[0].id;
      setSelectedAddressId(addrId);
      if (billingSameAsDelivery) {
        setSelectedBillingAddressId(addrId);
      }
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (billingSameAsDelivery) {
      setSelectedBillingAddressId(selectedAddressId);
    }
  }, [billingSameAsDelivery, selectedAddressId]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
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

      const sendEmailRequest = async (data: any) => {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            return { success: true };
          } else {
            const errorData = await response.json();
            return { success: false, error: errorData };
          }
        } catch (error) {
          return { success: false, error };
        }
      };

      const [customerResult, ownerResult] = await Promise.all([
        sendEmailRequest(emailData),
        sendEmailRequest({
          ...emailData,
          sendToAdmin: true,
          subject: `New Order Received - #${order.id.slice(-8)}`
        })
      ]);

      if (customerResult.success) {
        console.log('Customer email sent successfully');
      } else {
        console.warn('Customer email failed (order still created):', customerResult.error);
      }

      if (ownerResult.success) {
        console.log('Owner email sent successfully');
      } else {
        console.warn('Owner email failed (order still created):', ownerResult.error);
      }
    } catch (error) {
      console.warn('Email sending error (order still created):', error);
    }
  };

  const createOrder = async () => {
    try {
      if (!selectedAddress) {
        showToast('Please select a delivery address', 'error');
        return;
      }

      const billingAddress = billingSameAsDelivery
        ? selectedAddress
        : addresses.find(a => a.id === billingAddressId);

      if (!billingSameAsDelivery && !billingAddress) {
        showToast('Please select a billing address', 'error');
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: total,
          subtotal: gstBreakdown.subtotal,
          cgst_amount: gstBreakdown.cgst || 0,
          sgst_amount: gstBreakdown.sgst || 0,
          igst_amount: gstBreakdown.igst || 0,
          shipping_charges: gstBreakdown.shipping,
          discount_amount: gstBreakdown.discount,
          customer_state: customerState,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          shipping_address: selectedAddress,
          billing_address: billingAddress,
          billing_same_as_delivery: billingSameAsDelivery
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = displayItems.map(item => {
        const itemSubtotal = item.product.price * item.quantity;
        const gstPercentage = item.product.gst_percentage || 18;
        const gstAmount = (itemSubtotal * gstPercentage) / 100;

        return {
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          gst_percentage: gstPercentage,
          gst_amount: gstAmount,
          subtotal: itemSubtotal
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      sendOrderEmails(orderData, selectedAddress).catch(err => {
        console.warn('Email sending failed but order was created:', err);
      });

      return orderData;
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast('Failed to create order', 'error');
      return null;
    }
  };

  const handleRazorpayPayment = async (order: any) => {
    if (!isRazorpayConfigured) {
      showToast('Online payment is not configured. Please use Cash on Delivery.', 'error');
      setIsProcessing(false);
      return;
    }

    if (!window.Razorpay) {
      showToast('Payment gateway failed to load. Please try again.', 'error');
      setIsProcessing(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(total * 100),
      currency: 'INR',
      name: settings.business_name || 'Velora Tradings',
      description: `Order #${order.id.slice(-8).toUpperCase()}`,
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

          navigate('/order-confirmation', {
            state: {
              orderId: order.id,
              razorpay_payment_id: response.razorpay_payment_id
            },
            replace: true
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

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        showToast(`Payment failed: ${response.error.description}`, 'error');
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Razorpay initialization error:', error);
      showToast('Failed to initialize payment. Please try again or use COD.', 'error');
      setIsProcessing(false);
    }
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
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        if (updateError) {
          console.error('Error updating order status:', updateError);
          showToast('Order placed but status update failed', 'warning');
        }

        if (!buyNowProduct) {
          await clearCart();
        }

        setIsProcessing(false);

        navigate('/order-confirmation', {
          state: { orderId: order.id },
          replace: true
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

            {/* Billing Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="h-6 w-6 text-[#815536]" />
                <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
              </div>

              <div className="mb-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all border-[#815536] bg-[#815536]/5">
                  <input
                    type="checkbox"
                    checked={billingSameAsDelivery}
                    onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                    className="mr-3 text-[#815536] w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">Billing address same as delivery address</span>
                </label>
              </div>

              {!billingSameAsDelivery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mt-4"
                >
                  {addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 text-sm">No billing addresses available</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedBillingAddressId(address.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingAddressId === address.id
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
                          </div>
                          <div className="flex items-center space-x-2">
                            {billingAddressId === address.id && (
                              <div className="w-6 h-6 bg-[#815536] rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
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
                  className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                    !isRazorpayConfigured
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : paymentMethod === 'online'
                      ? 'border-[#815536] bg-[#815536]/5 cursor-pointer'
                      : 'border-gray-200 hover:border-[#815536]/50 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                    disabled={!isRazorpayConfigured}
                    className="mr-3 text-[#815536] disabled:opacity-50"
                  />
                  <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">
                      {isRazorpayConfigured
                        ? 'UPI, Cards, NetBanking'
                        : 'Not available - Configuration required'}
                    </p>
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
                  <div key={item.product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{gstBreakdown.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{gstBreakdown.shipping === 0 ? 'Free' : `₹${gstBreakdown.shipping}`}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax ({getGSTLabel(customerState, businessState)})</span>
                  <div className="flex items-center space-x-2">
                    <span>₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                    <button
                      onClick={() => setShowTaxBreakdown(true)}
                      className="text-[#815536] hover:text-[#6d4429] transition-colors"
                      title="View tax breakdown"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{Math.round(total).toLocaleString()}</span>
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

      <AnimatePresence>
        {showTaxBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaxBreakdown(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Breakup</h3>
                <button
                  onClick={() => setShowTaxBreakdown(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Items Breakdown</h4>
                  <div className="space-y-3 mb-4">
                    {displayItems.map((item) => {
                      const itemMRP = item.product.original_price || item.product.price;
                      const itemPrice = item.product.price;
                      const itemDiscount = itemMRP - itemPrice;
                      const discountPercent = itemMRP > 0 ? Math.round((itemDiscount / itemMRP) * 100) : 0;

                      return (
                        <div key={item.product.id} className="border-b pb-2 last:border-b-0">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div className="flex justify-between">
                              <span>MRP (₹{itemMRP} × {item.quantity})</span>
                              <span>₹{(itemMRP * item.quantity).toLocaleString()}</span>
                            </div>
                            {itemDiscount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount ({discountPercent}%)</span>
                                <span>-₹{(itemDiscount * item.quantity).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium">
                              <span>Price</span>
                              <span>₹{(itemPrice * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Total (MRP)</span>
                      <span className="font-medium">₹{displayItems.reduce((sum, item) => sum + ((item.product.original_price || item.product.price) * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        {displayItems.reduce((sum, item) => sum + (((item.product.original_price || item.product.price) - item.product.price) * item.quantity), 0) > 0
                          ? `-₹${displayItems.reduce((sum, item) => sum + (((item.product.original_price || item.product.price) - item.product.price) * item.quantity), 0).toLocaleString()}`
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">GST Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    {gstBreakdown.cgst !== undefined && gstBreakdown.sgst !== undefined ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            CGST (Central GST)
                            <span className="block text-xs text-gray-500">Same State Transaction</span>
                          </span>
                          <span className="font-medium">₹{Math.round(gstBreakdown.cgst).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            SGST (State GST)
                            <span className="block text-xs text-gray-500">Same State Transaction</span>
                          </span>
                          <span className="font-medium">₹{Math.round(gstBreakdown.sgst).toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          IGST (Integrated GST)
                          <span className="block text-xs text-gray-500">Interstate Transaction</span>
                        </span>
                        <span className="font-medium">₹{Math.round(gstBreakdown.igst || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Tax</span>
                        <span className="font-semibold">₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Charges</span>
                      <span className="font-medium">
                        {gstBreakdown.shipping === 0 ? 'FREE' : `₹${gstBreakdown.shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#815536]/10 to-[#c9baa8]/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-[#815536]">
                      ₹{Math.round(gstBreakdown.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2">
                  <p>Customer State: {customerState}</p>
                  <p>Business State: {businessState}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
