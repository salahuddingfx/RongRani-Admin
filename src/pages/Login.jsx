import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/admin/dashboard';
  const message = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      // Wait, check user role. The context state is updated by login, but let's redirect.
      navigate(from);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden px-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-maroon/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Animated Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl border-2 border-pink-500/30 p-1 overflow-hidden shadow-2xl bg-slate-800">
            <img src="/RongRani-Logo.png" alt="RongRani Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
            RongRani <span className="text-pink-500 font-medium text-lg block mt-1">Administration Panel</span>
          </h2>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-400">
              Sign in with your admin credentials to access the console dashboard.
            </p>
          </div>

          {message && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl mb-6 text-xs sm:text-sm flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <div className="mt-2 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-pink-500 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none text-white text-sm"
                  placeholder="admin@rongrani.com"
                />
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-700 focus:border-pink-500 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none text-white text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-pink-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-slate-950 border-slate-800 text-pink-600 focus:ring-pink-500 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-pink-500 hover:text-pink-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Access Panel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;