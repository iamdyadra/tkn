<?php
require_once __DIR__ . '/../config/koneksi.php';

// Helper to find category ID by keyword
function findKategoriId($pdo, $keyword) {
    $stmt = $pdo->prepare("SELECT id FROM kategori WHERE nama LIKE ? LIMIT 1");
    $stmt->execute(['%' . $keyword . '%']);
    $id = $stmt->fetchColumn();
    return $id ? (int)$id : null;
}

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE komisi_rules; SET FOREIGN_KEY_CHECKS = 1;");

    // Find category IDs dynamically
    $katWisata = findKategoriId($pdo, 'Wisata') ?? findKategoriId($pdo, 'Tour');
    $katPesawat = findKategoriId($pdo, 'Pesawat') ?? findKategoriId($pdo, 'Tiket');
    $katHotel = findKategoriId($pdo, 'Hotel');
    $katUmroh = findKategoriId($pdo, 'Umroh');
    $katEvent = findKategoriId($pdo, 'Event') ?? findKategoriId($pdo, 'MICE');
    $katCruise = findKategoriId($pdo, 'Cruise') ?? findKategoriId($pdo, 'Kapal');

    $rules = [
        // Rule umum
        ['Komisi Umum Tier 1', 'persentase', 3, 0, null],
        ['Komisi Umum Tier 2', 'persentase', 4, 5000000, null],
        ['Komisi Umum Tier 3', 'persentase', 5, 15000000, null],
        ['Komisi Umum Tier 4', 'persentase', 6, 30000000, null],
    ];

    // Specific rules if category is found
    if ($katWisata) {
        $rules[] = ['Paket Wisata Default', 'persentase', 5, 0, $katWisata];
        $rules[] = ['Paket Wisata Tier 2', 'persentase', 7, 10000000, $katWisata];
    }
    if ($katUmroh) {
        $rules[] = ['Umroh & Haji Default', 'persentase', 3, 0, $katUmroh];
        $rules[] = ['Umroh & Haji Tier 2', 'persentase', 4, 25000000, $katUmroh];
    }
    if ($katHotel) {
        $rules[] = ['Hotel & Resort Default', 'persentase', 4, 0, $katHotel];
        $rules[] = ['Hotel & Resort Tier 2', 'persentase', 5, 10000000, $katHotel];
    }
    if ($katPesawat) {
        $rules[] = ['Tiket Pesawat Default', 'persentase', 2, 0, $katPesawat];
        $rules[] = ['Tiket Pesawat Tier 2', 'persentase', 3, 10000000, $katPesawat];
    }
    if ($katEvent) {
        $rules[] = ['Event & MICE Default', 'persentase', 5, 0, $katEvent];
        $rules[] = ['Event & MICE Tier 2', 'persentase', 7, 20000000, $katEvent];
    }
    if ($katCruise) {
        $rules[] = ['Cruise Default', 'persentase', 5, 0, $katCruise];
        $rules[] = ['Cruise Tier 2', 'persentase', 6, 15000000, $katCruise];
    }

    $stmt = $pdo->prepare("INSERT INTO komisi_rules (nama_rule, tipe, nilai, min_transaksi, kategori_id) VALUES (?, ?, ?, ?, ?)");
    foreach ($rules as $r) {
        $stmt->execute($r);
    }

    sendResponse(true, count($rules), 'Seeding komisi rules default berhasil!');
} catch (Exception $e) {
    sendResponse(false, null, 'Gagal seeding: ' . $e->getMessage());
}
?>
