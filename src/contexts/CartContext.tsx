// CartContext — mengelola produk yang ditambahkan ke pesanan
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Produk } from '@/types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalHarga: number;
  addItem: (produk: Produk, qty?: number) => void;
  removeItem: (produkId: number) => void;
  updateQty: (produkId: number, qty: number) => void;
  clearCart: () => void;
  isInCart: (produkId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LS_KEY = 'ecatalog_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage saat mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // Sync ke localStorage setiap perubahan
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((produk: Produk, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.produk.id === produk.id);
      if (existing) {
        return prev.map(i =>
          i.produk.id === produk.id
            ? { ...i, qty: Math.min(i.qty + qty, produk.stok) }
            : i
        );
      }
      return [...prev, { produk, qty: Math.min(qty, produk.stok) }];
    });
  }, []);

  const removeItem = useCallback((produkId: number) => {
    setItems(prev => prev.filter(i => i.produk.id !== produkId));
  }, []);

  const updateQty = useCallback((produkId: number, qty: number) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(i => i.produk.id !== produkId);
      return prev.map(i =>
        i.produk.id === produkId
          ? { ...i, qty: Math.min(qty, i.produk.stok) }
          : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((produkId: number) =>
    items.some(i => i.produk.id === produkId), [items]);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalHarga = items.reduce((s, i) => {
    const harga = i.produk.harga_promo ?? i.produk.harga_normal;
    return s + harga * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalHarga, addItem, removeItem, updateQty, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus digunakan di dalam CartProvider');
  return ctx;
}
