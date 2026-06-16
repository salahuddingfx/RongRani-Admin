import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sparkles, MessageSquare, Mic, ShoppingBag, BarChart2 } from 'lucide-react';

const AdminAI = () => {
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    // Description Generation State
    const [descForm, setDescForm] = useState({
        productName: '',
        category: '',
        features: '',
        targetAudience: ''
    });

    // Marketing Content State
    const [marketingForm, setMarketingForm] = useState({
        contentType: 'social_media_post',
        productName: '',
        description: '',
        targetAudience: '',
        platform: 'Instagram'
    });

    // Feedback Analysis State
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

    return (
        <div className="container mx-auto px-4 py-8 reveal">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="mr-2 text-maroon" /> AI Studio
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs - Horizontal on mobile, Vertical on Desktop */}
                <div className="lg:w-1/4">
                    <div className="bg-white rounded-xl shadow-md p-4 lg:h-fit sticky top-24 overflow-x-auto flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-2 whitespace-nowrap">
                        <button
                            onClick={() => { setActiveTab('description'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'description' ? 'bg-maroon text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <ShoppingBag className="w-5 h-5 mr-0 lg:mr-3" />
                            <span className="hidden lg:inline">Product Description</span>
                            <span className="lg:hidden ml-2">Description</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('marketing'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'marketing' ? 'bg-maroon text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <Mic className="w-5 h-5 mr-0 lg:mr-3" />
                            <span className="hidden lg:inline">Marketing Content</span>
                            <span className="lg:hidden ml-2">Marketing</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('feedback'); setResult(''); }}
                            className={`flex-shrink-0 px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'feedback' ? 'bg-maroon text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <MessageSquare className="w-5 h-5 mr-0 lg:mr-3" />
                            <span className="hidden lg:inline">Feedback Analysis</span>
                            <span className="lg:hidden ml-2">Feedback</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:w-3/4">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        {activeTab === 'description' && (
                            <form onSubmit={handleDescSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">Generate Product Description</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={descForm.productName}
                                        onChange={e => setDescForm({ ...descForm, productName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={descForm.category}
                                        onChange={e => setDescForm({ ...descForm, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Key Features (comma separated)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={descForm.features}
                                        onChange={e => setDescForm({ ...descForm, features: e.target.value })}
                                        placeholder="Handmade, Organic, cotton..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={descForm.targetAudience}
                                        onChange={e => setDescForm({ ...descForm, targetAudience: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 flex justify-center items-center">
                                    {loading ? <Sparkles className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    Generate
                                </button>
                            </form>
                        )}

                        {activeTab === 'marketing' && (
                            <form onSubmit={handleMarketingSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">Generate Marketing Content</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content Type</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                            value={marketingForm.contentType}
                                            onChange={e => setMarketingForm({ ...marketingForm, contentType: e.target.value })}
                                        >
                                            <option value="social_media_post">Social Media Post</option>
                                            <option value="email_campaign">Email Campaign</option>
                                            <option value="ad_copy">Ad Copy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Platform</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                            value={marketingForm.platform}
                                            onChange={e => setMarketingForm({ ...marketingForm, platform: e.target.value })}
                                            placeholder="Instagram, Facebook, Email..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={marketingForm.productName}
                                        onChange={e => setMarketingForm({ ...marketingForm, productName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Description</label>
                                    <textarea
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={marketingForm.description}
                                        onChange={e => setMarketingForm({ ...marketingForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={marketingForm.targetAudience}
                                        onChange={e => setMarketingForm({ ...marketingForm, targetAudience: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 flex justify-center items-center">
                                    {loading ? <Sparkles className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    Generate
                                </button>
                            </form>
                        )}

                        {activeTab === 'feedback' && (
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">Analyze Feedback</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer Feedback</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={feedbackForm.feedback}
                                        onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                                        placeholder="Paste customer review or feedback here..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-maroon focus:ring focus:ring-maroon/20 p-2 border"
                                        value={feedbackForm.rating}
                                        onChange={e => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 flex justify-center items-center">
                                    {loading ? <Sparkles className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    Analyze
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Result Area */}
                    {result && (
                        <div className="bg-white rounded-xl shadow-md p-6 reveal-visible animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Generated Result</h3>
                                <button
                                    onClick={copyToClipboard}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-96 whitespace-pre-wrap">
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
