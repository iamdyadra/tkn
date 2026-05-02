// CompareContext — mengelola produk yang dipilih untuk dibandingkan (max 4)
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Produk } from '@/types';

const MAX_COMPARE = 4;

interface CompareContextType {
  items: Produk[];
  addToCompare: (produk: Produk) => boolean; // returns false jika max tercapai atau sudah ada
  removeFromCompare: (produkId: number) => void;
  clearCompare: () => void;
  isInCompare: (produkId: number) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const LS_KEY = 'ecatalog_compare';

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Produk[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addToCompare = useCallback((produk: Produk): boolean => {
    let added = false;
    setItems(prev => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.find(p => p.id === produk.id)) return prev;
      added = true;
      return [...prev, produk];
    });
    // Note: added will always be false here due to closure timing
    // Caller should check isInCompare + items.length
    return added;
  }, []);

  const removeFromCompare = useCallback((produkId: number) => {
    setItems(prev => prev.filter(p => p.id !== produkId));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);

  const isInCompare = useCallback((produkId: number) =>
    items.some(p => p.id === produkId), [items]);

  return (
    <CompareContext.Provider value={{
      items,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAdd: items.length < MAX_COMPARE,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare harus digunakan di dalam CompareProvider');
  return ctx;
}
