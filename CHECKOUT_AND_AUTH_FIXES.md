# Checkout and Authentication Fixes

## Issues Fixed

### 1. Guest Cart and Wishlist Functionality
**Status**: Already Working ✓

The guest cart and wishlist functionality was already properly implemented:
- Guest users can add items to cart and wishlist (stored in localStorage)
- Items persist across page reloads
- When guest users log in, their cart/wishlist automatically migrates to their account

**Files Involved**:
- `src/hooks/useGuestCart.ts` - Manages guest cart with localStorage
- `src/hooks/useGuestWishlist.ts` - Manages guest wishlist with localStorage
- `src/hooks/useCart.ts` - Switches between guest and authenticated cart
- `src/hooks/useWishlist.ts` - Switches between guest and authenticated wishlist

### 2. Buy Now Navigation Issue
**Problem**: When clicking "Buy Now", the app was navigating to cart page instead of checkout page.

**Root Cause**: The Checkout page was checking for `buyNowProduct` instead of `buyNowProductId`, causing the redirect logic to trigger incorrectly.

**Fix Applied**:
- Updated `src/pages/Checkout.tsx` to check for `buyNowProductId` (from location.state) instead of `buyNowProduct` (the resolved product object)
- This ensures the redirect logic doesn't trigger when in "Buy Now" mode
- Removed the unnecessary `addToCart` call from `ProductDetail.tsx` `handleBuyNow` function

**Files Modified**:
- `src/pages/Checkout.tsx` (Lines 86-97, 479-495)
- `src/pages/ProductDetail.tsx` (Line 78-82)

### 3. Page Refresh on Tab Focus
**Problem**: Every time users switched browser tabs or windows and came back, the page would refresh and lose all form data.

**Root Cause**: The `onAuthStateChange` listener was triggering on ALL events (including token refresh) and calling `handleAuth` asynchronously without proper event filtering, causing unnecessary re-renders.

**Fix Applied**:
- Modified `src/hooks/useSupabaseAuth.ts` to only handle specific auth events (`SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`)
- Wrapped the async call in an IIFE (Immediately Invoked Function Expression) to prevent deadlock issues as per Supabase best practices
- This prevents unnecessary re-fetches when the page regains focus or when Supabase refreshes tokens in the background

**Files Modified**:
- `src/hooks/useSupabaseAuth.ts` (Lines 178-204)

## Technical Details

### Auth State Change Pattern
```typescript
// Before (caused page refreshes):
supabase.auth.onAuthStateChange(async (event, session) => {
  await handleAuth(session, event);
})

// After (prevents unnecessary refreshes):
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
    (async () => {
      await handleAuth(session, event);
    })();
  }
})
```

### Buy Now Flow
```
User clicks "Buy Now"
  → Navigate to /checkout with state: { buyNowProductId: product.id }
  → Checkout page receives buyNowProductId from location.state
  → Creates temporary cart item for display
  → Skips redirect logic (because buyNowProductId exists)
  → User completes checkout
  → Order is created with the single product
```

## Testing Recommendations

1. **Guest Cart/Wishlist**:
   - Visit site without logging in
   - Add items to cart and wishlist
   - Verify items persist after page reload
   - Log in and verify items migrate to user account

2. **Buy Now**:
   - Click "Buy Now" from product card or product detail page
   - Verify navigation goes directly to checkout (not cart)
   - Complete purchase and verify order is created

3. **Tab Switching**:
   - Fill out a form (e.g., checkout form)
   - Switch to another tab and back
   - Verify form data remains intact
   - Verify page doesn't refresh/reload

## Build Status
✓ Build successful - All TypeScript compilation passed
