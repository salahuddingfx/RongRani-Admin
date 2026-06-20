import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, Trash2, Edit, Search, X, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminGiftCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const { socket } = useSocket() || {};
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    balance: '',
    recipientEmail: '',
    recipientName: '',
    message: '',
    expiryDate: '',
  });

  const fetchCards = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search.trim()) params.append('search', search.trim());
      const response = await axios.get(`/api/admin/gift-cards?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(response.data?.cards || []);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      setCards([]);
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchCards();
    socket.on('giftcard:created', handleRefresh);
    socket.on('giftcard:updated', handleRefresh);
    socket.on('giftcard:deleted', handleRefresh);
    return () => {
      socket.off('giftcard:created', handleRefresh);
      socket.off('giftcard:updated', handleRefresh);
      socket.off('giftcard:deleted', handleRefresh);
    };
  }, [socket, fetchCards]);

  const resetForm = () => {
    setFormData({ code: '', balance: '', recipientEmail: '', recipientName: '', message: '', expiryDate: '' });
    setEditingCard(null);
    setShowAddModal(false);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      code: card.code,
      balance: card.originalBalance || card.balance,
      recipientEmail: card.recipientEmail || '',
      recipientName: card.recipientName || '',
      message: card.message || '',
      expiryDate: card.expiryDate ? card.expiryDate.split('T')[0] : '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error('Code is required');
    if (!formData.balance || Number(formData.balance) <= 0) return toast.error('Balance must be positive');

    try {
      const token = localStorage.getItem('token');
      if (editingCard) {
        await axios.put(`/api/admin/gift-cards/${editingCard._id}`, {
          balance: Number(formData.balance),
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          message: formData.message,
          expiryDate: formData.expiryDate || null,
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Gift card updated');
      } else {
        await axios.post('/api/admin/gift-cards', {
          code: formData.code.trim().toUpperCase(),
          balance: Number(formData.balance),
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          message: formData.message,
          expiryDate: formData.expiryDate || null,
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Gift card created');
      }
      resetForm();
      fetchCards();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save gift card');
    }
  };

  const handleDelete = (card) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Gift Card',
      message: `Delete gift card "${card.code}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/admin/gift-cards/${card._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Gift card deleted');
          fetchCards();
        } catch (error) {
          toast.error('Failed to delete gift card');
        }
      }
    });
  };

  const handleToggle = async (card) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/gift-cards/${card._id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(card.isActive ? 'Gift card deactivated' : 'Gift card activated');
      fetchCards();
    } catch (error) {
      toast.error('Failed to toggle gift card');
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, code }));
  };

  const getStatus = (card) => {
    if (!card.isActive) return { label: 'Inactive', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
    if (card.expiryDate && new Date(card.expiryDate) < new Date()) return { label: 'Expired', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
    if (card.balance <= 0) return { label: 'Depleted', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' };
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' };
  };

  const inputCls = "w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-pink-400 transition-all";

  return (
    <div className="space-y-4">
      <ConfirmDialog {...confirmDialog} onClose={() => setConfirmDialog({ isOpen: false })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Gift Cards</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage gift cards and voucher balances</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-maroon hover:bg-maroon-dark text-white rounded-xl font-black text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Gift Card
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by code..."
              className={inputCls + ' pl-10'}
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className={inputCls + ' w-full sm:w-40'}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>
        </div>
      </div>

      {/* Cards list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading gift cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="p-8 text-center">
            <Gift className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No gift cards found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {cards.map((card) => {
              const status = getStatus(card);
              const usedPct = card.originalBalance > 0 ? ((card.originalBalance - card.balance) / card.originalBalance * 100).toFixed(0) : 0;
              return (
                <div key={card._id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-800 dark:text-white font-mono">{card.code}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {card.recipientName ? `For: ${card.recipientName}` : card.recipientEmail || 'No recipient'}
                        {card.expiryDate && ` • Expires: ${new Date(card.expiryDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800 dark:text-white">৳{card.balance.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">
                        {card.originalBalance > 0 && (
                          <span className={`${usedPct > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{usedPct}% used</span>
                        )}
                        {card.transactions?.length > 0 && ` • ${card.transactions.length} txns`}
                      </p>
                    </div>
                    <button onClick={() => handleToggle(card)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={card.isActive ? 'Deactivate' : 'Activate'}>
                      {card.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                    </button>
                    <button onClick={() => handleEdit(card)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                      <Edit className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(card)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">{editingCard ? 'Edit Gift Card' : 'Create Gift Card'}</h3>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. GIFT2025"
                    disabled={!!editingCard}
                    className={inputCls + ' font-mono uppercase flex-1'}
                  />
                  {!editingCard && (
                    <button type="button" onClick={generateRandomCode} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap">
                      Generate
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Balance (৳)</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="e.g. 500"
                  min="1"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Recipient Name</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="Optional"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Recipient Email</label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Message</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value.slice(0, 200) })}
                  placeholder="Optional gift message"
                  rows={2}
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.message.length}/200</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-maroon hover:bg-maroon-dark text-white rounded-xl text-sm font-black shadow transition-all active:scale-95">
                  {editingCard ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGiftCards;
