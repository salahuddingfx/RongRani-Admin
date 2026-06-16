import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const getImageUrl = (imageValue) => {
    if (!imageValue) return '';
    if (typeof imageValue === 'string') return imageValue;
    if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
    return '';
  };

  const [cartItems, setCartItems] = useState(() => {
    try {
      // Load cart from localStorage on mount
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      return parsedCart.map((item) => {
        const normalizedImage = typeof item.image === 'object' && item.image?.url
          ? item.image.url
          : item.image;
        return { ...item, image: normalizedImage };
      });
    } catch (e) {
      console.warn('LocalStorage not available for cart:', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Use useMemo for derived state to avoid setState in useEffect
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);


  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const productId = product._id || product.id;
      const existingItem = prevItems.find(item => item.userId === productId || item.id === productId);

      const availableStock = product.stock || 0;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
          // Optionally show toast/alert here, but context usually doesn't do UI
          // For now, cap at max stock
          return prevItems.map(item =>
            (item.userId === productId || item.id === productId)
              ? { ...item, quantity: availableStock, stock: availableStock }
              : item
          );
        }

        return prevItems.map(item =>
          (item.userId === productId || item.id === productId)
            ? { ...item, quantity: newQuantity, stock: availableStock }
            : item
        );
      } else {
        if (quantity > availableStock) {
          quantity = availableStock;
        }

        const primaryImage = getImageUrl(product.images?.[0]) || getImageUrl(product.image);

        return [...prevItems, {
          id: productId,
          slug: product.slug,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: primaryImage || 'https://via.placeholder.com/100',
          category: product.category,
          quantity,
          stock: availableStock // Store stock info
        }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          // Check stock limit if available
          const maxStock = item.stock || 100; // Default high if no stock info
          const validQuantity = Math.min(quantity, maxStock);
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  // Clear cart after order placement
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  /* Optimization: Memoize the context value to prevent unnecessary re-renders */
  const value = useMemo(() => ({
    cartItems,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    openCart,
    closeCart
  }), [cartItems, totalItems, totalPrice, isCartOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};