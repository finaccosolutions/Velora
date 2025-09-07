// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
  const { isVisible, user } = useAuth(); // ADDED 'user' here
  const isFetchingRef = useRef(false);

  const fetchProducts = async () => {
    console.log('fetchProducts: Starting fetch...'); 
    
    try {
      // Get current session to check authentication status
      console.log('fetchProducts: Before getSession()'); // New log
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('fetchProducts: After getSession(). Current session exists:', !!sessionData.session); // New log
      
      console.log('fetchProducts: Before products select query.'); // New log
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          image_url,
          category,
          in_stock,
          rating,
          reviews_count,
          features,
          ingredients,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      console.log('fetchProducts: Supabase query result - Data:', data, 'Error:', fetchError);

      if (fetchError) {
        console.error('fetchProducts: Error fetching products:', fetchError);
        setError(fetchError.message);
        setProducts([]);
      } else {
        setProducts(data || []);
        setError(null);
        console.log('fetchProducts: Successfully set products');
      }
    } catch (e: any) {
      console.error('fetchProducts: Caught unexpected exception:', e);
      setError(e.message);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories: Attempting to fetch categories...');
    try {
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
    console.log('useSupabaseProducts useEffect: isVisible:', isVisible, 'user:', user); // Added user to log
    
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
          setLoading(false);
          console.log('useSupabaseProducts: Fetch operations completed');
        }
      }
    };

    if (isVisible) {
      console.log('useSupabaseProducts: Scheduling fetch with debounce');
      timeoutId = setTimeout(executeFetch, 100);
    } else {
      setLoading(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [isVisible, user]); // ADDED 'user' to dependency array

  const getProductById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
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

      // Refetch after creation
      await fetchProducts();
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

      // Refetch after update
      await fetchProducts();
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

      // Refetch after deletion
      await fetchProducts();
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
