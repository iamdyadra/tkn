<?php
require_once '../config/koneksi.php';

$input = getJsonInput();
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    sendResponse(false, null, 'Email dan password tidak boleh kosong');
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_aktif = 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    unset($user['password']); // Jangan kirim password kembali
    $user['is_aktif'] = (bool) $user['is_aktif'];
    sendResponse(true, $user, 'Login berhasil');
} else {
    sendResponse(false, null, 'Email atau password salah, atau akun tidak aktif');
}
?>
