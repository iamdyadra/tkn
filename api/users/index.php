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
    
    if (isset($input['is_aktif'])) {
        $stmt = $pdo->prepare("UPDATE users SET is_aktif = ? WHERE id = ?");
        if ($stmt->execute([(int)$input['is_aktif'], $id])) {
            sendResponse(true, null, 'Status user diperbarui');
        } else {
            sendResponse(false, null, 'Gagal update status');
        }
    }
}
?>
