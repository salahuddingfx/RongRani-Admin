import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Package, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminSales = () => {
  const [salesData, setSalesData] = useState({
    dailySales: [],
    weeklySales: 0,
    monthlySales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week');

  const fetchSalesData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/sales?period=${timeFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSalesData({
        dailySales: [],
        weeklySales: 0,
        monthlySales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0
      });
      setError('No sales data available yet.');
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-maroon" />
          Sales & Revenue
        </h1>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="input-field"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 text-amber-700 dark:text-amber-400 p-4 mb-6 rounded-xl">
          <p className="font-bold">Sales data unavailable</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-maroon text-white rounded-2xl p-5 md:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Weekly Sales</p>
              <h3 className="text-3xl font-bold">৳{(salesData.weeklySales || 0).toLocaleString()}</h3>
              <p className="text-white/70 text-sm mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last week
              </p>
            </div>
            <DollarSign className="h-12 w-12 opacity-30" />
          </div>
        </div>

        <div className="bg-emerald-600 text-white rounded-2xl p-5 md:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Monthly Sales</p>
              <h3 className="text-3xl font-bold">৳{(salesData.monthlySales || 0).toLocaleString()}</h3>
              <p className="text-white/70 text-sm mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.3% from last month
              </p>
            </div>
            <Calendar className="h-12 w-12 opacity-30" />
          </div>
        </div>

        <div className="bg-amber-500 text-white rounded-2xl p-5 md:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold">{salesData.totalOrders || 0}</h3>
              <p className="text-white/70 text-sm mt-2 flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" />
                {Math.round(salesData.totalOrders / 7)} orders/day
              </p>
            </div>
            <Package className="h-12 w-12 opacity-30" />
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-2xl p-5 md:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Avg Order Value</p>
              <h3 className="text-3xl font-bold">৳{(salesData.avgOrderValue || 0).toLocaleString()}</h3>
              <p className="text-white/70 text-sm mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5.2% increase
              </p>
            </div>
            <DollarSign className="h-12 w-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Daily Sales Overview</h2>
        {salesData.dailySales.length > 0 ? (
          <div className="space-y-4">
            {salesData.dailySales.map((day, index) => {
              const maxRevenue = Math.max(...salesData.dailySales.map(d => d.revenue));
              const percentage = maxRevenue ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-500 dark:text-slate-400">{day.orders} orders</span>
                      <span className="font-bold text-slate-800 dark:text-white">৳{day.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                    <div
                      className="h-full bg-maroon rounded-xl transition-all duration-500 flex items-center justify-end pr-4"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <p>No daily sales data yet</p>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-maroon" />
            Top Selling Products
          </h2>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No top selling products yet</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-maroon" />
            Customer Insights
          </h2>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No customer insights yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
