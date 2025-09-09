// src/pages/admin/AdminReports.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowLeft, TrendingUp, Users, Package, DollarSign, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#7ED321', '#4A4A4A'];

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    } else if (!authLoading && isAdmin) {
      fetchReportData();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Sales Data (Last 30 days)
      const { data: sales, error: salesError } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', format(new Date().setDate(new Date().getDate() - 30), 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (salesError) throw salesError;

      const dailySales = sales.reduce((acc, order) => {
        const date = format(new Date(order.created_at), 'MMM dd');
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {});
      setSalesData(Object.keys(dailySales).map(date => ({ date, sales: dailySales[date] })));

      // Product Performance (Top 10 by quantity sold)
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product:products (name)
        `);
      if (orderItemsError) throw orderItemsError;

      const productSales = orderItems.reduce((acc, item) => {
        const productName = item.product?.name || 'Unknown Product';
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {});
      setProductPerformance(
        Object.keys(productSales)
          .map(name => ({ name, quantity: productSales[name] }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10)
      );

      // User Growth (Users created per month)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('created_at');
      if (usersError) throw usersError;

      const monthlyUserGrowth = users.reduce((acc, user) => {
        const month = format(new Date(user.created_at), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      setUserGrowth(Object.keys(monthlyUserGrowth).map(month => ({ month, count: monthlyUserGrowth[month] })));

      // Order Status Distribution
      const { data: ordersStatus, error: ordersStatusError } = await supabase
        .from('orders')
        .select('status');
      if (ordersStatusError) throw ordersStatusError;

      const statusCounts = ordersStatus.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      setOrderStatusData(Object.keys(statusCounts).map(status => ({ name: status, value: statusCounts[status] })));

    } catch (error: any) {
      console.error('Error fetching report data:', error.message);
      // Optionally set error state to display to user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Generating reports...</p>
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
            <h1 className="text-3xl font-bold text-admin-text">Analytics & Reports</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-admin-card rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-admin-text mb-4 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-admin-primary" />
            <span>Sales Trend (Last 30 Days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS[5]} />
              <XAxis dataKey="date" stroke={COLORS[5]} />
              <YAxis stroke={COLORS[5]} />
              <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E2E8F0' }} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke={COLORS[0]} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Product Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-admin-card rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-admin-text mb-4 flex items-center space-x-2">
            <Package className="h-6 w-6 text-admin-secondary" />
            <span>Top 10 Product Performance</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS[5]} />
              <XAxis type="number" stroke={COLORS[5]} />
              <YAxis type="category" dataKey="name" stroke={COLORS[5]} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E2E8F0' }} />
              <Legend />
              <Bar dataKey="quantity" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-admin-card rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-admin-text mb-4 flex items-center space-x-2">
            <Users className="h-6 w-6 text-admin-warning" />
            <span>User Registration Growth</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS[5]} />
              <XAxis dataKey="month" stroke={COLORS[5]} />
              <YAxis stroke={COLORS[5]} />
              <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E2E8F0' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke={COLORS[2]} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-admin-card rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-admin-text mb-4 flex items-center space-x-2">
            <CalendarDays className="h-6 w-6 text-admin-danger" />
            <span>Order Status Distribution</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E2E8F0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReports;
