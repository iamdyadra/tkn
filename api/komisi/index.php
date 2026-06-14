<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// ═══════════════════════════════════════════════════════════════
// GET
// ═══════════════════════════════════════════════════════════════
if ($method === 'GET') {
    $id       = $_GET['id']       ?? null;
    $sales_id = $_GET['sales_id'] ?? null;
    $summary  = $_GET['summary']  ?? null;

    // ── Summary ────────────────────────────────────────────────
    if ($summary && $sales_id) {
        $stmt = $pdo->prepare("
            SELECT
                COALESCE(SUM(CASE WHEN status = 'pending'   THEN nominal_komisi ELSE 0 END), 0) AS total_pending,
                COALESCE(SUM(CASE WHEN status = 'disetujui' THEN nominal_komisi ELSE 0 END), 0) AS total_disetujui,
                COALESCE(SUM(CASE WHEN status = 'dibayar'   THEN nominal_komisi ELSE 0 END), 0) AS total_dibayar
            FROM komisi WHERE sales_id = ?
        ");
        $stmt->execute([$sales_id]);
        $row = $stmt->fetch();
        sendResponse(true, [
            'total_pending'   => (int)$row['total_pending'],
            'total_disetujui' => (int)$row['total_disetujui'],
            'total_dibayar'   => (int)$row['total_dibayar'],
        ], 'Summary komisi');
    }

    // ── Detail by ID ───────────────────────────────────────────
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT k.*, u.nama AS sales_nama, p.kode AS kode_pesanan,
                   r.nama_rule
            FROM komisi k
            LEFT JOIN users u ON k.sales_id = u.id
            LEFT JOIN pesanan p ON k.pesanan_id = p.id
            LEFT JOIN komisi_rules r ON k.rule_id = r.id
            WHERE k.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) sendResponse(false, null, 'Komisi tidak ditemukan');
        sendResponse(true, castKomisi($row), 'Detail komisi');
    }

    // ── List by sales ──────────────────────────────────────────
    $query = "
        SELECT k.*, u.nama AS sales_nama, p.kode AS kode_pesanan,
               r.nama_rule
        FROM komisi k
        LEFT JOIN users u ON k.sales_id = u.id
        LEFT JOIN pesanan p ON k.pesanan_id = p.id
        LEFT JOIN komisi_rules r ON k.rule_id = r.id
    ";
    $params = [];
    if ($sales_id) {
        $query .= " WHERE k.sales_id = ?";
        $params[] = $sales_id;
    }
    $query .= " ORDER BY k.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    sendResponse(true, array_map('castKomisi', $rows), 'Data komisi');
}

// ═══════════════════════════════════════════════════════════════
// PUT — update status (admin only)
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'PUT') {
    $id    = $_GET['id'] ?? null;
    $input = getJsonInput();

    if (!$id) sendResponse(false, null, 'ID komisi tidak disertakan');

    $status  = $input['status']  ?? null;
    $catatan = $input['catatan'] ?? null;

    $validStatus = ['disetujui', 'dibayar', 'ditolak'];
    if (!in_array($status, $validStatus)) {
        sendResponse(false, null, 'Status tidak valid');
    }

    $now = date('Y-m-d H:i:s');
    $approved_at = ($status === 'disetujui') ? $now : null;
    $paid_at     = ($status === 'dibayar')   ? $now : null;

    // If disetujui, keep existing approved_at if already set
    if ($status === 'dibayar') {
        $stmt = $pdo->prepare("
            UPDATE komisi
            SET status = ?, catatan = ?,
                approved_at = COALESCE(approved_at, ?),
                paid_at = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $catatan, $now, $paid_at, $id]);
    } elseif ($status === 'disetujui') {
        $stmt = $pdo->prepare("
            UPDATE komisi SET status = ?, catatan = ?, approved_at = ? WHERE id = ?
        ");
        $stmt->execute([$status, $catatan, $approved_at, $id]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE komisi SET status = ?, catatan = ? WHERE id = ?
        ");
        $stmt->execute([$status, $catatan, $id]);
    }

    sendResponse(true, null, 'Status komisi diperbarui');
}

// ── Cast helper ────────────────────────────────────────────────
function castKomisi(array $row): array {
    $row['id']             = (int)$row['id'];
    $row['pesanan_id']     = (int)$row['pesanan_id'];
    $row['sales_id']       = (int)$row['sales_id'];
    $row['rule_id']        = $row['rule_id'] ? (int)$row['rule_id'] : null;
    $row['nilai_pesanan']  = (int)$row['nilai_pesanan'];
    $row['persen_komisi']  = (float)$row['persen_komisi'];
    $row['nominal_komisi'] = (int)$row['nominal_komisi'];
    return $row;
}
?>
