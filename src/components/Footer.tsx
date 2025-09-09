// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-[#815536] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white p-2 rounded-lg">
                <span className="text-[#815536] font-bold text-xl">V</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{settings.siteName || 'Velora'}</h3>
                <p className="text-sm text-[#c9baa8] -mt-1">TRADINGS</p>
              </div>
            </div>
            <p className="text-[#c9baa8] mb-4">
              {settings.footerCompanyDescription || 'Discover the essence of luxury with Velora Tradings. We curate the finest fragrances to enhance your personal style and leave a lasting impression.'}
            </p>
            <div className="flex space-x-4">
              <a href={settings.footerSocialFacebook || '#'} className="text-[#c9baa8] hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={settings.footerSocialInstagram || '#'} className="text-[#c9baa8] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={settings.footerSocialTwitter || '#'} className="text-[#c9baa8] hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#c9baa8] hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#c9baa8] hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#c9baa8] hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#c9baa8] hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="text-[#c9baa8] hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-[#c9baa8] hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#c9baa8] hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-[#c9baa8] hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-[#c9baa8]" />
                <span className="text-[#c9baa8]">
                  {settings.contactAddressLine1 || 'Perinthalmanna'}, {settings.contactCity || 'Kerala'}, {settings.contactCountry || 'India'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#c9baa8]" />
                <span className="text-[#c9baa8]">{settings.contactPhone1 || '+91 7356062349'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#c9baa8]" />
                <span className="text-[#c9baa8]">{settings.contactEmail1 || 'info@veloratradings.com'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#c9baa8]/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#c9baa8] text-sm">
              {settings.footerCopyrightText || '© 2025 Velora Tradings. All rights reserved.'}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-[#c9baa8] hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[#c9baa8] hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
