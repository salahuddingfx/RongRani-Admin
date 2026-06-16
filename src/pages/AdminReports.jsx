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

  const colors = ['#BE123C', '#1e40af', '#059669', '#F59E0B', '#9333EA', '#0D9488'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-maroon">Reports & Analytics</h1>
        <p className="text-slate">Live performance insights for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-maroon mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#BE123C" fill="#FECACA" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-maroon mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {orderStatusData.map((entry, index) => (
                  <Cell key={entry.status} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-maroon mb-4">Products by Category</h2>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
