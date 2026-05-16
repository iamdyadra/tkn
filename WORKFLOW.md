# 🔄 Alur Kerja TKN Travel E-Catalogue

> Dokumen ini menjelaskan secara detail alur kerja sistem berdasarkan masing-masing peran (role):
> **Pelanggan/User (Publik)**, **Sales**, dan **Admin**.

---

## 📋 Daftar Isi

- [Gambaran Umum Role](#-gambaran-umum-role)
- [Alur Kerja: Pelanggan / User Publik](#-alur-kerja-pelanggan--user-publik)
- [Alur Kerja: Sales](#-alur-kerja-sales)
- [Alur Kerja: Admin](#-alur-kerja-admin)
- [Alur Status Pesanan](#-alur-status-pesanan)
- [Alur Offline Mode](#-alur-offline-mode)
- [Diagram Interaksi Antar Role](#-diagram-interaksi-antar-role)

---

## 👥 Gambaran Umum Role

| Role | Akses | Deskripsi |
|------|-------|-----------|
| **Pelanggan / Publik** | Halaman `/` (Landing Page) | Pengunjung umum yang ingin mengetahui profil & layanan TKN. Tidak perlu login. |
| **Sales** | `/katalog`, `/pesanan/*`, `/promo` | Tim internal TKN yang bertugas mempresentasikan produk dan membuat pesanan atas nama pelanggan. Wajib login. |
| **Admin** | `/admin/*` | Pengelola sistem: mengelola produk, kategori, pesanan, akun sales, dan laporan. Wajib login dengan role admin. |

---

## 🌐 Alur Kerja: Pelanggan / User Publik

> Pelanggan **tidak perlu membuat akun atau login**. Mereka berinteraksi langsung dengan Sales secara offline/tatap muka, lalu Sales-lah yang melakukan input di sistem.

### Langkah 1 — Mengetahui TKN Travel

```
Pelanggan mengunjungi website TKN → Halaman Landing Page (/)
```

- Pelanggan melihat **profil perusahaan** PT. Travella Kreasi Nusantara
- Membaca **visi & misi** perusahaan
- Mengetahui **10 kategori layanan** yang tersedia:
  - TOUR, FLIGHT, OUTBOUND, HOTELS, PROMOTION
  - UMROH, MERCHANDISE, LOGISTICS/CARGO, WEDDING, RENT CAR
- Melihat keunggulan layanan: 24 Hour Reservation, Tour Package, Travel Konsultan, Discount Card, Wedding & EO
- Mencatat **kontak perusahaan**: telepon & email untuk menghubungi Sales

### Langkah 2 — Menghubungi Sales

```
Pelanggan → menghubungi Sales TKN (via telepon/email/tatap muka)
```

- Pelanggan menyampaikan kebutuhan perjalanan/layanan
- Sales kemudian membuka sistem dan membantu proses pemilihan produk
- **Pelanggan tidak perlu akses ke sistem** — Sales yang berperan sebagai perantara

### Langkah 3 — Menerima Kode Pesanan

```
Sales membuat pesanan → Pelanggan menerima kode ORD-YYYYMMDD-XXXX
```

- Setelah Sales membuat pesanan, pelanggan mendapat **kode pesanan unik**
- Kode ini bisa digunakan untuk tracking status pesanan
- Pelanggan bisa menanyakan update status ke Sales

### Ringkasan Touchpoint Pelanggan

```
[Lihat Landing Page] → [Hubungi Sales] → [Diskusi & Negosiasi] → [Terima Kode Pesanan] → [Pantau Status via Sales]
```

---

## 🧑‍💼 Alur Kerja: Sales

Sales adalah pengguna utama sistem ini. Semua aktivitas operasional sehari-hari dilakukan oleh Sales.

### 1. Registrasi & Login

```
Akses /register → Isi data (nama, email, password, telepon, wilayah) → Submit
Admin mengaktifkan akun → Login di /login → Masuk ke sistem
```

- Akun baru otomatis berstatus **nonaktif** sampai diaktifkan Admin
- Setelah login, Sales diarahkan ke **halaman katalog** (`/katalog`)
- Session tersimpan di browser (Context API + localStorage)

### 2. Menjelajahi Katalog Produk

```
/katalog → Filter & Cari → Lihat Detail → Bandingkan Produk
```

#### a. Melihat Daftar Produk
- Semua produk aktif ditampilkan dalam bentuk **card grid**
- Setiap card menampilkan: foto, nama, SKU, merek, harga, badge promo, stok
- **Filter tersedia:**
  - Filter per **kategori** (Paket Wisata, Tiket Pesawat, Hotel, dll)
  - **Pencarian** berdasarkan nama produk
  - **Slider harga** untuk filter range harga

#### b. Melihat Detail Produk (`/katalog/:id`)
- Foto produk dengan **galeri carousel** (multi-foto)
- Deskripsi lengkap & spesifikasi dinamis (key-value)
- Harga normal dan harga promo (jika sedang promo)
- Tombol **Tambah ke Keranjang**

#### c. Membandingkan Produk (`/bandingkan`)
- Pilih 2–3 produk dengan tombol "Bandingkan" di card
- Melihat perbandingan side-by-side: spesifikasi, harga, kategori
- Membantu Sales menjelaskan perbedaan produk ke pelanggan

#### d. Halaman Promo (`/promo`)
- Menampilkan **khusus produk yang sedang promo**
- Terlihat harga coret (harga normal) vs harga promo
- Badge "PROMO" dan info tanggal berlaku promo

### 3. Mengelola Keranjang (Cart)

```
Detail Produk → [Tambah ke Cart] → Atur Qty → Lanjut ke Buat Pesanan
```

- Cart tersimpan di **CartContext** (persisten selama session)
- Sales bisa:
  - Menambah produk dari halaman katalog / detail produk
  - Mengubah jumlah (qty) langsung di form pesanan
  - Menghapus item dari pesanan
- Badge cart di Navbar menampilkan jumlah item

### 4. Membuat Pesanan (`/pesanan/buat`)

```
Cart tidak kosong → Isi Data Pelanggan → Submit → Kode Pesanan Terbuat
```

#### Form Pesanan terdiri dari:

**Panel Kiri — Item Pesanan:**
| Field | Keterangan |
|-------|------------|
| Foto & nama produk | Tampil dari cart |
| Qty (+/-) | Bisa diubah langsung |
| Subtotal per item | Otomatis terhitung |
| Tombol hapus | Hapus item dari pesanan |

**Panel Kanan — Data Pelanggan:**
| Field | Validasi |
|-------|----------|
| Nama Pelanggan | Min. 3 karakter, wajib |
| Nama Perusahaan | Min. 2 karakter, wajib |
| No. Telepon | Min. 9 digit, wajib |
| Alamat Pengiriman | Min. 10 karakter, wajib |
| Catatan Pesanan | Opsional |

**Panel Ringkasan:**
- Total harga semua item
- Tombol **"Kirim Pesanan"**

#### Setelah Submit Berhasil:
- Kode pesanan otomatis dibuat: `ORD-YYYYMMDD-XXXX`
- Cart otomatis dikosongkan
- Halaman sukses tampil dengan kode pesanan
- Sales mencatat kode untuk disampaikan ke pelanggan

### 5. Memantau Riwayat Pesanan (`/pesanan/riwayat`)

```
/pesanan/riwayat → Lihat daftar pesanan milik Sales yang login
```

- Hanya menampilkan pesanan **milik Sales yang sedang login**
- Informasi: kode pesanan, nama pelanggan, total, status, tanggal
- Klik pesanan → masuk ke halaman **detail pesanan** (`/pesanan/:kode`)

### 6. Melihat Detail Pesanan (`/pesanan/:kode`)

- Kode pesanan, tanggal dibuat, nama Sales
- Data pelanggan: nama, perusahaan, telepon, alamat, catatan
- Daftar item beserta harga satuan, qty, subtotal
- **Status pesanan** saat ini (dengan warna badge)
- Total nilai pesanan

### Ringkasan Alur Kerja Sales

```
Login
  ↓
Buka Katalog → (Filter/Search) → Detail Produk → Tambah ke Cart
  ↓
[Opsional] Bandingkan produk / Cek halaman Promo
  ↓
Buat Pesanan → Isi Data Pelanggan → Submit
  ↓
Catat Kode Pesanan → Sampaikan ke Pelanggan
  ↓
Pantau Status di Riwayat Pesanan
```

---

## 🖥️ Alur Kerja: Admin

Admin memiliki akses penuh ke seluruh sistem melalui panel admin di `/admin/*`.

### 1. Login sebagai Admin

```
/login → Email admin → Masuk ke /admin (Dashboard)
```

- Jika non-admin mencoba akses `/admin/*` → otomatis redirect (AdminRoute guard)

### 2. Dashboard (`/admin`)

Dashboard memberikan **gambaran cepat performa sistem:**

| Statistik | Penjelasan |
|-----------|------------|
| Total Produk Aktif | Jumlah produk yang `is_aktif = 1` |
| Pesanan Hari Ini | Jumlah pesanan yang dibuat hari ini |
| Pesanan Pending | Draft + Diproses yang belum selesai |
| Sales Aktif | Jumlah akun sales yang aktif |

- **Grafik bar** pesanan per bulan (tahun berjalan)
- **Tabel 5 pesanan terbaru** dengan link ke detail

### 3. Manajemen Produk (`/admin/produk`)

```
Lihat daftar produk → Tambah / Edit / Hapus / Toggle Aktif
```

#### Tambah Produk Baru:
| Field | Keterangan |
|-------|------------|
| Nama Produk | Nama layanan |
| SKU | Kode unik produk |
| Merek / Provider | Contoh: Garuda, Accor, dll |
| Kategori | Pilih dari kategori aktif |
| Deskripsi | Deskripsi panjang produk |
| Spesifikasi | Dinamis: tambah key-value (misal: "Durasi: 3 Hari 2 Malam") |
| Harga Normal | Harga dasar (Rupiah) |
| Harga Promo | Opsional, aktif jika is_promo = true |
| Foto URL | Bisa multi-foto (array URL) |
| Stok | Jumlah stok tersedia |
| Status Aktif | Toggle produk tampil/tidak di katalog |

#### Mengaktifkan Promo:
- Toggle `is_promo` → aktifkan field tanggal mulai & selesai promo
- Produk akan muncul di halaman `/promo` selama rentang waktu promo
- Harga promo ditampilkan menggantikan harga normal di katalog

#### Edit & Hapus Produk:
- Edit: memperbarui semua data termasuk spesifikasi dinamis
- Hapus: hanya bisa jika produk tidak terikat pesanan aktif (RESTRICT DELETE di DB)
- Nonaktif: produk tidak muncul di katalog tapi data tetap tersimpan

### 4. Manajemen Kategori (`/admin/kategori`)

```
Lihat daftar kategori → Tambah / Edit / Hapus
```

| Field | Keterangan |
|-------|------------|
| Nama | Nama kategori (misal: Paket Wisata) |
| Ikon | Nama icon dari Lucide React |
| Warna | Tailwind color class (misal: `bg-blue-500`) |
| Deskripsi | Deskripsi singkat kategori |

- Kategori yang dihapus akan mempengaruhi produk yang menggunakannya
- Kategori aktif muncul sebagai opsi filter di katalog Sales

### 5. Manajemen Pesanan (`/admin/pesanan`)

```
Lihat SEMUA pesanan dari semua Sales → Update Status / Batalkan / Hapus
```

#### Filter Pesanan:
- **Cari** berdasarkan kode pesanan atau nama pelanggan
- **Filter status**: Semua / Draft / Diproses / Dikirim / Diterima / Dibatalkan
- **Filter per Sales**: tampilkan hanya pesanan dari Sales tertentu

#### Update Status Pesanan:

Admin menggerakkan status pesanan maju satu langkah:

```
[Draft] → tombol "→ Diproses"
[Diproses] → tombol "→ Dikirim"
[Dikirim] → tombol "→ Diterima"
[Diterima] → tidak ada tombol maju (selesai)
```

- Setiap perubahan status muncul **dialog konfirmasi**
- Tombol **"Batal"** (merah) tersedia untuk status Draft, Diproses, dan Dikirim
- Pembatalan bersifat **permanen** (tidak bisa dikembalikan)

#### Hapus Pesanan:
- Tombol hapus (ikon tong sampah) ada di setiap baris
- Dialog konfirmasi muncul sebelum penghapusan
- Menghapus pesanan **menghapus seluruh item** di dalamnya (CASCADE DELETE)

### 6. Manajemen Sales (`/admin/sales`)

```
Lihat daftar akun Sales → Toggle Aktif/Nonaktif → Lihat detail
```

- Tampil semua user dengan role = `sales`
- Informasi: nama, email, telepon, wilayah kerja, status aktif
- **Toggle aktif/nonaktif**: Sales nonaktif tidak bisa login ke sistem
- Digunakan untuk onboarding Sales baru atau menonaktifkan yang resign

### 7. Laporan (`/admin/laporan`)

```
Pilih periode (date range) → Filter per Sales (opsional) → Lihat rekap → Ekspor / Cetak
```

| Fitur | Keterangan |
|-------|------------|
| Filter tanggal | Pilih rentang tanggal laporan |
| Filter Sales | Rekap pesanan sales tertentu atau semua sales |
| Rekap pesanan | Daftar pesanan dalam periode dengan total nilai |
| Ekspor / Cetak | Output laporan untuk arsip atau presentasi |

### Ringkasan Alur Kerja Admin

```
Login (Admin)
  ↓
Dashboard → Pantau statistik & pesanan terbaru
  ↓
Manajemen Produk → Tambah/Edit produk, atur promo
  ↓
Manajemen Kategori → Kelola kategori layanan
  ↓
Manajemen Pesanan → Update status, batalkan, hapus pesanan
  ↓
Manajemen Sales → Aktifkan/nonaktifkan akun sales
  ↓
Laporan → Generate rekap berdasarkan periode & filter
```

---

## 📦 Alur Status Pesanan

Berikut adalah siklus lengkap status pesanan dan siapa yang mengubahnya:

```
          [SALES membuat pesanan]
                    ↓
               ┌─────────┐
               │  DRAFT  │  ← Pesanan baru terbuat
               └────┬────┘
                    │ Admin klik "→ Diproses"
                    ↓
             ┌──────────────┐
             │   DIPROSES   │  ← Tim sedang memproses
             └──────┬───────┘
                    │ Admin klik "→ Dikirim"
                    ↓
              ┌───────────┐
              │  DIKIRIM  │  ← Layanan/dokumen dikirimkan
              └─────┬─────┘
                    │ Admin klik "→ Diterima"
                    ↓
             ┌──────────────┐
             │   DITERIMA   │  ← Selesai, pelanggan terima ✓
             └──────────────┘

  Dari status Draft/Diproses/Dikirim:
  Admin bisa klik "Batal" →  ┌─────────────┐
                              │  DIBATALKAN │
                              └─────────────┘
```

| Status | Warna Badge | Siapa yang Mengubah |
|--------|-------------|---------------------|
| Draft | Abu-abu | Sistem (otomatis saat pesanan dibuat) |
| Diproses | Biru | Admin |
| Dikirim | Kuning/Amber | Admin |
| Diterima | Hijau | Admin |
| Dibatalkan | Merah | Admin |

---

## 📡 Alur Offline Mode

Fitur ini memungkinkan Sales tetap bekerja saat koneksi internet terputus.

```
Sales online → bekerja normal
       ↓
Koneksi terputus → Toast notifikasi "Offline"
       ↓
Sales tetap bisa membuat pesanan
       ↓
Pesanan disimpan di localStorage dengan kode "OFFLINE-xxxxxxxx"
dan flag offline_pending = true
       ↓
Koneksi pulih → Toast notifikasi "Kembali Online"
       ↓
Sinkronisasi otomatis: pesanan offline dikirim ke server
       ↓
Kode pesanan berubah dari OFFLINE-xxx → ORD-YYYYMMDD-XXXX
```

> ⚠️ **Penting:** Jangan hapus data browser sebelum sinkronisasi berhasil. Indikator "hasPendingSync" akan hilang setelah sinkronisasi selesai.

---

## 🔗 Diagram Interaksi Antar Role

```
┌─────────────────────────────────────────────────────────┐
│                    WEBSITE TKN                          │
│                                                         │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────┐  │
│  │  PELANGGAN   │    │     SALES     │    │  ADMIN   │  │
│  │   (Publik)   │    │  (Internal)   │    │          │  │
│  └──────┬───────┘    └──────┬────────┘    └────┬─────┘  │
│         │                  │                  │         │
│         │ Lihat profil      │ Login            │ Login   │
│         ▼                  ▼                  ▼         │
│    Landing Page        Katalog           Dashboard      │
│    (Company Profile)   Produk            Admin          │
│         │                  │                  │         │
│         │ Hubungi Sales     │ Tambah ke Cart   │ Kelola  │
│         ▼                  ▼                  │ Produk  │
│    [Kontak langsung]   Buat Pesanan       ◄───┘         │
│    via telepon/email        │                           │
│         │                  │ Kode Pesanan               │
│         ◄──────────────────┘ ORD-YYYYMMDD-XXXX          │
│         │                                    │          │
│    Terima kode              Update Status ◄──┘          │
│    & pantau status          oleh Admin                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Kontrol Akses (Route Guards)

| Komponen Guard | Perilaku |
|----------------|----------|
| `ProtectedRoute` | Redirect ke `/login` jika belum login |
| `SalesRoute` | Hanya user role `sales` yang boleh akses |
| `AdminRoute` | Hanya user role `admin` yang boleh akses |

Jika Sales mencoba akses `/admin/*` → redirect ke `/katalog`  
Jika Admin mencoba akses `/katalog` → diperbolehkan (admin bisa lihat katalog)  
Jika belum login mencoba akses halaman apapun selain `/` → redirect ke `/login`

---

## 📌 Catatan Penting

1. **Pelanggan tidak memiliki akun** di sistem TKN. Semua transaksi melalui Sales.
2. **Sales hanya melihat pesanan miliknya sendiri** — tidak bisa melihat pesanan Sales lain.
3. **Admin melihat SEMUA pesanan** dari seluruh Sales.
4. **Hapus produk** tidak bisa dilakukan jika produk sudah pernah dipesan (proteksi database).
5. **Status pesanan tidak bisa mundur** — hanya bisa maju atau dibatalkan.
6. **Akun Sales baru** perlu diaktifkan terlebih dahulu oleh Admin sebelum bisa login.

---

*© 2024 PT. Travella Kreasi Nusantara — Dokumen Internal Sistem TKN Travel E-Catalogue*
