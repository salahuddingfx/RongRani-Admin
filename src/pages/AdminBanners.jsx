import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      toast.success('Banner image uploaded! ✨', { id: loadingToast });
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
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon mx-auto mb-4"></div>
          <p className="text-slate font-medium">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-maroon mb-2">
            Banner Management
          </h1>
          <p className="text-slate text-lg">Manage homepage banner slides and promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setFormData({ title: '', subtitle: '', link: '', image: '', isActive: true, order: 0 });
            setShowModal(true);
          }}
          className="bg-maroon text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-maroon text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Total Banners</p>
              <h3 className="text-4xl font-black">{banners.length}</h3>
            </div>
            <ImageIcon className="h-12 w-12 opacity-30" />
          </div>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Active</p>
              <h3 className="text-4xl font-black">{banners.filter(b => b.isActive).length}</h3>
            </div>
            <Eye className="h-12 w-12 opacity-30" />
          </div>
        </div>
        <div className="bg-slate-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Inactive</p>
              <h3 className="text-4xl font-black">{banners.filter(b => !b.isActive).length}</h3>
            </div>
            <EyeOff className="h-12 w-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-maroon/10 hover:shadow-2xl transition-all">
            <div className="relative h-48 bg-cream">
              {banner.image ? (
                <img
                  src={typeof banner.image === 'string' ? banner.image : banner.image.url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-slate/30" />
                </div>
              )}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${banner.isActive
                ? 'bg-green-500 text-white'
                : 'bg-slate-500 text-white'
                }`}>
                {banner.isActive ? '✓ Active' : '✗ Inactive'}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-maroon mb-2">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-slate mb-4">{banner.subtitle}</p>
              )}
              {banner.link && (
                <p className="text-xs text-blue-600 mb-4 truncate">🔗 {banner.link}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate bg-cream px-3 py-1 rounded-full">
                  Order: {banner.order}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(banner._id, banner.isActive)}
                    className={`p-2 rounded-lg transition-colors ${banner.isActive
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate'
                      : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
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
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-dashed border-maroon/20">
          <ImageIcon className="h-24 w-24 text-slate/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-maroon mb-2">No Banners Yet</h3>
          <p className="text-slate mb-8 max-w-md mx-auto">Create your first banner to display on the homepage, or import our premium templates to get started quickly.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-maroon text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Custom Banner</span>
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
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-2 w-full sm:w-auto"
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span>Import Templates</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-maroon text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Banner Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  required
                  placeholder="e.g., Valentine's Day Special"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  placeholder="e.g., Up to 50% off on selected items"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Image URL *</label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                      required
                      placeholder="https://example.com/banner-image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomId = Math.floor(Math.random() * 1000);
                        setFormData({ ...formData, image: `https://picsum.photos/seed/${randomId}/1200/600` });
                      }}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-slate-200 transition-colors"
                    >
                      Random URL
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
                      className="bg-maroon text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-maroon/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {isUploading ? 'Uploading...' : 'Direct Upload'}
                    </button>
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden border-2 border-maroon/10 bg-cream group">
                      <img
                        src={formData.image.includes('drive.google.com')
                          ? formData.image.replace(/\/file\/d\/([^\/]+)\/view.*/, 'https://drive.google.com/uc?export=view&id=$1')
                          : formData.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, image: '' }); setImageMetadata(null); }}
                          className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-all hover:scale-110"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-maroon mb-2">Link URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                  placeholder="/shop?category=Valentine"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-maroon mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="text-sm font-bold text-maroon">Active</label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-6 h-6 text-maroon rounded focus:ring-maroon"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-maroon text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 text-slate py-4 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
