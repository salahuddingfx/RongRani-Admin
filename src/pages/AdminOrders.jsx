import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle, XCircle, Clock, Truck, Download, Edit, DollarSign, MessageSquare, Copy, ClipboardCheck, LayoutDashboard, Volume2, VolumeX, ListChecks, Square, CheckSquare, Gift, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';
import CourierDetailsModal from '../components/CourierDetailsModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierOrder, setCourierOrder] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    district: '',
    subDistrict: '',
    union: '',
    postalCode: '',
    notes: '',
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    isShippingPaid: false,
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  const [courierForm, setCourierForm] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    alternatePhone: '',
    addressLine: '',
    union: '',
    subDistrict: '',
    district: '',
    division: '',
    city: '',
    postalCode: '',
    itemDescription: '',
    weightKg: '',
    deliveryType: 'home',
    parcelValue: '',
    codAmount: '',
    invoice: '',
    note: '',
  });
  const { socket } = useSocket() || {};

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchOrders();
      if (soundEnabled) {
        notificationSound.play().catch(e => console.log('Sound error:', e));
      }
    };

    socket.on('order:new', handleRefresh);
    socket.on('order:updated', handleRefresh);
    socket.on('order:deleted', handleRefresh);
    socket.on('order:sent-to-courier', handleRefresh);

    return () => {
      socket.off('order:new', handleRefresh);
      socket.off('order:updated', handleRefresh);
      socket.off('order:deleted', handleRefresh);
      socket.off('order:sent-to-courier', handleRefresh);
    };
  }, [socket, fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    setOrders(prev => prev.map(order =>
      order._id === orderId ? { ...order, orderStatus: newStatus } : order
    ));

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/orders/${orderId}`, {
        orderStatus: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (_) {
      setOrders(previousOrders);
      toast.error('Failed to update order status');
    }
  };

  const sendToCourier = async (orderId, details) => {
    const loadingToast = toast.loading('Sending to courier...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/admin/orders/${orderId}/send-to-courier`,
        { courierDetails: details },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || 'Order sent to courier successfully!', {
        id: loadingToast,
        duration: 5000,
      });

      if (response.data.courierInfo?.trackingCode) {
        toast.success(
          `Tracking Code: ${response.data.courierInfo.trackingCode}`,
          { duration: 8000 }
        );
      }

      fetchOrders();
    } catch (error) {
      const data = error.response?.data;
      const missing = data?.details?.missingFields?.join(', ');
      const extra = data?.details?.recipientPhone ? `phone: ${data.details.recipientPhone}` : '';
      const message = missing
        ? `${data?.message || 'Missing required shipping info'}: ${missing}`
        : `${data?.message || 'Failed to send to courier'}${extra ? ` (${extra})` : ''}`;
      toast.error(message, { id: loadingToast });
      console.error('Courier error:', data);
    }
  };

  const openCourierModal = (order) => {
    const shipping = order.shippingAddress || {};
    const contact = order.user || order.guestInfo || {};
    const itemDescription = order.items
      .map((item) => `${item.product?.name || item.name || 'Item'} x${item.quantity}`)
      .join(', ');

    setCourierOrder(order);
    setCourierForm({
      recipientName: shipping.name || contact.name || '',
      recipientPhone: shipping.phone || contact.phone || '',
      recipientEmail: shipping.email || contact.email || '',
      alternatePhone: '',
      addressLine: shipping.street || '',
      union: shipping.union || '',
      subDistrict: shipping.subDistrict || '',
      district: shipping.district || '',
      division: shipping.division || '',
      city: shipping.city || '',
      postalCode: shipping.postalCode || shipping.zipCode || '',
      itemDescription,
      weightKg: '',
      deliveryType: 'home',
      parcelValue: '',
      codAmount: order.paymentMethod === 'cod' ? order.total : 0,
      invoice: `CHG-${order._id}`,
      note: order.notes || '',
    });
    setCourierModalOpen(true);
  };

  const handleCourierChange = (e) => {
    const { name, value } = e.target;
    setCourierForm((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending').length,
      processing: orders.filter(o => o.orderStatus === 'processing').length,
      shipped: orders.filter(o => o.orderStatus === 'shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    };
  };

  const stats = getOrderStats();

  const handleCourierSubmit = (e) => {
    e.preventDefault();
    if (!courierOrder) return;
    setCourierModalOpen(false);
    sendToCourier(courierOrder._id, courierForm);
  };

  const updateBulkStatus = async (newStatus) => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Update ${selectedOrders.length} orders to ${newStatus}?`)) return;

    const loadingToast = toast.loading(`Updating ${selectedOrders.length} orders...`);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedOrders.map(id =>
        axios.put(`/api/admin/orders/${id}`, { orderStatus: newStatus }, { headers: { Authorization: `Bearer ${token}` } })
      ));
      toast.success('Orders updated successfully', { id: loadingToast });
      setSelectedOrders([]);
      fetchOrders();
    } catch (_) {
      toast.error('Bulk update failed', { id: loadingToast });
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openEditModal = (order) => {
    const shipping = order.shippingAddress || {};
    const contact = order.user || order.guestInfo || {};

    setEditingOrder(order);
    setEditForm({
      name: shipping.name || contact.name || '',
      email: shipping.email || contact.email || '',
      phone: shipping.phone || contact.phone || '',
      street: shipping.street || '',
      city: shipping.city || '',
      district: shipping.district || '',
      subDistrict: shipping.subDistrict || '',
      union: shipping.union || '',
      postalCode: shipping.postalCode || shipping.zipCode || '',
      notes: order.notes || '',
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      isShippingPaid: order.delivery?.isShippingPaid || false,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

    setEditForm((prev) => {
      const newState = { ...prev, [name]: val };

      if (['subtotal', 'shipping', 'discount', 'isShippingPaid'].includes(name)) {
        const currentShipping = newState.isShippingPaid ? 0 : newState.shipping;
        newState.total = newState.subtotal + currentShipping - newState.discount;
      }

      return newState;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    const loadingToast = toast.loading('Updating order...');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/orders/${editingOrder._id}`, {
        notes: editForm.notes,
        subtotal: editForm.subtotal,
        shipping: editForm.shipping,
        discount: editForm.discount,
        total: editForm.total,
        isShippingPaid: editForm.isShippingPaid,
        shippingAddress: {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          street: editForm.street,
          city: editForm.city,
          district: editForm.district,
          subDistrict: editForm.subDistrict,
          union: editForm.union,
          postalCode: editForm.postalCode,
        },
        guestInfo: editingOrder.isGuest ? {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        } : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Order updated successfully', { id: loadingToast });
      setEditModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order', { id: loadingToast });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Eye className="h-4 w-4" />;
      case 'shipped': return <ShoppingBag className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'returned': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getFraudBadge = (risk, reasons) => {
    if (!risk || risk === 'Low') return null;

    let color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (risk === 'High') color = 'bg-orange-100 text-orange-800 border-orange-200';
    if (risk === 'Critical') color = 'bg-red-100 text-red-800 border-red-200';

    return (
      <div className={`group relative inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${color} ml-2 cursor-help`}>
        <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {risk} Risk</span>
        {reasons && reasons.length > 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <p className="font-bold border-b border-slate-600 pb-1 mb-1">Risk Reasons:</p>
            <ul className="list-disc pl-3">
              {Array.isArray(reasons) ? reasons.map((r, i) => <li key={i}>{r}</li>) : <li>{reasons}</li>}
            </ul>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>
    );
  };

  const filteredOrders = orders.filter(order => {
    const name = order.customerName || order.user?.name || 'Guest';
    const email = order.customerEmail || order.user?.email || '';
    const phone = order.shippingAddress?.phone || order.guestInfo?.phone || '';
    const trxId = order.paymentDetails?.transactionId || '';
    const lastDigits = order.paymentDetails?.senderLastDigits || '';

    const searchLower = searchTerm.toLowerCase();
    return order._id.toLowerCase().includes(searchLower) ||
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.toLowerCase().includes(searchLower) ||
      trxId.toLowerCase().includes(searchLower) ||
      lastDigits.toString().includes(searchLower);
  });

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-maroon flex items-center">
          <ShoppingBag className="mr-3 h-8 w-8" />
          Manage Orders
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
            title={soundEnabled ? 'Disable Sound Alerts' : 'Enable Sound Alerts'}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white shadow-elevated border border-slate-200 p-4 rounded-2xl flex items-center gap-6">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
            <CheckSquare className="text-maroon h-5 w-5" />
            <span className="font-bold text-maroon">{selectedOrders.length} Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase">Mark As:</span>
            {['processing', 'shipped', 'delivered'].map(status => (
              <button
                key={status}
                onClick={() => updateBulkStatus(status)}
                className="px-3 py-1.5 rounded-lg bg-maroon/10 text-maroon hover:bg-maroon hover:text-white text-xs font-bold capitalize transition-colors"
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedOrders([])}
            className="p-1 px-3 text-xs font-bold text-slate-600 hover:text-red-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Stats Summary Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', count: stats.total, icon: <ShoppingBag className="h-4 w-4 text-slate-600" /> },
          { label: 'Pending', count: stats.pending, icon: <Clock className="h-4 w-4 text-yellow-600" /> },
          { label: 'Processing', count: stats.processing, icon: <Eye className="h-4 w-4 text-blue-600" /> },
          { label: 'Shipped', count: stats.shipped, icon: <Truck className="h-4 w-4 text-indigo-600" /> },
          { label: 'Delivered', count: stats.delivered, icon: <CheckCircle className="h-4 w-4 text-emerald-600" /> },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
            {item.icon}
            <span className="text-2xl font-bold mt-1 leading-none text-slate-800">{item.count}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors whitespace-nowrap ${statusFilter === status
                  ? 'bg-maroon text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white border border-slate-100 rounded-2xl shadow-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleOrderSelection(order._id)}
                      className="mr-3 p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {selectedOrders.includes(order._id) ?
                        <CheckSquare className="h-6 w-6 text-maroon fill-maroon/10" /> :
                        <Square className="h-6 w-6 text-slate-300" />
                      }
                    </button>
                    <h3 className="text-xl font-bold text-maroon">#{order._id.slice(-6).toUpperCase()}</h3>
                  </div>
                  {getFraudBadge(order.fraudRisk, order.fraudReason)}
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border flex items-center space-x-2 ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    <span className="capitalize">{order.orderStatus}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 font-semibold flex items-center gap-1">
                      Customer
                    </p>
                    <p className="text-slate-800 font-medium">{order.customerName || order.user?.name || 'Guest'}</p>
                    <p className="text-slate-500 flex items-center gap-2">
                      {order.customerEmail || order.user?.email || 'No email'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600 font-medium">Phone: </span>
                      <span className="text-maroon font-bold select-all">
                        {order.shippingAddress?.phone || order.guestInfo?.phone || order.user?.phone || 'N/A'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.shippingAddress?.phone || order.guestInfo?.phone || order.user?.phone, 'Phone number')}
                        className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500"
                        title="Copy Phone"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <a
                        href={`https://wa.me/88${(order.shippingAddress?.phone || order.guestInfo?.phone || order.user?.phone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-600 font-semibold">Shipping Address</p>
                    <p className="text-slate-800 font-medium">
                      {order.shippingAddress
                        ? [
                          order.shippingAddress.street,
                          order.shippingAddress.union,
                          order.shippingAddress.subDistrict,
                          order.shippingAddress.district,
                          order.shippingAddress.division,
                          order.shippingAddress.city,
                          order.shippingAddress.postalCode || order.shippingAddress.zipCode,
                        ].filter(Boolean).join(', ')
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600 font-semibold">Items</p>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-slate-800">
                        {item.product?.name || item.name || 'Item'} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div>
                    <p className="text-slate-600 font-semibold">Order Date</p>
                    <p className="text-slate-800 font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin Note</p>
                      <p className="text-sm text-amber-800 font-medium">{order.notes}</p>
                    </div>
                  </div>
                )}

                {order.giftMessage && (
                  <div className="mt-3 p-3 bg-pink-50 rounded-xl border border-pink-200 flex items-start gap-2">
                    <Gift className="h-4 w-4 text-pink-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Customer Gift Message</p>
                      <p className="text-sm text-pink-800 font-medium italic">"{order.giftMessage}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount & Actions */}
              <div className="flex flex-col items-stretch lg:items-end space-y-4 w-full lg:w-auto lg:pl-6 lg:border-l border-slate-200 pt-4 lg:pt-0 border-t lg:border-t-0">
                <div className="text-left lg:text-right">
                  <p className="text-slate-500 text-sm font-semibold">Total Amount</p>
                  <p className="text-3xl font-bold text-maroon">৳{(order.total || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1 capitalize">{order.paymentMethod}</p>
                  {order.paymentDetails && (order.paymentDetails.transactionId || order.paymentDetails.senderLastDigits) && (
                    <div className="mt-2 text-left lg:text-right bg-slate-50 p-2 rounded border border-slate-200 inline-block min-w-[140px]">
                      {order.paymentDetails.transactionId && (
                        <p className="text-xs text-slate-500 flex items-center justify-start lg:justify-end gap-1">
                          TrxID: <span className="font-mono font-bold text-maroon select-all">{order.paymentDetails.transactionId}</span>
                          <button
                            onClick={() => copyToClipboard(order.paymentDetails.transactionId, 'Transaction ID')}
                            className="p-1 hover:bg-maroon/10 rounded transition-colors"
                          >
                            <Copy className="h-3 w-3 text-maroon" />
                          </button>
                        </p>
                      )}
                      {order.paymentDetails.senderLastDigits && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sender: <span className="font-mono font-bold text-slate-700">...{order.paymentDetails.senderLastDigits}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-stretch lg:items-end space-y-3 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`/api/orders/${order._id}/invoice?token=${token}`, '_blank');
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200 flex-1"
                      title="Download Invoice"
                    >
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                    <button
                      onClick={() => openEditModal(order)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200 flex-1"
                      title="Edit Order Details"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                  {!order.courierInfo?.consignmentId &&
                    order.orderStatus !== 'delivered' &&
                    order.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => openCourierModal(order)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 border border-emerald-200 w-full"
                      >
                        <Truck className="h-4 w-4" />
                        Send to Courier
                      </button>
                    )}

                  {order.courierInfo?.trackingCode && (
                    <div className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-full text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.courierInfo.trackingCode}</span>
                      </div>
                      <p className="text-[10px] text-blue-600 mt-1">
                        Sent: {new Date(order.courierInfo.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="input-field text-sm w-full"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}

                  <div className="flex items-center space-x-2 w-full justify-between lg:justify-end mt-2">
                    <span className="text-xs font-bold text-slate-600">Payment:</span>
                    <select
                      value={order.paymentStatus || 'pending'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const confirmMsg = newStatus === 'paid'
                          ? "Mark this order as PAID? This will count towards revenue."
                          : "Change payment status?";

                        if (window.confirm(confirmMsg)) {
                          const previousOrders = [...orders];
                          setOrders(prev => prev.map(o =>
                            o._id === order._id ? { ...o, paymentStatus: newStatus } : o
                          ));

                          try {
                            const token = localStorage.getItem('token');
                            await axios.put(`/api/admin/orders/${order._id}`, {
                              paymentStatus: newStatus
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            toast.success(`Payment marked as ${newStatus}`);
                            fetchOrders();
                          } catch {
                            setOrders(previousOrders);
                            toast.error('Failed to update payment status');
                          }
                        }
                      }}
                      className={`input-field text-sm py-1 px-2 w-full lg:w-auto border ${order.paymentStatus === 'paid' ? 'border-green-300 text-green-700' : 'border-orange-300 text-orange-700'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors w-full"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card text-center py-12">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-500">No orders found</p>
        </div>
      )}

      <CourierDetailsModal
        open={courierModalOpen}
        form={courierForm}
        onChange={handleCourierChange}
        onClose={() => setCourierModalOpen(false)}
        onSubmit={handleCourierSubmit}
      />

      {/* Edit Order Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-maroon flex items-center gap-2">
                <Edit className="h-6 w-6" />
                Edit Order Details
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-7 w-7" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Customer Name</label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} className="input-field" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                  <textarea name="street" value={editForm.street} onChange={handleEditChange} rows={2} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">District</label>
                  <input type="text" name="district" value={editForm.district} onChange={handleEditChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City / Town</label>
                  <input type="text" name="city" value={editForm.city} onChange={handleEditChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sub-District (Upazila)</label>
                  <input type="text" name="subDistrict" value={editForm.subDistrict} onChange={handleEditChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Union / Ward</label>
                  <input type="text" name="union" value={editForm.union} onChange={handleEditChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Postal Code</label>
                  <input type="text" name="postalCode" value={editForm.postalCode} onChange={handleEditChange} className="input-field" />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-maroon mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Subtotal</label>
                    <input type="number" name="subtotal" value={editForm.subtotal} onChange={handleEditChange} className="input-field bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Shipping</label>
                    <input type="number" name="shipping" value={editForm.shipping} onChange={handleEditChange} className="input-field bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Discount</label>
                    <input type="number" name="discount" value={editForm.discount} onChange={handleEditChange} className="input-field bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase text-maroon">Grand Total</label>
                    <input type="number" name="total" value={editForm.total} onChange={handleEditChange} className="input-field bg-white border-maroon/30 font-bold" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isShippingPaid"
                    name="isShippingPaid"
                    checked={editForm.isShippingPaid}
                    onChange={handleEditChange}
                    className="h-5 w-5 text-maroon rounded focus:ring-maroon cursor-pointer"
                  />
                  <label htmlFor="isShippingPaid" className="text-sm font-bold text-slate-700 cursor-pointer">
                    <CheckCircle className="w-4 h-4 inline-block" /> Shipping Charge is PAID (Display as "Paid" in Invoice)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea name="notes" value={editForm.notes} onChange={handleEditChange} rows={3} className="input-field" placeholder="Admin notes about this order..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-xl font-bold text-white bg-maroon hover:bg-maroon/90 shadow-card transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
