import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScrollRevealManager from './ScrollRevealManager';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/products', label: 'Products', icon: '🛍️' },
    { path: '/admin/categories', label: 'Categories', icon: '📂' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/admin/banners', label: 'Banners', icon: '📢' },
    { path: '/admin/hot-offer', label: 'Hot Offer', icon: '🔥' },
    { path: '/admin/flash-sale', label: 'Flash Sale', icon: '⚡' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/admin/delivery-settings', label: 'Delivery', icon: '🚚' },
    { path: '/admin/reports', label: 'Reports', icon: '📋' },
    { path: '/admin/status', label: 'Status', icon: '🧭' },
    { path: '/admin/ai', label: 'AI Studio', icon: '🤖' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      <ScrollRevealManager />

      {/* Admin Header */}
      <header className="bg-maroon text-white shadow-2xl sticky top-0 z-50 border-b-4 border-pink-600">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full border-2 border-white p-0 overflow-hidden shadow-lg bg-transparent">
                  <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-black tracking-tight">RongRani</h1>
                  <p className="text-xs text-pink-200 hidden md:block">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs md:text-sm font-semibold">{user?.name || 'Admin'}</p>
                <p className="text-xs text-pink-200">{user?.role || 'Administrator'}</p>
              </div>
              <a
                href={`${clientUrl}/dashboard`}
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-semibold"
              >
                <Home className="w-4 h-4" />
                <span>User View</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-semibold shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <nav
          className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-72 md:w-80 lg:w-72
            bg-white shadow-2xl
            transform transition-transform duration-300 ease-in-out
            z-50 lg:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="h-full overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 bg-maroon text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white p-0 overflow-hidden shadow-sm bg-transparent">
                  <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">RongRani</h2>
                  <p className="text-xs text-pink-200">Admin Menu</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="p-4">
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center justify-between
                        px-4 py-3 rounded-xl
                        transition-all duration-200
                        group
                        ${isActive(item.path)
                          ? 'bg-maroon text-white shadow-lg scale-105'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-maroon'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-semibold text-sm md:text-base">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${isActive(item.path) ? 'translate-x-1' : 'group-hover:translate-x-1'
                          }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Quick Actions - Mobile Only */}
              <div className="lg:hidden mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
                  Quick Actions
                </h3>
                <a
                  href={`${clientUrl}/dashboard`}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-semibold">User Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;