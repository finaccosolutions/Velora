// src/hooks/useSupabaseWishlist.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface WishlistItem {
  id: string; product_id: string; created_at: string; product: { id: string; name: string; price: number; image_url: string; category: string; category_name: string; }; // ADD category_name
}

export const useSupabaseWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userProfile, loading: authLoading } = useAuth(); // Keep userProfile here
  const isFetchingRef = useRef(false);

  const fetchWishlistItems = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('fetchWishlistItems: Fetch already in progress, skipping.');
      return;
    }
    if (!user?.id) {
      console.log('fetchWishlistItems: No user ID available, cannot fetch wishlist items.');
      setWishlistItems([]);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true); // Set loading true when the fetch actually starts
    console.time('fetchWishlistItemsQuery');
    try {
      console.log('fetchWishlistItems: Current authLoading state:', authLoading);
      const { data: currentSessionData } = await supabase.auth.getSession();
      console.log('fetchWishlistItems: Supabase client session at query time:', currentSessionData.session);
      console.log('fetchWishlistItems: Supabase client user at query time:', currentSessionData.session?.user);
      console.log('fetchWishlistItems: Supabase client access token at query time (first 5 chars):', currentSessionData.session?.access_token?.substring(0, 5) + '...');
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
              category,
              categories(name)
            )
          `)
          .eq('user_id', user.id); // Use user.id directly

      console.log('fetchWishlistItems: Supabase wishlist query executed.');
      console.timeEnd('fetchWishlistItemsQuery');
      console.log('fetchWishlistItems: Supabase query result for wishlist items - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching wishlist items:', error.message);
        setWishlistItems([]);
      } else {
        // Map the fetched data to include category_name
        const mappedData = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            category_name: item.product.categories.name // Map category name
          }
        }));
        setWishlistItems(mappedData || []);
        console.log('fetchWishlistItems: Wishlist items state updated to:', mappedData); // NEW LOG
      }
    } catch (error: any) {
      console.error('Error fetching wishlist items (caught exception):', error.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false; // Reset ref in finally block
    }
  }, [user?.id]); // Dependency on user.id only

  useEffect(() => {
    console.log('useSupabaseWishlist useEffect: authLoading:', authLoading, 'user:', user);

    if (!authLoading) {
      if (user) {
        console.log('useSupabaseWishlist useEffect: User available, triggering fetchWishlistItems.');
        fetchWishlistItems();
      } else {
        console.log('useSupabaseWishlist useEffect: No user, clearing wishlist items.');
        setWishlistItems([]);
      }
    }
  }, [user, authLoading, fetchWishlistItems]); // Dependencies for the useEffect

  const addToWishlist = async (productId: string) => {
    console.log(`addToWishlist: Called for product ID: ${productId}`); // NEW LOG
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      console.log('addToWishlist: Using supabase (authenticated) client to check for existing item...');
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        console.log('addToWishlist: Product already in wishlist, skipping insert.'); // NEW LOG
        return { error: new Error('Product already in wishlist') };
      }
      console.log('addToWishlist: Using supabase (authenticated) client to insert new item...');
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      console.log('addToWishlist: Item inserted successfully, triggering fetchWishlistItems.'); // NEW LOG
      await fetchWishlistItems();
      return { error: null };
    } catch (error: any) {
      console.error('Error adding to wishlist:', error.message);
      return { error };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    console.log(`removeFromWishlist: Called for wishlist item ID: ${wishlistItemId}`); // NEW LOG
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('removeFromWishlist: Using supabase (authenticated) client to delete item...');
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('removeFromWishlist: Item deleted successfully, triggering fetchWishlistItems.'); // NEW LOG
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

