import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sparkles, MessageSquare, Mic, ShoppingBag } from 'lucide-react';

const AdminAI = () => {
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const [descForm, setDescForm] = useState({
        productName: '',
        category: '',
        features: '',
        targetAudience: ''
    });

    const [marketingForm, setMarketingForm] = useState({
        contentType: 'social_media_post',
        productName: '',
        description: '',
        targetAudience: '',
        platform: 'Instagram'
    });

    const [feedbackForm, setFeedbackForm] = useState({
        feedback: '',
        rating: 5
    });

    const handleDescSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/generate-description', {
                ...descForm,
                features: descForm.features.split(',').map(f => f.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data.description);
            toast.success('Description generated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate description');
        } finally {
            setLoading(false);
        }
    };

    const handleMarketingSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/generate-content', {
                contentType: marketingForm.contentType,
                product: {
                    name: marketingForm.productName,
                    description: marketingForm.description
                },
                targetAudience: marketingForm.targetAudience,
                platform: marketingForm.platform
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data.content);
            toast.success('Content generated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/analyze-feedback', feedbackForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(JSON.stringify(response.data, null, 2));
            toast.success('Analysis complete!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze feedback');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        toast.success('Copied to clipboard!');
    };

    const inputClass = "w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon";

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-maroon" />
                        AI Studio
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Generate content with AI assistance</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-2 lg:sticky lg:top-24 flex lg:flex-row flex-row overflow-x-auto lg:flex-col gap-1">
                        <button
                            onClick={() => { setActiveTab('description'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-colors ${
                                activeTab === 'description'
                                    ? 'bg-maroon text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Product Description
                        </button>
                        <button
                            onClick={() => { setActiveTab('marketing'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-colors ${
                                activeTab === 'marketing'
                                    ? 'bg-maroon text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Mic className="w-4 h-4" />
                            Marketing Content
                        </button>
                        <button
                            onClick={() => { setActiveTab('feedback'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-colors ${
                                activeTab === 'feedback'
                                    ? 'bg-maroon text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Feedback Analysis
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5 mb-5">
                        {activeTab === 'description' && (
                            <form onSubmit={handleDescSubmit} className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Generate Product Description</h2>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        value={descForm.productName}
                                        onChange={e => setDescForm({ ...descForm, productName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        value={descForm.category}
                                        onChange={e => setDescForm({ ...descForm, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Key Features (comma separated)</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={descForm.features}
                                        onChange={e => setDescForm({ ...descForm, features: e.target.value })}
                                        placeholder="Handmade, Organic, cotton..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target Audience</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={descForm.targetAudience}
                                        onChange={e => setDescForm({ ...descForm, targetAudience: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                    {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Generate
                                </button>
                            </form>
                        )}

                        {activeTab === 'marketing' && (
                            <form onSubmit={handleMarketingSubmit} className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Generate Marketing Content</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Content Type</label>
                                        <select
                                            className={inputClass}
                                            value={marketingForm.contentType}
                                            onChange={e => setMarketingForm({ ...marketingForm, contentType: e.target.value })}
                                        >
                                            <option value="social_media_post">Social Media Post</option>
                                            <option value="email_campaign">Email Campaign</option>
                                            <option value="ad_copy">Ad Copy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Platform</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={marketingForm.platform}
                                            onChange={e => setMarketingForm({ ...marketingForm, platform: e.target.value })}
                                            placeholder="Instagram, Facebook, Email..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        value={marketingForm.productName}
                                        onChange={e => setMarketingForm({ ...marketingForm, productName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Product Description</label>
                                    <textarea
                                        rows="3"
                                        className={inputClass}
                                        value={marketingForm.description}
                                        onChange={e => setMarketingForm({ ...marketingForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target Audience</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={marketingForm.targetAudience}
                                        onChange={e => setMarketingForm({ ...marketingForm, targetAudience: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                    {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Generate
                                </button>
                            </form>
                        )}

                        {activeTab === 'feedback' && (
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Analyze Feedback</h2>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Customer Feedback</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className={inputClass}
                                        value={feedbackForm.feedback}
                                        onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                                        placeholder="Paste customer review or feedback here..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Rating (1-5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        className={inputClass}
                                        value={feedbackForm.rating}
                                        onChange={e => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-maroon text-white rounded-lg font-medium text-sm hover:bg-maroon/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                    {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Analyze
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Result Area */}
                    {result && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Generated Result</h3>
                                <button
                                    onClick={copyToClipboard}
                                    className="text-xs font-medium px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 overflow-auto max-h-96 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAI;
