// src/hooks/useSupabaseWishlist.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDocumentVisibility } from './useDocumentVisibility'; // New import

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
  const { user } = useAuth();
  const isVisible = useDocumentVisibility(); // New line

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // New useEffect to re-fetch on tab focus
  useEffect(() => {
    if (isVisible && user) {
      console.log('Tab became visible, re-fetching wishlist items...');
      fetchWishlistItems();
    }
  }, [isVisible, user]);

 const fetchWishlistItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
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
// CRITICAL LOG: This line MUST be present and its output provided
console.log('fetchWishlistItems: Supabase query result for wishlist items - Data:', data, 'Error:', error);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      // Check if item already exists in wishlist
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        return { error: new Error('Product already in wishlist') };
      }

      // Insert new item
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      await fetchWishlistItems();
      return { error: null };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
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
    } catch (error) {
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
