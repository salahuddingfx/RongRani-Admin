import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import SocketProvider from './contexts/SocketContext.jsx';
import AppInitializer from './components/AppInitializer';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import CustomCursor from './components/CustomCursor';

import './App.css';

// Loading Component
const PageLoading = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
    <p className="text-slate-500 font-medium animate-pulse">Loading perfection...</p>
  </div>
);

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminSales = lazy(() => import('./pages/AdminSales'));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminBanners = lazy(() => import('./pages/AdminBanners'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminHotOffer = lazy(() => import('./pages/AdminHotOffer'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminDeliverySettings = lazy(() => import('./pages/AdminDeliverySettings'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminStatus = lazy(() => import('./pages/AdminStatus'));
const AdminAI = lazy(() => import('./pages/AdminAI'));
const AdminFlashSale = lazy(() => import('./pages/AdminFlashSale'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <AppInitializer>
                <HelmetProvider>
                  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Toaster
                      position="top-right"
                      gutter={10}
                      toastOptions={{
                        duration: 3500,
                        style: {
                          background: '#fff',
                          color: '#1e293b',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 500,
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          maxWidth: '420px',
                        },
                        success: {
                          duration: 3000,
                          style: {
                            border: '1px solid #bbf7d0',
                            background: '#f0fdf4',
                          },
                          iconTheme: {
                            primary: '#16a34a',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4500,
                          style: {
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                          },
                          iconTheme: {
                            primary: '#dc2626',
                            secondary: '#fff',
                          },
                        },
                        loading: {
                          style: {
                            border: '1px solid #e0e7ff',
                            background: '#eef2ff',
                          },
                          iconTheme: {
                            primary: '#7c3aed',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                    <ScrollToTop />
                    <CustomCursor />

                    <Suspense fallback={<PageLoading />}>
                      <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        } />
                        <Route path="forgot-password" element={
                          <PublicRoute>
                            <ForgotPassword />
                          </PublicRoute>
                        } />
                        <Route path="reset-password/:token" element={
                          <PublicRoute>
                            <ResetPassword />
                          </PublicRoute>
                        } />

                        {/* Root Redirect to Admin Panel */}
                        <Route path="/" element={<Navigate to="/admin" replace />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="sales" element={<AdminSales />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="banners" element={<AdminBanners />} />
                          <Route path="hot-offer" element={<AdminHotOffer />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="delivery-settings" element={<AdminDeliverySettings />} />
                          <Route path="reports" element={<AdminReports />} />
                          <Route path="status" element={<AdminStatus />} />
                          <Route path="ai" element={<AdminAI />} />
                          <Route path="flash-sale" element={<AdminFlashSale />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                        </Route>

                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Router>
                </HelmetProvider>
              </AppInitializer>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
