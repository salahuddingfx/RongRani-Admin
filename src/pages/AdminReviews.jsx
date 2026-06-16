import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useSocket } from '../contexts/socketContextBase';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-maroon">Reviews Moderation</h1>
          <p className="text-slate">Approve or reject customer reviews.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full md:w-64"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-maroon text-white">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Reviewer</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Comment</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-cream-light/50">
                  <td className="px-6 py-4 font-semibold text-charcoal">
                    {review.product?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-slate">
                    {review.user?.name || review.guestName || 'Guest'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : review.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate max-w-xs">
                    <p className="line-clamp-2">{review.comment || review.title || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateStatus(review._id, 'approved')}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateStatus(review._id, 'rejected')}
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
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
        <div className="card text-center text-slate">
          No reviews found for this filter.
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
