// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useCallback } from 'react'; // Removed useRef
import { supabase } from '../lib/supabase';
import { useDocumentVisibility } from './useDocumentVisibility';
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
  const isVisible = useDocumentVisibility();
  const { user, loading: authLoading } = useAuth();
  const [isFetching, setIsFetching] = useState(false); // ADD THIS LINE

  // Wrap fetchProducts and fetchCategories in useCallback to prevent unnecessary re-creations
  const fetchProducts = useCallback(async () => {
    if (isFetching) { // ADD THIS CHECK
      console.log('fetchProducts: Fetch already in progress, skipping.');
      return;
    }

    setIsFetching(true); // Set fetching to true
    setLoading(true);
    console.time('fetchProductsQuery');
    try {
      console.log('fetchProducts: Current user (from hook state):', user);
      console.log('fetchProducts: Current authLoading state:', authLoading);
      const { data: currentSessionData } = await supabase.auth.getSession();
      console.log('fetchProducts: Supabase client session at query time:', currentSessionData.session);
      console.log('fetchProducts: Supabase client user at query time:', currentSessionData.session?.user);
      console.log('fetchProducts: Supabase client access token at query time (first 5 chars):', currentSessionData.session?.access_token?.substring(0, 5) + '...');
      console.log('fetchProducts: Using supabase to fetch products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('fetchProducts: Supabase query call completed.');
      console.timeEnd('fetchProductsQuery');
      console.log('fetchProducts: Data received:', data);
      console.log('fetchProducts: Error received:', error);

      if (error) {
        console.error('fetchProducts: Error fetching products:', error);
        console.error('fetchProducts: Error details:', JSON.stringify(error, null, 2));
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (e: any) {
      console.error('fetchProducts: Caught unexpected exception during fetch:', e);
      console.error('fetchProducts: Unexpected exception details:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      setProducts([]);
    } finally {
      setLoading(false);
      setIsFetching(false); // Set fetching to false
      console.log('fetchProducts: Setting loading to false.');
    }
  }, [user, authLoading, isFetching]); // Add isFetching to dependencies

  const fetchCategories = useCallback(async () => {
    // No isFetching check needed here as it's called alongside fetchProducts
    console.log('fetchCategories: Attempting to fetch categories...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');
      console.log('fetchCategories: Supabase query result for categories - Data:', data, 'Error:', error);

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      console.log('fetchCategories: Categories fetched successfully:', uniqueCategories);
      setCategories(['All', ...uniqueCategories]);
    } catch (error: any) {
      console.error('fetchCategories: Error fetching categories:', error);
      console.error('fetchCategories: Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      setCategories(['All']);
    }
  }, []); // No dependencies needed for categories if they are static or fetched once

  // Consolidated useEffect for data fetching
  useEffect(() => {
    console.log('useSupabaseProducts useEffect: authLoading:', authLoading, 'user:', user, 'isVisible:', isVisible);
    if (!authLoading && isVisible) {
      console.log('useSupabaseProducts useEffect: Triggering fetchProducts and fetchCategories.');
      fetchProducts();
      fetchCategories();
    } else if (!authLoading && !user) { // Clear products if user logs out
      setProducts([]);
    } else {
      console.log('useSupabaseProducts useEffect: Skipping fetch. authLoading:', authLoading, 'isVisible:', isVisible);
    }
  }, [authLoading, isVisible, user, fetchProducts, fetchCategories]); // Dependencies for this useEffect

  const getProductById = async (id: string) => {
    try {
      console.log('getProductById: Using supabase to get product by ID...');
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
      console.log('createProduct: Using supabase (authenticated) client to insert product...');
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategories();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      console.log('updateProduct: Using supabase (authenticated) client to update product...');
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategories();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('deleteProduct: Using supabase (authenticated) client to delete product...');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
    categories,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
