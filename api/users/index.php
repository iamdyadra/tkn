<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = $_GET['role'] ?? null;
    $query = "SELECT id, nama, email, telepon, role, wilayah, is_aktif, created_at FROM users";
    $params = [];
    
    if ($role) {
        $query .= " WHERE role = ?";
        $params[] = $role;
    }
    
    $query .= " ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
    
    foreach ($data as &$row) {
        $row['id'] = (int)$row['id'];
        $row['is_aktif'] = (bool)$row['is_aktif'];
    }
    
    sendResponse(true, $data, 'Data users');
}
elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendResponse(false, null, 'ID user tidak disertakan');
    }

    // Update status aktif saja
    if (array_key_exists('is_aktif', $input) && count($input) === 1) {
        $stmt = $pdo->prepare("UPDATE users SET is_aktif = ? WHERE id = ?");
        if ($stmt->execute([(int)$input['is_aktif'], $id])) {
            sendResponse(true, null, 'Status user diperbarui');
        } else {
            sendResponse(false, null, 'Gagal update status');
        }
    }

    // Update data profil sales (nama, email, telepon, wilayah)
    $fields = [];
    $params = [];

    if (!empty($input['nama'])) {
        $fields[] = 'nama = ?';
        $params[] = $input['nama'];
    }
    if (!empty($input['email'])) {
        $fields[] = 'email = ?';
        $params[] = $input['email'];
    }
    if (isset($input['telepon'])) {
        $fields[] = 'telepon = ?';
        $params[] = $input['telepon'];
    }
    if (isset($input['wilayah'])) {
        $fields[] = 'wilayah = ?';
        $params[] = $input['wilayah'];
    }
    if (array_key_exists('is_aktif', $input)) {
        $fields[] = 'is_aktif = ?';
        $params[] = (int)$input['is_aktif'];
    }

    if (empty($fields)) {
        sendResponse(false, null, 'Tidak ada data yang diperbarui');
    }

    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
    if ($stmt->execute($params)) {
        // Return updated user data
        $stmtGet = $pdo->prepare("SELECT id, nama, email, telepon, role, wilayah, is_aktif, created_at FROM users WHERE id = ?");
        $stmtGet->execute([$id]);
        $user = $stmtGet->fetch();
        $user['id'] = (int)$user['id'];
        $user['is_aktif'] = (bool)$user['is_aktif'];
        sendResponse(true, $user, 'Data user diperbarui');
    } else {
        sendResponse(false, null, 'Gagal update data user');
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        sendResponse(false, null, 'ID user tidak disertakan');
    }

    // Pastikan yang dihapus adalah role sales
    $stmtChk = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $stmtChk->execute([$id]);
    $user = $stmtChk->fetch();

    if (!$user) {
        sendResponse(false, null, 'User tidak ditemukan');
    }
    if ($user['role'] !== 'sales') {
        sendResponse(false, null, 'Hanya akun sales yang dapat dihapus');
    }

    // Cek apakah sales memiliki riwayat pesanan
    $stmtOrders = $pdo->prepare("SELECT COUNT(*) FROM pesanan WHERE sales_id = ?");
    $stmtOrders->execute([$id]);
    $orderCount = (int)$stmtOrders->fetchColumn();

    if ($orderCount > 0) {
        sendResponse(false, null, 'Sales memiliki riwayat pesanan dan tidak dapat dihapus. Nonaktifkan akun sebagai gantinya.');
    }

    // Hapus user
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'sales'");
    $stmt->execute([$id]);

    sendResponse(true, null, 'Akun sales berhasil dihapus');
}

?>
