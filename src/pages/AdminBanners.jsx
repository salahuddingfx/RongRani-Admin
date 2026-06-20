import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Sparkles, Loader2, Check, Link2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminLoading from '../components/AdminLoading';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    image: '',
    isActive: true,
    order: 0
  });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [imageMetadata, setImageMetadata] = useState(null);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading banner image...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/products/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const { url, publicId } = response.data;
      setImageMetadata({ url, publicId });
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Banner image uploaded!', { id: loadingToast });
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const processImageUrl = (url) => {
        if (!url) return '';
        let trimmed = url.trim();
        if (trimmed.includes('drive.google.com')) {
          const fileIdMatch = trimmed.match(/\/file\/d\/([^\/]+)/) || trimmed.match(/id=([^\&]+)/);
          if (fileIdMatch && fileIdMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
          }
        }
        return trimmed;
      };

      const finalUrl = processImageUrl(formData.image);
      const finalImage = imageMetadata && imageMetadata.url === formData.image
        ? { url: imageMetadata.url, publicId: imageMetadata.publicId }
        : { url: finalUrl };

      const bannerData = { ...formData, image: finalImage };

      if (editingBanner) {
        await axios.put(`/api/admin/banners/${editingBanner._id}`, bannerData, config);
        toast.success('Banner updated successfully');
      } else {
        await axios.post('/api/admin/banners', bannerData, config);
        toast.success('Banner created successfully');
      }

      setShowModal(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', link: '', image: '', isActive: true, order: 0 });
      fetchBanners();
    } catch {
      toast.error(editingBanner ? 'Failed to update banner' : 'Failed to create banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      image: banner.image,
      isActive: banner.isActive,
      order: banner.order || 0
    });

    if (banner.image && typeof banner.image === 'object') {
      setImageMetadata({ url: banner.image.url, publicId: banner.image.publicId });
    } else {
      setImageMetadata(null);
    }

    setShowModal(true);
  };

  const handleDelete = async (bannerId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Banner?',
      message: 'Are you sure you want to delete this banner?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/admin/banners/${bannerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Banner deleted successfully');
          fetchBanners();
        } catch {
          toast.error('Failed to delete banner');
        }
      }
    });
  };

  const toggleActive = async (bannerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/banners/${bannerId}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Banner status updated');
      fetchBanners();
    } catch {
      toast.error('Failed to update banner status');
    }
  };

  if (loading) {
    return <AdminLoading fullScreen text="Loading banners..." />;
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Banner Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage homepage banner slides and promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setFormData({ title: '', subtitle: '', link: '', image: '', isActive: true, order: 0 });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Banners</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{banners.length}</h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <ImageIcon className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Active</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{banners.filter(b => b.isActive).length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Inactive</p>
              <h3 className="text-2xl font-bold text-slate-400 mt-1">{banners.filter(b => !b.isActive).length}</h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <EyeOff className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
            <div className="relative h-44 bg-slate-100 dark:bg-slate-700">
              {banner.image ? (
                <img
                  src={typeof banner.image === 'string' ? banner.image : banner.image.url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                </div>
              )}
              <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                banner.isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-400 text-white'
              }`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-slate-500 mb-3">{banner.subtitle}</p>
              )}
              {banner.link && (
                <p className="text-xs text-blue-500 mb-3 truncate flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> {banner.link}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded">
                  Order: {banner.order}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(banner._id, banner.isActive)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      banner.isActive
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600'
                    }`}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-12 text-center">
          <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">No Banners Yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Create your first banner to display on the homepage, or import templates to get started quickly.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Custom Banner
            </button>
            <button
              onClick={async () => {
                const templates = [
                  {
                    title: 'Handcrafted Excellence',
                    subtitle: 'Discover Traditional Bengali Crafts',
                    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=80',
                    link: '/shop',
                    isActive: true,
                    order: 1
                  },
                  {
                    title: 'Anniversary Special',
                    subtitle: 'Make Your Moments Memorable',
                    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80',
                    link: '/shop',
                    isActive: true,
                    order: 2
                  },
                  {
                    title: 'Support Local Artisans',
                    subtitle: 'Every Purchase Makes a Difference',
                    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80',
                    link: '/shop',
                    isActive: true,
                    order: 3
                  }
                ];

                try {
                  const token = localStorage.getItem('token');
                  const config = { headers: { Authorization: `Bearer ${token}` } };
                  const loadingToast = toast.loading('Importing templates...');

                  for (const template of templates) {
                    await axios.post('/api/admin/banners', template, config);
                  }

                  toast.dismiss(loadingToast);
                  toast.success('Banners imported successfully!');
                  fetchBanners();
                } catch (err) {
                  toast.error('Failed to import templates');
                  console.error(err);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Import Templates
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Banner Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                  required
                  placeholder="e.g., Valentine's Day Special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                  placeholder="e.g., Up to 50% off on selected items"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Image URL *</label>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      required
                      placeholder="https://example.com/banner-image.jpg"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const randomId = Math.floor(Math.random() * 1000);
                          setFormData({ ...formData, image: `https://picsum.photos/seed/${randomId}/1200/600` });
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        Random
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-maroon text-white rounded-lg text-xs font-medium hover:bg-maroon/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {formData.image && (
                    <div className="relative h-36 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 group">
                      <img
                        src={(() => {
                          const imgUrl = typeof formData.image === 'object' ? (formData.image.url || '') : formData.image;
                          if (!imgUrl) return '';
                          return imgUrl.includes('drive.google.com')
                            ? imgUrl.replace(/\/file\/d\/([^\/]+)\/view.*/, 'https://drive.google.com/uc?export=view&id=$1')
                            : imgUrl;
                        })()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => { setFormData({ ...formData, image: '' }); setImageMetadata(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Link URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                  placeholder="/shop?category=Valentine"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-maroon rounded border-slate-300 focus:ring-maroon"
                  />
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminBanners;
