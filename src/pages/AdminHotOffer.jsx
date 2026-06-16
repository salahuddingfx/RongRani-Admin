import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';

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
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-maroon">Hot Offer</h1>
          <p className="text-slate">Control the hero promo banner shown on Home.</p>
        </div>
      </div>

      <div
        className="card overflow-hidden"
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
            <p className="text-slate mt-2 max-w-xl">
              {formData.subtitle || 'Add a short message that highlights the offer value.'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl font-bold text-maroon">
              {formData.discountText || 'Limited time'}
            </div>
            <div className="mt-3 inline-flex items-center px-4 py-2 bg-maroon text-white rounded-xl font-semibold">
              {formData.ctaText || 'Shop Now'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Valentine Deal Special"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Subtitle</label>
            <input
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Up to 50% off on selected gifts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Badge Text</label>
            <input
              name="badgeText"
              value={formData.badgeText}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Hot Offer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Discount Text</label>
            <input
              name="discountText"
              value={formData.discountText}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Save up to 50%"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Background Color</label>
            <input
              name="backgroundColor"
              value={formData.backgroundColor}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="#FDE2E4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">CTA Text</label>
            <input
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">CTA Link</label>
            <input
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div className="flex items-center gap-3 pt-7">
            <input
              id="hotOfferActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-maroon"
            />
            <label htmlFor="hotOfferActive" className="text-sm font-semibold text-slate">
              Active
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate mb-1">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Offer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotOffer;
