<?php
/**
 * GET /api/dashboard
 * Mengembalikan semua statistik dashboard admin dalam satu response:
 * - total_produk_aktif
 * - total_pesanan + breakdown by status
 * - total_sales_aktif
 * - total_komisi_pending
 * - pesanan_per_bulan (12 bulan tahun berjalan)
 * - top_produk (top 5 terlaris by qty dari pesanan_items)
 */
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $year = (int)($_GET['year'] ?? date('Y'));

    // ── 1. Total produk aktif ───────────────────────────────────
    $stmtProduk = $pdo->prepare("SELECT COUNT(*) FROM produk WHERE is_aktif = 1");
    $stmtProduk->execute();
    $total_produk_aktif = (int)$stmtProduk->fetchColumn();

    // ── 2. Total pesanan + breakdown by status ──────────────────
    $stmtPesanan = $pdo->prepare("SELECT status, COUNT(*) as jumlah FROM pesanan GROUP BY status");
    $stmtPesanan->execute();
    $rows = $stmtPesanan->fetchAll();

    $pesanan_by_status = [
        'draft' => 0, 'diproses' => 0, 'dikirim' => 0,
        'diterima' => 0, 'dibatalkan' => 0,
    ];
    $total_pesanan = 0;
    foreach ($rows as $r) {
        $pesanan_by_status[$r['status']] = (int)$r['jumlah'];
        $total_pesanan += (int)$r['jumlah'];
    }

    // ── 3. Total sales aktif ────────────────────────────────────
    $stmtSales = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'sales' AND is_aktif = 1");
    $stmtSales->execute();
    $total_sales_aktif = (int)$stmtSales->fetchColumn();

    // ── 4. Total komisi pending ─────────────────────────────────
    $stmtKomisi = $pdo->prepare("SELECT COUNT(*) FROM komisi WHERE status = 'pending'");
    $stmtKomisi->execute();
    $total_komisi_pending = (int)$stmtKomisi->fetchColumn();

    // ── 5. Pesanan per bulan (tahun berjalan) ───────────────────
    $BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    $pesanan_per_bulan = [];

    $stmtBulan = $pdo->prepare("
        SELECT
            MONTH(created_at) AS bulan,
            COUNT(*) AS jumlah,
            SUM(total) AS nilai
        FROM pesanan
        WHERE YEAR(created_at) = ?
        GROUP BY MONTH(created_at)
        ORDER BY bulan
    ");
    $stmtBulan->execute([$year]);
    $bulanRows = $stmtBulan->fetchAll();

    $bulanMap = [];
    foreach ($bulanRows as $r) {
        $bulanMap[(int)$r['bulan']] = ['jumlah' => (int)$r['jumlah'], 'nilai' => (int)$r['nilai']];
    }

    for ($i = 1; $i <= 12; $i++) {
        $pesanan_per_bulan[] = [
            'bulan'  => $BULAN[$i - 1],
            'jumlah' => $bulanMap[$i]['jumlah'] ?? 0,
            'nilai'  => $bulanMap[$i]['nilai'] ?? 0,
        ];
    }

    // ── 6. Top 5 produk terlaris (by total qty dari pesanan_items) ──
    $stmtTop = $pdo->prepare("
        SELECT
            pr.nama,
            pr.sku,
            COALESCE(SUM(pi.qty), 0) AS total_qty,
            COALESCE(SUM(pi.subtotal), 0) AS total_nilai
        FROM produk pr
        LEFT JOIN pesanan_items pi ON pi.produk_id = pr.id
        WHERE pr.is_aktif = 1
        GROUP BY pr.id, pr.nama, pr.sku
        ORDER BY total_qty DESC
        LIMIT 5
    ");
    $stmtTop->execute();
    $top_produk = $stmtTop->fetchAll();

    foreach ($top_produk as &$tp) {
        $tp['total_qty']   = (int)$tp['total_qty'];
        $tp['total_nilai'] = (int)$tp['total_nilai'];
    }

    // ── 7. Pesanan hari ini ─────────────────────────────────────
    $stmtHariIni = $pdo->prepare("SELECT COUNT(*) FROM pesanan WHERE created_at >= CURRENT_DATE()");
    $stmtHariIni->execute();
    $pesanan_hari_ini = (int)$stmtHariIni->fetchColumn();

    // ── 8. Total kategori aktif ─────────────────────────────────
    $stmtKat = $pdo->prepare("SELECT COUNT(*) FROM kategori");
    $stmtKat->execute();
    $total_kategori = (int)$stmtKat->fetchColumn();

    sendResponse(true, [
        'total_produk_aktif'   => $total_produk_aktif,
        'total_pesanan'        => $total_pesanan,
        'pesanan_by_status'    => $pesanan_by_status,
        'pesanan_hari_ini'     => $pesanan_hari_ini,
        'total_sales_aktif'    => $total_sales_aktif,
        'total_komisi_pending' => $total_komisi_pending,
        'total_kategori'       => $total_kategori,
        'pesanan_per_bulan'    => $pesanan_per_bulan,
        'top_produk'           => $top_produk,
        'tahun'                => $year,
    ], 'Data dashboard');
} else {
    sendResponse(false, null, 'Method tidak diizinkan');
}
?>
