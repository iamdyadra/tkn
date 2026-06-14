<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// ═══════════════════════════════════════════════════════════════
// GET — semua rules
// ═══════════════════════════════════════════════════════════════
if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT r.*, k.nama AS kategori_nama
        FROM komisi_rules r
        LEFT JOIN kategori k ON r.kategori_id = k.id
        ORDER BY r.id ASC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['id']            = (int)$row['id'];
        $row['kategori_id']   = $row['kategori_id'] ? (int)$row['kategori_id'] : null;
        $row['nilai']         = (float)$row['nilai'];
        $row['min_transaksi'] = (int)$row['min_transaksi'];
        $row['is_aktif']      = (bool)$row['is_aktif'];
    }
    sendResponse(true, $rows, 'Data rules komisi');
}

// ═══════════════════════════════════════════════════════════════
// POST — tambah rule baru
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'POST') {
    $input = getJsonInput();

    $nama_rule      = trim($input['nama_rule'] ?? '');
    $kategori_id    = isset($input['kategori_id']) && $input['kategori_id'] !== '' ? (int)$input['kategori_id'] : null;
    $tipe           = $input['tipe'] ?? 'persentase';
    $nilai          = (float)($input['nilai'] ?? 0);
    $min_transaksi  = (int)($input['min_transaksi'] ?? 0);
    $is_aktif       = isset($input['is_aktif']) ? (int)$input['is_aktif'] : 1;

    if (empty($nama_rule)) {
        sendResponse(false, null, 'Nama rule wajib diisi');
    }
    if (!in_array($tipe, ['persentase', 'nominal'])) {
        sendResponse(false, null, 'Tipe tidak valid');
    }
    if ($nilai <= 0) {
        sendResponse(false, null, 'Nilai komisi harus lebih dari 0');
    }

    $stmt = $pdo->prepare("
        INSERT INTO komisi_rules (nama_rule, kategori_id, tipe, nilai, min_transaksi, is_aktif)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$nama_rule, $kategori_id, $tipe, $nilai, $min_transaksi, $is_aktif]);
    $newId = (int)$pdo->lastInsertId();

    // Return full row
    $stmt2 = $pdo->prepare("
        SELECT r.*, k.nama AS kategori_nama
        FROM komisi_rules r
        LEFT JOIN kategori k ON r.kategori_id = k.id
        WHERE r.id = ?
    ");
    $stmt2->execute([$newId]);
    $row = $stmt2->fetch();
    $row['id']            = (int)$row['id'];
    $row['kategori_id']   = $row['kategori_id'] ? (int)$row['kategori_id'] : null;
    $row['nilai']         = (float)$row['nilai'];
    $row['min_transaksi'] = (int)$row['min_transaksi'];
    $row['is_aktif']      = (bool)$row['is_aktif'];

    sendResponse(true, $row, 'Rule berhasil ditambahkan');
}

// ═══════════════════════════════════════════════════════════════
// PUT — edit rule
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'PUT') {
    $id    = $_GET['id'] ?? null;
    $input = getJsonInput();

    if (!$id) sendResponse(false, null, 'ID rule tidak disertakan');

    $fields = [];
    $params = [];

    if (isset($input['nama_rule'])) {
        $fields[] = 'nama_rule = ?';
        $params[] = trim($input['nama_rule']);
    }
    if (array_key_exists('kategori_id', $input)) {
        $fields[] = 'kategori_id = ?';
        $params[] = ($input['kategori_id'] !== '' && $input['kategori_id'] !== null) ? (int)$input['kategori_id'] : null;
    }
    if (isset($input['tipe'])) {
        $fields[] = 'tipe = ?';
        $params[] = $input['tipe'];
    }
    if (isset($input['nilai'])) {
        $fields[] = 'nilai = ?';
        $params[] = (float)$input['nilai'];
    }
    if (isset($input['min_transaksi'])) {
        $fields[] = 'min_transaksi = ?';
        $params[] = (int)$input['min_transaksi'];
    }
    if (isset($input['is_aktif'])) {
        $fields[] = 'is_aktif = ?';
        $params[] = (int)$input['is_aktif'];
    }

    if (empty($fields)) {
        sendResponse(false, null, 'Tidak ada data yang diubah');
    }

    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE komisi_rules SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);

    sendResponse(true, null, 'Rule berhasil diperbarui');
}

// ═══════════════════════════════════════════════════════════════
// DELETE — hapus rule
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(false, null, 'ID rule tidak disertakan');

    // Check if rule is used in any komisi
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM komisi WHERE rule_id = ?");
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();

    if ($count > 0) {
        sendResponse(false, null, "Rule ini sudah digunakan dalam {$count} data komisi. Nonaktifkan saja sebagai gantinya.");
    }

    $stmt = $pdo->prepare("DELETE FROM komisi_rules WHERE id = ?");
    $stmt->execute([$id]);

    sendResponse(true, null, 'Rule berhasil dihapus');
}
?>
