import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const AdminReports = () => {
  const [data, setData] = useState({
    revenueByDay: [],
    orderStatusCounts: [],
    categoryCounts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/reports/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch {
        setData({ revenueByDay: [], orderStatusCounts: [], categoryCounts: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  const orderStatusData = data.orderStatusCounts.map((item) => ({
    status: item._id,
    count: item.count,
  }));

  const categoryData = data.categoryCounts.map((item) => ({
    name: item._id,
    count: item.count,
  }));

  const colors = ['#8B1538', '#1e40af', '#059669', '#D4AF37', '#9333EA', '#0D9488'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">Live performance insights for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B1538" fill="#FECACA" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {orderStatusData.map((entry, index) => (
                  <Cell key={entry.status} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Products by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
