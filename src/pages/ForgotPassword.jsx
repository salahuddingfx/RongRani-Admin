import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('Password reset email sent. Please check your inbox.');
      toast.success('Password reset email sent!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset email');
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/login" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden">
              <img src="/RongRani-Logo.png" alt="RongRani" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">RongRani Admin</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Forgot Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your email to receive a reset link</p>
          </div>

          {message && (
            <div className={`px-3 py-2.5 rounded-xl mb-4 text-xs ${
              message.includes('sent')
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10 transition-all"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-maroon-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-maroon transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
