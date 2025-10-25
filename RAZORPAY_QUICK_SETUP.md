# Razorpay Quick Setup Guide

## Current Status
**Online Payment is DISABLED** because Razorpay API key is not configured.

## What You Need to Do

### Option 1: Use Only Cash on Delivery (No Setup Required)
If you don't want to accept online payments right now, you can:
- Keep using Cash on Delivery (COD) only
- Online payment option is automatically disabled when Razorpay is not configured
- No action needed - your app works perfectly with COD only

### Option 2: Enable Online Payments (Requires Razorpay Account)

**Step 1: Create Razorpay Account**
1. Visit: https://razorpay.com
2. Click "Sign Up" and complete registration
3. Verify your email and phone number

**Step 2: Get Your API Keys**
1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com
2. Click on "Settings" (gear icon) in the left sidebar
3. Select "API Keys"
4. You'll see two modes:
   - **Test Mode**: For testing (use this first)
   - **Live Mode**: For real payments (requires KYC completion)

5. In **Test Mode**, click "Generate Test Keys"
6. You'll get two keys:
   - **Key ID** (starts with `rzp_test_`) - This is what you need
   - **Key Secret** - Keep this secret, don't share it

**Step 3: Add Key to Your Project**
1. Open your `.env` file
2. Find the line: `VITE_RAZORPAY_KEY_ID=`
3. Replace it with your Test Key ID:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyHere
   ```
4. Save the file
5. Restart your development server

**Step 4: Test the Payment**
After adding the key, you can test online payments using these test credentials:

**Test Credit Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Test UPI:**
- VPA: `success@razorpay`

## Example .env Configuration

```env
# For Testing
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890ABCD

# For Production (after KYC approval)
# VITE_RAZORPAY_KEY_ID=rzp_live_1234567890ABCD
```

## Going Live (Production)

To accept real payments:

1. **Complete KYC Verification**
   - Submit business documents in Razorpay Dashboard
   - Wait for approval (usually 1-2 business days)

2. **Switch to Live Mode**
   - Go to Settings > API Keys
   - Switch to "Live Mode"
   - Generate Live Keys
   - Update your `.env` file with the live key (starts with `rzp_live_`)

3. **Activate Payment Methods**
   - Go to Settings > Configuration > Payment Methods
   - Enable the payment methods you want to accept
   - Set any limits or restrictions

## Transaction Charges

Razorpay charges:
- **2% + GST** per transaction (standard rate)
- Settlements happen in **3-5 business days**
- No setup fee or monthly fee

## Need Help?

- **Razorpay Docs**: https://razorpay.com/docs/
- **Support**: support@razorpay.com
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/

## Current Behavior

- ✅ **COD works perfectly** - No configuration needed
- ⚠️ **Online Payment** - Disabled until you add Razorpay Key
- 🔒 **Secure** - API keys are kept in `.env` file (not committed to git)
