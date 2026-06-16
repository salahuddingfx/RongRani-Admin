import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const validToken = true;

  useEffect(() => {
    // Optionally, verify token validity here
  }, [token]);

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

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900 px-4">
        <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Invalid Token</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-maroon text-white py-3 px-6 rounded-lg hover:bg-maroon/80 transition-colors"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900 px-4">
      <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-maroon mb-2">Reset Password</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-maroon"
                placeholder="Enter new password"
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-maroon"
                placeholder="Confirm new password"
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white py-3 px-6 rounded-lg hover:bg-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;