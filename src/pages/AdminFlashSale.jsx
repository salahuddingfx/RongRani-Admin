import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Plus, Trash2, Calendar, Search, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminFlashSale = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSaleId, setEditingSaleId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        isActive: true,
        products: []
    });

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [discountPrice, setDiscountPrice] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');

    const getImageUrl = (value) => {
        if (!value) return '';
        let url = '';
        if (typeof value === 'string') {
            url = value;
        } else if (typeof value === 'object') {
            url = value.url || value.secure_url || '';
        }
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        if (url.includes('/api/images/')) {
            const parts = url.split('/api/images/');
            const imageId = parts[parts.length - 1];
            return `/api/images/${imageId}`;
        }
        return url;
    };

    const toLocalInputValue = (dateValue) => {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/flash-sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFlashSales(res.data.flashSales || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products?limit=100');
            setProducts(res.data.products || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearchProduct = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 1) {
            const results = products.filter(p =>
                p.name.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddProduct = () => {
        if (!selectedProduct || !discountPrice || !totalQuantity) {
            toast.error('Please fill all product fields');
            return;
        }

        const newProductItem = {
            product: selectedProduct._id,
            name: selectedProduct.name,
            image: getImageUrl(selectedProduct.images?.[0]) || getImageUrl(selectedProduct.image),
            originalPrice: selectedProduct.price,
            discountPrice: Number(discountPrice),
            totalQuantity: Number(totalQuantity)
        };

        setFormData(prev => ({
            ...prev,
            products: [...prev.products, newProductItem]
        }));

        setSelectedProduct(null);
        setDiscountPrice('');
        setTotalQuantity('');
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleRemoveProduct = (index) => {
        const newProducts = [...formData.products];
        newProducts.splice(index, 1);
        setFormData({ ...formData, products: newProducts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                isActive: formData.isActive,
                products: formData.products.map(p => ({
                    product: p.product,
                    discountPrice: p.discountPrice,
                    totalQuantity: p.totalQuantity
                }))
            };

            if (editingSaleId) {
                await axios.put(`/api/flash-sales/${editingSaleId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/flash-sales', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            toast.success(editingSaleId ? 'Flash Sale Updated Successfully!' : 'Flash Sale Created Successfully!');
            setShowForm(false);
            fetchFlashSales();
            setFormData({ name: '', startTime: '', endTime: '', isActive: true, products: [] });
            setEditingSaleId(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create flash sale');
        }
    };

    const handleDelete = async (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Flash Sale?',
            message: 'Are you sure you want to delete this flash sale?',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`/api/flash-sales/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Flash Sale Deleted');
                    fetchFlashSales();
                } catch (_) {
                    toast.error('Failed to delete');
                }
            }
        });
    };

    const toggleStatus = async (sale) => {
        if (new Date(sale.endTime) < new Date()) {
            toast.error('This campaign has already ended. Update dates to reactivate.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/flash-sales/${sale._id}`, {
                isActive: !sale.isActive
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Campaign ${!sale.isActive ? 'Activated' : 'Deactivated'}`);
            fetchFlashSales();
        } catch (_) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (sale) => {
        setEditingSaleId(sale._id);
        setShowForm(true);
        const isExpired = new Date(sale.endTime) < new Date();
        setFormData({
            name: sale.name || '',
            startTime: toLocalInputValue(sale.startTime),
            endTime: toLocalInputValue(sale.endTime),
            isActive: isExpired ? true : (sale.isActive !== undefined ? sale.isActive : true),
            products: (sale.products || []).map((p) => ({
                product: p.product?._id || p.product,
                name: p.product?.name || p.name,
                image: getImageUrl(p.product?.images?.[0]) || getImageUrl(p.image),
                originalPrice: p.product?.price || p.originalPrice || 0,
                discountPrice: p.discountPrice,
                totalQuantity: p.totalQuantity,
            })),
        });
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Zap className="h-6 w-6 text-maroon" />
                        Flash Sale Manager
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage flash sale campaigns</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create New Sale
                </button>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                {editingSaleId ? 'Edit Flash Sale' : 'Create Flash Sale'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Campaign Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Eid Flash Sale"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Campaign Status</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${formData.isActive ? 'bg-maroon' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {formData.isActive ? 'Active / Scheduled' : 'Paused / Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Product Selector */}
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">Add Products</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <div className="md:col-span-1 relative">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Search Product</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 pl-8 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                                placeholder="Type name..."
                                                value={searchTerm}
                                                onChange={handleSearchProduct}
                                            />
                                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg mt-1 max-h-48 overflow-y-auto z-10 border border-slate-200 dark:border-slate-600">
                                                {searchResults.map(p => (
                                                    <div
                                                        key={p._id}
                                                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setSearchTerm(p.name);
                                                            setSearchResults([]);
                                                        }}
                                                    >
                                                        <img src={getImageUrl(p.images?.[0]) || getImageUrl(p.image)} className="w-8 h-8 rounded object-cover" alt="" />
                                                        <div className="text-sm">
                                                            <p className="font-medium text-slate-800 dark:text-white truncate">{p.name}</p>
                                                            <p className="text-xs text-slate-400">Stock: {p.stock}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Discount Price (৳)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            placeholder="500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Flash Sale Qty</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                                            value={totalQuantity}
                                            onChange={(e) => setTotalQuantity(e.target.value)}
                                            placeholder="50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="px-4 py-2 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Added Products List */}
                            {formData.products.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-sm text-slate-500">Selected Products ({formData.products.length})</h3>
                                    {formData.products.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={getImageUrl(item.image)} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                <div>
                                                    <p className="font-medium text-sm text-slate-800 dark:text-white">{item.name}</p>
                                                    <div className="flex gap-3 text-xs text-slate-500">
                                                        <span>Original: ৳{item.originalPrice}</span>
                                                        <span className="text-maroon font-medium">Deal: ৳{item.discountPrice}</span>
                                                        <span>Qty: {item.totalQuantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(idx)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSaleId(null);
                                        setFormData({ name: '', startTime: '', endTime: '', isActive: true, products: [] });
                                    }}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors"
                                >
                                    {editingSaleId ? 'Save Changes' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashSales.map(sale => {
                    const now = new Date();
                    const start = new Date(sale.startTime);
                    const end = new Date(sale.endTime);
                    const isExpired = end < now;
                    const isLive = start <= now && end >= now;
                    const statusLabel = isExpired
                        ? 'Expired'
                        : isLive
                            ? (sale.isActive ? 'Active' : 'Paused')
                            : (sale.isActive ? 'Scheduled' : 'Inactive');

                    const statusClasses = isExpired
                        ? 'bg-red-50 text-red-600'
                        : isLive
                            ? (sale.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')
                            : 'bg-slate-100 text-slate-500';

                    return (
                    <div key={sale._id} className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 ${sale.isActive && !isExpired ? 'ring-1 ring-maroon/30' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white">{sale.name}</h3>
                                <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusClasses}`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <div className="p-2 bg-maroon/10 rounded-lg">
                                <Zap className="w-4 h-4 text-maroon" />
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Start: {new Date(sale.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>End: {new Date(sale.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>

                        <div className="flex -space-x-2 overflow-hidden mb-4">
                            {sale.products.slice(0, 5).map((p, i) => (
                                <img
                                    key={i}
                                    src={getImageUrl(p.product?.images?.[0]) || getImageUrl(p.image) || 'https://via.placeholder.com/50'}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                                    alt=""
                                />
                            ))}
                            {sale.products.length > 5 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-500">
                                    +{sale.products.length - 5}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 items-center">
                            <button
                                onClick={() => toggleStatus(sale)}
                                disabled={isExpired}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${sale.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {sale.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEdit(sale)}
                                    className="p-1.5 text-slate-400 hover:text-maroon hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Edit Campaign"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(sale._id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Campaign"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>

            {!loading && flashSales.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-12 text-center">
                    <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No Active Flash Sales</p>
                    <p className="text-sm text-slate-400 mt-1">Create one to boost your sales!</p>
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

export default AdminFlashSale;
