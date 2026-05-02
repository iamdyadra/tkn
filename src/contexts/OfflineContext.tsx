// OfflineContext — simulasi offline mode dan sync pesanan
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { pesananApi } from '@/lib/api';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  lastSynced: Date | null;
  hasPendingSync: boolean;
  triggerSync: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const QUEUE_KEY_PESANAN = 'tkn_offline_orders';
const LAST_SYNCED_KEY = 'tkn_last_synced';

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    const stored = localStorage.getItem(LAST_SYNCED_KEY);
    return stored ? new Date(stored) : null;
  });
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check pending status
  const checkPending = useCallback(() => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]');
    setHasPendingSync(queue.length > 0);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Koneksi pulih. Mulai sinkronisasi pesanan offline...');
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Koneksi terputus. Beralih ke Mode Offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkPending();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkPending]);

  const triggerSync = useCallback(async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);
    try {
      await pesananApi.syncOfflinePending();
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem(LAST_SYNCED_KEY, now.toISOString());
      checkPending(); // Re-check if everything sent
      if (!hasPendingSync) {
        toast.success('Semua pesanan offline berhasil disinkronkan.');
      }
    } catch (e) {
      console.error('Sync gagal:', e);
      toast.error('Gagal menyinkronkan beberapa pesanan.');
    } finally {
      setSyncing(false);
    }
  }, [syncing, checkPending, hasPendingSync]);

  return (
    <OfflineContext.Provider value={{ isOnline, lastSynced, hasPendingSync, triggerSync }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline harus digunakan di dalam OfflineProvider');
  return ctx;
}
