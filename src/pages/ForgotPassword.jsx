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
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900 px-4">
      <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-maroon mb-2">Forgot Password</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-maroon"
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white py-3 px-6 rounded-lg hover:bg-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-maroon hover:text-maroon/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;