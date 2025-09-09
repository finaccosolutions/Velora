// src/components/admin/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Settings, BarChart, LogOut, User, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
];

const AdminLayout: React.FC = () => {
  const { userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile sidebar visibility

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // If not loading and not an admin, redirect to home
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading || !isAdmin) {
    // Show a loading spinner or a simple message while checking auth status
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-admin-background text-admin-text">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-admin-card text-admin-text-light shadow-lg"
      >
        {isSidebarOpen ? <LogOut className="h-6 w-6" /> : <LayoutDashboard className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        // For mobile: animate x position to slide in/out
        initial={{ x: -250 }} // Start off-screen to the left
        animate={{ x: isSidebarOpen ? 0 : -250 }} // Slide in (0) or out (-250)
        transition={{ duration: 0.3 }}
        // Tailwind classes:
        // fixed for mobile, relative for desktop (md:relative)
        // hidden by default on mobile, shown when isSidebarOpen is true (w-64)
        // always visible and full width on desktop (md:w-64 md:opacity-100)
        className={`fixed inset-y-0 left-0 z-40 bg-admin-sidebar shadow-xl overflow-hidden
                    ${isSidebarOpen ? 'w-64' : 'w-0 opacity-0'} 
                    md:relative md:translate-x-0 md:w-64 md:opacity-100`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-admin-primary p-2 rounded-lg">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-admin-primary-dark">Admin</h1>
              <p className="text-sm text-admin-text-light -mt-1">Velora Tradings</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${location.pathname.startsWith(item.href)
                    ? 'bg-admin-primary text-white shadow-md'
                    : 'text-admin-text-light hover:bg-admin-card hover:text-admin-primary-dark'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User and Logout */}
          <div className="mt-auto pt-6 border-t border-admin-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-admin-card p-2 rounded-full">
                <User className="h-5 w-5 text-admin-primary-dark" />
              </div>
              <div>
                <p className="font-semibold text-admin-text-dark">{userProfile?.full_name || 'Admin User'}</p>
                <p className="text-sm text-admin-text-light">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-admin-danger hover:bg-admin-danger/20 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
            <Link
              to="/"
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-admin-text-light hover:bg-admin-card hover:text-admin-primary-dark transition-colors duration-200 mt-2"
            >
              <Eye className="h-5 w-5" />
              <span className="font-medium">View Site</span>
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64"> {/* Add md:ml-64 to push content over on desktop */}
        <main className="flex-1 p-8 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
