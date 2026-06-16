import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility to track recently viewed products
 * Call addToRecentlyViewed(product) when viewing a product
 */
export const addToRecentlyViewed = (product) => {
  if (!product || !product._id) return;

  try {
    const stored = localStorage.getItem('recentlyViewed');
    let recent = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    recent = recent.filter((p) => p._id !== product._id);

    // Add to beginning
    recent.unshift({
      _id: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category,
    });

    // Keep max 10 items
    recent = recent.slice(0, 10);

    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    
    // Dispatch event for RecentlyViewed component to update
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

/**
 * Auto scroll to top on route change
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
};

/**
 * Get recently viewed products
 */
export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem('recentlyViewed');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Clear recently viewed
 */
export const clearRecentlyViewed = () => {
  localStorage.removeItem('recentlyViewed');
  window.dispatchEvent(new Event('recentlyViewedUpdated'));
};

/**
 * Build product route parameter with slug fallback to id
 */
export const getProductRouteParam = (product) => {
  if (!product) return '';
  return product.slug || product._id || product.id || '';
};

/**
 * Build product detail page path from a product-like object
 */
export const getProductPath = (product) => {
  const param = getProductRouteParam(product);
  return param ? `/product/${param}` : '/shop';
};
