import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Filter, Eye, Edit, Truck, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, User, MapPin, Phone, Mail, Calendar, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  user_id: string | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  tracking_number: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  created_at: string;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string;
    };
  }[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    tracking_number: '',
    estimated_delivery: ''
  });

  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    } else {
      fetchOrders();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            full_name,
            email,
            phone
          ),
          order_items (
            id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const customerName = order.users?.full_name || order.guest_name || '';
        const customerEmail = order.users?.email || order.guest_email || '';
        return order.id.toLowerCase().includes(search) ||
          customerName.toLowerCase().includes(search) ||
          customerEmail.toLowerCase().includes(search);
      });
    }

    setFilteredOrders(filtered);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order.id);
    setEditForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery ? order.estimated_delivery.split('T')[0] : ''
    });
  };

  const handleUpdateOrder = async (orderId: string) => {
    try {
      const updateData: any = {
        status: editForm.status,
        tracking_number: editForm.tracking_number || null,
        estimated_delivery: editForm.estimated_delivery ? new Date(editForm.estimated_delivery).toISOString() : null
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      showToast('Order updated successfully', 'success');
      setEditingOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-admin-success/20 text-admin-success border-admin-success/50';
      case 'shipped':
        return 'bg-admin-info/20 text-admin-info border-admin-info/50';
      case 'confirmed':
        return 'bg-admin-warning/20 text-admin-warning border-admin-warning/50';
      case 'cancelled':
        return 'bg-admin-danger/20 text-admin-danger border-admin-danger/50';
      default:
        return 'bg-admin-text-light/20 text-admin-text-light border-admin-text-light/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-background p-8">
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-admin-text">Orders Management</h1>
        <p className="text-admin-text-light mt-2">Manage and track customer orders</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, color: 'bg-admin-primary', icon: Package },
          { label: 'Confirmed', value: stats.confirmed, color: 'bg-admin-warning', icon: Clock },
          { label: 'Shipped', value: stats.shipped, color: 'bg-admin-info', icon: Truck },
          { label: 'Delivered', value: stats.delivered, color: 'bg-admin-success', icon: CheckCircle }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-light">{stat.label}</p>
                <p className="text-2xl font-bold text-admin-text mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-admin-card rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-admin-text-light" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-background text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-admin-text-light" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-admin-border rounded-lg bg-admin-background text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-admin-card rounded-xl shadow-lg p-12 text-center">
            <Package className="h-16 w-16 text-admin-text-light mx-auto mb-4" />
            <p className="text-xl text-admin-text-light">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-admin-card rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-admin-primary p-3 rounded-lg">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-admin-text">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-admin-text-light">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-3 p-3 bg-admin-sidebar rounded-lg">
                    <User className="h-5 w-5 text-admin-primary" />
                    <div>
                      <p className="text-xs text-admin-text-light">Customer</p>
                      <p className="font-semibold text-admin-text">{order.users?.full_name || order.guest_name || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-admin-sidebar rounded-lg">
                    <DollarSign className="h-5 w-5 text-admin-primary" />
                    <div>
                      <p className="text-xs text-admin-text-light">Amount</p>
                      <p className="font-semibold text-admin-text">₹{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-admin-sidebar rounded-lg">
                    <Calendar className="h-5 w-5 text-admin-primary" />
                    <div>
                      <p className="text-xs text-admin-text-light">Payment</p>
                      <p className="font-semibold text-admin-text">{order.payment_method === 'cod' ? 'COD' : 'Online'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-admin-sidebar rounded-lg">
                    <Package className="h-5 w-5 text-admin-primary" />
                    <div>
                      <p className="text-xs text-admin-text-light">Items</p>
                      <p className="font-semibold text-admin-text">{order.order_items.length}</p>
                    </div>
                  </div>
                </div>

                {editingOrder === order.id ? (
                  <div className="border-t border-admin-border pt-4 mt-4">
                    <h4 className="font-semibold text-admin-text mb-4">Update Order</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Tracking Number</label>
                        <input
                          type="text"
                          value={editForm.tracking_number}
                          onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                          placeholder="Enter tracking number"
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Estimated Delivery</label>
                        <input
                          type="date"
                          value={editForm.estimated_delivery}
                          onChange={(e) => setEditForm({ ...editForm, estimated_delivery: e.target.value })}
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateOrder(order.id)}
                        className="px-4 py-2 bg-admin-success text-white rounded-lg hover:bg-admin-success/80 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-sidebar transition-colors text-admin-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-sidebar transition-colors text-admin-text"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{selectedOrder === order.id ? 'Hide' : 'View'} Details</span>
                      {selectedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/80 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Update</span>
                    </button>
                  </div>
                )}

                {selectedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-admin-border pt-4 mt-4"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Customer Information</span>
                        </h4>
                        <div className="bg-admin-sidebar p-4 rounded-lg space-y-2">
                          <p className="text-admin-text"><strong>Name:</strong> {order.users?.full_name || order.guest_name || 'Guest'}</p>
                          <p className="text-admin-text"><strong>Email:</strong> {order.users?.email || order.guest_email || 'N/A'}</p>
                          <p className="text-admin-text"><strong>Phone:</strong> {order.users?.phone || order.guest_phone || 'N/A'}</p>
                          {!order.users && <p className="text-sm text-admin-warning mt-2">(Guest Order)</p>}
                        </div>

                        <h4 className="font-semibold text-admin-text mb-3 mt-4 flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span>Shipping Address</span>
                        </h4>
                        <div className="bg-admin-sidebar p-4 rounded-lg">
                          <p className="text-admin-text">{order.shipping_address.full_name}</p>
                          <p className="text-admin-text">{order.shipping_address.address_line_1}</p>
                          {order.shipping_address.address_line_2 && (
                            <p className="text-admin-text">{order.shipping_address.address_line_2}</p>
                          )}
                          <p className="text-admin-text">
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                          </p>
                          <p className="text-admin-text">Phone: {order.shipping_address.phone}</p>
                        </div>

                        {order.status === 'cancelled' && order.cancellation_reason && (
                          <>
                            <h4 className="font-semibold text-admin-text mb-3 mt-4 flex items-center space-x-2">
                              <XCircle className="h-5 w-5 text-admin-danger" />
                              <span>Cancellation Reason</span>
                            </h4>
                            <div className="bg-admin-danger/10 border border-admin-danger/30 p-4 rounded-lg">
                              <p className="text-admin-text">{order.cancellation_reason}</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2">
                          <Package className="h-5 w-5" />
                          <span>Order Items</span>
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 p-3 bg-admin-sidebar rounded-lg">
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-admin-text">{item.product.name}</h5>
                                <p className="text-sm text-admin-text-light">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-admin-text">₹{Number(item.price).toLocaleString()}</p>
                                <p className="text-sm text-admin-text-light">per item</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
