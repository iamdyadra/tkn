<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM kategori ORDER BY id DESC");
    $data = $stmt->fetchAll();
    sendResponse(true, $data, 'Data kategori');
} 
elseif ($method === 'POST') {
    $input = getJsonInput();
    $nama = $input['nama'] ?? '';
    $ikon = $input['ikon'] ?? '';
    $warna = $input['warna'] ?? '';
    $deskripsi = $input['deskripsi'] ?? '';

    $stmt = $pdo->prepare("INSERT INTO kategori (nama, ikon, warna, deskripsi) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$nama, $ikon, $warna, $deskripsi])) {
        $id = $pdo->lastInsertId();
        $input['id'] = (int)$id;
        $input['created_at'] = date('Y-m-d H:i:s');
        sendResponse(true, $input, 'Kategori ditambahkan');
    } else {
        sendResponse(false, null, 'Gagal menambah kategori');
    }
}
elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(false, null, 'ID kategori tidak ada');
    }

    $nama = $input['nama'] ?? '';
    $ikon = $input['ikon'] ?? '';
    $warna = $input['warna'] ?? '';
    $deskripsi = $input['deskripsi'] ?? '';

    $stmt = $pdo->prepare("UPDATE kategori SET nama = ?, ikon = ?, warna = ?, deskripsi = ? WHERE id = ?");
    if ($stmt->execute([$nama, $ikon, $warna, $deskripsi, $id])) {
        $input['id'] = (int)$id;
        sendResponse(true, $input, 'Kategori diperbarui');
    } else {
        sendResponse(false, null, 'Gagal memperbarui kategori');
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(false, null, 'ID kategori tidak ada');
    }
    
    // Check if products exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM produk WHERE kategori_id = ?");
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) {
        sendResponse(false, null, 'Kategori tidak dapat dihapus karena memiliki produk');
    }

    $stmt = $pdo->prepare("DELETE FROM kategori WHERE id = ?");
    if ($stmt->execute([$id])) {
        sendResponse(true, null, 'Kategori dihapus');
    } else {
        sendResponse(false, null, 'Gagal menghapus kategori');
    }
}
?>
