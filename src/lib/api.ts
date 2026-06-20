// API Service Layer — E-Catalogue terhubung dengan Backend PHP
// Semua konfigurasi endpoint dan cache key terpusat di: src/config/env.ts

import type { User, Produk, Kategori, Pesanan, PesananStatus, Komisi, KomisiRule, KomisiSummary } from '@/types';
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
    if (endpoint === ENDPOINTS.produk.aktif || endpoint === ENDPOINTS.produk.index) {
      const cached = localStorage.getItem(CACHE_KEY_PRODUK);
      if (cached) return JSON.parse(cached);
    }
    if (endpoint === ENDPOINTS.kategori.index) {
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
      if (endpoint === ENDPOINTS.produk.aktif || endpoint === ENDPOINTS.produk.index) {
        const cached = localStorage.getItem(CACHE_KEY_PRODUK);
        if (cached) return JSON.parse(cached);
      }
      if (endpoint === ENDPOINTS.kategori.index) {
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
    // Ambil data dari queue offline terlebih dahulu
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]') as Pesanan[];
    const offlinePesanan: Pesanan[] = queue.map((p, idx: number) => ({
      ...p,
      id: -1 - idx,
      kode: p.kode || `OFF-PENDING-${Date.now()}-${idx}`,
      status: 'draft' as const,
      created_at: p.created_at || new Date().toISOString(),
      items: p.items || [],
    }));

    if (!navigator.onLine) {
      return offlinePesanan;
    }

    try {
      const onlineData = await apiCall<Pesanan[]>(ENDPOINTS.pesanan.bySales(salesId));
      return [...offlinePesanan, ...onlineData];
    } catch (err) {
      console.error('Gagal mengambil data pesanan online, tampilkan offline saja:', err);
      return offlinePesanan;
    }
  },

  async getByKode(kode: string): Promise<Pesanan | undefined> {
    return apiCall<Pesanan>(ENDPOINTS.pesanan.byKode(kode)).catch(() => undefined);
  },

  async create(data: Omit<Pesanan, 'id' | 'kode' | 'status' | 'created_at'>): Promise<Pesanan> {
    if (!navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY_PESANAN) || '[]');
      const newOrder: Pesanan = {
        ...data,
        id: -1,
        kode: `OFFLINE-${Date.now()}`,
        status: 'draft',
        offline_pending: true,
        created_at: new Date().toISOString(),
      };
      queue.push(newOrder);
      localStorage.setItem(QUEUE_KEY_PESANAN, JSON.stringify(queue));
      return newOrder;
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

  async updateSales(id: number, data: { nama: string; email: string; telepon: string; wilayah: string }): Promise<User> {
    return apiCall<User>(ENDPOINTS.users.byId(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSales(id: number): Promise<void> {
    await apiCall<void>(ENDPOINTS.users.byId(id), { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
// KOMISI API
// ═══════════════════════════════════════════════════════════════
export const komisiApi = {
  async getAll(): Promise<Komisi[]> {
    return apiCall<Komisi[]>(ENDPOINTS.komisi.index);
  },

  async getBySales(salesId: number): Promise<Komisi[]> {
    return apiCall<Komisi[]>(ENDPOINTS.komisi.bySales(salesId));
  },

  async getById(id: number): Promise<Komisi> {
    return apiCall<Komisi>(ENDPOINTS.komisi.byId(id));
  },

  async getSummary(salesId: number): Promise<KomisiSummary> {
    return apiCall<KomisiSummary>(ENDPOINTS.komisi.summary(salesId));
  },

  async updateStatus(id: number, status: string, catatan?: string): Promise<void> {
    await apiCall<void>(ENDPOINTS.komisi.byId(id), {
      method: 'PUT',
      body: JSON.stringify({ status, catatan: catatan ?? null }),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// KOMISI RULES API
// ═══════════════════════════════════════════════════════════════
export const komisiRulesApi = {
  async getAll(): Promise<KomisiRule[]> {
    return apiCall<KomisiRule[]>(ENDPOINTS.komisi.rules);
  },

  async create(data: Omit<KomisiRule, 'id' | 'created_at' | 'kategori_nama'>): Promise<KomisiRule> {
    return apiCall<KomisiRule>(ENDPOINTS.komisi.rules, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<KomisiRule>): Promise<void> {
    await apiCall<void>(ENDPOINTS.komisi.ruleById(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    await apiCall<void>(ENDPOINTS.komisi.ruleById(id), { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD API
// ═══════════════════════════════════════════════════════════════

export interface DashboardStats {
  total_produk_aktif: number;
  total_pesanan: number;
  pesanan_by_status: Record<string, number>;
  pesanan_hari_ini: number;
  total_sales_aktif: number;
  total_komisi_pending: number;
  total_kategori: number;
  pesanan_per_bulan: { bulan: string; jumlah: number; nilai: number }[];
  top_produk: { nama: string; sku: string; total_qty: number; total_nilai: number }[];
  tahun: number;
}

export const dashboardApi = {
  async getStats(year?: number): Promise<DashboardStats> {
    const endpoint = year
      ? ENDPOINTS.dashboard.byYear(year)
      : ENDPOINTS.dashboard.index;
    return apiCall<DashboardStats>(endpoint);
  },
};
