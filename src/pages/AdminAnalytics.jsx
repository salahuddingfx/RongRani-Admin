import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    TrendingUp, Users, ShoppingCart, Package, DollarSign,
    AlertCircle, BarChart3, PieChart, Activity
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [realtimeStats, setRealtimeStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');

    const fetchAnalytics = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/analytics/dashboard?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    }, [period]);

    const fetchRealtimeStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/analytics/realtime', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRealtimeStats(response.data.data);
        } catch (error) {
            console.error('Error fetching realtime stats:', error);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAnalytics();
            fetchRealtimeStats();
        }, 0);

        const interval = setInterval(fetchRealtimeStats, 30000);
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [fetchAnalytics, fetchRealtimeStats]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-maroon"></div>
            </div>
        );
    }

    const salesTrendData = {
        labels: analytics?.salesTrend?.map(item => item._id) || [],
        datasets: [
            {
                label: 'Revenue (৳)',
                data: analytics?.salesTrend?.map(item => item.revenue) || [],
                borderColor: 'rgb(139, 21, 56)',
                backgroundColor: 'rgba(139, 21, 56, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Orders',
                data: analytics?.salesTrend?.map(item => item.orders) || [],
                borderColor: 'rgb(212, 175, 55)',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const categoryRevenueData = {
        labels: analytics?.categoryRevenue?.map(item => item._id) || [],
        datasets: [{
            label: 'Revenue by Category',
            data: analytics?.categoryRevenue?.map(item => item.revenue) || [],
            backgroundColor: [
                'rgba(139, 21, 56, 0.8)',
                'rgba(212, 175, 55, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(147, 51, 234, 0.8)',
                'rgba(236, 72, 153, 0.8)',
            ]
        }]
    };

    const orderStatusData = {
        labels: analytics?.orderStatusDistribution?.map(item =>
            item._id.charAt(0).toUpperCase() + item._id.slice(1)
        ) || [],
        datasets: [{
            data: analytics?.orderStatusDistribution?.map(item => item.count) || [],
            backgroundColor: [
                'rgba(245, 158, 11, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(147, 51, 234, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ]
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                    <BarChart3 className="mr-3 h-8 w-8 text-maroon" />
                    Analytics Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Comprehensive business insights and metrics</p>
            </div>

            {/* Period Selector */}
            <div className="mb-6 flex space-x-2">
                {['24hours', '7days', '30days', '90days'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${period === p
                            ? 'bg-maroon text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {p === '24hours' ? 'Last 24 Hours' :
                            p === '7days' ? 'Last 7 Days' :
                                p === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
                    </button>
                ))}
            </div>

            {/* Real-time Stats */}
            {realtimeStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-600 text-white rounded-2xl p-5 md:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="h-10 w-10 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Live</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{realtimeStats.todayOrders}</div>
                        <div className="text-sm text-white/80">Orders Today</div>
                    </div>

                    <div className="bg-emerald-600 text-white rounded-2xl p-5 md:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="h-10 w-10 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Live</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">৳{realtimeStats.todayRevenue.toLocaleString()}</div>
                        <div className="text-sm text-white/80">Today's Revenue</div>
                    </div>

                    <div className="bg-purple-600 text-white rounded-2xl p-5 md:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="h-10 w-10 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Live</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{realtimeStats.todayUsers}</div>
                        <div className="text-sm text-white/80">New Users Today</div>
                    </div>

                    <div className="bg-amber-500 text-white rounded-2xl p-5 md:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <ShoppingCart className="h-10 w-10 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Live</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{realtimeStats.activeOrders}</div>
                        <div className="text-sm text-white/80">Active Orders</div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-maroon/10 p-3 rounded-xl">
                            <DollarSign className="h-6 w-6 text-maroon" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        ৳{analytics?.summary?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-500/10 p-3 rounded-xl">
                            <ShoppingCart className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {analytics?.summary?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Orders</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-emerald-500/10 p-3 rounded-xl">
                            <Users className="h-6 w-6 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {analytics?.summary?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-purple-500/10 p-3 rounded-xl">
                            <Package className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {analytics?.summary?.totalProducts || 0}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Products</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-red-500/10 p-3 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {analytics?.summary?.lowStockProducts || 0}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Low Stock Items</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-maroon" />
                        Sales Trend
                    </h3>
                    <div className="h-80">
                        <Line data={salesTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Category Revenue */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-maroon" />
                        Revenue by Category
                    </h3>
                    <div className="h-80">
                        <Bar data={categoryRevenueData} options={chartOptions} />
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                        <PieChart className="mr-2 h-5 w-5 text-maroon" />
                        Order Status Distribution
                    </h3>
                    <div className="h-80">
                        <Doughnut data={orderStatusData} options={chartOptions} />
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 md:p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                        <Package className="mr-2 h-5 w-5 text-maroon" />
                        Top Selling Products
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {analytics?.topProducts?.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-maroon/10 text-maroon font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <div className="text-slate-800 dark:text-white font-semibold text-sm">{product.name}</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-xs">{product.totalSold} sold</div>
                                    </div>
                                </div>
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold">৳{product.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
