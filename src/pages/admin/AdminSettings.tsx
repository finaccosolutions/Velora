// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface SiteSettingsForm {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { isAdmin } = useAuth();
  const { settings, loading: settingsLoading, error: settingsError, updateSetting } = useSiteSettings();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteSettingsForm>();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!settingsLoading && !settingsError) {
      // Set form default values from fetched settings
      reset({
        siteName: settings.siteName || 'Velora Tradings',
        logoUrl: settings.logoUrl || '',
        primaryColor: settings.primaryColor || '#815536',
        secondaryColor: settings.secondaryColor || '#c9baa8',
        heroTitle: settings.heroTitle || 'Discover Your Signature Scent',
        heroSubtitle: settings.heroSubtitle || 'Experience luxury fragrances that define your personality.',
        contactEmail: settings.contactEmail || 'info@veloratradings.com',
        contactPhone: settings.contactPhone || '+91 73560 62349',
        addressLine1: settings.addressLine1 || 'Perinthalmanna',
        addressLine2: settings.addressLine2 || 'Kerala',
        city: settings.city || 'Perinthalmanna',
        postalCode: settings.postalCode || '679322',
        country: settings.country || 'India',
      });
    }
  }, [settingsLoading, settingsError, settings, reset]);

  const onSubmit = async (data: SiteSettingsForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Update each setting individually
      const updates = Object.keys(data).map(key =>
        updateSetting(key, (data as any)[key])
      );
      
      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        setMessage({ type: 'error', text: 'Failed to save some settings. Check console for details.' });
      } else {
        setMessage({ type: 'success', text: 'All settings saved successfully!' });
      }
    } catch (error: any) {
      console.error('Error saving site settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading site settings...</p>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-admin-card rounded-xl shadow-lg">
          <p className="text-red-500 text-lg">{settingsError}</p>
          <p className="text-admin-text-light mt-2">Please ensure you have admin privileges and the site_settings table is set up correctly.</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-admin-text">Site Settings</h1>
          </div>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-admin-card rounded-xl shadow-lg p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <h2 className="text-2xl font-bold text-admin-text mb-4 flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>General Settings</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Site Name</label>
              <input
                {...register('siteName')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Logo URL</label>
              <input
                {...register('logoUrl')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Theme Colors */}
          <h2 className="text-2xl font-bold text-admin-text mb-4 pt-6 flex items-center space-x-2">
            <Palette className="h-6 w-6" />
            <span>Theme Colors</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Primary Color</label>
              <input
                type="color"
                {...register('primaryColor')}
                className="w-full h-12 border border-admin-border rounded-lg bg-admin-sidebar focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Secondary Color</label>
              <input
                type="color"
                {...register('secondaryColor')}
                className="w-full h-12 border border-admin-border rounded-lg bg-admin-sidebar focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Hero Section Text */}
          <h2 className="text-2xl font-bold text-admin-text mb-4 pt-6 flex items-center space-x-2">
            <ImageIcon className="h-6 w-6" />
            <span>Hero Section Content</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Hero Title</label>
              <input
                {...register('heroTitle')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Hero Subtitle</label>
              <textarea
                {...register('heroSubtitle')}
                rows={3}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Information */}
          <h2 className="text-2xl font-bold text-admin-text mb-4 pt-6 flex items-center space-x-2">
            <Type className="h-6 w-6" />
            <span>Contact Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Contact Email</label>
              <input
                type="email"
                {...register('contactEmail')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Contact Phone</label>
              <input
                {...register('contactPhone')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Address Line 1</label>
              <input
                {...register('addressLine1')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Address Line 2</label>
              <input
                {...register('addressLine2')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">City</label>
              <input
                {...register('city')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Postal Code</label>
              <input
                {...register('postalCode')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-light mb-2">Country</label>
              <input
                {...register('country')}
                className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
          </div>


          <div className="flex justify-end pt-6">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
