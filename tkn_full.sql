-- ============================================================
-- TKN Travel E-Catalogue — Full Database Schema
-- Versi: Final (include komisi v2)
-- Server: MariaDB 10.4+ / MySQL 5.7+
-- Charset: utf8mb4
-- Import ke phpMyAdmin: gunakan file ini SAJA (tidak perlu migrate.sql / migrate_v2.sql)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+07:00";
SET NAMES utf8mb4;

-- ============================================================
-- DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS `tkn`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `tkn`;

-- ============================================================
-- 1. TABLE: kategori
-- ============================================================

CREATE TABLE IF NOT EXISTS `kategori` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `nama`       VARCHAR(100) NOT NULL,
  `ikon`       VARCHAR(50)  NOT NULL COMMENT 'Nama icon Lucide (contoh: map, plane, hotel)',
  `warna`      VARCHAR(50)  NOT NULL COMMENT 'Class Tailwind (contoh: bg-blue-500)',
  `deskripsi`  TEXT         DEFAULT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data kategori
TRUNCATE TABLE `kategori`;
INSERT INTO `kategori` (`id`, `nama`, `ikon`, `warna`, `deskripsi`, `created_at`) VALUES
(1,  'Paket Wisata',       'map',           'bg-blue-500',   'Berbagai pilihan paket wisata domestik dan internasional',             '2024-05-01 00:00:00'),
(2,  'Tiket Pesawat',      'plane',         'bg-sky-500',    'Tiket pesawat domestik dan internasional semua maskapai',              '2024-05-01 00:00:00'),
(3,  'Hotel & Resort',     'hotel',         'bg-emerald-500','Booking hotel dan resort bintang 3 hingga 5',                          '2024-05-01 00:00:00'),
(4,  'Umroh & Haji',       'landmark',      'bg-amber-600',  'Layanan perjalanan ibadah Umroh dan Haji Plus',                        '2024-05-01 00:00:00'),
(5,  'Dokumen Perjalanan', 'file-text',     'bg-indigo-500', 'Pengurusan Visa, Paspor, dan dokumen lainnya',                         '2024-05-01 00:00:00'),
(6,  'Transportasi',       'car',           'bg-rose-500',   'Sewa mobil, bus, dan antar-jemput bandara',                            '2024-05-01 00:00:00'),
(7,  'Event & MICE',       'users',         'bg-purple-500', 'Pengelolaan event, meeting, incentive, conference, exhibition',         '2024-05-01 00:00:00'),
(8,  'Cruise',             'ship',          'bg-cyan-500',   'Paket wisata kapal pesiar mewah internasional',                        '2024-05-01 00:00:00'),
(9,  'Asuransi',           'shield-check',  'bg-teal-500',   'Asuransi perjalanan untuk keamanan liburan Anda',                      '2024-05-01 00:00:00'),
(10, 'Corporate Travel',   'briefcase',     'bg-slate-700',  'Layanan perjalanan bisnis terpadu untuk perusahaan',                   '2024-05-01 00:00:00');

-- ============================================================
-- 2. TABLE: users
--    Kolom persen_komisi ditambahkan (override komisi per sales)
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`             INT(11)                    NOT NULL AUTO_INCREMENT,
  `nama`           VARCHAR(100)               NOT NULL,
  `email`          VARCHAR(100)               NOT NULL,
  `password`       VARCHAR(255)               NOT NULL COMMENT 'bcrypt hash',
  `telepon`        VARCHAR(20)                NOT NULL,
  `role`           ENUM('sales','admin')      NOT NULL DEFAULT 'sales',
  `wilayah`        VARCHAR(100)               DEFAULT NULL,
  `is_aktif`       TINYINT(1)                 NOT NULL DEFAULT 1,
  `persen_komisi`  DECIMAL(5,2)               DEFAULT NULL COMMENT 'Override % komisi per sales. NULL = pakai rule global.',
  `created_at`     TIMESTAMP                  NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed user: password = "password" (bcrypt Laravel default hash)
-- GANTI password setelah import!
INSERT IGNORE INTO `users` (`id`, `nama`, `email`, `password`, `telepon`, `role`, `wilayah`, `is_aktif`, `persen_komisi`) VALUES
(1, 'Administrator', 'admin@tkn.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '081234567890', 'admin', 'Pusat', 1, NULL),
(2, 'Sales Demo', 'sales@tkn.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 '081234567891', 'sales', 'Jakarta', 1, NULL);

-- ============================================================
-- 3. TABLE: produk
-- ============================================================

CREATE TABLE IF NOT EXISTS `produk` (
  `id`            INT(11)    NOT NULL AUTO_INCREMENT,
  `nama`          VARCHAR(150) NOT NULL,
  `sku`           VARCHAR(50)  NOT NULL,
  `merek`         VARCHAR(100) NOT NULL,
  `kategori_id`   INT(11)      NOT NULL,
  `deskripsi`     TEXT         NOT NULL,
  `spesifikasi`   LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
                  CHECK (json_valid(`spesifikasi`)),
  `harga_normal`  INT(11)      NOT NULL,
  `harga_promo`   INT(11)      DEFAULT NULL,
  `stok`          INT(11)      NOT NULL DEFAULT 0,
  `foto_urls`     LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
                  CHECK (json_valid(`foto_urls`)),
  `is_promo`      TINYINT(1)   NOT NULL DEFAULT 0,
  `promo_mulai`   DATETIME     DEFAULT NULL,
  `promo_selesai` DATETIME     DEFAULT NULL,
  `is_aktif`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`),
  KEY `kategori_id_idx` (`kategori_id`),
  CONSTRAINT `fk_produk_kategori`
    FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data produk
TRUNCATE TABLE `produk`;
INSERT INTO `produk` (`id`, `nama`, `sku`, `merek`, `kategori_id`, `deskripsi`, `spesifikasi`, `harga_normal`, `harga_promo`, `stok`, `foto_urls`, `is_promo`, `promo_mulai`, `promo_selesai`, `is_aktif`, `created_at`) VALUES
(1,  'Paket Wisata Bali 3 Hari 2 Malam',        'PKG-BALI-32',  'TKN Travel',      1, 'Nikmati indahnya pulau Bali dengan kunjungan ke Kintamani, Uluwatu, dan Tanah Lot.',
     '[{"key":"Durasi","value":"3 Hari 2 Malam"},{"key":"Akomodasi","value":"Hotel Bintang 4"},{"key":"Tiket Pesawat","value":"Termasuk PP"}]',
     4500000, 3950000, 50,
     '["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000"]',
     1, '2024-04-01 00:00:00', '2024-12-31 23:59:59', 1, '2024-05-01 00:00:00'),
(2,  'Paket Umroh Reguler 9 Hari',               'UMR-REG-9D',   'Travelella',      4, 'Ibadah umroh nyaman dengan bimbingan ustadz berpengalaman. Menggunakan maskapai Saudi Airlines.',
     '[{"key":"Durasi","value":"9 Hari"},{"key":"Hotel Mekkah","value":"Anjum Hotel"},{"key":"Hotel Madinah","value":"Odset Hotel"}]',
     32000000, NULL, 40,
     '["https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1000"]',
     0, NULL, NULL, 1, '2024-05-01 00:00:00'),
(3,  'Tiket Jakarta - Tokyo (Economy)',           'TKT-NRT-ECO',  'Garuda Indonesia',2, 'Penerbangan langsung Jakarta ke Tokyo Narita menggunakan Garuda Indonesia.',
     '[{"key":"Bagasi","value":"30kg"},{"key":"Makanan","value":"Termasuk"},{"key":"Tipe","value":"Full Service"}]',
     12500000, 10800000, 20,
     '["https://images.unsplash.com/photo-1540339832862-4745a9805ad0?auto=format&fit=crop&q=80&w=1000"]',
     1, '2024-04-10 00:00:00', '2024-06-30 23:59:59', 1, '2024-05-01 00:00:00'),
(4,  'Sewa Toyota Alphard + Driver (12 Jam)',     'REN-ALP-01',   'TKN Transport',   6, 'Layanan sewa mobil mewah Alphard untuk area Jakarta dan sekitarnya.',
     '[{"key":"Durasi","value":"12 Jam"},{"key":"Driver","value":"Termasuk"},{"key":"BBM","value":"Tidak Termasuk"}]',
     2500000, NULL, 5,
     '["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000"]',
     0, NULL, NULL, 1, '2024-05-01 00:00:00'),
(5,  'Paket Wisata Labuan Bajo (Phinisi)',        'PKG-LBJ-PNS',  'TKN Travel',      1, 'Live on Board dengan kapal Phinisi mewah menjelajahi Pulau Komodo dan sekitarnya.',
     '[{"key":"Durasi","value":"3 Hari 2 Malam"},{"key":"Tipe Kapal","value":"Phinisi VIP"},{"key":"Aktivitas","value":"Snorkeling & Trekking"}]',
     6500000, NULL, 12,
     '["https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=1000"]',
     0, NULL, NULL, 1, '2024-05-01 00:00:00'),
(6,  'Hotel The Ritz-Carlton Jakarta (Grand Room)','HTL-RC-GND',  'Ritz-Carlton',    3, 'Menginap mewah di jantung kota Jakarta dengan fasilitas kelas dunia.',
     '[{"key":"Room Type","value":"Grand Room"},{"key":"Breakfast","value":"2 Orang"},{"key":"Fasilitas","value":"Pool & Gym"}]',
     3800000, 3400000, 10,
     '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"]',
     1, '2024-05-01 00:00:00', '2024-05-31 23:59:59', 1, '2024-05-01 00:00:00'),
(7,  'Visa Turis Amerika Serikat (B1/B2)',        'DOC-USA-B1',   'TKN Docs',        5, 'Jasa pengurusan visa turis Amerika Serikat termasuk pengisian form dan jadwal interview.',
     '[{"key":"Proses","value":"2-4 Minggu"},{"key":"Masa Berlaku","value":"5 Tahun"},{"key":"Tipe","value":"Electronic / Multiple"}]',
     3500000, NULL, 999,
     '["https://images.unsplash.com/photo-1557333610-90ba4a89926a?auto=format&fit=crop&q=80&w=1000"]',
     0, NULL, NULL, 1, '2024-05-01 00:00:00'),
(8,  'Corporate Gathering Package (50 Pax)',      'MICE-GTH-50',  'TKN Events',      7, 'Paket gathering perusahaan lengkap dengan meeting room, lunch, dan team building.',
     '[{"key":"Kapasitas","value":"50 Orang"},{"key":"Meeting Room","value":"Full Day"},{"key":"Coffee Break","value":"2 Kali"}]',
     25000000, 22500000, 1,
     '["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000"]',
     1, '2024-05-01 00:00:00', '2024-12-31 23:59:59', 1, '2024-05-01 00:00:00'),
(9,  'Asuransi Perjalanan Worldwide (Platinum)',  'INS-WW-PLT',   'Allianz',         9, 'Proteksi menyeluruh untuk perjalanan ke seluruh dunia termasuk klaim medis dan keterlambatan.',
     '[{"key":"Cakupan","value":"Seluruh Dunia"},{"key":"Medis","value":"Hingga 2M"},{"key":"Durasi","value":"Max 30 Hari"}]',
     850000, NULL, 999,
     '["https://images.unsplash.com/photo-1454165833767-027eeea15c3e?auto=format&fit=crop&q=80&w=1000"]',
     0, NULL, NULL, 1, '2024-05-01 00:00:00'),
(10, 'Cruise Singapore - Malaysia (3 Nights)',    'CRS-SG-MY',    'Royal Caribbean', 8, 'Pelayaran mewah menggunakan Spectrum of the Seas dari Singapore ke Malaysia.',
     '[{"key":"Durasi","value":"4 Hari 3 Malam"},{"key":"Kabin","value":"Ocean View"},{"key":"Makan","value":"Full Board"}]',
     8200000, 7500000, 8,
     '["https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=1000"]',
     1, '2024-05-01 00:00:00', '2024-08-31 23:59:59', 1, '2024-05-01 00:00:00');

-- ============================================================
-- 4. TABLE: pesanan
-- ============================================================

CREATE TABLE IF NOT EXISTS `pesanan` (
  `id`                 INT(11)                                                   NOT NULL AUTO_INCREMENT,
  `kode`               VARCHAR(50)                                               NOT NULL,
  `sales_id`           INT(11)                                                   DEFAULT NULL,
  `nama_pelanggan`     VARCHAR(100)                                              NOT NULL,
  `perusahaan`         VARCHAR(100)                                              NOT NULL,
  `telepon_pelanggan`  VARCHAR(20)                                               NOT NULL,
  `alamat_pengiriman`  TEXT                                                      NOT NULL,
  `catatan`            TEXT                                                      DEFAULT NULL,
  `total`              INT(11)                                                   NOT NULL,
  `status`             ENUM('draft','diproses','dikirim','diterima','dibatalkan') NOT NULL DEFAULT 'draft',
  `offline_pending`    TINYINT(1)                                                NOT NULL DEFAULT 0,
  `created_at`         TIMESTAMP                                                 NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_unique` (`kode`),
  KEY `sales_id_idx` (`sales_id`),
  CONSTRAINT `fk_pesanan_sales`
    FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. TABLE: pesanan_items
-- ============================================================

CREATE TABLE IF NOT EXISTS `pesanan_items` (
  `id`           INT(11) NOT NULL AUTO_INCREMENT,
  `pesanan_id`   INT(11) NOT NULL,
  `produk_id`    INT(11) NOT NULL,
  `harga_satuan` INT(11) NOT NULL,
  `qty`          INT(11) NOT NULL,
  `subtotal`     INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pesanan_id_idx` (`pesanan_id`),
  KEY `produk_id_idx` (`produk_id`),
  CONSTRAINT `fk_pesanan_items_ps`
    FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pesanan_items_pr`
    FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. TABLE: komisi_rules
--    Aturan perhitungan komisi — per kategori atau global
-- ============================================================

CREATE TABLE IF NOT EXISTS `komisi_rules` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `kategori_id`    INT           NULL DEFAULT NULL
                   COMMENT 'NULL = berlaku untuk semua kategori (global)',
  `nama_rule`      VARCHAR(100)  NOT NULL,
  `tipe`           ENUM('persentase','nominal') NOT NULL DEFAULT 'persentase',
  `nilai`          DECIMAL(10,2) NOT NULL,
  `min_transaksi`  INT           NOT NULL DEFAULT 0,
  `is_aktif`       TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`     TIMESTAMP     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `kategori_idx` (`kategori_id`),
  CONSTRAINT `fk_komisi_rules_kategori`
    FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Aturan perhitungan komisi per kategori atau global';

-- Seed: default global rule 5%
INSERT IGNORE INTO `komisi_rules` (`id`, `kategori_id`, `nama_rule`, `tipe`, `nilai`, `min_transaksi`, `is_aktif`)
VALUES (1, NULL, 'Komisi Default Global', 'persentase', 5.00, 0, 1);

-- ============================================================
-- 7. TABLE: komisi
--    Rekap komisi sales per pesanan yang diproses
-- ============================================================

CREATE TABLE IF NOT EXISTS `komisi` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `pesanan_id`      INT          NOT NULL,
  `sales_id`        INT          NOT NULL,
  `rule_id`         INT          NULL DEFAULT NULL,
  `nilai_pesanan`   INT          NOT NULL COMMENT 'Snapshot total pesanan saat komisi dibuat',
  `persen_komisi`   DECIMAL(5,2) NOT NULL,
  `nominal_komisi`  INT          NOT NULL COMMENT 'Nominal komisi dalam Rupiah',
  `status`          ENUM('pending','disetujui','dibayar','ditolak') NOT NULL DEFAULT 'pending',
  `catatan`         TEXT         DEFAULT NULL,
  `approved_at`     TIMESTAMP    NULL DEFAULT NULL,
  `paid_at`         TIMESTAMP    NULL DEFAULT NULL,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pesanan` (`pesanan_id`),
  KEY `sales_id_idx` (`sales_id`),
  KEY `status_idx` (`status`),
  CONSTRAINT `fk_komisi_pesanan`
    FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_komisi_sales`
    FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_komisi_rule`
    FOREIGN KEY (`rule_id`) REFERENCES `komisi_rules` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Rekap komisi sales per pesanan yang diproses';

-- ============================================================
-- Re-enable FK checks & commit
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- ============================================================
-- CATATAN IMPORT:
-- 1. Buka phpMyAdmin → pilih / buat database "tkn"
-- 2. Tab "Import" → pilih file ini → klik "Go"
-- 3. Login default: admin@tkn.com / password (hash bcrypt)
--    WAJIB ganti password setelah login pertama!
-- ============================================================
