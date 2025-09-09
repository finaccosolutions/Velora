// src/pages/admin/AdminProducts.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Filter, ArrowLeft, Save, X,
  Package, DollarSign, Tag, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSupabaseProducts } from '../../hooks/useSupabaseProducts';
import { useSupabaseCategories } from '../../hooks/useSupabaseCategories'; // NEW: Import useSupabaseCategories

interface ProductForm {
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string; // This will now be the category ID (UUID)
  in_stock: boolean;
  features: string;
  ingredients: string;
}

const AdminProducts: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All'); // Renamed to avoid conflict
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const { isAdmin } = useAuth();
  const { products, categories: productFilterCategories, createProduct, updateProduct, deleteProduct, fetchProducts } = useSupabaseProducts();
  const { categories: allCategories, loading: categoriesLoading } = useSupabaseCategories(); // NEW: Fetch all categories for dropdown
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Use product.category_name for filtering display
    const matchesCategory = selectedCategoryFilter === 'All' || product.category_name === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product?: any) => {
    setEditingProduct(product);
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        category: product.category, // Use the category ID for the form
        in_stock: product.in_stock,
        features: product.features?.join(', ') || '',
        ingredients: product.ingredients ? product.ingredients.join(', ') : ''
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        original_price: null,
        image_url: '',
        category: '', // Default empty or first category ID
        in_stock: true,
        features: '',
        ingredients: ''
      });
    }
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setMessage(null);
  };

  const onSubmit = async (data: ProductForm) => {
    setIsLoading(true);
    setMessage(null);

    const productData = {
      ...data,
      features: data.features.split(',').map(f => f.trim()).filter(f => f),
      ingredients: data.ingredients ? data.ingredients.split(',').map(i => i.trim()).filter(i => i) : null,
      original_price: data.original_price || null
    };

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, productData);
      } else {
        result = await createProduct(productData);
      }

      if (result.error) {
        throw result.error;
      }
      setMessage({ type: 'success', text: `Product ${editingProduct ? 'updated' : 'added'} successfully!` });
      closeModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save product.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      setMessage(null);
      const result = await deleteProduct(productId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || 'Failed to delete product.' });
      } else {
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      {/* Header */}
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2 text-admin-text-light hover:text-admin-primary-dark transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-admin-border"></div>
            <h1 className="text-3xl font-bold text-admin-text">Product Management</h1>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-5 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-light h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
        >
          {productFilterCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-admin-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => openModal(product)}
                  className="p-2 bg-admin-sidebar rounded-full shadow-md hover:bg-admin-border transition-colors text-admin-text-light"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-admin-sidebar rounded-full shadow-md hover:bg-admin-danger/20 transition-colors text-admin-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {!product.in_stock && (
                <div className="absolute top-2 left-2 bg-admin-danger text-white px-2 py-1 rounded text-xs font-semibold">
                  Out of Stock
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-admin-text mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-admin-text-light text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-bold text-admin-primary">₹{product.price}</span>
                  {product.original_price && (
                    <span className="text-sm text-admin-text-light line-through ml-2">₹{product.original_price}</span>
                  )}
                </div>
                <span className="text-xs bg-admin-secondary/20 text-admin-secondary px-2 py-1 rounded-full">
                  {product.category_name} {/* Display category name */}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-admin-text-light">
                <span>Rating: {product.rating}/5</span>
                <span>{product.reviews_count} reviews</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-admin-text-light">
          <Package className="h-12 w-12 mx-auto mb-4" />
          <p>No products found</p>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-admin-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-admin-text">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-admin-sidebar rounded-full transition-colors text-admin-text-light"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Product Name *
                      </label>
                      <input
                        {...register('name', { required: 'Product name is required' })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Category *
                      </label>
                      {categoriesLoading ? (
                        <p className="text-admin-text-light">Loading categories...</p>
                      ) : (
                        <select
                          {...register('category', { required: 'Category is required' })}
                          className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Enter product description"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price', {
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('original_price', {
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0.00 (optional)"
                      />
                      {errors.original_price && (
                        <p className="text-red-500 text-sm mt-1">{errors.original_price.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Image URL *
                    </label>
                    <input
                      {...register('image_url', { required: 'Image URL is required' })}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image_url && (
                      <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Features (comma-separated)
                    </label>
                    <input
                      {...register('features')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Long-lasting, Premium bottle, Gift box included"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Ingredients (comma-separated)
                    </label>
                    <input
                      {...register('ingredients')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Bergamot, Rose, Sandalwood"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('in_stock')}
                      className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-admin-border rounded"
                    />
                    <label className="ml-2 block text-sm text-admin-text">
                      In Stock
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-admin-border text-admin-text-light rounded-lg hover:bg-admin-sidebar transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
