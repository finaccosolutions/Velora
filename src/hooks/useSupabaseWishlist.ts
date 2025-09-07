// src/hooks/useSupabaseWishlist.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDocumentVisibility } from './useDocumentVisibility';

interface WishlistItem { // Re-adding for clarity, assuming it's needed for state typing
  id: string; product_id: string; created_at: string; product: { id: string; name: string; price: number; image_url: string; category: string; };
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
      setWishlistItems([]); // Ensure wishlist is empty if no user
      setLoading(false);
      return;
    }

    setLoading(true);
    console.time('fetchWishlistItemsQuery');
    // Add a small delay to allow Supabase session to fully propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      console.log('Debug: Supabase client in fetchWishlistItems:', supabase);
      console.log('fetchWishlistItems: Using supabase to fetch wishlist items...');
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
      console.timeEnd('fetchWishlistItemsQuery');
      console.log('fetchWishlistItems: Supabase query result for wishlist items - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching wishlist items:', error.message);
        setWishlistItems([]); // Clear wishlist on error
      } else {
        setWishlistItems(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist items (caught exception):', error.message);
      setWishlistItems([]); // Clear wishlist on exception
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      console.log('addToWishlist: Using supabase (authenticated) client to check for existing item...'); // NEW LOG
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        return { error: new Error('Product already in wishlist') };
      }
      console.log('addToWishlist: Using supabase (authenticated) client to insert new item...'); // NEW LOG
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      await fetchWishlistItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error adding to wishlist:', error.message);
      return { error };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('removeFromWishlist: Using supabase (authenticated) client to delete item...'); // NEW LOG
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWishlistItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error removing from wishlist:', error.message);
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

