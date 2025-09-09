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
  const { userProfile, signOut, loading: authLoading, isAdmin } = useAuth(); // ADD isAdmin from useAuth
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) { // USE isAdmin here
      navigate('/');
      return;
    }
    if (!authLoading && isAdmin) { // USE isAdmin here
      fetchDashboardData();
    } else if (!authLoading && !userProfile) {
      setLoading(false);
    }
  }, [userProfile, authLoading, isAdmin]); // Add isAdmin to dependencies

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

      // Fetch top products
      console.log('fetchDashboardData: Fetching top products...');
      const { data: topProducts, error: topProductsError } = await supabase
        .from('products')
        .select('name, price, category')
        .order('rating', { ascending: false })
        .limit(5);
      console.log('fetchDashboardData: Top products result:', topProducts, 'Error:', topProductsError);
      if (topProductsError) throw topProductsError;

      // Generate mock sales data for chart (no Supabase call here)
      const salesData = Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'short' }),
        sales: Math.floor(Math.random() * 50000) + 10000
      }));

      // Fetch category distribution
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

  const COLORS = ['#815536', '#c9baa8', '#a67c52', '#6d4429', '#b8a494'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#815536] to-[#c9baa8] p-2 rounded-lg">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Velora Tradings</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#815536] text-white rounded-lg hover:bg-[#6d4429] transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Manage Products</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Site</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
            { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-green-500' },
            { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-yellow-500' },
            { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#815536" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.users?.full_name}</p>
                    <p className="text-sm text-gray-600">{order.users?.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Products</h3>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#815536]">₹{product.price.toLocaleString()}</p>
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
