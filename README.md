# TKN Travel E-Catalogue

Aplikasi **E-Catalogue & Sistem Manajemen Pesanan** berbasis web untuk Tim Sales TKN Travel. Dibangun dengan arsitektur **SPA (Single Page Application)** menggunakan React + TypeScript di frontend dan PHP native di backend (REST API).

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Alur Autentikasi & Otorisasi](#-alur-autentikasi--otorisasi)
- [Modul Frontend](#-modul-frontend)
- [REST API Backend](#-rest-api-backend)
- [Model Data](#-model-data)
- [Fitur Offline (PWA)](#-fitur-offline-pwa)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Instalasi & Development](#-instalasi--development)
- [Build & Deployment](#-build--deployment)
- [Database](#-database)

---

## ✨ Fitur Utama

| Fitur | Role |
|---|---|
| Landing page publik dengan hero, fitur, dan CTA | Semua |
| Login & Registrasi akun Sales | Semua |
| Katalog produk dengan filter & pencarian | Sales |
| Detail produk + galeri foto + spesifikasi | Sales |
| Bandingkan produk (side-by-side) | Sales |
| Halaman promo / produk diskon | Sales |
| Keranjang belanja (CartContext + localStorage) | Sales |
| Buat pesanan baru dengan stepper multi-langkah | Sales |
| Riwayat & detail pesanan | Sales |
| Komisi Sales — tracking pendapatan komisi | Sales |
| Dashboard ringkasan statistik | Admin |
| Manajemen produk (CRUD + foto) | Admin |
| Manajemen kategori produk | Admin |
| Manajemen pesanan & update status | Admin |
| Manajemen data Sales | Admin |
| Laporan penjualan & grafik | Admin |
| Manajemen aturan & pembayaran komisi | Admin |
| Mode Offline (PWA) + sinkronisasi otomatis | Sales |

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|---|---|---|
| React | 18.3 | UI library |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| React Router DOM | 6.30 | Client-side routing |
| TanStack Query | 5.83 | Server state management & caching |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui + Radix UI | — | Komponen UI aksesibel |
| Recharts | 2.15 | Grafik & visualisasi data |
| React Hook Form + Zod | — | Form management & validasi |
| Axios | 1.14 | HTTP client |
| Sonner | 1.7 | Toast notification |
| Lucide React | 0.462 | Icon set |
| date-fns | 3.6 | Manipulasi tanggal |

### Backend
| Teknologi | Fungsi |
|---|---|
| PHP (native) | REST API handler |
| MySQL / MariaDB | Database relasional |
| Apache (.htaccess) | URL rewriting & CORS |

### Infrastruktur
| Alat | Fungsi |
|---|---|
| Laragon | Local development server |
| Service Worker | PWA caching & offline support |
| localStorage | Offline order queue & auth persistence |

---

## 📁 Struktur Proyek

```
tkn/
├── 📄 index.html                  # Entry point HTML
├── 📄 sw.js                       # Service Worker (PWA)
├── 📄 vite.config.ts              # Konfigurasi Vite + base path
├── 📄 tailwind.config.ts          # Konfigurasi Tailwind CSS
├── 📄 tsconfig.json               # TypeScript config
├── 📄 package.json                # Dependensi & scripts npm
├── 📄 .htaccess                   # Apache: URL rewrite & CORS headers
├── 📄 .env                        # Environment development (Laragon lokal)
├── 📄 .env.production             # Environment production (VPS)
├── 📄 tkn.sql                     # Dump database lengkap
│
├── 📁 api/                        # ─── BACKEND PHP ───────────────────────
│   ├── 📁 config/
│   │   └── koneksi.php            # Koneksi PDO ke MySQL
│   ├── 📁 auth/
│   │   ├── login.php              # POST /api/auth/login
│   │   └── register.php           # POST /api/auth/register
│   ├── 📁 produk/
│   │   └── index.php              # GET/POST/PUT/DELETE /api/produk
│   ├── 📁 kategori/
│   │   └── index.php              # GET/POST/PUT/DELETE /api/kategori
│   ├── 📁 pesanan/
│   │   └── index.php              # GET/POST/PUT /api/pesanan
│   ├── 📁 komisi/
│   │   ├── index.php              # GET/POST /api/komisi
│   │   ├── rules.php              # GET/POST/PUT/DELETE /api/komisi/rules
│   │   ├── migrate.sql            # SQL migrasi tabel komisi v1
│   │   └── migrate_v2.sql         # SQL migrasi tabel komisi v2
│   └── 📁 users/
│       └── index.php              # GET/PUT /api/users (admin)
│
├── 📁 src/                        # ─── FRONTEND REACT ─────────────────────
│   ├── 📄 main.tsx                # Entry React + Service Worker registration
│   ├── 📄 App.tsx                 # Root component + routing + context wrappers
│   ├── 📄 App.css                 # Global app styles
│   ├── 📄 index.css               # Tailwind directives + CSS custom properties
│   │
│   ├── 📁 config/
│   │   └── env.ts                 # Membaca VITE_* env variables
│   │
│   ├── 📁 types/
│   │   └── index.ts               # Semua TypeScript interface & type global
│   │
│   ├── 📁 lib/
│   │   ├── api.ts                 # Semua fungsi API call (axios) — authApi, produkApi, dll.
│   │   └── utils.ts               # Utility: cn() (clsx + tailwind-merge)
│   │
│   ├── 📁 data/
│   │   └── mockData.ts            # Data mock untuk development/fallback
│   │
│   ├── 📁 hooks/
│   │   ├── use-mobile.tsx         # Hook deteksi layar mobile
│   │   └── use-toast.ts           # Hook wrapper untuk toast notification
│   │
│   ├── 📁 contexts/               # ─── React Context Providers ───────────
│   │   ├── AuthContext.tsx        # State autentikasi (user, role, login/logout)
│   │   ├── CartContext.tsx        # State keranjang belanja + localStorage sync
│   │   ├── CompareContext.tsx     # State bandingkan produk (maks. 3 item)
│   │   └── OfflineContext.tsx     # Deteksi online/offline + sync antrian pesanan
│   │
│   ├── 📁 components/             # ─── Komponen Reusable ──────────────────
│   │   ├── Navbar.tsx             # Navigasi utama (Sales) + cart badge + offline indicator
│   │   ├── Footer.tsx             # Footer halaman publik
│   │   ├── AdminLayout.tsx        # Layout sidebar untuk halaman Admin
│   │   ├── ProductCard.tsx        # Kartu produk di katalog
│   │   ├── ProtectedRoute.tsx     # Guard: ProtectedRoute, AdminRoute, SalesRoute
│   │   ├── NavLink.tsx            # Wrapper NavLink dengan active styling
│   │   ├── Stepper.tsx            # Komponen stepper multi-langkah untuk pesanan
│   │   └── 📁 ui/                 # shadcn/ui components (button, dialog, table, dll.)
│   │
│   ├── 📁 pages/                  # ─── Halaman Aplikasi ───────────────────
│   │   ├── HomePage.tsx           # Landing page publik
│   │   ├── NotFound.tsx           # Halaman 404
│   │   │
│   │   ├── 📁 auth/
│   │   │   ├── LoginPage.tsx      # Form login
│   │   │   └── RegisterPage.tsx   # Form registrasi Sales baru
│   │   │
│   │   ├── 📁 katalog/            # (Sales only)
│   │   │   ├── KatalogPage.tsx    # Daftar produk + filter + search
│   │   │   ├── DetailProdukPage.tsx  # Detail produk + galeri + spesifikasi + add to cart
│   │   │   └── BandingkanPage.tsx    # Perbandingan side-by-side produk
│   │   │
│   │   ├── 📁 promo/              # (Sales only)
│   │   │   └── PromoPage.tsx      # Daftar produk promo / diskon
│   │   │
│   │   ├── 📁 pesanan/            # (Sales only)
│   │   │   ├── BuatPesananPage.tsx   # Stepper: pilih produk → data pelanggan → konfirmasi
│   │   │   ├── RiwayatPesananPage.tsx  # Daftar semua pesanan Sales
│   │   │   └── DetailPesananPage.tsx   # Detail pesanan spesifik
│   │   │
│   │   ├── 📁 komisi/             # (Sales only)
│   │   │   └── KomisiPage.tsx     # Riwayat komisi + summary (pending/disetujui/dibayar)
│   │   │
│   │   └── 📁 admin/              # (Admin only, nested di AdminLayout)
│   │       ├── AdminDashboardPage.tsx  # Statistik: total pesanan, produk, sales, komisi
│   │       ├── AdminProdukPage.tsx     # CRUD produk + upload foto
│   │       ├── AdminKategoriPage.tsx   # CRUD kategori + ikon & warna
│   │       ├── AdminPesananPage.tsx    # Daftar pesanan + update status
│   │       ├── AdminSalesPage.tsx      # Manajemen akun Sales (aktif/nonaktif)
│   │       ├── AdminLaporanPage.tsx    # Laporan penjualan + grafik Recharts
│   │       └── AdminKomisiPage.tsx     # Aturan komisi + persetujuan + pembayaran
│   │
│   └── 📁 assets/                 # Gambar & aset statis
│
├── 📁 public/                     # File publik statis (tidak diproses Vite)
│   ├── favicon.ico
│   ├── robots.txt
│   ├── placeholder.svg
│   └── sw.js                      # Salinan service worker untuk public path
│
└── 📁 dist/                       # Output build produksi (auto-generated)
```

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────┐
│              Browser (Client)                │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │     React SPA (Vite Build)          │     │
│  │                                     │     │
│  │  Context Layer:                     │     │
│  │  AuthContext → CartContext           │     │
│  │  CompareContext → OfflineContext    │     │
│  │                                     │     │
│  │  Pages / Components (shadcn/ui)     │     │
│  │  TanStack Query (server state)      │     │
│  └────────────┬────────────────────────┘     │
│               │ Axios HTTP                   │
│               │                              │
│  ┌────────────▼────────────────────────┐     │
│  │     Service Worker (sw.js)          │     │
│  │     Cache API → Offline fallback    │     │
│  └────────────┬────────────────────────┘     │
└───────────────│─────────────────────────────┘
                │ REST API (JSON)
                ▼
┌─────────────────────────────────────────────┐
│              Apache + PHP Backend            │
│                                              │
│  /api/auth/     → login, register            │
│  /api/produk/   → CRUD produk                │
│  /api/kategori/ → CRUD kategori              │
│  /api/pesanan/  → CRUD + status pesanan      │
│  /api/komisi/   → komisi + rules             │
│  /api/users/    → manajemen sales            │
│                                              │
│  ┌─────────────────────────┐                │
│  │  PDO → MySQL/MariaDB    │                │
│  └─────────────────────────┘                │
└─────────────────────────────────────────────┘
```

---

## 🔐 Alur Autentikasi & Otorisasi

```
Browser
  │
  ├── POST /api/auth/login
  │       └── Response: { user: {..., role: 'admin'|'sales' } }
  │
  ├── AuthContext menyimpan user ke localStorage (key: tkn_v4_auth_user)
  │
  └── Route Guard (ProtectedRoute.tsx)
        ├── <ProtectedRoute>  → cek isAuthenticated
        ├── <AdminRoute>      → cek isAdmin (role === 'admin')
        └── <SalesRoute>      → cek isSales (role === 'sales')
```

**Role yang tersedia:**
- `sales` — Tim penjualan, akses ke katalog, pesanan, komisi
- `admin` — Administrator, akses penuh termasuk panel admin

---

## 📦 Modul Frontend

### Contexts (State Global)
| Context | State yang Dikelola | Persistensi |
|---|---|---|
| `AuthContext` | user, role, login/logout | localStorage |
| `CartContext` | item keranjang, total | localStorage |
| `CompareContext` | list produk untuk dibandingkan (maks. 3) | Memori |
| `OfflineContext` | status online/offline, antrian sync | localStorage |

### Routing
| Path | Komponen | Akses |
|---|---|---|
| `/` | `HomePage` | Publik |
| `/login` | `LoginPage` | Publik |
| `/register` | `RegisterPage` | Publik |
| `/katalog` | `KatalogPage` | Sales |
| `/katalog/:id` | `DetailProdukPage` | Sales |
| `/bandingkan` | `BandingkanPage` | Sales |
| `/promo` | `PromoPage` | Sales |
| `/pesanan/buat` | `BuatPesananPage` | Sales |
| `/pesanan/riwayat` | `RiwayatPesananPage` | Sales |
| `/pesanan/:kode` | `DetailPesananPage` | Sales |
| `/komisi` | `KomisiPage` | Sales |
| `/admin` | `AdminDashboardPage` | Admin |
| `/admin/produk` | `AdminProdukPage` | Admin |
| `/admin/kategori` | `AdminKategoriPage` | Admin |
| `/admin/pesanan` | `AdminPesananPage` | Admin |
| `/admin/komisi` | `AdminKomisiPage` | Admin |
| `/admin/sales` | `AdminSalesPage` | Admin |
| `/admin/laporan` | `AdminLaporanPage` | Admin |

---

## 🔌 REST API Backend

Semua endpoint menggunakan JSON response format:
```json
{ "success": true, "data": ..., "message": "..." }
```

### Auth
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/login` | Login dengan email & password |
| POST | `/api/auth/register` | Registrasi akun Sales baru |

### Produk
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/produk` | Ambil semua produk (support filter query) |
| POST | `/api/produk` | Tambah produk baru |
| PUT | `/api/produk?id={id}` | Update produk |
| DELETE | `/api/produk?id={id}` | Hapus produk |

### Kategori
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/kategori` | Ambil semua kategori |
| POST | `/api/kategori` | Tambah kategori |
| PUT | `/api/kategori?id={id}` | Update kategori |
| DELETE | `/api/kategori?id={id}` | Hapus kategori |

### Pesanan
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/pesanan` | Ambil pesanan (filter by sales_id / all for admin) |
| POST | `/api/pesanan` | Buat pesanan baru |
| PUT | `/api/pesanan?id={id}` | Update status pesanan |

### Komisi
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/komisi` | Ambil data komisi Sales |
| POST | `/api/komisi` | Approve / bayar komisi |
| GET | `/api/komisi/rules` | Ambil semua aturan komisi |
| POST | `/api/komisi/rules` | Tambah aturan komisi |
| PUT | `/api/komisi/rules?id={id}` | Update aturan komisi |
| DELETE | `/api/komisi/rules?id={id}` | Hapus aturan komisi |

### Users (Admin)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/users` | Ambil semua akun Sales |
| PUT | `/api/users?id={id}` | Update data / status aktif Sales |

---

## 📐 Model Data

### User
```typescript
interface User {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  role: 'sales' | 'admin';
  wilayah?: string;
  is_aktif: boolean;
  created_at: string;
}
```

### Produk
```typescript
interface Produk {
  id: number;
  nama: string;
  sku: string;
  merek: string;
  kategori_id: number;
  deskripsi: string;
  spesifikasi: { key: string; value: string }[];
  harga_normal: number;
  harga_promo?: number;
  stok: number;
  foto_urls: string[];
  is_promo: boolean;
  is_aktif: boolean;
}
```

### Pesanan
```typescript
interface Pesanan {
  id: number;
  kode: string;            // Format: ORD-YYYYMMDD-XXXX
  sales_id: number;
  nama_pelanggan: string;
  perusahaan: string;
  alamat_pengiriman: string;
  items: ItemPesanan[];
  total: number;
  status: 'draft' | 'diproses' | 'dikirim' | 'diterima' | 'dibatalkan';
  offline_pending: boolean;
}
```

### Komisi
```typescript
interface KomisiRule {
  tipe: 'persentase' | 'nominal';
  nilai: number;
  min_transaksi: number;
  kategori_id: number | null;  // null = berlaku untuk semua
}

interface Komisi {
  pesanan_id: number;
  nilai_pesanan: number;
  persen_komisi: number;
  nominal_komisi: number;
  status: 'pending' | 'disetujui' | 'dibayar' | 'ditolak';
}
```

---

## 📶 Fitur Offline (PWA)

Aplikasi mendukung penggunaan dalam kondisi tanpa koneksi internet:

1. **Service Worker** (`sw.js`) — cache aset statis & HTML shell
2. **OfflineContext** — mendeteksi event `online`/`offline` browser
3. **Antrian pesanan offline** — pesanan dibuat saat offline disimpan di localStorage (`tkn_offline_orders`)
4. **Auto-sync** — saat koneksi pulih, antrian pesanan dikirim otomatis ke API

```
Offline Mode Flow:
  User buat pesanan → disimpan ke localStorage
        ↓
  Koneksi pulih (event: 'online')
        ↓
  OfflineContext.triggerSync()
        ↓
  pesananApi.syncOfflinePending()
        ↓
  Toast: "Semua pesanan offline berhasil disinkronkan"
```

---

## ⚙️ Konfigurasi Environment

### `.env` (Development — Laragon Lokal)
```env
VITE_API_BASE_URL=http://localhost/tkn/api
VITE_APP_BASE_PATH=/tkn
VITE_APP_NAME=TKN Travel E-Catalogue
```

### `.env.production` (Production — VPS)
```env
VITE_API_BASE_URL=https://tkn.tiunpam.id/api
VITE_APP_BASE_PATH=/
VITE_APP_NAME=TKN Travel E-Catalogue
```

> **Catatan:** `VITE_APP_BASE_PATH` harus sama dengan nilai `base` di `vite.config.ts`

---

## 🚀 Instalasi & Development

### Prasyarat
- Node.js ≥ 18
- Laragon (PHP 8+ + MySQL)
- npm

### Langkah Setup

```bash
# 1. Clone / letakkan proyek di direktori Laragon
# Path: C:\laragon\www\tkn\

# 2. Install dependensi frontend
npm install

# 3. Salin file environment
cp .env.example .env   # atau sesuaikan manual

# 4. Import database
# Buka phpMyAdmin → buat database "tkn" → import file tkn.sql

# 5. Jalankan dev server
npm run dev
```

Buka browser: `http://localhost:5173/tkn`

> API backend berjalan otomatis via Laragon di `http://localhost/tkn/api`

---

## 📦 Build & Deployment

### Build untuk Produksi
```bash
# Build menggunakan .env.production
npm run build

# Output ada di folder dist/
```

### Deploy ke VPS
```bash
# Upload seluruh isi folder dist/ + folder api/ + .htaccess ke server
# Pastikan .env.production sudah dikonfigurasi dengan benar
```

### Scripts yang Tersedia
| Script | Perintah | Fungsi |
|---|---|---|
| `dev` | `vite` | Jalankan dev server |
| `build` | `vite build` | Build produksi |
| `build:dev` | `vite build --mode development` | Build mode dev |
| `lint` | `eslint .` | Cek kode dengan ESLint |
| `preview` | `vite preview` | Preview hasil build |

---

## 🗄 Database

File `tkn.sql` berisi dump lengkap database. Tabel utama:

| Tabel | Deskripsi |
|---|---|
| `users` | Akun Sales & Admin |
| `produk` | Data produk wisata/layanan |
| `kategori` | Kategori produk |
| `pesanan` | Header pesanan |
| `pesanan_items` | Detail item per pesanan |
| `komisi` | Record komisi per pesanan |
| `komisi_rules` | Aturan perhitungan komisi |

File migrasi tambahan untuk modul komisi:
- `api/komisi/migrate.sql` — Migrasi tabel komisi v1
- `api/komisi/migrate_v2.sql` — Migrasi tabel komisi v2 (extended)

---

## 🌐 URL Produksi

- **Aplikasi:** https://tkn.tiunpam.id
- **API Backend:** https://tkn.tiunpam.id/api

---

*README ini di-generate dari analisis menyeluruh kode sumber proyek.*
