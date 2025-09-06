// src/hooks/useSupabaseCart.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDocumentVisibility } from './useDocumentVisibility';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    in_stock: boolean;
  };
}

export const useSupabaseCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isVisible = useDocumentVisibility();

  useEffect(() => {
    if (!authLoading && user) {
      fetchCartItems();
    } else if (!authLoading && !user) {
      setCartItems([]);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isVisible && user && !authLoading) {
      console.log('Tab became visible, re-fetching cart items...');
      fetchCartItems();
    }
  }, [isVisible, user, authLoading]);

  const fetchCartItems = async () => {
    console.log('fetchCartItems: Current user:', user);
    if (!user) {
      console.log('fetchCartItems: No user, returning.');
      return;
    }

    setLoading(true);
    try {
      console.log('fetchCartItems: About to execute Supabase cart query...');
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
      console.log('fetchCartItems: Supabase query result for cart items - Data:', data, 'Error:', error);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) { // Explicitly type error as any
      console.error('Error fetching cart items:', error.message); // Log error message
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return { error: new Error('Please login to add items to cart') };

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
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
    } catch (error: any) { // Explicitly type error as any
      console.error('Error adding to cart:', error.message); // Log error message
      return { error };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCartItems();
      return { error: null };
    } catch (error: any) { // Explicitly type error as any
      console.error('Error updating quantity:', error.message); // Log error message
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCartItems();
      return { error: null };
    } catch (error: any) { // Explicitly type error as any
      console.error('Error removing from cart:', error.message); // Log error message
      return { error };
    }
  };

  const clearCart = async () => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      return { error: null };
    } catch (error: any) { // Explicitly type error as any
      console.error('Error clearing cart:', error.message); // Log error message
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
