import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Truck, MapPin, Gift } from 'lucide-react';

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
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Truck className="h-6 w-6 text-maroon" />
          Delivery Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage shipping fees and free delivery rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 space-y-5 max-w-2xl">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
          <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Inside Cox's Bazar City Delivery Fee (BDT)
          </label>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-3">Apply this fee for deliveries within Cox's Bazar City</p>
          <input
            name="chittagongFee"
            type="number"
            value={formData.chittagongFee}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-500/20 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            min="0"
            placeholder="e.g., 70"
          />
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
          <label className="block text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            Outside Cox's Bazar City Delivery Fee (BDT)
          </label>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mb-3">Apply this fee for deliveries to all other districts/areas</p>
          <input
            name="outsideChittagongFee"
            type="number"
            value={formData.outsideChittagongFee}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-500/20 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            min="0"
            placeholder="e.g., 150"
          />
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
          <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
            <Gift className="w-4 h-4" />
            Free Shipping Threshold (BDT)
          </label>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-3">Orders above this amount get FREE shipping (both regions)</p>
          <input
            name="freeShippingThreshold"
            type="number"
            value={formData.freeShippingThreshold}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-amber-200 dark:border-amber-500/20 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            min="0"
            placeholder="e.g., 2500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-5 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDeliverySettings;
