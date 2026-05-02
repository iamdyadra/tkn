<?php
require_once '../config/koneksi.php';

$input = getJsonInput();
$nama = $input['nama'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$telepon = $input['telepon'] ?? '';
$wilayah = $input['wilayah'] ?? '-';
$role = $input['role'] ?? 'sales';

if (!$nama || !$email || !$password || !$telepon) {
    sendResponse(false, null, 'Data tidak lengkap');
}

// Cek email unik
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendResponse(false, null, 'Email sudah terdaftar');
}

$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("INSERT INTO users (nama, email, password, telepon, role, wilayah, is_aktif) VALUES (?, ?, ?, ?, ?, ?, 1)");
if ($stmt->execute([$nama, $email, $hashed, $telepon, $role, $wilayah])) {
    $id = $pdo->lastInsertId();
    $newUser = [
        'id' => (int)$id,
        'nama' => $nama,
        'email' => $email,
        'telepon' => $telepon,
        'role' => $role,
        'wilayah' => $wilayah,
        'is_aktif' => true,
        'created_at' => date('Y-m-d H:i:s')
    ];
    sendResponse(true, $newUser, 'Registrasi berhasil');
} else {
    sendResponse(false, null, 'Gagal mendaftar pengguna');
}
?>
