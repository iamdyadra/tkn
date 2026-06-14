/**
 * ─────────────────────────────────────────────────────────────────
 * KONFIGURASI TERPUSAT — TKN Travel E-Catalogue
 * ─────────────────────────────────────────────────────────────────
 *
 * Semua nilai diambil dari environment variables (.env / .env.production).
 * Untuk mengubah endpoint API atau base path:
 *   - Development : edit file .env
 *   - Production  : edit file .env.production lalu rebuild (npm run build)
 * ─────────────────────────────────────────────────────────────────
 */

// ── API ──────────────────────────────────────────────────────────
/** Base URL backend PHP. Contoh: http://localhost/tkn/api */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL;

// ── APP ──────────────────────────────────────────────────────────
/** Base path React Router. Harus sinkron dengan vite.config.ts → base */
export const APP_BASE_PATH: string =
  import.meta.env.VITE_APP_BASE_PATH ?? '/';

/** Nama tampilan aplikasi */
export const APP_NAME: string =
  import.meta.env.VITE_APP_NAME ?? 'TKN Travel E-Catalogue';

// ── CACHE KEYS ───────────────────────────────────────────────────
/** localStorage key untuk cache data produk (offline mode) */
export const CACHE_KEY_PRODUK = 'tkn_cache_produk';

/** localStorage key untuk cache data kategori (offline mode) */
export const CACHE_KEY_KATEGORI = 'tkn_cache_kategori';

/** localStorage key untuk antrian pesanan offline */
export const QUEUE_KEY_PESANAN = 'tkn_offline_orders';

// ── ENDPOINTS ────────────────────────────────────────────────────
/**
 * Daftar endpoint API yang tersedia.
 * Semua path relatif terhadap API_BASE_URL.
 */
export const ENDPOINTS = {
  auth: {
    login:    '/auth/login.php',
    register: '/auth/register.php',
  },
  produk: {
    index:  '/produk/index.php',
    aktif:  '/produk/index.php?is_aktif=1',
    promo:  '/produk/index.php?is_promo=1',
    byId:   (id: number) => `/produk/index.php?id=${id}`,
  },
  kategori: {
    index: '/kategori/index.php',
    byId:  (id: number) => `/kategori/index.php?id=${id}`,
  },
  pesanan: {
    index:    '/pesanan/index.php',
    bySales:  (salesId: number) => `/pesanan/index.php?sales_id=${salesId}`,
    byKode:   (kode: string)    => `/pesanan/index.php?kode=${kode}`,
    byId:     (id: number)      => `/pesanan/index.php?id=${id}`,
  },
  users: {
    index:    '/users/index.php',
    sales:    '/users/index.php?role=sales',
    byId:     (id: number) => `/users/index.php?id=${id}`,
  },
  komisi: {
    index:    '/komisi/index.php',
    bySales:  (salesId: number) => `/komisi/index.php?sales_id=${salesId}`,
    byId:     (id: number)      => `/komisi/index.php?id=${id}`,
    summary:  (salesId: number) => `/komisi/index.php?summary=1&sales_id=${salesId}`,
    rules:    '/komisi/rules.php',
    ruleById: (id: number)      => `/komisi/rules.php?id=${id}`,
  },
  dashboard: {
    index:       '/dashboard/index.php',
    byYear:      (year: number) => `/dashboard/index.php?year=${year}`,
  },
} as const;

