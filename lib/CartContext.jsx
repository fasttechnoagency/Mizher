import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'mizher_cart_items';

function loadStoredItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredItems); // { product, quantity }

  // Persist cart so it survives page redirects (e.g. hosted payment checkout)
  // and is only cleared once an order is actually placed successfully.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + qty }
          : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Group by retailer
  const byRetailer = items.reduce((acc, i) => {
    const rid = i.product.retailer_id;
    if (!acc[rid]) acc[rid] = { retailer_name_en: i.product.retailer_name_en, retailer_name_ar: i.product.retailer_name_ar, items: [] };
    acc[rid].items.push(i);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count, byRetailer }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}