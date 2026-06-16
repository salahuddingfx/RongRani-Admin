import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchWishlist = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(response.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user, fetchWishlist]);

    const addToWishlist = async (product) => {
        if (!user) {
            toast.error('Please login to add items to wishlist');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/users/wishlist/${product._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(prev => [...prev.filter(i => i._id !== product._id), product]);
            toast.success('Added to wishlist ❤️');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(prev => prev.filter(item => item._id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    const toggleWishlist = async (product) => {
        if (isInWishlist(product._id)) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            refreshWishlist: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
