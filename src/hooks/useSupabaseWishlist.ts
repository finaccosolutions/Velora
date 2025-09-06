// src/hooks/useSupabaseWishlist.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDocumentVisibility } from './useDocumentVisibility';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
}

export const useSupabaseWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isVisible = useDocumentVisibility();

  useEffect(() => {
    if (!authLoading && user) {
      fetchWishlistItems();
    } else if (!authLoading && !user) {
      setWishlistItems([]);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isVisible && user && !authLoading) {
      console.log('Tab became visible, re-fetching wishlist items...');
      fetchWishlistItems();
    }
  }, [isVisible, user, authLoading]);

  const fetchWishlistItems = async () => {
    console.log('fetchWishlistItems: Current user:', user);
    if (!user) {
      console.log('fetchWishlistItems: No user, returning.');
      return;
    }

    setLoading(true);
    try {
      console.log('fetchWishlistItems: About to execute Supabase wishlist query...');
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          product:products (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id);
      console.log('fetchWishlistItems: Supabase wishlist query executed.');
      console.log('fetchWishlistItems: Supabase query result for wishlist items - Data:', data, 'Error:', error);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error: any) { // Explicitly type error as any
      console.error('Error fetching wishlist items:', error.message); // Log error message
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        return { error: new Error('Product already in wishlist') };
      }

      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      await fetchWishlistItems();
      return { error: null };
    } catch (error: any) { // Explicitly type error as any
      console.error('Error adding to wishlist:', error.message); // Log error message
      return { error };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWishlistItems();
      return { error: null };
    } catch (error: any) { // Explicitly type error as any
      console.error('Error removing from wishlist:', error.message); // Log error message
      return { error };
    }
  };

  const getWishlistItemsCount = () => {
    return wishlistItems.length;
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    getWishlistItemsCount,
    isInWishlist,
    fetchWishlistItems,
  };
};
