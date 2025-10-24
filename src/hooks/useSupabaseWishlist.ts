// src/hooks/useSupabaseWishlist.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface WishlistItem {
  id: string; product_id: string; created_at: string; product: { id: string; name: string; price: number; image_url: string; category: string; category_name: string; }; // ADD category_name
}

export const useSupabaseWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, userProfile, loading: authLoading } = useAuth();
  const isFetchingRef = useRef(false);

  const fetchWishlistItems = useCallback(async (force = false) => {
    if (!user?.id) {
      console.log('fetchWishlistItems: No user ID available, cannot fetch wishlist items.');
      setWishlistItems([]);
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    if (!force && isFetchingRef.current) {
      console.log('fetchWishlistItems: Fetch already in progress, skipping.');
      return;
    }

    isFetchingRef.current = true;
    if (!initialLoadComplete) {
      setLoading(true);
    }

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
              category,
              categories(name)
            )
          `)
          .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist items:', error.message);
        setWishlistItems([]);
      } else {
        const mappedData = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            category_name: item.product.categories.name
          }
        }));
        setWishlistItems(mappedData || []);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist items (caught exception):', error.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
      isFetchingRef.current = false;
    }
  }, [user?.id, initialLoadComplete]);

  useEffect(() => {
    console.log('useSupabaseWishlist useEffect: authLoading:', authLoading, 'user:', user);

    if (!authLoading) {
      if (user) {
        console.log('useSupabaseWishlist useEffect: User available, triggering fetchWishlistItems.');
        fetchWishlistItems();

        // Subscribe to wishlist changes
        const channel = supabase
          .channel('wishlist_changes_' + user.id)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'wishlist_items',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Wishlist change detected:', payload);
              // Force immediate refetch without delay
              fetchWishlistItems(true);
            }
          )
          .subscribe((status) => {
            console.log('Wishlist subscription status:', status);
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        console.log('useSupabaseWishlist useEffect: No user, clearing wishlist items.');
        setWishlistItems([]);
      }
    }
  }, [user, authLoading, fetchWishlistItems]); // Dependencies for the useEffect

  const addToWishlist = async (productId: string) => {
    console.log(`addToWishlist: Called for product ID: ${productId}`);
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      console.log('addToWishlist: Checking for existing item...');
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        console.log('addToWishlist: Product already in wishlist.');
        return { error: new Error('Product already in wishlist') };
      }

      console.log('addToWishlist: Inserting new item...');

      const { data: newItem, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        })
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

        setWishlistItems((prevItems) => [...prevItems, mappedItem]);
      }

      await fetchWishlistItems(true);

      console.log('addToWishlist: Item inserted successfully.');
      return { error: null };
    } catch (error: any) {
      console.error('Error adding to wishlist:', error.message);
      fetchWishlistItems(true);
      return { error };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    console.log(`removeFromWishlist: Called for wishlist item ID: ${wishlistItemId}`);
    if (!user) return { error: new Error('Please login') };

    try {
      console.log('removeFromWishlist: Removing item...');

      setWishlistItems((prevItems) =>
        prevItems.filter((item) => item.id !== wishlistItemId)
      );

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWishlistItems(true);

      console.log('removeFromWishlist: Item deleted successfully.');
      return { error: null };
    } catch (error: any) {
      console.error('Error removing from wishlist:', error.message);
      fetchWishlistItems(true);
      return { error };
    }
  };

  const getWishlistItemsCount = () => {
    return wishlistItems.length;
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const removeFromWishlistByProductId = async (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.product_id === productId);
    if (wishlistItem) {
      return await removeFromWishlist(wishlistItem.id);
    }
    return { error: new Error('Item not found in wishlist') };
  };

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    getWishlistItemsCount,
    isInWishlist,
    fetchWishlistItems,
  };
};

