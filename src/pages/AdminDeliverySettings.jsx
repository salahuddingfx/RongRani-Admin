import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDeliverySettings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    chittagongFee: 70,
    outsideChittagongFee: 150,
    freeShippingThreshold: 2500,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/settings/delivery', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          setFormData({
            chittagongFee: response.data.chittagongFee ?? response.data.dhakaFee ?? 70,
            outsideChittagongFee: response.data.outsideChittagongFee ?? response.data.outsideDhakaFee ?? 150,
            freeShippingThreshold: response.data.freeShippingThreshold ?? 2500,
          });
        }
      } catch {
        toast.error('Failed to load delivery settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/admin/settings/delivery',
        {
          chittagongFee: Number(formData.chittagongFee),
          outsideChittagongFee: Number(formData.outsideChittagongFee),
          freeShippingThreshold: Number(formData.freeShippingThreshold),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Delivery settings updated');
    } catch {
      toast.error('Failed to update delivery settings');
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
      <div>
        <h1 className="text-3xl font-bold text-maroon">Delivery Settings</h1>
        <p className="text-slate">Manage shipping fees and free delivery rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 max-w-2xl">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-blue-900 mb-1">🏙️ Inside Cox's Bazar City Delivery Fee (BDT)</label>
          <p className="text-xs text-blue-800 mb-3">Apply this fee for deliveries within Cox's Bazar City</p>
          <input
            name="chittagongFee"
            type="number"
            value={formData.chittagongFee}
            onChange={handleChange}
            className="input-field w-full text-lg font-bold"
            min="0"
            placeholder="e.g., 70"
          />
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-green-900 mb-1">🌍 Outside Cox's Bazar City Delivery Fee (BDT)</label>
          <p className="text-xs text-green-800 mb-3">Apply this fee for deliveries to all other districts/areas</p>
          <input
            name="outsideChittagongFee"
            type="number"
            value={formData.outsideChittagongFee}
            onChange={handleChange}
            className="input-field w-full text-lg font-bold"
            min="0"
            placeholder="e.g., 150"
          />
        </div>
        <div className="bg-gold/20 border-2 border-gold/50 rounded-xl p-4">
          <label className="block text-sm font-bold text-amber-900 mb-1">🎁 Free Shipping Threshold (BDT)</label>
          <p className="text-xs text-amber-800 mb-3">Orders above this amount get FREE shipping (both regions)</p>
          <input
            name="freeShippingThreshold"
            type="number"
            value={formData.freeShippingThreshold}
            onChange={handleChange}
            className="input-field w-full text-lg font-bold"
            min="0"
            placeholder="e.g., 2500"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default AdminDeliverySettings;
