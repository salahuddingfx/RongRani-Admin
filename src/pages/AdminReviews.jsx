import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useSocket } from '../contexts/socketContextBase';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const { socket } = useSocket() || {};

  const fetchReviews = useCallback(async (status = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const query = status !== 'all' ? `?status=${status}` : '';
      const response = await axios.get(`/api/admin/reviews${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(statusFilter);
  }, [statusFilter, fetchReviews]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchReviews(statusFilter);

    socket.on('review:updated', handleRefresh);
    socket.on('review:deleted', handleRefresh);

    return () => {
      socket.off('review:updated', handleRefresh);
      socket.off('review:deleted', handleRefresh);
    };
  }, [socket, fetchReviews, statusFilter]);

  const updateStatus = async (reviewId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/reviews/${reviewId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Review ${status}`);
      fetchReviews(statusFilter);
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Review deleted');
      fetchReviews(statusFilter);
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reviews Moderation</h1>
          <p className="text-slate-500 text-sm mt-1">Approve or reject customer reviews.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon w-full md:w-56"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviewer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comment</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-sm text-slate-800 dark:text-white">
                    {review.product?.name || 'Unknown'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {review.user?.name || review.guestName || 'Guest'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : review.status === 'rejected'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs">
                    <p className="line-clamp-2">{review.comment || review.title || '-'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateStatus(review._id, 'approved')}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(review._id, 'rejected')}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reviews.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-12 text-center">
          <Star className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews found for this filter.</p>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
