// Tipe data global — E-Catalogue Sistem Pendaftaran Layanan untuk Tim Sales

export type UserRole = 'sales' | 'admin';

export interface User {
  id: number;
  nama: string;
  email: string;
  password: string;
  telepon: string;
  role: UserRole;
  wilayah?: string;
  is_aktif: boolean;
  created_at: string;
}

export interface Kategori {
  id: number;
  nama: string;
  ikon: string;        // nama icon lucide
  warna: string;      // tailwind color class
  deskripsi: string;
  created_at: string;
}

export interface SpesifikasiItem {
  key: string;
  value: string;
}

export interface Produk {
  id: number;
  nama: string;
  sku: string;
  merek: string;
  kategori_id: number;
  kategori_nama: string;
  deskripsi: string;
  spesifikasi: SpesifikasiItem[];
  harga_normal: number;
  harga_promo?: number;
  stok: number;
  foto_urls: string[];   // array URL foto
  is_promo: boolean;
  promo_mulai?: string;
  promo_selesai?: string;
  is_aktif: boolean;
  created_at: string;
}

export type PesananStatus = 'draft' | 'diproses' | 'dikirim' | 'diterima' | 'dibatalkan';

export interface ItemPesanan {
  produk_id: number;
  nama_produk: string;
  sku: string;
  foto_url: string;
  harga_satuan: number;
  qty: number;
  subtotal: number;
}

export interface Pesanan {
  id: number;
  kode: string;           // ORD-YYYYMMDD-XXXX
  sales_id: number;
  sales_nama: string;
  nama_pelanggan: string;
  perusahaan: string;
  telepon_pelanggan: string;
  alamat_pengiriman: string;
  catatan: string;
  items: ItemPesanan[];
  total: number;
  status: PesananStatus;
  offline_pending: boolean;
  created_at: string;
}

// Cart state (di context + localStorage)
export interface CartItem {
  produk: Produk;
  qty: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ── Komisi ────────────────────────────────────────────────────

export type KomisiStatus = 'pending' | 'disetujui' | 'dibayar' | 'ditolak';

export interface KomisiRule {
  id: number;
  kategori_id: number | null;
  kategori_nama?: string | null;
  nama_rule: string;
  tipe: 'persentase' | 'nominal';
  nilai: number;
  min_transaksi: number;
  is_aktif: boolean;
  created_at: string;
}

export interface Komisi {
  id: number;
  pesanan_id: number;
  sales_id: number;
  rule_id: number | null;
  nilai_pesanan: number;
  persen_komisi: number;
  nominal_komisi: number;
  status: KomisiStatus;
  catatan: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  // joined fields
  sales_nama?: string;
  kode_pesanan?: string;
  nama_rule?: string | null;
}

export interface KomisiSummary {
  total_pending: number;
  total_disetujui: number;
  total_dibayar: number;
}

