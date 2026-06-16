import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Plus, Trash2, Edit, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const { socket } = useSocket() || {};
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    endDate: '',
    usageLimit: '',
    description: '',
    isActive: true
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchCoupons();

    socket.on('coupon:created', handleRefresh);
    socket.on('coupon:updated', handleRefresh);
    socket.on('coupon:deleted', handleRefresh);

    return () => {
      socket.off('coupon:created', handleRefresh);
      socket.off('coupon:updated', handleRefresh);
      socket.off('coupon:deleted', handleRefresh);
    };
  }, [socket, fetchCoupons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        endDate: formData.endDate,
        description: formData.description || undefined,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await axios.put(`/api/admin/coupons/${editingCoupon._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon updated successfully');
      } else {
        await axios.post('/api/admin/coupons', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon created successfully');
      }

      setShowAddModal(false);
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        endDate: '',
        usageLimit: '',
        description: '',
        isActive: true
      });
      fetchCoupons();
    } catch {
      toast.error('Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: coupon.value ?? '',
      minOrderValue: coupon.minOrderValue ?? '',
      maxDiscount: coupon.maxDiscount ?? '',
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : '',
      usageLimit: coupon.usageLimit ?? '',
      description: coupon.description || '',
      isActive: coupon.isActive !== false,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-maroon flex items-center">
          <Ticket className="mr-3 h-8 w-8" />
          Manage Coupons
        </h1>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setFormData({
              code: '',
              type: 'percentage',
              value: '',
              minOrderValue: '',
              maxDiscount: '',
              endDate: '',
              usageLimit: '',
              description: '',
              isActive: true
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="card hover:shadow-large transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-maroon text-white px-4 py-2 rounded-lg font-bold text-xl">
                {coupon.code}
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 hover:bg-maroon/10 rounded-lg transition-colors"
                  onClick={() => handleEdit(coupon)}
                >
                  <Edit className="h-5 w-5 text-maroon" />
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate text-sm">Discount</span>
                <span className="font-bold text-maroon text-xl">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate text-sm">Min Purchase</span>
                <span className="font-semibold text-charcoal">৳{coupon.minOrderValue || 0}</span>
              </div>

              {coupon.maxDiscount && (
                <div className="flex justify-between items-center">
                  <span className="text-slate text-sm">Max Discount</span>
                  <span className="font-semibold text-charcoal">৳{coupon.maxDiscount}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate text-sm">Expires</span>
                <span className="font-semibold text-charcoal">{new Date(coupon.endDate).toLocaleDateString()}</span>
              </div>

              <div className="pt-3 border-t border-slate/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate text-sm">Usage</span>
                  <span className="font-semibold text-charcoal">{coupon.usageCount || 0}/{coupon.usageLimit || 0}</span>
                </div>
                <div className="h-2 bg-cream-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-maroon rounded-full"
                    style={{ width: coupon.usageLimit ? `${(coupon.usageCount / coupon.usageLimit) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="pt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-maroon">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCoupon(null);
                }}
                className="text-slate hover:text-maroon"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="input-field w-full uppercase"
                    placeholder="WELCOME10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="input-field w-full"
                    placeholder={formData.type === 'percentage' ? '10' : '500'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Min Purchase (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                    className="input-field w-full"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Max Discount (৳)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="input-field w-full"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    className="input-field w-full"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field w-full"
                  placeholder="Seasonal discount on selected items"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate mb-2">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="couponActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-maroon"
                />
                <label htmlFor="couponActive" className="text-sm font-semibold text-slate">
                  Active
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCoupon(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
