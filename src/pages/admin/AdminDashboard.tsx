// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Package, Users, ShoppingCart, DollarSign, TrendingUp,
  Eye, Plus, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns'; // Import format and subDays

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  topProducts: any[];
  salesData: any[];
  categoryData: any[];
}

// Define admin theme colors for charts (adjusted for light theme)
const COLORS = [
  '#007BFF', // Primary Blue
  '#28A745', // Success Green
  '#FFC107', // Warning Yellow
  '#6F42C1', // Secondary Purple
  '#17A2B8', // Info Teal
  '#DC3545', // Danger Red
  '#CED4DA', // Light Gray for grid/axis (admin.text-light equivalent)
];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    salesData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);
  const { userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (!authLoading && isAdmin) {
      fetchDashboardData();
    } else if (!authLoading && !userProfile) {
      setLoading(false);
    }
  }, [userProfile, authLoading, isAdmin, navigate]); // Added navigate to dependencies

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products count
      console.log('fetchDashboardData: Fetching products count...');
      const { count: productsCount, error: productsCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      console.log('fetchDashboardData: Products count result:', productsCount, 'Error:', productsCountError);
      if (productsCountError) throw productsCountError;

      // Fetch users count
      console.log('fetchDashboardData: Fetching users count...');
      const { count: usersCount, error: usersCountError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      console.log('fetchDashboardData: Users count result:', usersCount, 'Error:', usersCountError);
      if (usersCountError) throw usersCountError;

      // Fetch orders count and revenue
      console.log('fetchDashboardData: Fetching orders...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');
      console.log('fetchDashboardData: Orders result:', orders, 'Error:', ordersError);
      if (ordersError) throw ordersError;

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Fetch recent orders with user details
      console.log('fetchDashboardData: Fetching recent orders...');
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          users (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      console.log('fetchDashboardData: Recent orders result:', recentOrders, 'Error:', recentOrdersError);
      if (recentOrdersError) throw recentOrdersError;

      // Fetch top products (already implemented, just ensure it's correct)
      console.log('fetchDashboardData: Fetching top products...');
      const { data: topProducts, error: topProductsError } = await supabase
        .from('products')
        .select('name, price, category, rating, reviews_count') // Added rating and reviews_count for sorting
        .order('rating', { ascending: false }) // Sort by rating
        .limit(5);
      console.log('fetchDashboardData: Top products result:', topProducts, 'Error:', topProductsError);
      if (topProductsError) throw topProductsError;

      // Generate sales data for chart (last 7 days) - REAL DATA
      const sevenDaysAgo = subDays(new Date(), 6);
      const salesDataMap: { [key: string]: number } = {};
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), 6 - i), 'MMM dd');
        salesDataMap[date] = 0;
      }

      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= sevenDaysAgo) {
          const formattedDate = format(orderDate, 'MMM dd');
          salesDataMap[formattedDate] = (salesDataMap[formattedDate] || 0) + order.total_amount;
        }
      });

      const salesData = Object.keys(salesDataMap).map(date => ({
        day: date,
        sales: salesDataMap[date]
      }));

      // Fetch category distribution (already implemented, just ensure it's correct)
      console.log('fetchDashboardData: Fetching product categories for distribution...');
      const { data: productsData, error: productsDataError } = await supabase
        .from('products')
        .select('category, categories(name)'); // Select category ID and join to get category name
      console.log('fetchDashboardData: Product categories result:', productsData, 'Error:', productsDataError);
      if (productsDataError) throw productsDataError;

      const categoryCount = productsData?.reduce((acc: any, product) => {
        const categoryName = product.categories?.name || 'Uncategorized'; // Use joined name
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

      setStats({
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        recentOrders: recentOrders || [],
        topProducts: topProducts || [],
        salesData,
        categoryData
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        topProducts: [],
        salesData: [],
        categoryData: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // The COLORS array is now defined at the top of the file to use admin theme colors.

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-background">
      {/* Header */}
      <header className="bg-admin-card shadow-sm border-b border-admin-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-admin-primary p-2 rounded-lg">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-admin-text">Admin Dashboard</h1>
                <p className="text-sm text-admin-text-light">Velora Tradings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-admin-primary' },
            { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-admin-secondary' },
            { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-admin-warning' },
            { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-admin-success' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-admin-card rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text-light">{stat.title}</p>
                  <p className="text-2xl font-bold text-admin-text">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-admin-text mb-4">Weekly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS[6]} />
                <XAxis dataKey="day" stroke={COLORS[6]} />
                <YAxis stroke={COLORS[6]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#343A40' }} itemStyle={{ color: '#343A40' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke={COLORS[0]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-admin-text mb-4">Product Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#343A40' }} itemStyle={{ color: '#343A40' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-admin-text mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-admin-border rounded-lg">
                  <div>
                    <p className="font-medium text-admin-text">{order.users?.full_name}</p>
                    <p className="text-sm text-admin-text-light">{order.users?.email}</p>
                    <p className="text-xs text-admin-text-light">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-admin-primary">₹{order.total_amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-admin-success/20 text-admin-success' :
                      order.status === 'shipped' ? 'bg-admin-primary/20 text-admin-primary' :
                      order.status === 'confirmed' ? 'bg-admin-warning/20 text-admin-warning' :
                      'bg-admin-text-light/20 text-admin-text-light'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-admin-text mb-4">Top Rated Products</h3>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-admin-border rounded-lg">
                  <div>
                    <p className="font-medium text-admin-text">{product.name}</p>
                    <p className="text-sm text-admin-text-light">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-admin-primary">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
