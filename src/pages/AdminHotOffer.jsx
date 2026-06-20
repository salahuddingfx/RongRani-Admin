import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';
import { Flame } from 'lucide-react';
import AdminLoading from '../components/AdminLoading';

const AdminHotOffer = () => {
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket() || {};
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: 'Hot Offer',
    discountText: '',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    backgroundColor: '#FDE2E4',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const applyOfferData = useCallback((data) => {
    if (!data) return;
    setFormData({
      title: data.title || '',
      subtitle: data.subtitle || '',
      badgeText: data.badgeText || 'Hot Offer',
      discountText: data.discountText || '',
      ctaText: data.ctaText || 'Shop Now',
      ctaLink: data.ctaLink || '/shop',
      backgroundColor: data.backgroundColor || '#FDE2E4',
      startDate: data.startDate ? data.startDate.slice(0, 10) : '',
      endDate: data.endDate ? data.endDate.slice(0, 10) : '',
      isActive: Boolean(data.isActive),
    });
  }, []);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/hot-offer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        applyOfferData(response.data);
      } catch {
        toast.error('Failed to load hot offer');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [applyOfferData]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => applyOfferData(data);

    socket.on('hot_offer:updated', handleUpdate);

    return () => {
      socket.off('hot_offer:updated', handleUpdate);
    };
  }, [socket, applyOfferData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/admin/hot-offer',
        {
          ...formData,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Hot offer saved');
    } catch {
      toast.error('Failed to save hot offer');
    }
  };

  if (loading) {
    return <AdminLoading fullScreen text="Loading hot offer..." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-maroon" />
          Hot Offer
        </h1>
        <p className="text-slate-500 text-sm mt-1">Control the hero promo banner shown on Home.</p>
      </div>

      {/* Preview */}
      <div
        className="rounded-2xl overflow-hidden p-6"
        style={{ backgroundColor: formData.backgroundColor }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 text-maroon text-xs font-bold">
              {formData.badgeText || 'Hot Offer'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-maroon mt-3">
              {formData.title || 'Add a headline for the offer'}
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              {formData.subtitle || 'Add a short message that highlights the offer value.'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl font-bold text-maroon">
              {formData.discountText || 'Limited time'}
            </div>
            <div className="mt-3 inline-flex items-center px-4 py-2 bg-maroon text-white rounded-lg font-semibold text-sm">
              {formData.ctaText || 'Shop Now'}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              placeholder="Valentine Deal Special"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Subtitle</label>
            <input
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              placeholder="Up to 50% off on selected gifts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Badge Text</label>
            <input
              name="badgeText"
              value={formData.badgeText}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              placeholder="Hot Offer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Discount Text</label>
            <input
              name="discountText"
              value={formData.discountText}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              placeholder="Save up to 50%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Background Color</label>
            <input
              name="backgroundColor"
              value={formData.backgroundColor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
              placeholder="#FDE2E4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">CTA Text</label>
            <input
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">CTA Link</label>
            <input
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              id="hotOfferActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-maroon rounded border-slate-300 focus:ring-maroon"
            />
            <label htmlFor="hotOfferActive" className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-5 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors">
            Save Offer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotOffer;
