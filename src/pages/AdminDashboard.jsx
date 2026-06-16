import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Ticket, BarChart3, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const revenueData = (stats.monthlyRevenue || []).map((item) => ({
    name: item._id,
    revenue: item.revenue,
  }));

  const categoryData = (stats.categoryCounts || []).map((item, index) => ({
    name: item._id,
    value: item.count,
    color: ['#8B1538', '#D4AF37', '#1e40af', '#059669', '#f59e0b', '#9333EA'][index % 6],
  }));

  const orderStatusData = (stats.orderStatusCounts || []).map((item, index) => ({
    status: item._id,
    count: item.count,
    color: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'][index % 5],
  }));

  const topProducts = stats.topProducts || [];
  const recentOrders = stats.recentOrders || [];

  const COLORS = ['#8B1538', '#D4AF37', '#1e40af', '#059669', '#f59e0b', '#9333EA'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-bold">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Make sure the backend server is running on port 5000</p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-maroon mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-maroon text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cream opacity-90 text-sm font-semibold mb-1">Total Users</p>
              <h3 className="text-3xl sm:text-4xl font-bold">{stats.totalUsers || 0}</h3>
              <p className="text-cream-light text-sm mt-2">Active customer base</p>
            </div>
            <Users className="h-10 w-10 sm:h-12 sm:w-12 opacity-30" />
          </div>
        </div>

        <div className="card bg-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 opacity-90 text-sm font-semibold mb-1">Total Orders</p>
              <h3 className="text-3xl sm:text-4xl font-bold">{stats.totalOrders || 0}</h3>
              <p className="text-emerald-200 text-sm mt-2">Latest orders in pipeline</p>
            </div>
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 opacity-30" />
          </div>
        </div>

        <div className="card bg-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 opacity-90 text-sm font-semibold mb-1">Total Products</p>
              <h3 className="text-3xl sm:text-4xl font-bold">{stats.totalProducts || 0}</h3>
              <p className="text-amber-200 text-sm mt-2">
                {stats.lowStockProducts?.length || 0} low stock items
              </p>
            </div>
            <Package className="h-10 w-10 sm:h-12 sm:w-12 opacity-30" />
          </div>
        </div>

        <div className="card bg-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 opacity-90 text-sm font-semibold mb-1">Total Revenue</p>
              <h3 className="text-3xl sm:text-4xl font-bold">৳{(stats.totalRevenue || 0).toLocaleString()}</h3>
              <p className="text-purple-200 text-sm mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Last 30 days paid revenue
              </p>
            </div>
            <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-maroon mb-6 flex items-center">
          <BarChart3 className="mr-2 h-6 w-6" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products"
            className="flex items-center space-x-3 p-5 bg-maroon/10 hover:bg-maroon/20 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium border-2 border-maroon/20 hover:border-maroon/40"
          >
            <Package className="h-8 w-8 text-maroon" />
            <span className="font-bold text-charcoal">Manage Products</span>
          </Link>

          <Link
            to="/admin/sales"
            className="flex items-center space-x-3 p-5 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium border-2 border-emerald-200 hover:border-emerald-300"
          >
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-charcoal">View Sales</span>
          </Link>

          <Link
            to="/admin/coupons"
            className="flex items-center space-x-3 p-5 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium border-2 border-amber-200 hover:border-amber-300"
          >
            <Ticket className="h-8 w-8 text-amber-600" />
            <span className="font-bold text-charcoal">Manage Coupons</span>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center space-x-3 p-5 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium border-2 border-purple-200 hover:border-purple-300"
          >
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <span className="font-bold text-charcoal">View Orders</span>
          </Link>

          <Link
            to="/admin/flash-sale"
            className="flex items-center space-x-3 p-5 bg-pink-100 hover:bg-pink-200 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium border-2 border-pink-200 hover:border-pink-300"
          >
            <Zap className="h-8 w-8 text-pink-600" />
            <span className="font-bold text-charcoal">Flash Sales</span>
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Revenue & Orders Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-6 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6" />
            Revenue & Orders Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B1538" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B1538" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #8B1538', borderRadius: '8px' }}
                labelStyle={{ color: '#8B1538', fontWeight: 'bold' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8B1538" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (৳)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-6 flex items-center">
            <Package className="mr-2 h-6 w-6" />
            Products by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #8B1538', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-6 flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6" />
            Order Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #8B1538', borderRadius: '8px' }}
                labelStyle={{ color: '#8B1538', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="#8B1538" radius={[8, 8, 0, 0]}>
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-6 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6" />
            Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={product._id || idx} className="flex items-center justify-between p-4 bg-cream-light rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-gold/20 text-gold' :
                      idx === 1 ? 'bg-slate/20 text-slate' :
                        idx === 2 ? 'bg-amber-500/20 text-amber-600' :
                          'bg-slate/10 text-slate'
                      }`}>
                      <span className="font-black text-lg">#{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">{product.name}</p>
                      <p className="text-sm text-slate">{product.sales || 0} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-maroon">৳{(product.revenue || 0).toLocaleString()}</p>
                    <div className="flex items-center space-x-1 text-xs font-semibold text-slate">
                      <span>Updated</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate">
              <p>No top selling products yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-4">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-cream-light rounded-lg hover:shadow-medium transition-shadow">
                  <div>
                    <p className="font-semibold text-charcoal">Order #{order._id?.slice(-6)}</p>
                    <p className="text-sm text-slate">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                  <span className="font-bold text-maroon">৳{(order.total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate">
              <p>No recent orders yet</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-maroon mb-4">Low Stock Alert</h2>
          <div className="space-y-3">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product, idx) => (
                <Link
                  key={idx}
                  to={`/admin/products`}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:shadow-medium transition-shadow"
                >
                  <p className="font-semibold text-charcoal">{product.name}</p>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                    {product.stock} left
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-slate">
                <p>All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;