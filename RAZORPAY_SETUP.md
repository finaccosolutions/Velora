# Razorpay Integration Setup Guide

## Overview
This e-commerce application integrates Razorpay payment gateway for online payments. Follow the steps below to configure Razorpay for your application.

## Prerequisites
- A Razorpay account (Sign up at https://razorpay.com)
- Access to Razorpay Dashboard

## Setup Instructions

### Step 1: Create Razorpay Account
1. Visit https://razorpay.com and sign up
2. Complete the verification process
3. Log in to your Razorpay Dashboard

### Step 2: Get API Keys
1. Navigate to Settings → API Keys in your Razorpay Dashboard
2. Generate API Keys (you'll get both Key ID and Key Secret)
3. Note: Use Test Mode keys for development, Live Mode keys for production

### Step 3: Configure Environment Variables
Add your Razorpay Key ID to the `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Important:**
- For testing: Use keys starting with `rzp_test_`
- For production: Use keys starting with `rzp_live_`
- Never commit your `.env` file to version control

### Step 4: Test the Integration

#### Test Mode Payments
In test mode, you can use these test card details:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: Any 6 digits (when prompted)

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- This will simulate a payment failure

**UPI Testing:**
- VPA: `success@razorpay`
- This will simulate a successful UPI payment

For more test credentials, visit: https://razorpay.com/docs/payments/payments/test-card-details/

### Step 5: Webhook Setup (Optional but Recommended)

For production, set up webhooks to receive payment notifications:

1. Go to Settings → Webhooks in Razorpay Dashboard
2. Add your webhook URL: `https://yourdomain.com/api/webhook/razorpay`
3. Select events you want to receive (payment.authorized, payment.captured, etc.)
4. Save the webhook secret for verification

## Features Implemented

### Payment Methods Supported
- Credit/Debit Cards (Visa, Mastercard, Amex, Rupay)
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Net Banking
- Wallets (Paytm, PhonePe, Amazon Pay, etc.)

### Payment Flow
1. User selects items and proceeds to checkout
2. User selects delivery address
3. User chooses payment method:
   - **Cash on Delivery**: Order placed immediately
   - **Online Payment**: Razorpay payment gateway opens
4. For online payments:
   - User completes payment on Razorpay
   - Payment verified and order confirmed
   - User redirected to order success page
5. Order details saved in database with payment status

## Order Status Flow

```
pending → (payment completed) → confirmed → shipped → delivered
                ↓ (payment failed)
             cancelled
```

## Security Considerations

1. **Never expose your Key Secret**: Only use Key ID in frontend
2. **Verify payments on backend**: Always verify payment signatures
3. **Use HTTPS**: Ensure your application is served over HTTPS in production
4. **Enable 3D Secure**: Recommended for card payments
5. **Set up webhooks**: For reliable payment notifications

## Troubleshooting

### Payment Gateway Not Opening
- Check if Razorpay script is loaded: Open browser console and check for errors
- Verify your Razorpay Key ID is correct
- Check if browser is blocking popups

### Payment Successful but Order Not Created
- Check browser console for errors
- Verify Supabase connection
- Check order table permissions in Supabase

### Test Payments Not Working
- Ensure you're using test mode keys (starting with `rzp_test_`)
- Use correct test card details
- Check Razorpay Dashboard for payment logs

## Going Live

### Pre-Launch Checklist
- [ ] Complete KYC verification on Razorpay
- [ ] Switch to Live Mode keys in production
- [ ] Set up webhooks for production
- [ ] Test end-to-end payment flow
- [ ] Configure payment methods you want to accept
- [ ] Set up proper error handling
- [ ] Enable payment notifications

### Production Configuration
1. Activate your Razorpay account (complete KYC)
2. Go to Settings → Configuration → Payment Methods
3. Enable the payment methods you want to offer
4. Set minimum/maximum order values if needed
5. Configure auto-capture settings
6. Replace test keys with live keys in `.env`

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Integration Issues: Check Razorpay Dashboard logs

## Important Notes

1. **Transaction Charges**: Razorpay charges a fee per transaction (typically 2% + GST)
2. **Settlement**: Payments are settled to your bank account (T+3 days for most merchants)
3. **Refunds**: Can be initiated from Razorpay Dashboard
4. **Currency**: Currently configured for INR (Indian Rupees)

## Sample Payment Flow Code

The payment integration is implemented in `/src/pages/Checkout.tsx`:

```typescript
const handleRazorpayPayment = async (order: any) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: total * 100, // Amount in paise
    currency: 'INR',
    name: 'Velora Tradings',
    description: 'Purchase from Velora Tradings',
    order_id: order.id,
    handler: async function (response: any) {
      // Payment success handler
    },
    prefill: {
      name: userProfile?.full_name || '',
      email: userProfile?.email || '',
      contact: userProfile?.phone || ''
    },
    theme: {
      color: '#815536'
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

## Contact

For any issues or questions regarding the payment integration, please contact the development team.
