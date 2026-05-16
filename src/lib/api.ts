// API Service Layer — E-Catalogue terhubung dengan Backend PHP
// Semua konfigurasi endpoint dan cache key terpusat di: src/config/env.ts

import type { User, Produk, Kategori, Pesanan, PesananStatus } from '@/types';
import {
  API_BASE_URL,
  CACHE_KEY_PRODUK,
  CACHE_KEY_KATEGORI,
  QUEUE_KEY_PESANAN,
  ENDPOINTS,
} from '@/config/env';

// ─── Helper Fetch API ─────────────────────────────────────────
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';

  // Jika offline dan permintaan adalah GET, coba ambil dari cache
  if (!navigator.onLine && isGet) {
    if (endpoint.includes('/produk/')) {
      const cached = localStorage.getItem(CACHE_KEY_PRODUK);
      if (cached) return JSON.parse(cached);
    }
    if (endpoint.includes('/kategori/')) {
      const cached = localStorage.getItem(CACHE_KEY_KATEGORI);
      if (cached) return JSON.parse(cached);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (!data.success) {
      throw new Error(data.message || 'Error occurred');
    }

    // Simpan ke cache jika sukses dan ini adalah list produk/kategori
    if (isGet) {
      if (endpoint === ENDPOINTS.produk.aktif) {
        localStorage.setItem(CACHE_KEY_PRODUK, JSON.stringify(data.data));
      } else if (endpoint === ENDPOINTS.kategori.index) {
        localStorage.setItem(CACHE_KEY_KATEGORI, JSON.stringify(data.data));
      }
    }

    return data.data;
  } catch (err) {
    // Fallback terakhir jika fetch gagal (misal koneksi terputus saat request)
    if (isGet) {
      if (endpoint.includes('/produk/')) {
        const cached = localStorage.getItem(CACHE_KEY_PRODUK);
        if (cached) return JSON.parse(cached);
      }
      if (endpoint.includes('/kategori/')) {
        const cached = localStorage.getItem(CACHE_KEY_KATEGORI);
        if (cached) return JSON.parse(cached);
      }
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════
export const authApi = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      return await apiCall<User>(ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return null;
    }
  },

  async register(data: { nama: string; email: string; password: string; telepon: string; wilayah?: string }): Promise<User> {
    return apiCall<User>(ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// PRODUK API
// ═══════════════════════════════════════════════════════════════
export const produkApi = {
  async getAll(): Promise<Produk[]> {
    return apiCall<Produk[]>(ENDPOINTS.produk.aktif);
  },

  async getAllAdmin(): Promise<Produk[]> {
    return apiCall<Produk[]>(ENDPOINTS.produk.index);
  },

  async getById(id: number): Promise<Produk | undefined> {
    const list = await this.getAll();
    return list.find(p => p.id === id);
  },

  async getByKategori(kategoriId: number): Promise<Produk[]> {
    const list = await this.getAll();
    return list.filter(p => p.kategori_id === kategoriId);
  },

  async getPromo(): Promise<Produk[]> {
    return apiCall<Produk[]>(ENDPOINTS.produk.promo);
  },

  async create(data: Omit<Produk, 'id' | 'created_at'>): Promise<Produk> {
    return apiCall<Produk>(ENDPOINTS.produk.index, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Produk>): Promise<Produk> {
    return apiCall<Produk>(ENDPOINTS.produk.byId(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    await apiCall<void>(ENDPOINTS.produk.byId(id), { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
// KATEGORI API
// ═══════════════════════════════════════════════════════════════
export const kategoriApi = {
  async getAll(): Promise<Kategori[]> {
    return apiCall<Kategori[]>(ENDPOINTS.kategori.index);
  },

  async create(data: Omit<Kategori, 'id' | 'created_at'>): Promise<Kategori> {
    return apiCall<Kategori>(ENDPOINTS.kategori.index, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Kategori>): Promise<Kategori> {
    return apiCall<Kategori>(ENDPOINTS.kategori.byId(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    await apiCall<void>(ENDPOINTS.kategori.byId(id), { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
// PESANAN API
// ═══════════════════════════════════════════════════════════════
export const pesananApi = {
  async getAll(): Promise<Pesanan[]> {
    return apiCall<Pesanan[]>(ENDPOINTS.pesanan.index);
  },

  async getByUser(salesId: number): Promise<Pesanan[]> {
    const onlineData = navigator.onLine
      ? await apiCall<Pesanan[]>(ENDPOINTS.pesanan.bySales(salesId))
      : [];

    // Gabungkan dengan yang masih di queue offline
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]');
    const offlinePesanan = queue.map((p: any, idx: number) => ({
      ...p,
      id: -1 - idx,
      kode: p.kode || `OFF-PENDING-${Date.now()}-${idx}`,
      status: 'draft',
      created_at: new Date().toISOString(),
    }));

    return [...offlinePesanan, ...onlineData];
  },

  async getByKode(kode: string): Promise<Pesanan | undefined> {
    return apiCall<Pesanan>(ENDPOINTS.pesanan.byKode(kode)).catch(() => undefined);
  },

  async create(data: Omit<Pesanan, 'id' | 'kode' | 'status' | 'created_at'>): Promise<Pesanan> {
    if (!navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]');
      const newOrder = {
        ...data,
        kode: `OFFLINE-${Date.now()}`,
        status: 'draft',
        offline_pending: true,
        created_at: new Date().toISOString(),
      };
      queue.push(newOrder);
      localStorage.setItem(QUEUE_KEY_PESANAN, JSON.stringify(queue));
      return newOrder as any;
    }

    return apiCall<Pesanan>(ENDPOINTS.pesanan.index, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, status: PesananStatus): Promise<Pesanan> {
    return apiCall<Pesanan>(ENDPOINTS.pesanan.byId(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: number): Promise<void> {
    await apiCall<void>(ENDPOINTS.pesanan.byId(id), { method: 'DELETE' });
  },

  async syncOfflinePending(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline orders...`);
    const remaining = [];

    for (const item of queue) {
      try {
        await apiCall(ENDPOINTS.pesanan.index, {
          method: 'POST',
          body: JSON.stringify(item),
        });
      } catch (err) {
        console.error('Failed to sync order:', item.kode, err);
        remaining.push(item);
      }
    }

    localStorage.setItem(QUEUE_KEY_PESANAN, JSON.stringify(remaining));
  },
};

// ═══════════════════════════════════════════════════════════════
// USER (SALES) API
// ═══════════════════════════════════════════════════════════════
export const userApi = {
  async getSales(): Promise<User[]> {
    return apiCall<User[]>(ENDPOINTS.users.sales);
  },

  async getAll(): Promise<User[]> {
    return apiCall<User[]>(ENDPOINTS.users.index);
  },

  async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    return apiCall<User>(ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async setActive(id: number, is_aktif: boolean): Promise<User> {
    return apiCall<User>(ENDPOINTS.users.byId(id), {
      method: 'PUT',
      body: JSON.stringify({ is_aktif: is_aktif ? 1 : 0 }),
    });
  },
};
