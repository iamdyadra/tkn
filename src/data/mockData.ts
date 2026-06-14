// Mock data statis — TKN Travel Agency
import type { User, Produk, Kategori, Pesanan } from '@/types';

// ============================================================
// USERS
// ============================================================
export const mockUsers: User[] = [
  {
    id: 1, nama: 'Admin Sistem', email: 'admin@tkntravel.com', password: 'admin123',
    telepon: '081200000001', role: 'admin', wilayah: '-', is_aktif: true, created_at: '2025-01-01',
  },
  {
    id: 2, nama: 'Budi Santoso', email: 'budi@tkntravel.com', password: 'sales123',
    telepon: '081200000002', role: 'sales', wilayah: 'Jabodetabek', is_aktif: true, created_at: '2025-01-05',
  },
  {
    id: 3, nama: 'Siti Rahayu', email: 'siti@tkntravel.com', password: 'sales123',
    telepon: '081200000003', role: 'sales', wilayah: 'Jawa Barat', is_aktif: true, created_at: '2025-01-10',
  },
];

// ============================================================
// KATEGORI
// ============================================================
export const mockKategori: Kategori[] = [
  { id: 1, nama: 'Tour', ikon: 'Map', warna: 'blue', deskripsi: 'Paket liburan dan wisata', created_at: '2025-01-01' },
  { id: 2, nama: 'Flight', ikon: 'Plane', warna: 'indigo', deskripsi: 'Pemesanan tiket pesawat & kereta', created_at: '2025-01-01' },
  { id: 3, nama: 'Outbound', ikon: 'Tent', warna: 'emerald', deskripsi: 'Outbound training & fun games', created_at: '2025-01-01' },
  { id: 4, nama: 'Hotels', ikon: 'Building', warna: 'amber', deskripsi: 'Reservasi & voucher hotel', created_at: '2025-01-01' },
  { id: 5, nama: 'Promotion', ikon: 'Tag', warna: 'cyan', deskripsi: 'PPOB, Pulsa Elektrik & Travel Konsultan', created_at: '2025-01-01' },
  { id: 6, nama: 'Umroh', ikon: 'Moon', warna: 'purple', deskripsi: 'Paket Umroh & Haji', created_at: '2025-01-01' },
  { id: 7, nama: 'Merchandise', ikon: 'Gift', warna: 'pink', deskripsi: 'TKN Card Discount & merchandise', created_at: '2025-01-01' },
  { id: 8, nama: 'Logistics / Cargo', ikon: 'Truck', warna: 'orange', deskripsi: 'Logistik dan cargo pengiriman paket', created_at: '2025-01-01' },
  { id: 9, nama: 'Wedding', ikon: 'Heart', warna: 'red', deskripsi: 'Wedding & Event Organizer', created_at: '2025-01-01' },
  { id: 10, nama: 'Rent Car', ikon: 'Car', warna: 'slate', deskripsi: 'Penyewaan kendaraan', created_at: '2025-01-01' },
];

// ============================================================
// PRODUK
// ============================================================
export const mockProduk: Produk[] = [
  {
    id: 1, nama: 'Paket Tour Wisata Bali 3 Hari 2 Malam', sku: 'TRV-001', merek: 'TKN Tour',
    kategori_id: 1, kategori_nama: 'Tour',
    deskripsi: 'Paket liburan ke Pulau Dewata dengan fasilitas lengkap, penginapan hotel bintang 4, transportasi eksklusif, tiket wisata (GWK, Tanah Lot, Pantai Melasti), dan layanan pemandu.',
    spesifikasi: [
      { key: 'Durasi', value: '3 Hari 2 Malam' },
      { key: 'Lokasi', value: 'Bali, Indonesia' },
      { key: 'Include', value: 'Hotel, Sarapan, Guide, Transportasi' },
    ],
    harga_normal: 3500000, harga_promo: 3100000, stok: 50,
    foto_urls: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2025-01-01', promo_selesai: '2026-12-31', is_aktif: true, created_at: '2025-01-10'
  },
  {
    id: 17, nama: 'Paket Tour Jogja–Solo–Bromo 4 Hari 3 Malam', sku: 'TRV-002', merek: 'TKN Tour',
    kategori_id: 1, kategori_nama: 'Tour',
    deskripsi: 'Eksplorasi keindahan budaya dan alam Jawa! Jelajahi Prambanan, Borobudur, Keraton Solo, dan saksikan matahari terbit spektakuler di Gunung Bromo. Hotel bintang 3–4, transportasi AC, pemandu profesional.',
    spesifikasi: [
      { key: 'Durasi', value: '4 Hari 3 Malam' },
      { key: 'Destinasi', value: 'Jogja, Solo, Bromo' },
      { key: 'Include', value: 'Hotel, Makan, Guide, Transportasi' },
    ],
    harga_normal: 4200000, harga_promo: 3350000, stok: 40,
    foto_urls: ['https://images.unsplash.com/photo-1588668214407-6ea9a6d8f3b8?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2026-05-01', promo_selesai: '2026-08-31', is_aktif: true, created_at: '2026-05-01'
  },
  {
    id: 18, nama: 'Tiket Pesawat JKT–LABUAN BAJO (PP)', sku: 'FLT-003', merek: 'TKN Flight',
    kategori_id: 2, kategori_nama: 'Flight',
    deskripsi: 'Dapatkan e-ticket pesawat rute Jakarta (CGK) menuju Labuan Bajo (LBJ) pulang-pergi dengan harga spesial. Nikmati keindahan Komodo dan Pulau Padar dengan penerbangan langsung.',
    spesifikasi: [
      { key: 'Rute', value: 'Jakarta (CGK) ⇄ Labuan Bajo (LBJ)' },
      { key: 'Bagasi', value: '20 Kg' },
      { key: 'E-Ticket', value: 'Dikirim H+1 Kerja' },
    ],
    harga_normal: 2800000, harga_promo: 1990000, stok: 60,
    foto_urls: ['https://images.unsplash.com/photo-1569913486515-b74bf7751574?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2026-06-01', promo_selesai: '2026-07-31', is_aktif: true, created_at: '2026-06-01'
  },
  {
    id: 19, nama: 'Paket Outbound Family Fun Day', sku: 'OUT-002', merek: 'TKN Outbound',
    kategori_id: 3, kategori_nama: 'Outbound',
    deskripsi: 'Paket outbound spesial keluarga dan komunitas! Tersedia berbagai permainan seru (flying fox, water games, paintball) di resort alam terbuka Bogor. Cocok untuk gathering RT, arisan, hingga ulang tahun anak.',
    spesifikasi: [
      { key: 'Jumlah Peserta', value: 'Min. 20 Orang' },
      { key: 'Durasi', value: '1 Hari (07.00–17.00)' },
      { key: 'Fasilitas', value: 'Makan Siang, Snack, Trainer, Dokumentasi' },
    ],
    harga_normal: 550000, harga_promo: 399000, stok: 80,
    foto_urls: ['https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2026-06-01', promo_selesai: '2026-09-30', is_aktif: true, created_at: '2026-06-01'
  },
  {
    id: 20, nama: 'Sewa Alphard Mewah – Supir Termasuk', sku: 'RNT-002', merek: 'TKN Rent Car',
    kategori_id: 10, kategori_nama: 'Rent Car',
    deskripsi: 'Tampil elegan dan nyaman bersama keluarga atau rekan bisnis dengan Toyota Alphard premium. Cocok untuk airport transfer, perjalanan VIP, atau wisata dalam kota. Supir profesional dan berpengalaman.',
    spesifikasi: [
      { key: 'Seat', value: '6 Penumpang (Captain Seat)' },
      { key: 'Waktu Sewa', value: '12 Jam' },
      { key: 'Supir', value: 'Profesional Termasuk' },
    ],
    harga_normal: 1800000, harga_promo: 1350000, stok: 8,
    foto_urls: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2026-06-01', promo_selesai: '2026-12-31', is_aktif: true, created_at: '2026-06-01'
  },
  {
    id: 21, nama: 'Paket Umroh Hemat Reguler 9 Hari', sku: 'UMR-005', merek: 'TKN Umroh',
    kategori_id: 6, kategori_nama: 'Umroh',
    deskripsi: 'Spesial Early Bird! Paket umroh reguler 9 hari dengan fasilitas hotel bintang 4 dekat Masjidil Haram dan Masjid Nabawi. Didampingi muthawif berpengalaman dan asuransi perjalanan penuh.',
    spesifikasi: [
      { key: 'Transport/Flight', value: 'Direct Landing Jeddah' },
      { key: 'Hotel', value: 'Bintang 4 (±200m Haram)' },
      { key: 'Fasilitas', value: 'Makan 3x, Visa, Muthawif, Asuransi' },
    ],
    harga_normal: 28500000, harga_promo: 24900000, stok: 30,
    foto_urls: ['https://images.unsplash.com/photo-1565552643983-6cc379aa6e64?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2026-06-01', promo_selesai: '2026-09-30', is_aktif: true, created_at: '2026-06-01'
  },
  {
    id: 2, nama: 'Tiket Pesawat JKT-BALI (PP)', sku: 'FLT-001', merek: 'TKN Flight',
    kategori_id: 2, kategori_nama: 'Flight',
    deskripsi: 'Pemesanan e-ticket pesawat rute Jakarta (CGK) menuju Denpasar (DPS) Pulang-Pergi menggunakan maskapai komersial full-service.',
    spesifikasi: [
      { key: 'Rute', value: 'Jakarta (CGK) ⇄ Bali (DPS)' },
      { key: 'Bagasi', value: '20 Kg' },
      { key: 'E-Ticket', value: 'Dikirim H+1' },
    ],
    harga_normal: 3200000, stok: 100,
    foto_urls: ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-11'
  },
  {
    id: 3, nama: 'Tiket Kereta Api Eksekutif Jakarta-Jogja', sku: 'FLT-002', merek: 'TKN Train',
    kategori_id: 2, kategori_nama: 'Flight',
    deskripsi: 'Pemesanan e-ticket kereta api Eksekutif perjalanan Jakarta (Gambir) ke Yogyakarta (Tugu). Dilayani dengan reservasi 24 Jam via sistem kami.',
    spesifikasi: [
      { key: 'Kelas', value: 'Eksekutif' },
      { key: 'Rute', value: 'GMR ⇄ YK' },
    ],
    harga_normal: 850000, stok: 150,
    foto_urls: ['https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-12'
  },
  {
    id: 4, nama: 'Paket Corporate Outbound Gathering (Puncak)', sku: 'OUT-001', merek: 'TKN Outbound',
    kategori_id: 3, kategori_nama: 'Outbound',
    deskripsi: 'Program perjalanan insentif untuk perusahaan, termasuk outbound training dan fun games di kawasan Puncak untuk mempererat kerja sama tim (Team Building).',
    spesifikasi: [
      { key: 'Jumlah Peserta', value: 'Min. 50 Orang' },
      { key: 'Durasi', value: '1 Hari (Atau menginap opsional)' },
      { key: 'Fasilitas', value: 'Lokasi, Trainer, Konsumsi' },
    ],
    harga_normal: 650000, stok: 99, // Harga per pax
    foto_urls: ['https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-13'
  },
  {
    id: 5, nama: 'Voucher Hotel Bintang 5', sku: 'HTL-001', merek: 'TKN Hotel',
    kategori_id: 4, kategori_nama: 'Hotels',
    deskripsi: 'Voucher reservasi khusus untuk Hotel Bintang 5 di kota-kota besar Indonesia untuk keperluan perjalanan bisnis atau wisata. Dapatkan rate harga khusus mitra.',
    spesifikasi: [
      { key: 'Masa Berlaku', value: 'Bebas Pilih Tanggal (S&K)' },
      { key: 'Kapasitas', value: '2 Dewasa (1 Kamar Deluxe)' },
    ],
    harga_normal: 1200000, harga_promo: 999000, stok: 200,
    foto_urls: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2025-01-01', promo_selesai: '2026-12-31', is_aktif: true, created_at: '2025-01-14'
  },
  {
    id: 6, nama: 'Jasa Konsultan Usaha Travel & PPOB/Pulsa', sku: 'PRM-001', merek: 'TKN Promotion',
    kategori_id: 5, kategori_nama: 'Promotion',
    deskripsi: 'Perusahaan kami terbuka untuk memberikan panduan konsultasi apabila Anda berniat membuka usaha keagenan Tour & Travel. Termasuk akses sistem pembayaran tagihan (PLN, PDAM, Pulsa Elektrik).',
    spesifikasi: [
      { key: 'Sesi', value: '3x Pertemuan / Online' },
      { key: 'Include', value: 'Hak Akses Sistem PPOB' },
    ],
    harga_normal: 5000000, stok: 10,
    foto_urls: ['https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-15'
  },
  {
    id: 7, nama: 'Paket Ibadah Umroh Reguler 9 Hari', sku: 'UMR-001', merek: 'TKN Umroh',
    kategori_id: 6, kategori_nama: 'Umroh',
    deskripsi: 'Perjalanan suci ibadah Umroh 9 Hari dengan akomodasi hotel dekat Masjidil Haram (Makkah) dan Masjid Nabawi (Madinah), serta bimbingan ibadah intensif.',
    spesifikasi: [
      { key: 'Transport/Flight', value: 'Direct Landing Jeddah/Madinah' },
      { key: 'Hotel', value: 'Bintang 4/5' },
      { key: 'Fasilitas', value: 'Makan 3x, Visa, Muthawif' },
    ],
    harga_normal: 28500000, stok: 45,
    foto_urls: ['https://images.unsplash.com/photo-1565552643983-6cc379aa6e64?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-16'
  },
  {
    id: 8, nama: 'Pendaftaran Ibadah Haji Plus', sku: 'UMR-002', merek: 'TKN Umroh',
    kategori_id: 6, kategori_nama: 'Umroh',
    deskripsi: 'Fasilitas pendaftaran haji plus resmi dengan masa tunggu yang lebih singkat dari reguler, beserta seluruh akomodasi setingkat VIP.',
    spesifikasi: [
      { key: 'Tipe', value: 'Haji Khusus (Plus)' },
      { key: 'Akomodasi', value: 'Tenda VIP Mina / Arafah' },
    ],
    harga_normal: 120000000, stok: 15,
    foto_urls: ['https://images.unsplash.com/photo-1590456128036-79174f19bca4?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-17'
  },
  {
    id: 9, nama: 'MERCHANT BOOK TKN Card Discount', sku: 'MRC-001', merek: 'TKN Merchandise',
    kategori_id: 7, kategori_nama: 'Merchandise',
    deskripsi: 'Kartu diskon pintar edisi eksklusif TKN Travel! Produk unggulan yang dapat digunakan untuk mendapat potongan harga di tempat rute wisata dan hotel yang sudah bekerjasama dengan kami.',
    spesifikasi: [
      { key: 'Masa Berlaku', value: '1 Tahun Penuh' },
      { key: 'Guna', value: 'Diskon Merchant Partner' },
    ],
    harga_normal: 250000, stok: 500,
    foto_urls: ['https://images.unsplash.com/photo-1556741533-974cb8e54e48?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-18'
  },
  {
    id: 10, nama: 'Layanan Pengiriman Cargo Express', sku: 'LOG-001', merek: 'TKN Logistics',
    kategori_id: 8, kategori_nama: 'Logistics / Cargo',
    deskripsi: 'Jasa layanan logistik untuk pengiriman dokumen maupun paket cargo Anda. Tersedia rute pengiriman ke seluruh Nusantara secara aman.',
    spesifikasi: [
      { key: 'Hitungan', value: 'Per 10 Kg' },
      { key: 'Rute', value: 'Domestik' },
    ],
    harga_normal: 150000, stok: 999,
    foto_urls: ['https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-19'
  },
  {
    id: 11, nama: 'Wedding Event Organizer Gold Package', sku: 'WED-001', merek: 'TKN Wedding',
    kategori_id: 9, kategori_nama: 'Wedding',
    deskripsi: 'Kami merancang dan menjamin kelancaran hari bahagia Anda. Paket lengkap pernikahan impian (500 pax tamu) mencakup Venue, Dekorasi, Katering, dan Dokumentasi video sinematik.',
    spesifikasi: [
      { key: 'Kapasitas', value: '500 Tamu Undangan' },
      { key: 'Style', value: 'Custom Tradisional / Modern' },
      { key: 'Tim', value: 'TKN Kreatif WO' },
    ],
    harga_normal: 95000000, stok: 10,
    foto_urls: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-20'
  },
  {
    id: 12, nama: 'Penyewaan Transportasi - Innova Reborn', sku: 'RNT-001', merek: 'TKN Rent Car',
    kategori_id: 10, kategori_nama: 'Rent Car',
    deskripsi: 'Sewa mobil harian Innova Reborn lengkap dengan Supir berlisensi dan berpengalaman. Nyaman digunakan untuk aktivitas liburan bersama grup maupun kunjungan dinas dalam kota.',
    spesifikasi: [
      { key: 'Seat', value: '7 Penumpang' },
      { key: 'Waktu Sewa', value: '12 Jam' },
      { key: 'Pemandu/Supir', value: 'Termasuk' },
    ],
    harga_normal: 850000, stok: 20,
    foto_urls: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-21'
  },
  {
    id: 13, nama: 'Paket Umroh Plus Turki 12 Hari', sku: 'UMR-003', merek: 'TKN Umroh',
    kategori_id: 6, kategori_nama: 'Umroh',
    deskripsi: 'Paket perjalanan ibadah Umroh sekaligus city tour destinasi memukau di negara Turki (Istanbul, Cappadocia, dsb). Dilengkapi fasilitas pesawat bintang 5 dan asuransi.',
    spesifikasi: [
      { key: 'Rute Tambahan', value: 'Istanbul - Bursa - Cappadocia' },
      { key: 'Hotel', value: 'Bintang 5' },
      { key: 'Maskapai', value: 'Turkish Airlines / setaraf' },
    ],
    harga_normal: 42500000, harga_promo: 38500000, stok: 20,
    foto_urls: ['https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80'],
    is_promo: true, promo_mulai: '2025-01-01', promo_selesai: '2025-12-31', is_aktif: true, created_at: '2025-01-22'
  },
  {
    id: 14, nama: 'Paket Umroh Ramadhan (Itikaf Akhir)', sku: 'UMR-004', merek: 'TKN Umroh',
    kategori_id: 6, kategori_nama: 'Umroh',
    deskripsi: 'Program istimewa untuk mengejar malam Lailatul Qadar. Itikaf 15 Hari di akhir bulan suci Ramadhan berlokasi khusus di Majidil Haram dan Masjid Nabawi.',
    spesifikasi: [
      { key: 'Aktivitas', value: 'Itikaf Lailatul Qadar' },
      { key: 'Fasilitas', value: 'Buka Puasa & Sahur Reguler' },
      { key: 'Transport', value: 'Bus Eksekutif Makkah-Madinah' },
    ],
    harga_normal: 45000000, stok: 15,
    foto_urls: ['https://images.unsplash.com/photo-1579934375631-7b8cdda1428a?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-22'
  },
  {
    id: 15, nama: 'Wedding Event Organizer Silver Package', sku: 'WED-002', merek: 'TKN Wedding',
    kategori_id: 9, kategori_nama: 'Wedding',
    deskripsi: 'Paket esensial pernikahan impian untuk kapasitas 250 tamu undangan. Menyediakan katering standar pilihan, dekorasi ruang resepsi modern, dan dokumentasi foto/video.',
    spesifikasi: [
      { key: 'Kapasitas', value: '250 Tamu Undangan' },
      { key: 'Dokumentasi', value: '2 Fotografer + 1 Videografer' },
      { key: 'Hiburan', value: 'Acoustic Band (1 Singer)' },
    ],
    harga_normal: 45000000, stok: 15,
    foto_urls: ['https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-22'
  },
  {
    id: 16, nama: 'Sewa Dekorasi & Peralatan Resepsi', sku: 'WED-003', merek: 'TKN Wedding',
    kategori_id: 9, kategori_nama: 'Wedding',
    deskripsi: 'Layanan penyewaan perlengkapan lengkap bagi Anda yang telah memiliki katering sendiri. Mencakup tenda VIP, kursi tamu, sound system, panggung, dan dekorasi pelaminan.',
    spesifikasi: [
      { key: 'Tenda & Pelaminan', value: 'Desain Modern Eksklusif' },
      { key: 'Sound System', value: '3000 Watt' },
      { key: 'Katering', value: 'Tidak Termasuk' },
    ],
    harga_normal: 25000000, stok: 5,
    foto_urls: ['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80'],
    is_promo: false, is_aktif: true, created_at: '2025-01-22'
  }
];

export const mockPesanan: Pesanan[] = [];
