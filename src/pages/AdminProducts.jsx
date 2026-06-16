import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit, Search, Package, Globe, Tag, Settings, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/socketContextBase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockDrafts, setStockDrafts] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const { socket } = useSocket() || {};
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    images: '',
    tags: '',
    seoTitle: '',
    seoDescription: ''
  });

  // Track storage metadata for uploaded images
  const [imageMetadata, setImageMetadata] = useState([]);

  const getImageCount = () => {
    if (!formData.images) return 0;
    // Split by comma OR newline, then filter out empty entries
    return formData.images.split(/[,\n]/).filter(url => url.trim().length > 0).length;
  };

  const getDiscountPercentage = () => {
    const original = parseFloat(formData.originalPrice);
    const selling = parseFloat(formData.price);
    if (!original || !selling || original <= selling) return 0;
    return Math.round(((original - selling) / original) * 100);
  };

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading image to MongoDB storage...');

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

      // Store metadata for this URL
      if (publicId) {
        setImageMetadata(prev => [...prev, { url, publicId }]);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images ? `${prev.images}\n${url}` : url
      }));

      toast.success('Image uploaded successfully! ✨', { id: loadingToast });
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/categories?all=true');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchProducts();

    socket.on('product:created', handleRefresh);
    socket.on('product:updated', handleRefresh);
    socket.on('product:deleted', handleRefresh);
    socket.on('inventory:updated', handleRefresh);
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('product:created', handleRefresh);
      socket.off('product:updated', handleRefresh);
      socket.off('product:deleted', handleRefresh);
      socket.off('inventory:updated', handleRefresh);
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket, fetchProducts]);

  useEffect(() => {
    if (!socket) return;
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket, fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleStockChange = (id, value) => {
    setStockDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleStockUpdate = async (product) => {
    const nextStock = Number(stockDrafts[product._id]);
    if (Number.isNaN(nextStock)) {
      toast.error('Enter a valid stock number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/products/${product._id}`,
        { stock: nextStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Stock updated');
      fetchProducts();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!formData.images.trim()) {
        toast.error('At least one image URL is required');
        return;
      }
      // Helper to convert Google Drive links to direct links
      const processImageUrl = (url) => {
        let trimmed = url.trim();
        // Handle GDrive file links
        if (trimmed.includes('drive.google.com')) {
          const fileIdMatch = trimmed.match(/\/file\/d\/([^\/]+)/) || trimmed.match(/id=([^\&]+)/);
          if (fileIdMatch && fileIdMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
          }
        }
        return trimmed;
      };

      const imagesArray = formData.images
        .split(/[,\n]/)
        .map(img => processImageUrl(img))
        .filter(Boolean);

      // Merge metadata with URLs
      const finalImages = imagesArray.map(url => {
        const meta = imageMetadata.find(m => m.url === url);
        return meta ? { url: meta.url, publicId: meta.publicId } : { url };
      });

      const productData = {
        ...formData,
        sku: formData.sku?.trim() || undefined,
        images: finalImages,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product added successfully');
      }

      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        stock: '',
        images: '',
        tags: '',
        seoTitle: '',
        seoDescription: ''
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    const imagesValue = (product.images || [])
      .map(img => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean)
      .join(', ');

    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || product.price || '',
      category: product.category || '',
      stock: product.stock ?? '',
      images: imagesValue,
      tags: (product.tags || []).join(', '),
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    });

    // Initialize metadata for existing images
    const existingMeta = (product.images || [])
      .filter(img => typeof img === 'object' && img.publicId)
      .map(img => ({ url: img.url, publicId: img.publicId }));
    setImageMetadata(existingMeta);

    setShowAddModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-maroon flex items-center">
          <Package className="mr-3 h-8 w-8" />
          Manage Products
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              sku: '',
              description: '',
              price: '',
              originalPrice: '',
              category: '',
              stock: '',
              images: '',
              tags: '',
              seoTitle: '',
              seoDescription: ''
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate group-focus-within:text-maroon transition-colors" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 w-full transition-all focus:ring-4 focus:ring-maroon/10"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-lg">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full min-w-[800px]">
            <thead className="bg-maroon text-white">
              <tr>
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/20">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-cream-light transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={typeof product.images?.[0] === 'string' ? product.images?.[0] : product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-lg shadow-soft"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-charcoal">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-[10px] text-slate-500">SKU: {product.sku || '—'}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {product.tags && product.tags.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100" title={`Tags: ${product.tags.join(', ')}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {product.tags.length}
                          </span>
                        )}
                        {(product.seoTitle || product.seoDescription) && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100" title="SEO Meta Data Configured">
                            <Globe className="w-3 h-3 mr-1" />
                            SEO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-maroon/10 text-maroon rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-maroon">৳{product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock}
                      </span>
                      <input
                        type="number"
                        className="w-20 px-3 py-2 border border-slate/20 rounded-lg text-sm"
                        value={stockDrafts[product._id] ?? product.stock}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                      />
                      <button
                        onClick={() => handleStockUpdate(product)}
                        className="px-3 py-2 bg-maroon text-white rounded-lg text-xs font-semibold hover:bg-maroon-light"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-3">
                      <button
                        className="p-2 hover:bg-maroon/10 rounded-lg transition-colors"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-5 w-5 text-maroon" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-scale-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col">
            <div className="flex justify-between items-center bg-maroon p-6 md:p-8 shrink-0">
              <div className="flex items-center space-x-3 text-white">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all hover:rotate-90"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="Handmade Pottery Vase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field w-full"
                    placeholder="RR-HPV-001"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Optional but recommended for inventory tracking</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Beautiful handcrafted pottery..."
                  />
                </div>

                {/* Price & Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate mb-2">Original Price (Main)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="input-field w-full"
                      placeholder="e.g. 2000"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Leave blank if same as selling price</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate mb-2 flex justify-between">
                      <span>Selling Price</span>
                      {getDiscountPercentage() > 0 && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          -{getDiscountPercentage()}% OFF
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field w-full bg-green-50/50 border-green-200 focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate mb-2">Stock Inventory</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field w-full"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate mb-2 flex justify-between items-center text-maroon">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Product Images (URLs or Upload)</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold transition-all shadow-sm ${getImageCount() > 0 ? 'bg-maroon text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {getImageCount()} Image{getImageCount() !== 1 ? 's' : ''} Added
                    </span>
                  </label>

                  <div className="relative group">
                    <textarea
                      required
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      className="input-field w-full font-mono text-xs focus:h-40 transition-all duration-300 pr-10"
                      rows="4"
                      placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
                    />
                    {formData.images && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, images: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Clear all URLs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
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
                      className="flex items-center gap-2 px-4 py-2 bg-maroon text-white hover:bg-maroon/90 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md active:scale-95"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploading ? 'Direct Upload' : 'Upload From Device'}
                    </button>
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        📌 Paste URLs OR use Upload to store image in MongoDB
                      </p>
                    </div>
                  </div>

                  {/* LIVE IMAGE PREVIEW GALLERY */}
                  {getImageCount() > 0 && (
                    <div className="mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ImageIcon className="h-3 w-3" />
                        Live Preview (Click ✖ to remove)
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {formData.images.split(/[,\n]/).filter(u => u.trim()).map((url, idx) => {
                          // Process for preview (handle GDrive etc)
                          let displayUrl = url.trim();
                          if (displayUrl.includes('drive.google.com')) {
                            const fileIdMatch = displayUrl.match(/\/file\/d\/([^\/]+)/) || displayUrl.match(/id=([^\&]+)/);
                            if (fileIdMatch && fileIdMatch[1]) {
                              displayUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                            }
                          }

                          return (
                            <div key={idx} className="relative group h-20 w-20 flex-shrink-0 animate-in fade-in zoom-in duration-300">
                              <img
                                src={displayUrl}
                                alt={`Preview ${idx + 1}`}
                                className={`h-full w-full object-cover rounded-xl border-2 transition-all ${idx === 0 ? 'border-maroon ring-2 ring-maroon/20' : 'border-white'} shadow-sm group-hover:shadow-md`}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150?text=Invalid';
                                  e.target.className += ' grayscale';
                                }}
                              />
                              {idx === 0 && (
                                <span className="absolute -top-2 -left-2 bg-maroon text-[8px] text-white font-black px-1.5 py-0.5 rounded-full shadow-lg">MAIN</span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const urls = formData.images.split(/[,\n]/).map(u => u.trim()).filter(Boolean);
                                  urls.splice(idx, 1);
                                  setFormData({ ...formData, images: urls.join('\n') });
                                }}
                                className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow-lg border border-red-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold text-maroon mb-4 flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <div className="bg-maroon/10 p-1.5 rounded-lg">
                      <Settings className="h-5 w-5 text-maroon" />
                    </div>
                    <span>SEO & Search Optimization 🚀</span>
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <Tag className="h-4 w-4 mr-2 text-maroon" />
                        Search Tags (Keywords)
                        <span className="text-xs font-normal text-slate-500 ml-auto bg-white px-2 py-1 rounded border border-slate-200">
                          Separated by commas
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="input-field w-full"
                        placeholder="e.g. gift, handmade, birthday"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                          <Globe className="h-4 w-4 mr-2 text-maroon" />
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          className="input-field w-full"
                          placeholder={formData.name || "Product Name"}
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                          <Search className="h-4 w-4 mr-2 text-maroon" />
                          Meta Description
                        </label>
                        <textarea
                          value={formData.seoDescription}
                          onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                          className="input-field w-full"
                          rows="2"
                          placeholder="Short summary for Google search results..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-100 mt-6">
                  <button type="submit" className="btn-primary flex-1 py-4 text-lg">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="btn-secondary flex-1 py-4 text-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default AdminProducts;
