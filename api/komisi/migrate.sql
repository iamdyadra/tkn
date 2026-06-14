-- ============================================================
-- Migrasi: Fitur Komisi Sales — TKN Travel
-- Jalankan sekali di database `tkn`
-- ============================================================

USE `tkn`;

-- 1. Tambah kolom persen_komisi pada tabel users (override per sales)
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `persen_komisi` DECIMAL(5,2) DEFAULT NULL
  COMMENT 'Override persentase komisi. NULL = pakai default global';

-- 2. Tabel pengaturan komisi global
CREATE TABLE IF NOT EXISTS `pengaturan_komisi` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `persen_default` DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Konfigurasi global persentase komisi sales';

-- Seed default jika belum ada
INSERT IGNORE INTO `pengaturan_komisi` (`id`, `persen_default`) VALUES (1, 5.00);

-- 3. Tabel komisi
CREATE TABLE IF NOT EXISTS `komisi` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `pesanan_id`    INT          NOT NULL,
  `sales_id`      INT          NOT NULL,
  `total_pesanan` INT          NOT NULL COMMENT 'Snapshot nilai pesanan saat komisi dibuat',
  `persen_komisi` DECIMAL(5,2) NOT NULL,
  `nilai_komisi`  INT          NOT NULL COMMENT 'Nominal komisi dalam Rupiah',
  `status`        ENUM('pending','dibayar') NOT NULL DEFAULT 'pending',
  `dibayar_at`    DATETIME     DEFAULT NULL,
  `catatan`       TEXT         DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pesanan` (`pesanan_id`),
  KEY `sales_id_idx` (`sales_id`),
  KEY `status_idx` (`status`),
  CONSTRAINT `fk_komisi_pesanan` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_komisi_sales`   FOREIGN KEY (`sales_id`)   REFERENCES `users`   (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Rekap komisi sales per pesanan yang diterima';
