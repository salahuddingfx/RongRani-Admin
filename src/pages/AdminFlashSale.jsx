import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Plus, Trash2, Calendar, Search, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFlashSale = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSaleId, setEditingSaleId] = useState(null);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        products: []
    });

    // Product Selection State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [discountPrice, setDiscountPrice] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');

    const getImageUrl = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value.url) return value.url;
        return '';
    };

    const toLocalInputValue = (dateValue) => {
        if (!dateValue) return '';
        const local = new Date(dateValue);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 16);
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
            name: selectedProduct.name, // Temporary for display
            image: getImageUrl(selectedProduct.images?.[0]) || getImageUrl(selectedProduct.image),
            originalPrice: selectedProduct.price,
            discountPrice: Number(discountPrice),
            totalQuantity: Number(totalQuantity)
        };

        setFormData(prev => ({
            ...prev,
            products: [...prev.products, newProductItem]
        }));

        // Reset inputs
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
            // Check current active sale
            // Pass only necessary product data
            // Convert picked local times to actual date objects for proper timezone handling
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
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
            setFormData({ name: '', startTime: '', endTime: '', products: [] });
            setEditingSaleId(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create flash sale');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this flash sale?')) return;
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
        setFormData({
            name: sale.name || '',
            startTime: toLocalInputValue(sale.startTime),
            endTime: toLocalInputValue(sale.endTime),
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-maroon flex items-center gap-2">
                    <Zap className="fill-maroon" /> Flash Sale Manager
                </h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-maroon text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-maroon-dark transition-colors"
                >
                    <Plus className="w-5 h-5" /> Create New Sale
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-charcoal">Create Flash Sale</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-maroon"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Eid Flash Sale"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Product Selector */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-lg mb-4">Add Products</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-1 relative">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Search Product</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full border border-slate-300 rounded-lg p-2 pl-8"
                                                placeholder="Type name..."
                                                value={searchTerm}
                                                onChange={handleSearchProduct}
                                            />
                                            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-3" />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto z-10 border border-slate-100">
                                                {searchResults.map(p => (
                                                    <div
                                                        key={p._id}
                                                        className="p-2 hover:bg-cream-light cursor-pointer flex items-center gap-2"
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setSearchTerm(p.name);
                                                            setSearchResults([]);
                                                        }}
                                                    >
                                                        <img src={p.images[0]?.url} className="w-8 h-8 rounded object-cover" alt="" />
                                                        <div className="text-sm">
                                                            <p className="font-bold truncate">{p.name}</p>
                                                            <p className="text-xs text-slate-500">Stock: {p.stock}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Discount Price (৳)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-slate-300 rounded-lg p-2"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            placeholder="Example: 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Flash Sale Qty</label>
                                        <input
                                            type="number"
                                            className="w-full border border-slate-300 rounded-lg p-2"
                                            value={totalQuantity}
                                            onChange={(e) => setTotalQuantity(e.target.value)}
                                            placeholder="Example: 50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="bg-maroon text-white p-2 rounded-lg font-bold hover:bg-maroon-dark"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Added Products List */}
                            {formData.products.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-sm text-slate-500">Selected Products ({formData.products.length})</h3>
                                    {formData.products.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                                <div>
                                                    <p className="font-bold text-charcoal">{item.name}</p>
                                                    <div className="flex gap-4 text-sm text-slate-500">
                                                        <span>Original: ৳{item.originalPrice}</span>
                                                        <span className="text-maroon font-bold">Deal: ৳{item.discountPrice}</span>
                                                        <span>Qty: {item.totalQuantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(idx)}
                                                className="text-red-500 p-2 hover:bg-red-50 rounded-full"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSaleId(null);
                                        setFormData({ name: '', startTime: '', endTime: '', products: [] });
                                    }}
                                    className="px-6 py-2 text-slate-500 font-bold hover:text-charcoal mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-maroon text-white px-8 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                                >
                                    {editingSaleId ? 'Save Changes' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            ? (sale.isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')
                            : 'bg-slate-100 text-slate-500';

                    return (
                    <div key={sale._id} className={`bg-white rounded-2xl p-6 border-2 ${sale.isActive && !isExpired ? 'border-maroon' : 'border-slate-200'} shadow-lg relative`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-charcoal">{sale.name}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusClasses}`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <div className="bg-maroon/10 p-2 rounded-full">
                                <Zap className="w-6 h-6 text-maroon" />
                            </div>
                        </div>

                        <div className="space-y-2 mb-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Start: {new Date(sale.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>End: {new Date(sale.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>

                        <div className="flex -space-x-2 overflow-hidden mb-4">
                            {sale.products.slice(0, 5).map((p, i) => (
                                <img
                                    key={i}
                                    src={getImageUrl(p.product?.images?.[0]) || getImageUrl(p.image) || 'https://via.placeholder.com/50'}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                    alt=""
                                />
                            ))}
                            {sale.products.length > 5 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 text-xs font-bold text-slate-500">
                                    +{sale.products.length - 5}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 items-center">
                            <button
                                onClick={() => toggleStatus(sale)}
                                disabled={isExpired}
                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-colors ${sale.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {sale.isActive ? 'Deactivate' : 'Activate Ahora'}
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(sale)}
                                    className="text-slate-400 hover:text-maroon p-2 transition-colors"
                                    title="Edit Campaign"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(sale._id)}
                                    className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                    title="Delete Campaign"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>

            {!loading && flashSales.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-bold">No Active Flash Sales</p>
                    <p>Create one to boost your sales!</p>
                </div>
            )}
        </div>
    );
};

export default AdminFlashSale;
