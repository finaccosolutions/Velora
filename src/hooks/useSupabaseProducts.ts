// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDocumentVisibility } from './useDocumentVisibility';

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
  const isVisible = useDocumentVisibility();
  const isFetchingRef = useRef(false);

  const fetchProducts = async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    console.log('fetchProducts: Starting fetch...');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('fetchProducts: Query completed. Data length:', data?.length, 'Error:', error);

      if (error) {
        console.error('fetchProducts: Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
        console.log('fetchProducts: Successfully set products');
      }
    } catch (e: any) {
      console.error('fetchProducts: Caught unexpected exception:', e);
      setProducts([]);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories: Attempting to fetch categories...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;

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
    console.log('useSupabaseProducts useEffect: isVisible:', isVisible);
    
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
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [isVisible]);

  // Simple refetch function that can be called manually if needed
  const refetch = async () => {
    setLoading(true);
    await fetchProducts();
    await fetchCategories();
    setLoading(false);
  };

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

      await refetch();

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

      await refetch();

      return { data, error: null };
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

      await refetch();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    products,
    loading,
    categories,
    refetch,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}; 