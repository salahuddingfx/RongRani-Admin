import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, ChevronRight, BarChart3, TrendingUp, Users, Package, ShoppingBag, Folder, Zap, Bot, Ticket, Megaphone, Flame, Star, Truck, ClipboardList, Compass } from 'lucide-react';
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
    { path: '/admin/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { path: '/admin/orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
    { path: '/admin/products', label: 'Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { path: '/admin/categories', label: 'Categories', icon: <Folder className="w-4 h-4" /> },
    { path: '/admin/coupons', label: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
    { path: '/admin/banners', label: 'Banners', icon: <Megaphone className="w-4 h-4" /> },
    { path: '/admin/hot-offer', label: 'Hot Offer', icon: <Flame className="w-4 h-4" /> },
    { path: '/admin/flash-sale', label: 'Flash Sale', icon: <Zap className="w-4 h-4" /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
    { path: '/admin/delivery-settings', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
    { path: '/admin/reports', label: 'Reports', icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/admin/status', label: 'Status', icon: <Compass className="w-4 h-4" /> },
    { path: '/admin/ai', label: 'AI Studio', icon: <Bot className="w-4 h-4" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ScrollRevealManager />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
                <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">RongRani</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Admin Panel</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
            </div>
            <a
              href={`${clientUrl}/dashboard`}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-maroon dark:hover:text-pink-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>User View</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav
          className={`
            fixed lg:sticky top-[53px] left-0 h-[calc(100vh-53px)]
            w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
            transform transition-transform duration-200 ease-in-out
            z-50 lg:z-auto overflow-y-auto custom-scrollbar
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="lg:hidden sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
                <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">RongRani</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-3">
            <ul className="space-y-0.5">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive(item.path)
                        ? 'bg-maroon text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile quick actions */}
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <a
                href={`${clientUrl}/dashboard`}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                <span>User Dashboard</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-53px)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
