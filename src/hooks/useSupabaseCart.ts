// src/hooks/useSupabaseCart.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface CartItem {
  id: string; product_id: string; quantity: number; product: { id: string; name: string; price: number; image_url: string; category: string; category_name: string; in_stock: boolean; }; // ADD category_name
}

export const useSupabaseCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, userProfile, loading: authLoading } = useAuth();
  const isFetchingRef = useRef(false);

  const fetchCartItems = useCallback(async (force = false) => {
    if (!user?.id) {
      console.log('fetchCartItems: No user ID available, cannot fetch cart items.');
      setCartItems([]);
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    if (!force && isFetchingRef.current) {
      console.log('fetchCartItems: Fetch already in progress, skipping.');
      return;
    }

    isFetchingRef.current = true;
    if (!initialLoadComplete) {
      setLoading(true);
    }

    try {
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
              in_stock,
              categories(name)
            )
          `)
          .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error.message);
        setCartItems([]);
      } else {
        const mappedData = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            category_name: item.product.categories.name
          }
        }));
        setCartItems(mappedData || []);
      }
    } catch (error: any) {
      console.error('Error fetching cart items (caught exception):', error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
      isFetchingRef.current = false;
    }
  }, [user?.id, initialLoadComplete]);

  useEffect(() => {
    console.log('useSupabaseCart useEffect: authLoading:', authLoading, 'user:', user);

    if (!authLoading) {
      if (user) {
        console.log('useSupabaseCart useEffect: User available, triggering fetchCartItems.');
        fetchCartItems();

        // Subscribe to cart changes
        const channel = supabase
          .channel('cart_changes_' + user.id)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Cart change detected:', payload);
              // Force immediate refetch without delay
              fetchCartItems(true);
            }
          )
          .subscribe((status) => {
            console.log('Cart subscription status:', status);
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        console.log('useSupabaseCart useEffect: No user, clearing cart items.');
        setCartItems([]);
      }
    }
  }, [user, authLoading, fetchCartItems]); // Dependencies for the useEffect

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
        console.log('addToCart: Updating existing item quantity...');

        const newQuantity = existingItem.quantity + quantity;

        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;

        await fetchCartItems(true);
      } else {
        console.log('addToCart: Inserting new item...');

        const { data: newItem, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity,
          })
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
              in_stock,
              categories(name)
            )
          `)
          .single();

        if (error) throw error;

        if (newItem) {
          const mappedItem = {
            ...newItem,
            product: {
              ...newItem.product,
              category_name: newItem.product.categories.name
            }
          };

          setCartItems((prevItems) => [...prevItems, mappedItem]);
        }

        await fetchCartItems(true);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      fetchCartItems(true);
      return { error };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }
      console.log('updateQuantity: Updating item quantity...');

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Force refetch to ensure count is updated
      await fetchCartItems(true);

      return { error: null };
    } catch (error: any) {
      console.error('Error updating quantity:', error.message);
      // Revert on error
      fetchCartItems(true);
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('removeFromCart: Removing item...');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Force refetch to ensure count is updated
      await fetchCartItems(true);

      return { error: null };
    } catch (error: any) {
      console.error('Error removing from cart:', error.message);
      // Revert on error
      fetchCartItems(true);
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

