// src/hooks/useSupabaseCart.ts
import { useState, useEffect } from 'react'; // Removed useRef
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDocumentVisibility } from './useDocumentVisibility';

interface CartItem {
  id: string; product_id: string; quantity: number; product: { id: string; name: string; price: number; image_url: string; category: string; in_stock: boolean; };
}

export const useSupabaseCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isVisible = useDocumentVisibility();
  const [isFetching, setIsFetching] = useState(false); // ADD THIS LINE

  useEffect(() => {
    if (!authLoading && isVisible) {
      fetchCartItems();
    } else if (!authLoading && !user) {
      setCartItems([]);
    }
  }, [user, authLoading, isVisible]);

  const fetchCartItems = async () => {
    if (isFetching) { // ADD THIS CHECK
      console.log('fetchCartItems: Fetch already in progress, skipping.');
      return;
    }

    if (!user) {
      console.log('fetchCartItems: No user, returning.');
      setCartItems([]);
      setLoading(false);
      return;
    }

    setIsFetching(true); // Set fetching to true
    setLoading(true);
    console.time('fetchCartItemsQuery');
    try {
      console.log('fetchCartItems: Current authLoading state:', authLoading);
      const { data: currentSessionData } = await supabase.auth.getSession();
      console.log('fetchCartItems: Supabase client session at query time:', currentSessionData.session);
      console.log('fetchCartItems: Supabase client user at query time:', currentSessionData.session?.user);
      console.log('fetchCartItems: Supabase client access token at query time (first 5 chars):', currentSessionData.session?.access_token?.substring(0, 5) + '...');
      console.log('Debug: Supabase client in fetchCartItems:', supabase);
      console.log('fetchCartItems: Using supabase to fetch cart items...');
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            product_id,
            quantity,
            product:products (
              id,
              name,
              price,
              image_url,
              category,
              in_stock
            )
          `)
          .eq('user_id', user.id);

      console.log('fetchCartItems: Supabase cart query executed.');
      console.timeEnd('fetchCartItemsQuery');
      console.log('fetchCartItems: Supabase query result for cart items - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching cart items:', error.message);
        setCartItems([]);
      } else {
        setCartItems(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching cart items (caught exception):', error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
      setIsFetching(false); // Set fetching to false
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return { error: new Error('Please login to add items to cart') };

    try {
      console.log('addToCart: Using supabase (authenticated) client to check for existing item...');
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        console.log('addToCart: Using supabase (authenticated) client to update existing item quantity...');
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        console.log('addToCart: Using supabase (authenticated) client to insert new item...');
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;
      }

      await fetchCartItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      return { error };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }
      console.log('updateQuantity: Using supabase (authenticated) client to update item quantity...');
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCartItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating quantity:', error.message);
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('removeFromCart: Using supabase (authenticated) client to delete item...');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCartItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error removing from cart:', error.message);
      return { error };
    }
  };

  const clearCart = async () => {
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('clearCart: Using supabase (authenticated) client to delete all items...');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      return { error: null };
    } catch (error: any) {
      console.error('Error clearing cart:', error.message);
      return { error };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCartItems,
  };
};
