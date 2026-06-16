import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook to calculate delivery charge from backend
 * Never calculates delivery locally - always uses backend values
 */
export const useDeliveryCalculation = () => {
  const [delivery, setDelivery] = useState({
    charge: 0,
    label: 'Calculating...',
    isFree: false,
    provider: 'STEADFAST',
    threshold: 2500,
    subtotal: 0,
    eligibleForFree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch delivery calculation from backend
   * @param {number} subtotal - Order subtotal
   * @param {string} district - Shipping district
   * @param {string} city - Shipping city
   */
  const fetchDelivery = useCallback(async (subtotal, district = '', city = '') => {
    if (typeof subtotal !== 'number' || subtotal < 0) {
      setError('Invalid subtotal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/orders/calc-delivery', {
        subtotal,
        district,
        city,
      });

      if (response.data && response.data.delivery) {
        setDelivery(response.data.delivery);
      }
    } catch (err) {
      console.error('Delivery calculation error:', err);
      // Fallback to safe defaults
      setDelivery((prev) => ({
        ...prev,
        charge: subtotal >= 2500 ? 0 : 150, // Safe default charge if backend fails
        threshold: 2500,
        eligibleForFree: subtotal >= 2500,
      }));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { delivery, loading, error, fetchDelivery };
};

export default useDeliveryCalculation;
