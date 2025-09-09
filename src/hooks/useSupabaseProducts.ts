// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Product as ProductType } from '../types'; // Import Product from types

// Define the structure of a product as returned from Supabase, including category name
interface SupabaseProduct extends Omit<ProductType, 'category' | 'reviews' | 'inStock'> {
  category: string; // This will be the category ID (UUID) from the DB
  category_name: string; // The actual category name from the joined table
  reviews_count: number; // Matches DB column name
  in_stock: boolean; // Matches DB column name
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]); // For filter options
  const [error, setError] = useState<string | null>(null);
  const { isVisible, user, session } = useAuth();
  const isFetchingRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('fetchProducts: Starting fetch...');

    try {
      // Select product fields and join with categories to get the category name
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
          updated_at,
          categories!inner(name) // Join with categories table and select its name
        `)
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Map the data to include category_name directly in the product object
      const mappedProducts: SupabaseProduct[] = data.map((p: any) => ({
        ...p,
        category_name: p.categories.name, // Extract name from nested categories object
        category: p.category, // Keep the category ID
      }));

      setProducts(mappedProducts || []);
      console.log('fetchProducts: Successfully set products state.');

    } catch (e: any) {
      console.error('fetchProducts: Error fetching products:', e.message);
      setError(e.message);
      setProducts([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // No dependencies needed for useCallback as it's a direct fetch

  const fetchCategoriesForFilter = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      const uniqueCategories = [...new Set(data?.map((item: any) => item.name) || [])];
      setCategories(['All', ...uniqueCategories]);
    } catch (error: any) {
      console.error('fetchCategoriesForFilter: Error fetching categories:', error.message);
      setCategories(['All']);
    }
  }, []);

  // Main useEffect for initial fetch
  useEffect(() => {
    console.log('useSupabaseProducts useEffect: isVisible:', isVisible, 'user:', user, 'session:', session);

    let isMounted = true;

    const executeFetch = async () => {
      if (!isMounted || isFetchingRef.current) return;

      isFetchingRef.current = true;
      console.log('useSupabaseProducts: Starting fetch operations...');

      try {
        await fetchProducts();
        await fetchCategoriesForFilter(); // Fetch categories for filter options
      } catch (error) {
        console.error('useSupabaseProducts: Error during fetch operations:', error);
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
          console.log('useSupabaseProducts: Fetch operations completed');
        }
      }
    };

    if (isVisible && !isFetchingRef.current) {
      console.log('useSupabaseProducts: Document visible. Executing fetch.');
      executeFetch();
    }

    return () => {
      isMounted = false;
    };
  }, [isVisible, user, session, fetchProducts, fetchCategoriesForFilter]); // Add fetchProducts and fetchCategoriesForFilter to dependencies

  const getProductById = async (id: string) => {
    try {
      const { data, error } = await Promise.race([
        supabase
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
            updated_at,
            categories!inner(name)
          `)
          .eq('id', id)
          .single(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Product ${id} fetch timed out after 5 seconds`)), 5000)
        )
      ]);

      if (error) throw error;

      // Map the data to include category_name directly in the product object
      const mappedProduct: SupabaseProduct = {
        ...data,
        category_name: data.categories.name,
        category: data.category,
      };

      return { data: mappedProduct, error: null };
    } catch (error: any) {
      console.error('getProductById: Caught unexpected exception:', error.message);
      return { data: null, error };
    }
  };

  // Product type for insert/update operations
  interface ProductInsertUpdate {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    image_url: string;
    category: string; // This is now the category ID (UUID)
    in_stock?: boolean;
    rating?: number;
    reviews_count?: number;
    features?: string[];
    ingredients?: string[] | null;
  }

  const createProduct = async (product: ProductInsertUpdate) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategoriesForFilter();

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductInsertUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategoriesForFilter();

      return { data: null, error };
    } catch (error: any) {
      console.error('Error updating product:', error.message);
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
      await fetchCategoriesForFilter();

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      return { error };
    }
  };

  return {
    products,
    loading,
    error,
    categories, // Categories for filter options
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
