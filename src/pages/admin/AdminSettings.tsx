// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Type, Image as ImageIcon, Info, Phone, MessageCircle, Home, LayoutDashboard, Mail, Server, Globe, DollarSign, ShieldCheck,
} from 'lucide-react'; // NEW: Import Home and LayoutDashboard for tab icons
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useToast } from '../../context/ToastContext';

interface SiteSettingsForm {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  adminEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  siteLogoUrl: string;
  siteFaviconUrl: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number;
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  // NEW: About Page Content
  aboutHeroTitle: string;
  aboutHeroSubtitle: string;
  aboutStoryParagraph1: string;
  aboutStoryParagraph2: string;
  aboutYearsExperience: string;
  aboutHappyCustomers: string;
  aboutPremiumFragrances: string;
  aboutValueQualityTitle: string;
  aboutValueQualityDescription: string;
  aboutValueCustomerTitle: string;
  aboutValueCustomerDescription: string;
  aboutValueGlobalTitle: string;
  aboutValueGlobalDescription: string;
  aboutValuePassionTitle: string;
  aboutValuePassionDescription: string;
  aboutWhyChoose1: string;
  aboutWhyChoose2: string;
  aboutWhyChoose3: string;
  aboutWhyChoose4: string;
  aboutWhyChoose5: string;
  aboutWhyChoose6: string;
  aboutCtaTitle: string;
  aboutCtaSubtitle: string;
  // NEW: Contact Page Content
  contactHeroSubtitle: string;
  contactAddressLine1: string;
  contactAddressLine2: string;
  contactCity: string;
  contactCountry: string;
  contactPhone1: string;
  contactPhone2: string;
  contactEmail1: string;
  contactEmail2: string;
  contactEmail3: string;
  contactHoursMonFri: string;
  contactHoursSat: string;
  contactHoursSun: string;
  contactHoursHolidays: string;
  contactFormTitle: string;
  contactFormSubtitle: string;
  contactFaqTitle: string;
  contactFaqSubtitle: string;
  contactFaq1Question: string;
  contactFaq1Answer: string;
  contactFaq2Question: string;
  contactFaq2Answer: string;
  contactFaq3Question: string;
  contactFaq3Answer: string;
  contactFaq4Question: string;
  contactFaq4Answer: string;
  contactFaq5Question: string;
  contactFaq5Answer: string;
  // NEW: Footer Content
  footerCompanyDescription: string;
  footerSocialFacebook: string;
  footerSocialInstagram: string;
  footerSocialTwitter: string;
  footerCopyrightText: string;
}

const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // State for active tab

  const { isAdmin } = useAuth();
  const { settings, loading: settingsLoading, error: settingsError, updateSetting } = useSiteSettings();
  const navigate = useNavigate();
  const { showToast } = useToast();

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
        adminEmail: settings.adminEmail || 'shafeeqkpt@gmail.com',
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpSecure: settings.smtpSecure !== undefined ? settings.smtpSecure : true,
        smtpUser: settings.smtpUser || '',
        smtpPassword: settings.smtpPassword || '',
        smtpFromEmail: settings.smtpFromEmail || '',
        smtpFromName: settings.smtpFromName || '',
        siteLogoUrl: settings.siteLogoUrl || '',
        siteFaviconUrl: settings.siteFaviconUrl || '',
        currencySymbol: settings.currencySymbol || '₹',
        currencyCode: settings.currencyCode || 'INR',
        taxRate: settings.taxRate || 0,
        shippingEnabled: settings.shippingEnabled !== undefined ? settings.shippingEnabled : true,
        freeShippingThreshold: settings.freeShippingThreshold || 0,
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        socialFacebook: settings.socialFacebook || '',
        socialTwitter: settings.socialTwitter || '',
        socialInstagram: settings.socialInstagram || '',
        socialLinkedin: settings.socialLinkedin || '',
        metaTitle: settings.metaTitle || '',
        metaDescription: settings.metaDescription || '',
        metaKeywords: settings.metaKeywords || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
        maintenanceMode: settings.maintenanceMode !== undefined ? settings.maintenanceMode : false,
        maintenanceMessage: settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
        // NEW: About Page Content
        aboutHeroTitle: settings.aboutHeroTitle || 'About Velora Tradings',
        aboutHeroSubtitle: settings.aboutHeroSubtitle || 'Crafting memories through exquisite fragrances since 2020.',
        aboutStoryParagraph1: settings.aboutStoryParagraph1 || 'Founded with a passion for luxury and elegance, Velora Tradings began as a dream to bring the world\'s finest fragrances to discerning customers. Our journey started with a simple belief: that fragrance is not just about smelling good, but about expressing your unique personality and creating lasting impressions.',
        aboutStoryParagraph2: settings.aboutStoryParagraph2 || 'Today, we curate an exclusive collection of premium perfumes from renowned houses and emerging artisans alike. Each fragrance in our collection is carefully selected for its quality, uniqueness, and ability to evoke emotions and memories.',
        aboutYearsExperience: settings.aboutYearsExperience || '5+',
        aboutHappyCustomers: settings.aboutHappyCustomers || '10K+',
        aboutPremiumFragrances: settings.aboutPremiumFragrances || '100+',
        aboutValueQualityTitle: settings.aboutValueQualityTitle || 'Quality Excellence',
        aboutValueQualityDescription: settings.aboutValueQualityDescription || 'We source only the finest fragrances from trusted suppliers and renowned perfume houses.',
        aboutValueCustomerTitle: settings.aboutValueCustomerTitle || 'Customer First',
        aboutValueCustomerDescription: settings.aboutValueCustomerDescription || 'Your satisfaction is our priority. We provide personalized service and expert guidance.',
        aboutValueGlobalTitle: settings.aboutValueGlobalTitle || 'Global Reach',
        aboutValueGlobalDescription: settings.aboutValueGlobalDescription || 'Bringing international luxury fragrances to customers across India with reliable delivery.',
        aboutValuePassionTitle: settings.aboutValuePassionTitle || 'Passion Driven',
        aboutValuePassionDescription: settings.aboutValuePassionDescription || 'Our love for fragrances drives us to continuously discover and share exceptional scents.',
        aboutWhyChoose1: settings.aboutWhyChoose1 || 'Authentic products from verified suppliers',
        aboutWhyChoose2: settings.aboutWhyChoose2 || '100% genuine fragrances with quality guarantee',
        aboutWhyChoose3: settings.aboutWhyChoose3 || 'Expert curation and personalized recommendations',
        aboutWhyChoose4: settings.aboutWhyChoose4 || 'Secure packaging and fast delivery',
        aboutWhyChoose5: settings.aboutWhyChoose5 || 'Competitive pricing on luxury fragrances',
        aboutWhyChoose6: settings.aboutWhyChoose6 || '24/7 customer support and after-sales service',
        aboutCtaTitle: settings.aboutCtaTitle || 'Ready to Find Your Signature Scent?',
        aboutCtaSubtitle: settings.aboutCtaSubtitle || 'Explore our curated collection of premium fragrances and discover the perfect scent that defines you.',
        // NEW: Contact Page Content
        contactHeroSubtitle: settings.contactHeroSubtitle || 'Have questions about our fragrances? Need personalized recommendations? We\'re here to help you find your perfect scent.',
        contactAddressLine1: settings.contactAddressLine1 || 'Perinthalmanna',
        contactAddressLine2: settings.contactAddressLine2 || 'Kerala',
        contactCity: settings.contactCity || 'Perinthalmanna',
        contactCountry: settings.contactCountry || 'India',
        contactPhone1: settings.contactPhone1 || '+91 73560 62349',
        contactPhone2: settings.contactPhone2 || '+91 98765 43211',
        contactEmail1: settings.contactEmail1 || 'info@veloratradings.com',
        contactEmail2: settings.contactEmail2 || 'support@veloratradings.com',
        contactEmail3: settings.contactEmail3 || 'orders@veloratradings.com',
        contactHoursMonFri: settings.contactHoursMonFri || 'Monday - Friday: 10AM - 8PM',
        contactHoursSat: settings.contactHoursSat || 'Saturday: 10AM - 8PM',
        contactHoursSun: settings.contactHoursSun || 'Sunday: 11AM - 6PM',
        contactHoursHolidays: settings.contactHoursHolidays || 'Holidays: 12PM - 5PM',
        contactFormTitle: settings.contactFormTitle || 'Send Us a Message',
        contactFormSubtitle: settings.contactFormSubtitle || 'Fill out the form below and we\'ll get back to you as soon as possible.',
        contactFaqTitle: settings.contactFaqTitle || 'Frequently Asked Questions',
        contactFaqSubtitle: settings.contactFaqSubtitle || 'Quick answers to common questions about our products and services.',
        contactFaq1Question: settings.contactFaq1Question || 'Are all your fragrances authentic?',
        contactFaq1Answer: settings.contactFaq1Answer || 'Yes, we guarantee 100% authentic products. All our fragrances are sourced directly from authorized distributors and verified suppliers.',
        contactFaq2Question: settings.contactFaq2Question || 'Do you offer fragrance samples?',
        contactFaq2Answer: settings.contactFaq2Answer || 'Yes, we offer sample sizes for most of our fragrances. This allows you to try before committing to a full-size bottle.',
        contactFaq3Question: settings.contactFaq3Question || 'What is your return policy?',
        contactFaq3Answer: settings.contactFaq3Answer || 'We offer a 30-day return policy for unopened products. If you\'re not satisfied with your purchase, you can return it for a full refund.',
        contactFaq4Question: settings.contactFaq4Question || 'How long does shipping take?',
        contactFaq4Answer: settings.contactFaq4Answer || 'Standard shipping takes 3-5 business days within India. Express shipping is available for 1-2 day delivery in major cities.',
        contactFaq5Question: settings.contactFaq5Question || 'Do you provide fragrance recommendations?',
        contactFaq5Answer: settings.contactFaq5Answer || 'Absolutely! Our fragrance experts are happy to provide personalized recommendations based on your preferences and occasions.',
        // NEW: Footer Content
        footerCompanyDescription: settings.footerCompanyDescription || 'Discover the essence of luxury with Velora Tradings. We curate the finest fragrances to enhance your personal style and leave a lasting impression.',
        footerSocialFacebook: settings.footerSocialFacebook || '#',
        footerSocialInstagram: settings.footerSocialInstagram || '#',
        footerSocialTwitter: settings.footerSocialTwitter || '#',
        footerCopyrightText: settings.footerCopyrightText || '© 2025 Velora Tradings. All rights reserved.',
      });
    }
  }, [settingsLoading, settingsError, settings, reset]);

  const onSubmit = async (data: SiteSettingsForm) => {
    setIsLoading(true);

    try {
      // Update each setting individually
      const updates = Object.keys(data).map(key =>
        updateSetting(key, (data as any)[key])
      );
      
      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        showToast('Failed to save some settings. Check console for details.', 'error');
      } else {
        showToast('All settings saved successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error saving site settings:', error);
      showToast(error.message || 'Failed to save settings.', 'error');
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

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, color: 'text-admin-primary' },
    { id: 'email', label: 'Email & SMTP', icon: Mail, color: 'text-red-500' },
    { id: 'payment', label: 'Payment & Currency', icon: DollarSign, color: 'text-green-500' },
    { id: 'seo', label: 'SEO & Analytics', icon: Globe, color: 'text-blue-500' },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck, color: 'text-orange-500' },
    { id: 'home', label: 'Home Page', icon: Home, color: 'text-admin-success' },
    { id: 'about', label: 'About Page', icon: Info, color: 'text-admin-warning' },
    { id: 'contact', label: 'Contact Page', icon: Phone, color: 'text-admin-secondary' },
    { id: 'footer', label: 'Footer', icon: LayoutDashboard, color: 'text-admin-info' },
  ];

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      {/* Header */}
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-admin-text">Site Settings</h1>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-admin-card rounded-xl shadow-lg p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-admin-border pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-admin-primary text-white shadow-md'
                    : 'bg-admin-sidebar text-admin-text-light hover:bg-admin-border'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6" // Added space-y for spacing between sections
              >
                {/* General Settings Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'general')?.color}`}>
                    <Settings className="h-6 w-6" />
                    <span>General Settings</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Site Name</label>
                      <input
                        {...register('siteName')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Logo URL</label>
                      <input
                        {...register('logoUrl')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Colors Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'general')?.color}`}>
                    <Palette className="h-6 w-6" />
                    <span>Theme Colors</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Primary Color</label>
                      <input
                        type="color"
                        {...register('primaryColor')}
                        className="w-full h-12 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Secondary Color</label>
                      <input
                        type="color"
                        {...register('secondaryColor')}
                        className="w-full h-12 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'email')?.color}`}>
                    <Mail className="h-6 w-6" />
                    <span>Admin Email</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Admin Email Address</label>
                    <input
                      {...register('adminEmail')}
                      type="email"
                      placeholder="admin@example.com"
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                    <p className="text-sm text-admin-text-light mt-2">
                      This email will receive all order notifications from customers.
                    </p>
                  </div>
                </div>

                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'email')?.color}`}>
                    <Server className="h-6 w-6" />
                    <span>SMTP Configuration</span>
                  </h2>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-admin-text text-sm">
                      <strong>Configure your SMTP settings below.</strong> These settings will be used to send order confirmation emails to customers and admins.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Host *</label>
                      <input
                        {...register('smtpHost')}
                        type="text"
                        placeholder="smtp.example.com or smtp2go.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP server hostname</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Port *</label>
                      <input
                        {...register('smtpPort', { valueAsNumber: true })}
                        type="number"
                        placeholder="587"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Usually 587 (TLS) or 465 (SSL)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Username *</label>
                      <input
                        {...register('smtpUser')}
                        type="text"
                        placeholder="your-username"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP username</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Password / API Key *</label>
                      <input
                        {...register('smtpPassword')}
                        type="password"
                        placeholder="your-password-or-api-key"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP password or API key</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">From Email Address *</label>
                      <input
                        {...register('smtpFromEmail')}
                        type="email"
                        placeholder="noreply@yourdomain.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Email address to send from</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">From Name</label>
                      <input
                        {...register('smtpFromName')}
                        type="text"
                        placeholder="Your Store Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Display name for outgoing emails</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('smtpSecure')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Use TLS/SSL (Recommended)</span>
                      </label>
                      <p className="text-xs text-admin-text-light mt-1 ml-7">Enable secure connection to SMTP server</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Recommended SMTP Provider: SMTP2GO</h3>
                    <p className="text-admin-text text-sm mb-2">
                      For reliable email delivery, we recommend using SMTP2GO. It's easy to set up and offers a free tier.
                    </p>
                    <ul className="list-disc list-inside text-admin-text text-sm space-y-1 ml-2">
                      <li>Sign up at smtp2go.com</li>
                      <li>Get your API key from the dashboard</li>
                      <li>Use your API key as the SMTP Password above</li>
                      <li>SMTP Host: api.smtp2go.com (optional, for standard SMTP)</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'payment')?.color}`}>
                    <DollarSign className="h-6 w-6" />
                    <span>Currency Settings</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Currency Symbol</label>
                      <input
                        {...register('currencySymbol')}
                        type="text"
                        placeholder="₹"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Currency Code</label>
                      <input
                        {...register('currencyCode')}
                        type="text"
                        placeholder="INR"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Tax Rate (%)</label>
                      <input
                        {...register('taxRate', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Free Shipping Threshold</label>
                      <input
                        {...register('freeShippingThreshold', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Minimum order value for free shipping (0 = no free shipping)</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('shippingEnabled')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Enable Shipping</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-admin-text">Branding</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Site Logo URL</label>
                      <input
                        {...register('siteLogoUrl')}
                        type="text"
                        placeholder="https://example.com/logo.png"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Site Favicon URL</label>
                      <input
                        {...register('siteFaviconUrl')}
                        type="text"
                        placeholder="https://example.com/favicon.ico"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-admin-text">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Contact Phone</label>
                      <input
                        {...register('contactPhone')}
                        type="text"
                        placeholder="+91 12345 67890"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Contact Address</label>
                      <input
                        {...register('contactAddress')}
                        type="text"
                        placeholder="123 Main St, City, Country"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-admin-text">Social Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Facebook URL</label>
                      <input
                        {...register('socialFacebook')}
                        type="text"
                        placeholder="https://facebook.com/yourpage"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Twitter URL</label>
                      <input
                        {...register('socialTwitter')}
                        type="text"
                        placeholder="https://twitter.com/yourhandle"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Instagram URL</label>
                      <input
                        {...register('socialInstagram')}
                        type="text"
                        placeholder="https://instagram.com/yourhandle"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">LinkedIn URL</label>
                      <input
                        {...register('socialLinkedin')}
                        type="text"
                        placeholder="https://linkedin.com/company/yourcompany"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'seo')?.color}`}>
                    <Globe className="h-6 w-6" />
                    <span>SEO Settings</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Meta Title</label>
                      <input
                        {...register('metaTitle')}
                        type="text"
                        placeholder="Your Site - Best Products Online"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Meta Description</label>
                      <textarea
                        {...register('metaDescription')}
                        rows={3}
                        placeholder="Description of your site for search engines"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Meta Keywords</label>
                      <input
                        {...register('metaKeywords')}
                        type="text"
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Google Analytics ID</label>
                      <input
                        {...register('googleAnalyticsId')}
                        type="text"
                        placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'maintenance' && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'maintenance')?.color}`}>
                    <ShieldCheck className="h-6 w-6" />
                    <span>Maintenance Mode</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('maintenanceMode')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Enable Maintenance Mode</span>
                      </label>
                      <p className="text-xs text-admin-text-light mt-1 ml-7">When enabled, visitors will see a maintenance page</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Maintenance Message</label>
                      <textarea
                        {...register('maintenanceMessage')}
                        rows={3}
                        placeholder="We are currently performing maintenance. Please check back soon."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Home Page Hero Section Content */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'home')?.color}`}>
                    <Home className="h-6 w-6" />
                    <span>Home Page Hero Section Content</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hero Title</label>
                      <input
                        {...register('heroTitle')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hero Subtitle</label>
                      <textarea
                        {...register('heroSubtitle')}
                        rows={3}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* About Hero Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'about')?.color}`}>
                    <Info className="h-6 w-6" />
                    <span>About Hero Section</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">About Hero Title</label>
                    <input
                      {...register('aboutHeroTitle')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">About Hero Subtitle</label>
                    <textarea
                      {...register('aboutHeroSubtitle')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Our Story Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Our Story</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Story Paragraph 1</label>
                    <textarea
                      {...register('aboutStoryParagraph1')}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Story Paragraph 2</label>
                    <textarea
                      {...register('aboutStoryParagraph2')}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Years Experience</label>
                      <input
                        {...register('aboutYearsExperience')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Happy Customers</label>
                      <input
                        {...register('aboutHappyCustomers')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Premium Fragrances</label>
                      <input
                        {...register('aboutPremiumFragrances')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Our Values Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Our Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Quality Value Title</label>
                      <input {...register('aboutValueQualityTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Quality Value Description</label>
                      <textarea {...register('aboutValueQualityDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Customer Value Title</label>
                      <input {...register('aboutValueCustomerTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Customer Value Description</label>
                      <textarea {...register('aboutValueCustomerDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Global Value Title</label>
                      <input {...register('aboutValueGlobalTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Global Value Description</label>
                      <textarea {...register('aboutValueGlobalDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Passion Value Title</label>
                      <input {...register('aboutValuePassionTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Passion Value Description</label>
                      <textarea {...register('aboutValuePassionDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Why Choose Us</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={`aboutWhyChoose${i}`}>
                        <label className="block text-sm font-medium text-admin-text-dark mb-2">{`Why Choose Us Point ${i}`}</label>
                        <input {...register(`aboutWhyChoose${i}` as keyof SiteSettingsForm)} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Call to Action</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">CTA Title</label>
                    <input {...register('aboutCtaTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">CTA Subtitle</label>
                    <textarea {...register('aboutCtaSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Contact Hero Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'contact')?.color}`}>
                    <Phone className="h-6 w-6" />
                    <span>Contact Hero Section</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Contact Hero Subtitle</label>
                    <textarea
                      {...register('contactHeroSubtitle')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Address Line 1</label>
                      <input {...register('contactAddressLine1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Address Line 2</label>
                      <input {...register('contactAddressLine2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">City</label>
                      <input {...register('contactCity')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Country</label>
                      <input {...register('contactCountry')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number 1</label>
                      <input {...register('contactPhone1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number 2</label>
                      <input {...register('contactPhone2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 1</label>
                      <input {...register('contactEmail1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 2</label>
                      <input {...register('contactEmail2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 3</label>
                      <input {...register('contactEmail3')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Business Hours Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Business Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Mon-Fri</label>
                      <input {...register('contactHoursMonFri')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Saturday</label>
                      <input {...register('contactHoursSat')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Sunday</label>
                      <input {...register('contactHoursSun')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Holidays</label>
                      <input {...register('contactHoursHolidays')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Contact Form Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Contact Form Section</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Form Title</label>
                    <input {...register('contactFormTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Form Subtitle</label>
                    <textarea {...register('contactFormSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">FAQ Section</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">FAQ Title</label>
                    <input {...register('contactFaqTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">FAQ Subtitle</label>
                    <textarea {...register('contactFaqSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`contactFaq${i}`} className="mt-4">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">{`FAQ ${i} Question`}</label>
                      <input {...register(`contactFaq${i}Question` as keyof SiteSettingsForm)} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">{`FAQ ${i} Answer`}</label>
                      <textarea {...register(`contactFaq${i}Answer` as keyof SiteSettingsForm)} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'footer' && (
              <motion.div
                key="footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Company Description Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'footer')?.color}`}>
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Company Description</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Company Description</label>
                    <textarea
                      {...register('footerCompanyDescription')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Social Media Links Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Facebook URL</label>
                      <input {...register('footerSocialFacebook')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Instagram URL</label>
                      <input {...register('footerSocialInstagram')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Twitter URL</label>
                      <input {...register('footerSocialTwitter')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Copyright Text Section */}
                <div className="bg-admin-sidebar p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Copyright Text</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Copyright Text</label>
                    <input {...register('footerCopyrightText')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>
              </motion.div>
            )}
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
