// src/hooks/useSupabaseProducts.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useDocumentVisibility } from './useDocumentVisibility';
import { useAuth } from '../context/AuthContext'; // Import useAuth

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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const isVisible = useDocumentVisibility();
  const { user, loading: authLoading } = useAuth(); // Get user and authLoading from useAuth

  useEffect(() => {
    // Only fetch if auth is not loading
    if (!authLoading) {
      fetchProducts();
      fetchCategories();
    }
  }, [authLoading, user]); // Add user and authLoading as dependencies

  // New useEffect to re-fetch on tab focus
  useEffect(() => {
    if (isVisible && !authLoading) { // Add authLoading check
      console.log('Tab became visible, re-fetching products and categories...');
      fetchProducts();
      fetchCategories();
    }
  }, [isVisible, authLoading]); // Add authLoading to dependencies

  const fetchProducts = async () => {
    setLoading(true);
    console.log('fetchProducts: Attempting to fetch products...');
    console.log('fetchProducts: Current user:', user); // Log current user state
    console.log('fetchProducts: Before Supabase query.');
    try {
      console.log('fetchProducts: Executing supabase.from("products").select("*")...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      console.log('fetchProducts: Supabase products query executed.');
      // CRITICAL LOG: This line MUST be present and its output provided
      console.log('fetchProducts: Supabase query result for products - Data:', data, 'Error:', error);

      if (error) {
        console.error('fetchProducts: Error fetching products:', error);
        console.error('fetchProducts: Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('fetchProducts: Products fetched successfully, data length:', data?.length);
      }
      setProducts(data || []);
    } catch (e: any) {
      console.error('fetchProducts: Caught unexpected exception during fetch:', e);
      console.error('fetchProducts: Unexpected exception details:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      setProducts([]);
    } finally {
      setLoading(false);
      console.log('fetchProducts: Setting loading to false.');
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories: Attempting to fetch categories...');
    try {
      console.log('fetchCategories: Executing supabase.from("products").select("category")...');
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

      await fetchProducts();
      await fetchCategories();

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
