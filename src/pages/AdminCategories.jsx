import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Package, Eye, EyeOff, Search, Star, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Package',
    color: 'bg-maroon',
    image: '',
    order: 0,
    isActive: true,
    showOnHome: false,
  });
  const [imageMetadata, setImageMetadata] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const iconOptions = ['Heart', 'Sparkles', 'ShoppingBag', 'Gift', 'Star', 'Clock', 'Package', 'Shirt', 'Flower', 'Pencil'];
  const colorOptions = [
    { name: 'Maroon', value: 'bg-maroon', preview: '#8B2635' },
    { name: 'Pink', value: 'bg-pink-600', preview: '#DB2777' },
    { name: 'Red', value: 'bg-red-500', preview: '#EF4444' },
    { name: 'Rose', value: 'bg-rose-600', preview: '#E11D48' },
    { name: 'Amber', value: 'bg-amber-500', preview: '#F59E0B' },
    { name: 'Gold', value: 'bg-gold', preview: '#C9A86A' },
    { name: 'Emerald', value: 'bg-emerald-500', preview: '#10B981' },
    { name: 'Teal', value: 'bg-teal-600', preview: '#0D9488' },
    { name: 'Purple', value: 'bg-purple-600', preview: '#9333EA' },
    { name: 'Indigo', value: 'bg-indigo-600', preview: '#4F46E5' },
    { name: 'Slate', value: 'bg-slate-700', preview: '#334155' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories?all=true');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-') })
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading category image...');

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
      toast.success('Category image uploaded! ✨', { id: loadingToast });
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const processImageUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
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

      const categoryData = { ...formData, image: finalImage };

      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, categoryData, config);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/categories', categoryData, config);
        toast.success('Category created successfully');
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const toggleActive = async (category) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/categories/${category._id}`,
        { isActive: !category.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch {
      toast.error('Failed to toggle category status');
    }
  };

  const toggleShowOnHome = async (category) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/categories/${category._id}`,
        { showOnHome: !category.showOnHome },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Category ${!category.showOnHome ? 'added to' : 'removed from'} home sliders`);
      fetchCategories();
    } catch {
      toast.error('Failed to update home display status');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'Package',
      color: category.color || 'bg-maroon',
      image: category.image || '',
      order: category.order || 0,
      isActive: category.isActive,
      showOnHome: category.showOnHome || false,
    });

    if (category.image && typeof category.image === 'object') {
      setImageMetadata({ url: category.image.url, publicId: category.image.publicId });
    } else {
      setImageMetadata(null);
    }

    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Package',
      color: 'bg-maroon',
      image: '',
      order: 0,
      isActive: true,
      showOnHome: false,
    });
    setImageMetadata(null);
    setEditingCategory(null);
    setShowModal(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="bg-maroon rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Categories Management</h1>
            <p className="text-white/80 text-lg">Organize your product collections</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-maroon hover:bg-white/90 px-6 py-3 rounded-xl font-bold text-lg flex items-center space-x-2 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-8 border border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category._id} className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700 hover:border-maroon transition-all hover:shadow-2xl hover:shadow-maroon/20 transform hover:-translate-y-1">
            <div className={`${category.color} p-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <button
                    onClick={() => toggleActive(category)}
                    className={`p-2 ${category.isActive ? 'bg-green-500/30' : 'bg-red-500/30'} hover:bg-white/30 rounded-xl transition-all backdrop-blur-md`}
                  >
                    {category.isActive ? (
                      <Eye className="h-5 w-5 text-white" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleShowOnHome(category)}
                    className={`p-2 ${category.showOnHome ? 'bg-amber-500/50' : 'bg-slate-500/30'} hover:bg-white/30 rounded-xl transition-all backdrop-blur-md ml-2`}
                    title={category.showOnHome ? 'Remove from Home Slider' : 'Show as Home Slider'}
                  >
                    <Star className={`h-5 w-5 text-white ${category.showOnHome ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">{category.name}</h3>
                <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
              </div>
            </div>
            <div className="p-5 bg-slate-800/80">
              <div className="flex justify-between items-center text-sm text-slate-300 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="bg-slate-700 px-3 py-1 rounded-lg">
                    <strong className="text-white">{category.productCount || 0}</strong> Products
                  </span>
                  <span className="bg-slate-700 px-3 py-1 rounded-lg">
                    <strong className="text-white">{category.orderCount || 0}</strong> Orders
                  </span>
                  <span className="bg-slate-700 px-3 py-1 rounded-lg">
                    Sort: <strong className="text-white">{category.order}</strong>
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
          <Package className="h-20 w-20 text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-400 mb-2">No categories found</h3>
          <p className="text-slate-500 mb-6">Create your first category to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-maroon p-6 flex justify-between items-center rounded-t-3xl z-10">
              <h2 className="text-3xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon"
                  required
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon"
                  required
                  placeholder="auto-generated-slug"
                />
                <p className="text-xs text-slate-400 mt-1">Auto-generated from name</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-maroon"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Color Theme
                  </label>
                  <div className="relative">
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-maroon appearance-none"
                    >
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value}>{color.name}</option>
                      ))}
                    </select>
                    <div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white pointer-events-none"
                      style={{ backgroundColor: colorOptions.find(c => c.value === formData.color)?.preview }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-maroon"
                    min="0"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer bg-slate-700 px-4 py-3 rounded-xl w-full hover:bg-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-maroon rounded focus:ring-maroon border-slate-600"
                    />
                    <span className="text-sm font-bold text-white">Active Status</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer bg-slate-700 px-4 py-3 rounded-xl w-full hover:bg-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      name="showOnHome"
                      checked={formData.showOnHome}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-slate-600"
                    />
                    <span className="text-sm font-bold text-white">Show as Slider on Home</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Category Cover Image</label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="image"
                      value={typeof formData.image === 'string' ? formData.image : formData.image?.url || ''}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon"
                      placeholder="https://example.com/category-image.jpg"
                    />
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
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Direct Upload'}
                    </button>
                  </div>

                  {formData.image && (
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden border-2 border-slate-600 bg-slate-900 group">
                      <img
                        src={(typeof formData.image === 'string' ? formData.image : formData.image?.url || '').includes('drive.google.com')
                          ? (typeof formData.image === 'string' ? formData.image : formData.image?.url || '').replace(/\/file\/d\/([^\/]+)\/view.*/, 'https://drive.google.com/uc?export=view&id=$1')
                          : (typeof formData.image === 'string' ? formData.image : formData.image?.url || '')
                        }
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, image: '' }); setImageMetadata(null); }}
                          className="bg-red-500/80 p-2 rounded-full text-white hover:bg-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-maroon hover:bg-maroon/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
