# 🌏 TKN Travel E-Catalogue

> **Sistem E-Katalog & Manajemen Pesanan untuk Tim Sales**  
> PT. TRAVELLA KREASI NUSANTARA — *"Your Travel Solution"*

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
- [Struktur Database](#-struktur-database)
- [Struktur Proyek](#-struktur-proyek)
- [Rancangan Halaman](#-rancangan-halaman)
- [API Backend](#-api-backend)
- [Cara Instalasi](#-cara-instalasi)
- [Akun Default](#-akun-default)

---

## 📌 Tentang Aplikasi

**TKN Travel E-Catalogue** adalah platform web berbasis React yang dirancang khusus sebagai sistem katalog produk dan manajemen pesanan internal bagi tim sales PT. Travella Kreasi Nusantara (TKN Travel Agency).

Aplikasi ini memungkinkan tim sales untuk:
- Menjelajahi dan mempresentasikan produk layanan travel kepada klien
- Membuat pesanan langsung dari katalog
- Melacak status pesanan secara real-time
- Bekerja bahkan saat koneksi internet terputus (*offline mode*)

Administrator dapat:
- Mengelola seluruh produk, kategori, dan akun sales
- Memantau performa penjualan melalui dashboard analitik
- Mengupdate status pesanan dan mencetak laporan

---

## ✨ Fitur Utama

### 🏠 Halaman Publik (Landing Page)
- **Company Profile** — profil perusahaan TKN Travel Agency
- **Daftar Layanan** — 10 layanan utama (Tour, Flight, Hotels, Umroh, Outbound, Merchandise, Logistics, Wedding, Rent Car, Promotion)
- **Visi & Misi** — informasi perusahaan secara lengkap
- **Kontak** — alamat kantor dan customer service

### 🔐 Autentikasi
- Login dengan email & password
- Registrasi akun sales baru
- Role-based access: **Sales** dan **Admin**
- Route protection — halaman tertentu hanya bisa diakses sesuai role

### 🛍️ Katalog Produk (Sales)
| Fitur | Deskripsi |
|-------|-----------|
| Filter & Pencarian | Cari produk berdasarkan nama, filter per kategori |
| Slider Harga | Filter produk berdasarkan range harga |
| Tampilan Kartu | Card produk dengan gambar, harga, status promo, dan stok |
| Detail Produk | Halaman detail lengkap: deskripsi, spesifikasi, galeri foto multi-image, harga normal vs promo |
| Keranjang Belanja | Tambah produk ke cart, atur jumlah, lihat subtotal |
| Bandingkan Produk | Pilih 2–3 produk untuk dibandingkan side-by-side (spesifikasi, harga, dll) |
| Halaman Promo | Tampilkan khusus produk yang sedang mendapat harga promosi |

### 📦 Manajemen Pesanan (Sales)
| Fitur | Deskripsi |
|-------|-----------|
| Buat Pesanan | Isi data pelanggan (nama, perusahaan, telepon, alamat) + item dari cart |
| Kode Unik | Kode pesanan otomatis format `ORD-YYYYMMDD-XXXX` |
| Stepper Form | Formulir multi-langkah dengan progress indicator |
| Riwayat Pesanan | Daftar semua pesanan milik sales yang login |
| Detail Pesanan | Lihat detail lengkap pesanan beserta status terkini |
| Offline Mode | Pesanan tetap bisa dibuat saat offline, lalu disinkronkan otomatis saat koneksi pulih |

### 🖥️ Panel Admin
| Modul | Fitur |
|-------|-------|
| **Dashboard** | Statistik: total produk aktif, pesanan hari ini, pesanan pending, jumlah sales aktif; grafik bar pesanan per bulan; tabel 5 pesanan terbaru |
| **Manajemen Produk** | CRUD produk: tambah, edit, hapus; upload multi-foto (URL); manajemen spesifikasi dinamis (key-value); toggle promo dengan rentang tanggal; toggle aktif/nonaktif |
| **Manajemen Kategori** | CRUD kategori: nama, ikon (Lucide icon), warna (Tailwind class), deskripsi |
| **Manajemen Pesanan** | Lihat semua pesanan seluruh sales; update status pesanan (draft → diproses → dikirim → diterima / dibatalkan); hapus pesanan |
| **Manajemen Sales** | Daftar user sales; toggle aktif/nonaktif; lihat data detail tiap sales |
| **Laporan** | Laporan rekap pesanan berdasarkan periode (date range); filter per sales; ekspor atau cetak |

### 📡 Offline Sync
- Deteksi koneksi internet secara real-time
- Notifikasi toast saat koneksi terputus / pulih
- Pesanan yang dibuat offline disimpan ke `localStorage`
- Sinkronisasi otomatis saat koneksi pulih
- Indikator "hasPendingSync" pada antarmuka

---

## 🧱 Arsitektur & Tech Stack

### Frontend
| Teknologi | Versi | Peran |
|-----------|-------|-------|
| **React** | 18.3 | Library UI utama |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **React Router DOM** | 6.30 | Client-side routing |
| **TanStack Query** | 5.83 | Server state & caching |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **shadcn/ui + Radix UI** | — | Komponen UI accessible |
| **Lucide React** | 0.462 | Icon library |
| **Recharts** | 2.15 | Visualisasi grafik (dashboard) |
| **React Hook Form + Zod** | — | Form management & validasi |
| **Axios** | 1.14 | HTTP client |
| **Sonner** | 1.7 | Toast notifications |
| **date-fns** | 3.6 | Utilitas tanggal |
| **Embla Carousel** | 8.6 | Carousel/galeri foto |

### Backend
| Teknologi | Peran |
|-----------|-------|
| **PHP 8.x** | REST API handler |
| **MySQL / MariaDB** | Database relasional |
| **PDO** | Koneksi database |
| **Apache (.htaccess)** | URL rewriting untuk SPA & API |

### Pola Arsitektur
```
[Browser / React SPA]
        │
        ▼ HTTP (Axios)
[PHP REST API — /api/*]
        │
        ▼ PDO
[MySQL Database — tkn]
```

- **SPA (Single Page Application)** — semua routing ditangani React Router di sisi klien
- **REST API** — backend PHP menyediakan endpoint JSON per resource
- **Context API** — state global (Auth, Cart, Compare, Offline) dikelola dengan React Context
- **Route Guards** — `ProtectedRoute`, `AdminRoute`, `SalesRoute` mencegah akses tidak sah

---

## 🗄️ Struktur Database

### Tabel `kategori`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `nama` | VARCHAR(100) | Nama kategori |
| `ikon` | VARCHAR(50) | Nama icon Lucide |
| `warna` | VARCHAR(50) | Tailwind color class |
| `deskripsi` | TEXT | Deskripsi kategori |
| `created_at` | TIMESTAMP | Waktu dibuat |

**Data awal (10 kategori):** Paket Wisata, Tiket Pesawat, Hotel & Resort, Umroh & Haji, Dokumen Perjalanan, Transportasi, Event & MICE, Cruise, Asuransi, Corporate Travel

---

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `nama` | VARCHAR(100) | Nama lengkap |
| `email` | VARCHAR(100) UNIQUE | Email (login) |
| `password` | VARCHAR(255) | Bcrypt hash |
| `telepon` | VARCHAR(20) | No. telepon |
| `role` | ENUM('sales','admin') | Role pengguna |
| `wilayah` | VARCHAR(100) | Area kerja sales |
| `is_aktif` | TINYINT(1) | Status aktif |
| `created_at` | TIMESTAMP | Waktu dibuat |

---

### Tabel `produk`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `nama` | VARCHAR(150) | Nama produk/layanan |
| `sku` | VARCHAR(50) UNIQUE | Kode SKU unik |
| `merek` | VARCHAR(100) | Merek/provider |
| `kategori_id` | INT FK | Relasi ke `kategori` |
| `deskripsi` | TEXT | Deskripsi produk |
| `spesifikasi` | JSON | Array `[{key, value}]` spesifikasi dinamis |
| `harga_normal` | INT | Harga dasar (Rupiah) |
| `harga_promo` | INT NULL | Harga promo (opsional) |
| `stok` | INT | Jumlah stok |
| `foto_urls` | JSON | Array URL foto produk |
| `is_promo` | TINYINT(1) | Status sedang promo |
| `promo_mulai` | DATETIME NULL | Tanggal mulai promo |
| `promo_selesai` | DATETIME NULL | Tanggal selesai promo |
| `is_aktif` | TINYINT(1) | Produk aktif/nonaktif |
| `created_at` | TIMESTAMP | Waktu dibuat |

---

### Tabel `pesanan`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `kode` | VARCHAR(50) UNIQUE | Kode unik `ORD-YYYYMMDD-XXXX` |
| `sales_id` | INT FK NULL | Relasi ke `users` |
| `nama_pelanggan` | VARCHAR(100) | Nama klien |
| `perusahaan` | VARCHAR(100) | Nama perusahaan klien |
| `telepon_pelanggan` | VARCHAR(20) | Kontak klien |
| `alamat_pengiriman` | TEXT | Alamat pengiriman |
| `catatan` | TEXT NULL | Catatan tambahan |
| `total` | INT | Total nilai pesanan |
| `status` | ENUM | `draft` / `diproses` / `dikirim` / `diterima` / `dibatalkan` |
| `offline_pending` | TINYINT(1) | Flag pesanan offline yang belum sync |
| `created_at` | TIMESTAMP | Waktu dibuat |

---

### Tabel `pesanan_items`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `pesanan_id` | INT FK | Relasi ke `pesanan` (CASCADE DELETE) |
| `produk_id` | INT FK | Relasi ke `produk` (RESTRICT DELETE) |
| `harga_satuan` | INT | Harga saat dipesan |
| `qty` | INT | Jumlah item |
| `subtotal` | INT | Harga × Qty |

---

## 📁 Struktur Proyek

```
tkn/
├── api/                        # PHP REST API
│   ├── auth/                   # Login & Register endpoint
│   ├── config/                 # Konfigurasi koneksi database
│   ├── kategori/               # CRUD kategori
│   ├── pesanan/                # CRUD pesanan & items
│   ├── produk/                 # CRUD produk
│   └── users/                  # Manajemen user sales
│
├── public/
│   └── sw.js                   # Service Worker (PWA/offline)
│
├── src/
│   ├── components/             # Komponen reusable
│   │   ├── AdminLayout.tsx     # Layout sidebar panel admin
│   │   ├── Footer.tsx          # Footer global
│   │   ├── Navbar.tsx          # Navigasi utama + cart badge
│   │   ├── ProductCard.tsx     # Card produk katalog
│   │   ├── ProtectedRoute.tsx  # Guard: Admin / Sales route
│   │   ├── Stepper.tsx         # Komponen stepper form multi-langkah
│   │   └── ui/                 # Komponen shadcn/ui (Button, Dialog, dll)
│   │
│   ├── contexts/               # React Context (state global)
│   │   ├── AuthContext.tsx     # State auth + user login
│   │   ├── CartContext.tsx     # State keranjang belanja
│   │   ├── CompareContext.tsx  # State bandingkan produk
│   │   └── OfflineContext.tsx  # Deteksi online/offline + sync
│   │
│   ├── lib/
│   │   └── api.ts              # Axios API helpers (produkApi, pesananApi, dll)
│   │
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page publik
│   │   ├── NotFound.tsx        # Halaman 404
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── katalog/
│   │   │   ├── KatalogPage.tsx       # Daftar produk + filter
│   │   │   ├── DetailProdukPage.tsx  # Detail satu produk
│   │   │   └── BandingkanPage.tsx    # Perbandingan produk
│   │   ├── pesanan/
│   │   │   ├── BuatPesananPage.tsx   # Form buat pesanan (stepper)
│   │   │   ├── RiwayatPesananPage.tsx # List riwayat pesanan
│   │   │   └── DetailPesananPage.tsx  # Detail satu pesanan
│   │   ├── promo/
│   │   │   └── PromoPage.tsx         # Daftar produk promo
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx # Dashboard + chart
│   │       ├── AdminProdukPage.tsx    # CRUD produk
│   │       ├── AdminKategoriPage.tsx  # CRUD kategori
│   │       ├── AdminPesananPage.tsx   # Manajemen semua pesanan
│   │       ├── AdminSalesPage.tsx     # Manajemen akun sales
│   │       └── AdminLaporanPage.tsx   # Laporan & rekap
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   │
│   ├── App.tsx                 # Root app + routing
│   └── main.tsx                # Entry point React
│
├── tkn.sql                     # Dump database (schema + data awal)
├── .htaccess                   # Apache URL rewriting
├── index.html                  # HTML template
├── vite.config.ts              # Konfigurasi Vite
├── tailwind.config.ts          # Konfigurasi Tailwind
└── package.json                # Dependencies NPM
```

---

## 🌐 Rancangan Halaman

### Routing

| Path | Akses | Deskripsi |
|------|-------|-----------|
| `/` | Publik | Landing page company profile |
| `/login` | Publik | Halaman login |
| `/register` | Publik | Halaman registrasi sales |
| `/katalog` | Sales | Daftar katalog produk |
| `/katalog/:id` | Sales | Detail produk |
| `/bandingkan` | Sales | Perbandingan produk |
| `/pesanan/buat` | Sales | Formulir buat pesanan |
| `/pesanan/riwayat` | Sales | Riwayat pesanan |
| `/pesanan/:kode` | Sales | Detail pesanan |
| `/promo` | Sales | Produk promo |
| `/admin` | Admin | Dashboard admin |
| `/admin/produk` | Admin | Kelola produk |
| `/admin/kategori` | Admin | Kelola kategori |
| `/admin/pesanan` | Admin | Kelola semua pesanan |
| `/admin/sales` | Admin | Kelola akun sales |
| `/admin/laporan` | Admin | Laporan penjualan |

### Status Pesanan & Alurnya

```
[Draft] → [Diproses] → [Dikirim] → [Diterima]
                    ↘
                  [Dibatalkan]
```

---

## 🔌 API Backend

Semua endpoint berlokasi di `/api/` dan mengembalikan JSON `{ success, data, message }`.

### Auth — `/api/auth/`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login, return data user |
| POST | `/api/auth/register` | Daftar akun sales baru |

### Produk — `/api/produk/`
| Method | Parameter | Deskripsi |
|--------|-----------|-----------|
| GET | `?is_aktif=1` / `?id=X` | Ambil semua / detail produk |
| POST | body JSON | Tambah produk baru |
| PUT | `?id=X` + body JSON | Edit produk |
| DELETE | `?id=X` | Hapus produk |

### Kategori — `/api/kategori/`
| Method | Deskripsi |
|--------|-----------|
| GET | Ambil semua kategori |
| POST | Tambah kategori |
| PUT `?id=X` | Edit kategori |
| DELETE `?id=X` | Hapus kategori |

### Pesanan — `/api/pesanan/`
| Method | Parameter | Deskripsi |
|--------|-----------|-----------|
| GET | `?sales_id=X` / `?kode=Y` | Ambil pesanan (filter opsional) |
| POST | body JSON | Buat pesanan + items (transaction) |
| PUT | `?id=X` + `{status}` | Update status pesanan |
| DELETE | `?id=X` | Hapus pesanan + items |

### Users — `/api/users/`
| Method | Deskripsi |
|--------|-----------|
| GET | Daftar user role=sales |
| PUT `?id=X` | Toggle aktif/nonaktif sales |

---

## ⚙️ Cara Instalasi

### Prasyarat
- **PHP** >= 8.0 (dengan PDO MySQL)
- **MySQL / MariaDB** >= 10.4
- **Node.js** >= 18
- **Apache** dengan mod_rewrite aktif (atau Laragon/XAMPP)

### Langkah

```bash
# 1. Clone / salin folder ke direktori web
#    Contoh: C:\laragon\www\tkn\

# 2. Install dependencies frontend
npm install

# 3. Import database
#    Buka phpMyAdmin, buat database 'tkn', import file tkn.sql

# 4. Konfigurasi koneksi database
#    Edit: api/config/koneksi.php
#    Sesuaikan HOST, DB_NAME, USER, PASSWORD

# 5. Jalankan dev server
npm run dev
#    Akses: http://localhost:5173

# atau untuk production:
npm run build
#    Output di folder /dist, serve via Apache (akses /tkn)
```

### Konfigurasi `.env` (opsional)
Edit `vite.config.ts` untuk mengubah base URL API jika deploy ke server berbeda.

---

## 👥 Akun Default

> Password default: `password`

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| Sales | `sales@example.com` | `password` |

> ⚠️ **Ganti password default sebelum deploy ke production!**

---

## 🎨 Design System

- **Warna Primer:** Indigo (`#4f46e5`) — brand TKN
- **Warna Sekunder:** Emerald (`#10b981`) — aksi/CTA
- **Warna Aksen:** Amber (`#f59e0b`) — warning/promo
- **Font:** Inter (via system-ui fallback) + Tailwind typography
- **Komponen UI:** shadcn/ui di atas Radix UI (accessible, headless)
- **Animasi:** Tailwind animate + transisi hover pada cards dan buttons
- **Ikon:** Lucide React (konsisten, tree-shakeable)

---

## 📞 Kontak Perusahaan

**PT. TRAVELLA KREASI NUSANTARA**  
Jl. Jombang Raya No. 35 C, Kel. Pondok Pucung, Kec. Pondok Aren  
Tangerang Selatan - Banten 15229  
📞 (021) 3529 6792  
📧 Travellakreasinusantara@gmail.com  

---

*© 2024 PT. Travella Kreasi Nusantara. All rights reserved.*
