-- ============================================================
-- Migrasi v2: Fitur Komisi Sales (Rules Engine) — TKN Travel
-- Jalankan sekali di database `tkn`
-- CATATAN: Jika sudah menjalankan migrate.sql (v1), tabel `komisi`
-- akan di-drop dan dibuat ulang dengan skema baru yang lebih lengkap.
-- ============================================================

USE `tkn`;

-- ── 0. Drop tabel lama jika ada (v1 schema) ──────────────────
DROP TABLE IF EXISTS `komisi`;
DROP TABLE IF EXISTS `pengaturan_komisi`;

-- ── 1. Tabel aturan komisi ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `komisi_rules` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `kategori_id`    INT           NULL DEFAULT NULL COMMENT 'NULL = berlaku untuk semua kategori (global)',
  `nama_rule`      VARCHAR(100)  NOT NULL,
  `tipe`           ENUM('persentase','nominal') NOT NULL DEFAULT 'persentase',
  `nilai`          DECIMAL(10,2) NOT NULL,
  `min_transaksi`  INT           NOT NULL DEFAULT 0,
  `is_aktif`       TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`     TIMESTAMP     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `kategori_idx` (`kategori_id`),
  CONSTRAINT `fk_komisi_rules_kategori`
    FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Aturan perhitungan komisi per kategori atau global';

-- Seed: default global rule 5% (berlaku jika tidak ada rule kategori yang cocok)
INSERT IGNORE INTO `komisi_rules` (`id`, `kategori_id`, `nama_rule`, `tipe`, `nilai`, `min_transaksi`, `is_aktif`)
VALUES (1, NULL, 'Komisi Default Global', 'persentase', 5.00, 0, 1);

-- ── 2. Tabel komisi per pesanan ───────────────────────────────
CREATE TABLE IF NOT EXISTS `komisi` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `pesanan_id`      INT           NOT NULL,
  `sales_id`        INT           NOT NULL,
  `rule_id`         INT           NULL DEFAULT NULL,
  `nilai_pesanan`   INT           NOT NULL COMMENT 'Snapshot total pesanan saat komisi dibuat',
  `persen_komisi`   DECIMAL(5,2)  NOT NULL,
  `nominal_komisi`  INT           NOT NULL COMMENT 'Nominal komisi dalam Rupiah',
  `status`          ENUM('pending','disetujui','dibayar','ditolak') NOT NULL DEFAULT 'pending',
  `catatan`         TEXT          DEFAULT NULL,
  `approved_at`     TIMESTAMP     NULL DEFAULT NULL,
  `paid_at`         TIMESTAMP     NULL DEFAULT NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pesanan` (`pesanan_id`),
  KEY `sales_id_idx` (`sales_id`),
  KEY `status_idx` (`status`),
  CONSTRAINT `fk_komisi_pesanan`
    FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_komisi_sales`
    FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_komisi_rule`
    FOREIGN KEY (`rule_id`) REFERENCES `komisi_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Rekap komisi sales per pesanan yang diproses';
