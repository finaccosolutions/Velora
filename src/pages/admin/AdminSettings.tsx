// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Type, Image as ImageIcon, Info, Phone, MessageCircle, Home, LayoutDashboard, Mail, Server, Globe, DollarSign, ShieldCheck, Building2, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useToast } from '../../context/ToastContext';
import { camelToSnake, mapDbToForm } from '../../utils/settingsMapper';
import { INDIAN_STATES } from '../../data/indianStates';

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
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercentage: number;
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
  // Supplier/Business Details for GST and Invoicing
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPincode: string;
  businessPhone: string;
  businessEmail: string;
  gstNumber: string;
  invoiceTerms: string;
  invoiceFooter: string;
  deliveryCharge: number;
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
      // Map database snake_case to form camelCase using the mapper
      const formData = mapDbToForm(settings);
      // Set form default values from mapped settings with fallbacks
      reset({
        siteName: formData.siteName || 'Velora Tradings',
        logoUrl: formData.logoUrl || '',
        primaryColor: formData.primaryColor || '#815536',
        secondaryColor: formData.secondaryColor || '#c9baa8',
        heroTitle: formData.heroTitle || 'Discover Your Signature Scent',
        heroSubtitle: formData.heroSubtitle || 'Experience luxury fragrances that define your personality.',
        adminEmail: formData.adminEmail || 'shafeeqkpt@gmail.com',
        smtpHost: formData.smtpHost || '',
        smtpPort: formData.smtpPort || 587,
        smtpSecure: formData.smtpSecure !== undefined ? formData.smtpSecure : true,
        smtpUser: formData.smtpUser || '',
        smtpPassword: formData.smtpPassword || '',
        smtpFromEmail: formData.smtpFromEmail || '',
        smtpFromName: formData.smtpFromName || '',
        siteLogoUrl: formData.siteLogoUrl || '',
        siteFaviconUrl: formData.siteFaviconUrl || '',
        currencySymbol: formData.currencySymbol || '₹',
        currencyCode: formData.currencyCode || 'INR',
        shippingEnabled: formData.shippingEnabled !== undefined ? formData.shippingEnabled : true,
        freeShippingThreshold: formData.freeShippingThreshold || 0,
        bulkDiscountThreshold: formData.bulkDiscountThreshold || 0,
        bulkDiscountPercentage: formData.bulkDiscountPercentage || 0,
        contactPhone: formData.contactPhone || '',
        contactAddress: formData.contactAddress || '',
        socialFacebook: formData.socialFacebook || '',
        socialTwitter: formData.socialTwitter || '',
        socialInstagram: formData.socialInstagram || '',
        socialLinkedin: formData.socialLinkedin || '',
        metaTitle: formData.metaTitle || '',
        metaDescription: formData.metaDescription || '',
        metaKeywords: formData.metaKeywords || '',
        googleAnalyticsId: formData.googleAnalyticsId || '',
        maintenanceMode: formData.maintenanceMode !== undefined ? formData.maintenanceMode : false,
        maintenanceMessage: formData.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
        aboutHeroTitle: formData.aboutHeroTitle || 'About Velora Tradings',
        aboutHeroSubtitle: formData.aboutHeroSubtitle || 'Crafting memories through exquisite fragrances since 2020.',
        aboutStoryParagraph1: formData.aboutStoryParagraph1 || 'Founded with a passion for luxury and elegance...',
        aboutStoryParagraph2: formData.aboutStoryParagraph2 || 'Today, we curate an exclusive collection...',
        aboutYearsExperience: formData.aboutYearsExperience || '5+',
        aboutHappyCustomers: formData.aboutHappyCustomers || '10K+',
        aboutPremiumFragrances: formData.aboutPremiumFragrances || '100+',
        aboutValueQualityTitle: formData.aboutValueQualityTitle || 'Quality Excellence',
        aboutValueQualityDescription: formData.aboutValueQualityDescription || 'We source only the finest fragrances...',
        aboutValueCustomerTitle: formData.aboutValueCustomerTitle || 'Customer First',
        aboutValueCustomerDescription: formData.aboutValueCustomerDescription || 'Your satisfaction is our priority...',
        aboutValueGlobalTitle: formData.aboutValueGlobalTitle || 'Global Reach',
        aboutValueGlobalDescription: formData.aboutValueGlobalDescription || 'Bringing international luxury fragrances...',
        aboutValuePassionTitle: formData.aboutValuePassionTitle || 'Passion Driven',
        aboutValuePassionDescription: formData.aboutValuePassionDescription || 'Our love for fragrances drives us...',
        aboutWhyChoose1: formData.aboutWhyChoose1 || 'Authentic products from verified suppliers',
        aboutWhyChoose2: formData.aboutWhyChoose2 || '100% genuine fragrances with quality guarantee',
        aboutWhyChoose3: formData.aboutWhyChoose3 || 'Expert curation and personalized recommendations',
        aboutWhyChoose4: formData.aboutWhyChoose4 || 'Secure packaging and fast delivery',
        aboutWhyChoose5: formData.aboutWhyChoose5 || 'Competitive pricing on luxury fragrances',
        aboutWhyChoose6: formData.aboutWhyChoose6 || '24/7 customer support and after-sales service',
        aboutCtaTitle: formData.aboutCtaTitle || 'Ready to Find Your Signature Scent?',
        aboutCtaSubtitle: formData.aboutCtaSubtitle || 'Explore our curated collection of premium fragrances...',
        contactHeroSubtitle: formData.contactHeroSubtitle || 'Have questions about our fragrances?...',
        contactAddressLine1: formData.contactAddressLine1 || 'Perinthalmanna',
        contactAddressLine2: formData.contactAddressLine2 || 'Kerala',
        contactCity: formData.contactCity || 'Perinthalmanna',
        contactCountry: formData.contactCountry || 'India',
        contactPhone1: formData.contactPhone1 || '+91 73560 62349',
        contactPhone2: formData.contactPhone2 || '+91 98765 43211',
        contactEmail1: formData.contactEmail1 || 'info@veloratradings.com',
        contactEmail2: formData.contactEmail2 || 'support@veloratradings.com',
        contactEmail3: formData.contactEmail3 || 'orders@veloratradings.com',
        contactHoursMonFri: formData.contactHoursMonFri || 'Monday - Friday: 10AM - 8PM',
        contactHoursSat: formData.contactHoursSat || 'Saturday: 10AM - 8PM',
        contactHoursSun: formData.contactHoursSun || 'Sunday: 11AM - 6PM',
        contactHoursHolidays: formData.contactHoursHolidays || 'Holidays: 12PM - 5PM',
        contactFormTitle: formData.contactFormTitle || 'Send Us a Message',
        contactFormSubtitle: formData.contactFormSubtitle || 'Fill out the form below...',
        contactFaqTitle: formData.contactFaqTitle || 'Frequently Asked Questions',
        contactFaqSubtitle: formData.contactFaqSubtitle || 'Quick answers to common questions...',
        contactFaq1Question: formData.contactFaq1Question || 'Are all your fragrances authentic?',
        contactFaq1Answer: formData.contactFaq1Answer || 'Yes, we guarantee 100% authentic products...',
        contactFaq2Question: formData.contactFaq2Question || 'Do you offer fragrance samples?',
        contactFaq2Answer: formData.contactFaq2Answer || 'Yes, we offer sample sizes for most of our fragrances...',
        contactFaq3Question: formData.contactFaq3Question || 'What is your return policy?',
        contactFaq3Answer: formData.contactFaq3Answer || 'We offer a 30-day return policy...',
        contactFaq4Question: formData.contactFaq4Question || 'How long does shipping take?',
        contactFaq4Answer: formData.contactFaq4Answer || 'Standard shipping takes 3-5 business days...',
        contactFaq5Question: formData.contactFaq5Question || 'Do you provide fragrance recommendations?',
        contactFaq5Answer: formData.contactFaq5Answer || 'Absolutely! Our fragrance experts are happy to provide...',
        footerCompanyDescription: formData.footerCompanyDescription || 'Discover the essence of luxury with Velora Tradings...',
        footerSocialFacebook: formData.footerSocialFacebook || '#',
        footerSocialInstagram: formData.footerSocialInstagram || '#',
        footerSocialTwitter: formData.footerSocialTwitter || '#',
        footerCopyrightText: formData.footerCopyrightText || '© 2025 Velora Tradings. All rights reserved.',
        businessName: formData.businessName || 'Velora Tradings',
        businessAddress: formData.businessAddress || '',
        businessCity: formData.businessCity || '',
        businessState: formData.businessState || '',
        businessPincode: formData.businessPincode || '',
        businessPhone: formData.businessPhone || '',
        businessEmail: formData.businessEmail || '',
        gstNumber: formData.gstNumber || '',
        invoiceTerms: formData.invoiceTerms || 'All sales are final. Returns accepted within 7 days.',
        invoiceFooter: formData.invoiceFooter || 'This is a computer generated invoice.',
        deliveryCharge: formData.deliveryCharge || 0,
      });
    }
  }, [settingsLoading, settingsError, settings, reset]);

  const onSubmit = async (data: SiteSettingsForm) => {
    setIsLoading(true);

    try {
      // Convert camelCase form data to snake_case for database
      const updates = Object.keys(data).map(key => {
        const dbKey = camelToSnake(key);
        return updateSetting(dbKey, (data as any)[key]);
      });

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        showToast('Some settings failed to save. Please try again.', 'error');
      } else {
        showToast('Settings saved successfully!', 'success');
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
    { id: 'business', label: 'Business/GST', icon: Building2, color: 'text-indigo-500' },
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
    <div className="min-h-screen bg-admin-background text-admin-text p-4 md:p-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-admin-primary to-admin-primary-dark shadow-xl rounded-2xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Site Settings</h1>
            <p className="text-white/80 text-sm mt-1">Configure your store settings and preferences</p>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-admin-card rounded-2xl shadow-xl overflow-hidden"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-admin-sidebar px-4 py-3 border-b border-admin-border">
            <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
                  ${activeTab === tab.id
                    ? 'bg-admin-primary text-white shadow-lg scale-105'
                    : 'bg-admin-card text-admin-text-light hover:bg-admin-border hover:text-admin-text'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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

            {activeTab === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Business Details Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'business')?.color}`}>
                    <Building2 className="h-6 w-6" />
                    <span>Business/Supplier Details</span>
                  </h2>
                  <p className="text-sm text-admin-text-light mb-6">
                    These details will appear on invoices and are used for GST calculations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Name *</label>
                      <input
                        {...register('businessName')}
                        type="text"
                        placeholder="Your Business Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">This will appear on invoices</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Address *</label>
                      <input
                        {...register('businessAddress')}
                        type="text"
                        placeholder="Street Address, Building Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">City *</label>
                      <input
                        {...register('businessCity')}
                        type="text"
                        placeholder="City"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">State *</label>
                      <select
                        {...register('businessState')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-admin-text-light mt-1">Used to determine intrastate/interstate GST</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">PIN Code *</label>
                      <input
                        {...register('businessPincode')}
                        type="text"
                        placeholder="6-digit PIN"
                        maxLength={6}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number *</label>
                      <input
                        {...register('businessPhone')}
                        type="text"
                        placeholder="+91 12345 67890"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Email *</label>
                      <input
                        {...register('businessEmail')}
                        type="email"
                        placeholder="business@example.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">GST Number (GSTIN) *</label>
                      <input
                        {...register('gstNumber')}
                        type="text"
                        placeholder="e.g., 27AAPFU0939F1ZV"
                        maxLength={15}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent uppercase"
                      />
                      <p className="text-xs text-admin-text-light mt-1">15-character GST Identification Number</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Settings Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'business')?.color}`}>
                    <FileText className="h-6 w-6" />
                    <span>Invoice Settings</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Invoice Terms & Conditions</label>
                      <textarea
                        {...register('invoiceTerms')}
                        rows={4}
                        placeholder="Enter terms and conditions that will appear on invoices..."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">e.g., return policy, warranty information, payment terms</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Invoice Footer Text</label>
                      <input
                        {...register('invoiceFooter')}
                        type="text"
                        placeholder="This is a computer generated invoice."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Text that appears at the bottom of invoices</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-admin-text mb-2">Important Note</h3>
                  <p className="text-admin-text text-sm">
                    All fields marked with * are required for proper GST invoicing. Your business state is used to determine whether GST should be split into CGST+SGST (intrastate) or IGST (interstate).
                  </p>
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Free Shipping Threshold</label>
                      <input
                        {...register('freeShippingThreshold', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Minimum order value for free shipping (0 = no free shipping)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Delivery Charge (₹)</label>
                      <input
                        {...register('deliveryCharge', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Flat delivery charge for all orders (0 = free delivery, overridden by free shipping threshold)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Bulk Discount Threshold (₹)</label>
                      <input
                        {...register('bulkDiscountThreshold', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Minimum order value for bulk discount (0 = no bulk discount)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Bulk Discount Percentage (%)</label>
                      <input
                        {...register('bulkDiscountPercentage', { valueAsNumber: true })}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Discount percentage to apply when order value exceeds threshold</p>
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

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
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
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Copyright Text</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Copyright Text</label>
                    <input {...register('footerCopyrightText')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="sticky bottom-0 bg-admin-card border-t border-admin-border px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-admin-text-light">Save your changes to update the site configuration</p>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-admin-primary to-admin-primary-dark text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>{isLoading ? 'Saving Changes...' : 'Save All Settings'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
