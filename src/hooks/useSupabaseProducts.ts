// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useRef } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase'; // Import supabaseUrl and supabaseAnonKey
import { useAuth } from '../context/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  features: string[];
  ingredients: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isVisible, user, session } = useAuth(); // Get session from useAuth
  const isFetchingRef = useRef(false);

  const fetchProducts = async () => {
    console.log('fetchProducts: Starting fetch...');

    // Ensure user and session are available before proceeding
    if (!user || !session) {
      console.log('fetchProducts: No user or session available, skipping fetch.');
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      console.log('fetchProducts: User and session available. Proceeding with raw fetch.');
      const productsEndpoint = `${supabaseUrl}/rest/v1/products?select=*`;
      console.log('fetchProducts: Attempting raw fetch to:', productsEndpoint);
      console.log('fetchProducts: Using access token (first 5 chars):', session.access_token.substring(0, 5) + '...');

      const response = await Promise.race([
        fetch(productsEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Products raw fetch timed out after 5 seconds')), 5000)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('fetchProducts: Raw fetch successful:', data);
      setProducts(data || []);
      setError(null);
      console.log('fetchProducts: Successfully set products state.');

    } catch (e: any) {
      console.error('fetchProducts: Caught unexpected exception during raw product fetch:', e.message);
      setError(e.message);
      setProducts([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false; // Reset ref in finally block
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories: Attempting to fetch categories...');
    try {
      // Ensure user and session are available for this too if RLS is enabled for categories
      if (!user || !session) {
        console.log('fetchCategories: No user or session available, skipping category fetch.');
        setCategories(['All']);
        return;
      }

      // This still uses the Supabase client, which might also hang.
      // If this also hangs, we might need to convert this to raw fetch too.
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('category')
        .order('category');

      console.log('fetchCategories: Supabase query result - Data:', data, 'Error:', fetchError);

      if (fetchError) {
        console.error('fetchCategories: Error:', fetchError);
        throw fetchError;
      }

      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      console.log('fetchCategories: Categories fetched successfully:', uniqueCategories);
      setCategories(['All', ...uniqueCategories]);
    } catch (error: any) {
      console.error('fetchCategories: Error fetching categories:', error);
      setCategories(['All']);
    }
  };

  // Main useEffect for initial fetch
  useEffect(() => {
    console.log('useSupabaseProducts useEffect: isVisible:', isVisible, 'user:', user, 'session:', session);

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const executeFetch = async () => {
      if (!isMounted || isFetchingRef.current) return;

      isFetchingRef.current = true;
      setLoading(true);
      console.log('useSupabaseProducts: Starting fetch operations...');

      try {
        await fetchProducts();
        await fetchCategories();
      } catch (error) {
        console.error('useSupabaseProducts: Error during fetch operations:', error);
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
          setLoading(false); // Ensure loading is set to false
          console.log('useSupabaseProducts: Fetch operations completed');
        }
      }
    };

    // Only trigger fetch if user and session are available and visible
    if (isVisible && user && session) {
      console.log('useSupabaseProducts: User, session, and visibility present. Scheduling fetch with debounce');
      timeoutId = setTimeout(executeFetch, 100);
    } else if (!user || !session) {
      // If no user/session, ensure loading is false and products/categories are cleared/defaulted
      console.log('useSupabaseProducts: No user or session. Clearing products/categories and setting loading to false.');
      setProducts([]);
      setCategories(['All']);
      setLoading(false);
    } else {
      console.log('useSupabaseProducts: Skipping scheduling fetch. isVisible:', isVisible, 'user:', user, 'session:', session);
      setLoading(false); // Ensure loading is false if not fetching
    }


    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [isVisible, user, session]); // ADDED 'session' to dependency array

  // NOTE: getProductById, createProduct, updateProduct, deleteProduct still use the supabase client.
  // If these also exhibit hanging behavior, they would need similar raw fetch implementations.
  const getProductById = async (id: string) => {
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Product ${id} fetch timed out after 5 seconds`)), 5000)
        )
      ]);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('getProductById: Caught unexpected exception:', error.message);
      return { data: null, error };
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // This will now use the raw fetch
      await fetchCategories();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // This will now use the raw fetch
      await fetchCategories();

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts(); // This will now use the raw fetch
      await fetchCategories();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    products,
    loading,
    error,
    categories,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
