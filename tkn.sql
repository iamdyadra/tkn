-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 20, 2026 at 07:57 AM
-- Server version: 8.0.30
-- PHP Version: 8.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tkn`
--

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `ikon` varchar(50) NOT NULL,
  `warna` varchar(50) NOT NULL,
  `deskripsi` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id`, `nama`, `ikon`, `warna`, `deskripsi`, `created_at`) VALUES
(11, 'Wisata Halal', 'star', 'bg-green-600', 'Paket wisata halal dan ibadah', '2026-06-13 02:38:07'),
(12, 'Tiket Pesawat', 'plane', 'bg-sky-500', 'Tiket pesawat domestik dan internasional', '2026-06-13 02:38:07'),
(13, 'Hotel & Resort', 'building', 'bg-emerald-500', 'Booking hotel dan resort', '2026-06-13 02:38:07'),
(14, 'Tour & Travel', 'map', 'bg-blue-500', 'Paket tour dan travel', '2026-06-13 02:38:07'),
(15, 'Umroh & Haji', 'landmark', 'bg-amber-600', 'Layanan perjalanan ibadah', '2026-06-13 02:38:07'),
(16, 'Wisata Religi', 'compass', 'bg-teal-600', 'Wisata religi dan ziarah', '2026-06-13 02:38:07'),
(17, 'Wisata Alam', 'tree-pine', 'bg-green-500', 'Wisata alam dan petualangan', '2026-06-13 02:38:07'),
(18, 'Logistik & Kargo', 'package', 'bg-slate-700', 'Layanan logistik dan pengiriman kargo', '2026-06-13 02:38:07'),
(19, 'Event & MICE', 'users', 'bg-purple-500', 'Pengelolaan event, meeting, conference', '2026-06-13 02:38:07'),
(20, 'Transportasi', 'car', 'bg-rose-500', 'Sewa kendaraan dan transportasi', '2026-06-13 02:38:07');

-- --------------------------------------------------------

--
-- Table structure for table `komisi`
--

CREATE TABLE `komisi` (
  `id` int NOT NULL,
  `pesanan_id` int NOT NULL,
  `sales_id` int NOT NULL,
  `rule_id` int DEFAULT NULL,
  `nilai_pesanan` int NOT NULL COMMENT 'Snapshot total pesanan saat komisi dibuat',
  `persen_komisi` decimal(5,2) NOT NULL,
  `nominal_komisi` int NOT NULL COMMENT 'Nominal komisi dalam Rupiah',
  `status` enum('pending','disetujui','dibayar','ditolak') NOT NULL DEFAULT 'pending',
  `catatan` text,
  `approved_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Rekap komisi sales per pesanan yang diproses';

--
-- Dumping data for table `komisi`
--

INSERT INTO `komisi` (`id`, `pesanan_id`, `sales_id`, `rule_id`, `nilai_pesanan`, `persen_komisi`, `nominal_komisi`, `status`, `catatan`, `approved_at`, `paid_at`, `created_at`) VALUES
(1, 16, 5, 3, 24900000, '5.00', 1245000, 'dibayar', 'Sudah dibayar ya', '2026-06-14 02:34:55', '2026-06-14 02:35:05', '2026-06-14 08:14:55'),
(2, 11, 4, 9, 1000000, '3.75', 37500, 'dibayar', 'Sudah', '2026-06-14 02:35:13', '2026-06-14 02:35:18', '2026-06-14 09:32:01'),
(3, 17, 8, 1, 2700000, '3.00', 81000, 'pending', NULL, NULL, NULL, '2026-06-15 07:09:21'),
(4, 18, 9, 1, 1350000, '3.00', 40500, 'pending', NULL, NULL, NULL, '2026-06-15 07:18:04');

-- --------------------------------------------------------

--
-- Table structure for table `komisi_rules`
--

CREATE TABLE `komisi_rules` (
  `id` int NOT NULL,
  `kategori_id` int DEFAULT NULL COMMENT 'NULL = berlaku untuk semua kategori (global)',
  `nama_rule` varchar(100) NOT NULL,
  `tipe` enum('persentase','nominal') NOT NULL DEFAULT 'persentase',
  `nilai` decimal(10,2) NOT NULL,
  `min_transaksi` int NOT NULL DEFAULT '0',
  `is_aktif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Aturan perhitungan komisi per kategori atau global';

--
-- Dumping data for table `komisi_rules`
--

INSERT INTO `komisi_rules` (`id`, `kategori_id`, `nama_rule`, `tipe`, `nilai`, `min_transaksi`, `is_aktif`, `created_at`) VALUES
(1, NULL, 'Komisi Umum Tier 1', 'persentase', '3.00', 0, 1, '2026-06-14 08:03:02'),
(2, NULL, 'Komisi Umum Tier 2', 'persentase', '4.00', 5000000, 1, '2026-06-14 08:03:02'),
(3, NULL, 'Komisi Umum Tier 3', 'persentase', '5.00', 15000000, 1, '2026-06-14 08:03:02'),
(4, NULL, 'Komisi Umum Tier 4', 'persentase', '6.00', 30000000, 1, '2026-06-14 08:03:02'),
(5, 11, 'Paket Wisata Default', 'persentase', '5.00', 0, 1, '2026-06-14 08:03:02'),
(6, 11, 'Paket Wisata Tier 2', 'persentase', '7.00', 10000000, 1, '2026-06-14 08:03:02'),
(7, 15, 'Umroh & Haji Default', 'persentase', '3.00', 0, 1, '2026-06-14 08:03:02'),
(8, 15, 'Umroh & Haji Tier 2', 'persentase', '4.00', 25000000, 1, '2026-06-14 08:03:02'),
(9, 13, 'Hotel & Resort Default', 'persentase', '4.00', 0, 1, '2026-06-14 08:03:02'),
(10, 13, 'Hotel & Resort Tier 2', 'persentase', '5.00', 10000000, 1, '2026-06-14 08:03:02'),
(11, 12, 'Tiket Pesawat Default', 'persentase', '2.00', 0, 1, '2026-06-14 08:03:02'),
(12, 12, 'Tiket Pesawat Tier 2', 'persentase', '3.00', 10000000, 1, '2026-06-14 08:03:02'),
(13, 19, 'Event & MICE Default', 'persentase', '5.00', 0, 1, '2026-06-14 08:03:02'),
(14, 19, 'Event & MICE Tier 2', 'persentase', '7.00', 20000000, 1, '2026-06-14 08:03:02');

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id` int NOT NULL,
  `kode` varchar(50) NOT NULL,
  `sales_id` int DEFAULT NULL,
  `nama_pelanggan` varchar(100) NOT NULL,
  `perusahaan` varchar(100) NOT NULL,
  `telepon_pelanggan` varchar(20) NOT NULL,
  `alamat_pengiriman` text NOT NULL,
  `catatan` text,
  `total` int NOT NULL,
  `status` enum('draft','diproses','dikirim','diterima','dibatalkan') NOT NULL DEFAULT 'draft',
  `offline_pending` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pesanan`
--

INSERT INTO `pesanan` (`id`, `kode`, `sales_id`, `nama_pelanggan`, `perusahaan`, `telepon_pelanggan`, `alamat_pengiriman`, `catatan`, `total`, `status`, `offline_pending`, `created_at`) VALUES
(2, 'ORD-20260502-5222', 4, 'Valdi', 'PT. Berdikari', '231312332321', 'Depok, Jalan Setapak', 'adadadaad', 2500000, 'diterima', 0, '2026-05-02 04:57:08'),
(11, 'ORD-20260611-5887', 4, 'Valdiiiii', 'ererere', '231312332321', 'vdffdvdfvdfdfvvfvd', 'vfdvfdvdfvdfvdfv', 1000000, 'diterima', 0, '2026-06-11 11:49:14'),
(16, 'ORD-20260614-9262', 5, 'sdsddsd', 'PT. Arkodsdsd', '201209109019201', 'fvnjfdnvjnjdnjfnvfdvfdvd', 'mlkmdvlkmfdlkjigjblkdjlfd', 24900000, 'diterima', 0, '2026-06-14 08:14:55'),
(17, 'ORD-20260615-4766', 8, 'Arni', 'PT. IMU', '348349859584', 'assacmkdncjfurdskjcjfre', 'ceihshciewndkqjdkjois', 2700000, 'diterima', 0, '2026-06-15 07:09:21'),
(18, 'ORD-20260615-4783', 9, 'Fora', 'PT. Budok', '02120920910921', 'oekdoekdoekdeokokdokakmnjs', 'cdsmcdhiushciurehscnjhsriue', 1350000, 'diterima', 0, '2026-06-15 07:18:04');

-- --------------------------------------------------------

--
-- Table structure for table `pesanan_items`
--

CREATE TABLE `pesanan_items` (
  `id` int NOT NULL,
  `pesanan_id` int NOT NULL,
  `produk_id` int NOT NULL,
  `harga_satuan` int NOT NULL,
  `qty` int NOT NULL,
  `subtotal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pesanan_items`
--

INSERT INTO `pesanan_items` (`id`, `pesanan_id`, `produk_id`, `harga_satuan`, `qty`, `subtotal`) VALUES
(2, 2, 29, 2500000, 1, 2500000),
(13, 11, 31, 250000, 1, 250000),
(14, 11, 28, 750000, 1, 750000),
(21, 16, 33, 24900000, 1, 24900000),
(22, 17, 34, 1350000, 2, 2700000),
(23, 18, 34, 1350000, 1, 1350000);

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id` int NOT NULL,
  `nama` varchar(150) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `merek` varchar(100) NOT NULL,
  `kategori_id` int NOT NULL,
  `deskripsi` text NOT NULL,
  `spesifikasi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `harga_normal` int NOT NULL,
  `harga_promo` int DEFAULT NULL,
  `stok` int NOT NULL DEFAULT '0',
  `foto_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_promo` tinyint(1) NOT NULL DEFAULT '0',
  `promo_mulai` datetime DEFAULT NULL,
  `promo_selesai` datetime DEFAULT NULL,
  `is_aktif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id`, `nama`, `sku`, `merek`, `kategori_id`, `deskripsi`, `spesifikasi`, `harga_normal`, `harga_promo`, `stok`, `foto_urls`, `is_promo`, `promo_mulai`, `promo_selesai`, `is_aktif`, `created_at`) VALUES
(6, 'Paket Umroh Reguler 9 Hari', 'TKN-UMR-01', 'TKN Umroh', 16, 'Paket ibadah umroh periode 9 hari dengan fasilitas hotel bintang 4 di Mekkah dan Madinah.', '[{\"key\":\"Durasi\",\"value\":\"9 Hari\"},{\"key\":\"Hotel\",\"value\":\"Bintang 4\"},{\"key\":\"Maskapai\",\"value\":\"Saudia \\/ Garuda\"}]', 28500000, NULL, 999, '[\"https://images.unsplash.com/photo-1591604129939-f1efa4d8f7ec?auto=format&fit=crop&q=80\"]', 0, NULL, NULL, 1, '2026-04-08 13:58:15'),
(7, 'Tour 3 Negara Asia (TH-MY-SG)', 'TKN-TOR-01', 'TKN Tour', 11, 'Paket wisata mengunjungi Thailand, Malaysia, dan Singapore dalam 7 hari.', '[{\"key\":\"Durasi\",\"value\":\"7 Hari\"},{\"key\":\"Keberangkatan\",\"value\":\"Jakarta\"}]', 8500000, NULL, 999, '[\"https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80\"]', 0, NULL, NULL, 1, '2026-04-08 13:58:15'),
(8, 'Layanan Kargo Express Jawa-Bali', 'TKN-LOG-01', 'TKN Cargo', 18, 'Layanan pengiriman paket kilat rute Jawa - Bali.', '[{\"key\":\"Estimasi\",\"value\":\"2-3 Hari\"},{\"key\":\"Jenis\",\"value\":\"Darat\"}]', 15000, NULL, 999, '[\"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80\"]', 0, NULL, NULL, 1, '2026-04-08 13:58:15'),
(9, 'Sewa Mobil Toyota Hiace (14 Seat)', 'TKN-REN-01', 'TKN Rent', 20, 'Penyediaan armada Toyota Hiace untuk kebutuhan perjalanan dinas atau wisata keluarga.', '[{\"key\":\"Kapasitas\",\"value\":\"14 Orang\"},{\"key\":\"Include\",\"value\":\"Driver & BBM\"}]', 1500000, NULL, 999, '[\"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80\"]', 0, NULL, NULL, 1, '2026-04-08 13:58:15'),
(10, 'Paket Wedding Classic (Rumah)', 'TKN-WED-01', 'TKN Wedding', 19, 'Layanan Wedding Organizer untuk acara pernikahan dirumah yang lengkap dan berkesan.', '[{\"key\":\"Kapasitas\",\"value\":\"500 Pax\"},{\"key\":\"Include\",\"value\":\"Catering & Dekorasi\"}]', 45000000, NULL, 999, '[\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80\"]', 0, NULL, NULL, 1, '2026-04-08 13:58:15'),
(22, 'Paket Wisata Lombok 4D3N (Gili Trawangan)', 'PKG-LOP-43', 'TKN Travel', 11, 'Eksplorasi keindahan pantai Lombok dan keseruan di Gili Trawangan dengan akomodasi premium.', '[{\"key\":\"Durasi\",\"value\":\"4 Hari 3 Malam\"},{\"key\":\"Akomodasi\",\"value\":\"Hotel Bintang 4\"},{\"key\":\"Fasilitas\",\"value\":\"Snorkeling & Lunch\"}]', 5200000, 4850000, 30, '[\"https:\\/\\/images.unsplash.com\\/photo-1570989084505-4d7cba443265?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(23, 'Tiket Singapore Airlines (Jakarta - Singapore PP)', 'TKT-SIN-SQ', 'Singapore Airlines', 12, 'Penerbangan full service dengan kenyamanan kelas dunia bersama Singapore Airlines.', '[{\"key\":\"Bagasi\",\"value\":\"25kg\"},{\"key\":\"Hiburan\",\"value\":\"KrisWorld IFE\"},{\"key\":\"Makanan\",\"value\":\"Pilihan Menu Internasional\"}]', 3500000, 2900000, 100, '[\"https:\\/\\/images.unsplash.com\\/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(24, 'Ayana Resort Bali (Terrace Suite)', 'HTL-AYN-TRC', 'Ayana', 14, 'Rasakan pengalaman menginap di resort terbaik di Bali dengan akses eksklusif ke Rock Bar.', '[{\"key\":\"Tipe Kamar\",\"value\":\"Terrace Suite\"},{\"key\":\"Breakfast\",\"value\":\"Padi Restaurant\"},{\"key\":\"Akses\",\"value\":\"Kubu Beach & Rimba\"}]', 6500000, 5800000, 15, '[\"https:\\/\\/images.unsplash.com\\/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(25, 'Paket Umroh Ramadhan (Lailatul Qadar)', 'UMR-RDN-15', 'Travelella', 16, 'Mengejar keutamaan malam Lailatul Qadar di Masjidil Haram dengan paket khusus akhir Ramadhan.', '[{\"key\":\"Durasi\",\"value\":\"15 Hari\"},{\"key\":\"Hotel Madinah\",\"value\":\"Frontel Al Harithia\"},{\"key\":\"Hotel Mekkah\",\"value\":\"Movenpick Hajar Tower\"}]', 45000000, NULL, 25, '[\"https:\\/\\/images.unsplash.com\\/photo-1564767609342-620cb19b2357?auto=format&fit=crop&q=80&w=1000\"]', 0, NULL, NULL, 1, '2026-04-09 15:05:25'),
(26, 'Sewa Bus Pariwisata SHD (45 Seats)', 'BUS-SHD-45', 'TKN Transport', 20, 'Bus Super High Deck dengan fasilitas entertainment lengkap untuk perjalanan grup besar.', '[{\"key\":\"Kapasitas\",\"value\":\"45 Seats\"},{\"key\":\"Fasilitas\",\"value\":\"AC, TV, Karaoke, Toilet\"},{\"key\":\"Termasuk\",\"value\":\"BBM & Driver\"}]', 4500000, NULL, 5, '[\"https:\\/\\/images.unsplash.com\\/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000\"]', 0, NULL, NULL, 1, '2026-04-09 15:05:25'),
(27, 'Paket Wedding Bali (Beach Front)', 'WDG-BALI-BF', 'TKN Wedding', 19, 'Wujudkan pernikahan impian Anda di pinggir pantai Bali dengan dekorasi eksklusif.', '[{\"key\":\"Kapasitas\",\"value\":\"50 Pax\"},{\"key\":\"Venue\",\"value\":\"Jimbaran Beach\"},{\"key\":\"Termasuk\",\"value\":\"Catering & Decor\"}]', 75000000, 68000000, 2, '[\"https:\\/\\/images.unsplash.com\\/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(28, 'Paket Team Building & Outbound (Bogor)', 'MICE-OUT-BGR', 'TKN Events', 13, 'Program penguatan kerjasama tim dengan aktivitas seru di alam terbuka daerah Bogor.', '[{\"key\":\"Peserta Minimal\",\"value\":\"30 Pax\"},{\"key\":\"Aktivitas\",\"value\":\"Flying Fox, Paintball, Games\"},{\"key\":\"Makan\",\"value\":\"3x Sehari\"}]', 850000, 750000, 10, '[\"https:\\/\\/images.unsplash.com\\/photo-1528605248644-14dd04cb113d?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(29, 'Pengiriman Cargo Internasional (Sea Freight)', 'CRG-SEA-INT', 'TKN Cargo', 18, 'Layanan pengiriman barang skala besar via laut dengan tarif kompetitif.', '[{\"key\":\"Rute\",\"value\":\"Jakarta - Worldwide\"},{\"key\":\"Jenis\",\"value\":\"LCL \\/ FCL\"},{\"key\":\"Estimasi\",\"value\":\"3-4 Minggu\"}]', 2500000, NULL, 999, '[\"https:\\/\\/images.unsplash.com\\/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000\"]', 0, NULL, NULL, 1, '2026-04-09 15:05:25'),
(30, 'Travel Bag TKN Exclusive (Hard Case)', 'MER-BAG-01', 'TKN Merch', 17, 'Koper eksklusif TKN dengan bahan polikarbonat yang kuat dan ringan.', '[{\"key\":\"Ukuran\",\"value\":\"24 Inch\"},{\"key\":\"Bahan\",\"value\":\"Hard Case Polycarbonate\"},{\"key\":\"Roda\",\"value\":\"Double Spinner 360\"}]', 1250000, 950000, 100, '[\"https:\\/\\/images.unsplash.com\\/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(31, 'Voucher Liburan Akhir Tahun (Diskon 50%)', 'PRO-VCH-50', 'TKN Promo', 15, 'Dapatkan potongan langsung untuk semua paket tour TKN di periode akhir tahun.', '[{\"key\":\"Potongan\",\"value\":\"Maks Rp 2.000.000\"},{\"key\":\"Berlaku\",\"value\":\"Desember 2026\"},{\"key\":\"Kategori\",\"value\":\"Semua Tour\"}]', 500000, 250000, 50, '[\"https:\\/\\/images.unsplash.com\\/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000\"]', 1, NULL, NULL, 1, '2026-04-09 15:05:25'),
(33, 'Paket Umroh Reguler 9 Hari - Early Bird', 'UMR-EARLY-2026', 'TKN Umroh', 16, 'Spesial Early Bird! Paket umroh reguler 9 hari dengan fasilitas hotel bintang 4 dekat Masjidil Haram dan Masjid Nabawi. Didampingi muthawif berpengalaman dan asuransi perjalanan penuh. Daftar sekarang, hemat jutaan rupiah!', '[{\"key\":\"Transport\\/Flight\",\"value\":\"Direct Landing Jeddah\"},{\"key\":\"Hotel\",\"value\":\"Bintang 4 (+\\/-200m dari Haram)\"},{\"key\":\"Fasilitas\",\"value\":\"Makan 3x, Visa, Muthawif, Asuransi\"}]', 28500000, 24900000, 30, '[\"https:\\/\\/images.unsplash.com\\/photo-1565552643983-6cc379aa6e64?auto=format&fit=crop&q=80&w=1000\"]', 1, '2026-06-01 00:00:00', '2026-09-30 00:00:00', 1, '2026-06-06 09:35:17'),
(34, 'Sewa Toyota Sedan VIP - Supir Termasuk', 'RNT-SEDAN-2026', 'TKN Rent Car', 20, 'Tampil elegan dan nyaman bersama keluarga atau rekan bisnis dengan Toyota Alphard premium. Cocok untuk airport transfer, perjalanan VIP, wisata dalam kota, atau acara spesial. Supir profesional dan berpengalaman. Armada terawat dan bersih.', '[{\"key\":\"Seat\",\"value\":\"6 Penumpang (Captain Seat)\"},{\"key\":\"Waktu Sewa\",\"value\":\"12 Jam\"},{\"key\":\"Supir\",\"value\":\"Profesional Termasuk\"}]', 1800000, 1350000, 8, '[\"https:\\/\\/images.unsplash.com\\/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000\"]', 1, '2026-06-01 00:00:00', '2026-12-31 00:00:00', 1, '2026-06-06 09:35:29'),
(35, 'Paket Weding', 'PKT-WED-2027', 'TKN WO', 19, 'Pokoknya WO buat weding', '[]', 39000000, 3400000, 8, '[\"https:\\/\\/id.pinterest.com\\/pin\\/1101763496399391089\\/\"]', 1, '2027-05-31 03:23:00', '2027-09-12 12:00:00', 1, '2026-06-14 09:54:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telepon` varchar(20) NOT NULL,
  `role` enum('sales','admin') NOT NULL DEFAULT 'sales',
  `wilayah` varchar(100) DEFAULT NULL,
  `is_aktif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `telepon`, `role`, `wilayah`, `is_aktif`, `created_at`) VALUES
(1, 'Administrator', 'admin@example.com', '$2a$12$3ThLXS.tLPBbInF40OvjruZT6rl68tDcxthZoTVgGhF1Rx.HTkS0G', '081234567890', 'admin', 'Pusat', 1, '2024-04-30 17:00:00'),
(4, 'Administrator', 'admin@tkntravel.com', '$2y$12$aWoFJUcS7viJzjq8JzWU/.vbk5jdUatO/GmeCND8YUWB/xwc7z8F6', '08123456789', 'admin', 'Pusat', 1, '2026-04-08 13:42:47'),
(5, 'Budi Sales', 'budi@tkntravel.com', '$2y$12$Od/0.5Ddpe6zI72RxMoJEuG.S3bx75Kwl7FnHOGmbv.PFZjWv8prS', '08123456789', 'sales', 'Jakarta', 1, '2026-04-08 13:42:48'),
(7, 'Sales TKN', 'sales@tkn.com', '$2y$12$SwOu9rYgiIzqwGnoOh0vzuo4GFKvkiCIyGDXsYOJXDR5GQg/cqJZS', '08123456789', 'sales', 'Jakarta', 1, '2026-06-14 08:24:07'),
(8, 'Abde', 'abde@sales.com', '$2y$12$HSHnL1Zx7NCUYYVlJoWrVu0FO4vdRiz0ezFksjQ2CSc4mRtIpIe9e', '0895074537734', 'sales', 'Bogor', 1, '2026-06-14 09:58:19'),
(9, 'Arnis', 'arnis@tkn.com', '$2y$12$HlRc6jBD.fdjM.wftbZkKOTRTEtSAzQtGkwS5AJIr3BE.RQwjaSz6', '0895074349853', 'sales', 'Depok', 1, '2026-06-15 07:17:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `komisi`
--
ALTER TABLE `komisi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pesanan` (`pesanan_id`),
  ADD KEY `sales_id_idx` (`sales_id`),
  ADD KEY `status_idx` (`status`),
  ADD KEY `fk_komisi_rule` (`rule_id`);

--
-- Indexes for table `komisi_rules`
--
ALTER TABLE `komisi_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kategori_idx` (`kategori_id`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unique` (`kode`),
  ADD KEY `sales_id_idx` (`sales_id`);

--
-- Indexes for table `pesanan_items`
--
ALTER TABLE `pesanan_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pesanan_id_idx` (`pesanan_id`),
  ADD KEY `produk_id_idx` (`produk_id`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD KEY `kategori_id_idx` (`kategori_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `komisi`
--
ALTER TABLE `komisi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `komisi_rules`
--
ALTER TABLE `komisi_rules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `pesanan_items`
--
ALTER TABLE `pesanan_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `komisi`
--
ALTER TABLE `komisi`
  ADD CONSTRAINT `fk_komisi_pesanan` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_komisi_rule` FOREIGN KEY (`rule_id`) REFERENCES `komisi_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_komisi_sales` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `komisi_rules`
--
ALTER TABLE `komisi_rules`
  ADD CONSTRAINT `fk_komisi_rules_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD CONSTRAINT `fk_pesanan_sales` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pesanan_items`
--
ALTER TABLE `pesanan_items`
  ADD CONSTRAINT `fk_pesanan_items_pr` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pesanan_items_ps` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `fk_produk_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
