<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $query = "
        SELECT p.*, k.nama as kategori_nama 
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
    ";
    $params = [];
    $where = [];

    if (isset($_GET['is_aktif'])) {
        $where[] = "p.is_aktif = ?";
        $params[] = $_GET['is_aktif'];
    }
    if (isset($_GET['kategori_id'])) {
        $where[] = "p.kategori_id = ?";
        $params[] = $_GET['kategori_id'];
    }
    if (isset($_GET['is_promo'])) {
        $where[] = "p.is_promo = 1 AND p.is_aktif = 1";
        $where[] = "(p.promo_selesai IS NULL OR p.promo_selesai >= CURRENT_DATE)";
    }

    if (count($where) > 0) {
        $query .= " WHERE " . implode(" AND ", $where);
    }
    $query .= " ORDER BY p.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    // Decode JSON strings in numeric fields or arrays
    foreach ($data as &$row) {
        $row['id'] = (int)$row['id'];
        $row['kategori_id'] = (int)$row['kategori_id'];
        $row['harga_normal'] = (int)$row['harga_normal'];
        $row['harga_promo'] = $row['harga_promo'] ? (int)$row['harga_promo'] : null;
        $row['stok'] = (int)$row['stok'];
        $row['is_promo'] = (bool)$row['is_promo'];
        $row['is_aktif'] = (bool)$row['is_aktif'];
        $row['spesifikasi'] = json_decode($row['spesifikasi'], true);
        $row['foto_urls'] = json_decode($row['foto_urls'], true);
        // JOIN helper logic: we could rely on database kategori_nama but we already keep it denormalized for speed.
    }
    sendResponse(true, $data, 'Data produk');
}
elseif ($method === 'POST') {
    $input = getJsonInput();
    
    // Default values mapping
    $nama = $input['nama'] ?? '';
    $sku = $input['sku'] ?? '';
    $merek = $input['merek'] ?? '';
    $kategori_id = $input['kategori_id'] ?? 0;
    
    // fetch kategori_nama
    $stmtKat = $pdo->prepare("SELECT nama FROM kategori WHERE id = ?");
    $stmtKat->execute([$kategori_id]);
    $kategori_nama = $stmtKat->fetchColumn() ?: '';

    $deskripsi = $input['deskripsi'] ?? '';
    $spesifikasi = json_encode($input['spesifikasi'] ?? []);
    $harga_normal = $input['harga_normal'] ?? 0;
    $harga_promo = isset($input['harga_promo']) ? $input['harga_promo'] : null;
    $stok = $input['stok'] ?? 0;
    $foto_urls = json_encode($input['foto_urls'] ?? []);
    $is_promo = isset($input['is_promo']) ? (int)$input['is_promo'] : 0;
    $promo_mulai = isset($input['promo_mulai']) ? $input['promo_mulai'] : null;
    $promo_selesai = isset($input['promo_selesai']) ? $input['promo_selesai'] : null;
    $is_aktif = isset($input['is_aktif']) ? (int)$input['is_aktif'] : 1;

    $stmt = $pdo->prepare("INSERT INTO produk (nama, sku, merek, kategori_id, deskripsi, spesifikasi, harga_normal, harga_promo, stok, foto_urls, is_promo, promo_mulai, promo_selesai, is_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if ($stmt->execute([$nama, $sku, $merek, $kategori_id, $deskripsi, $spesifikasi, $harga_normal, $harga_promo, $stok, $foto_urls, $is_promo, $promo_mulai, $promo_selesai, $is_aktif])) {
        // Need to update the fake denormalized name temporarily since we didn't add the column in db except maybe?
        // Wait, the tkn.sql didn't have `kategori_nama` in the `produk` table! Let me alter table if needed.
        // Wait... I didn't add kategori_nama to table `produk`. tkn.sql just had: id, nama, sku, merek, kategori_id, deskripsi, spesifikasi, harga_normal... 
        // Ah, tkn.sql didn't have kategori_nama! Wait. Yes it didn't in my dump. Let's sendResponse.
        
        $input['id'] = (int)$pdo->lastInsertId();
        $input['kategori_nama'] = $kategori_nama;
        sendResponse(true, $input, 'Produk ditambahkan');
    } else {
        sendResponse(false, null, 'Gagal menambah produk');
    }
}
elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(false, null, 'ID produk tidak ditentukan');
    }

    $input = getJsonInput();
    if (!$input) {
        sendResponse(false, null, 'Data input tidak valid');
    }

    // Ambil data produk lama untuk merge atau pengecekan
    $stmtCheck = $pdo->prepare("SELECT * FROM produk WHERE id = ?");
    $stmtCheck->execute([$id]);
    $oldProduk = $stmtCheck->fetch();

    if (!$oldProduk) {
        sendResponse(false, null, 'Produk tidak ditemukan');
    }

    // Mapping fields dengan fallback ke data lama jika tidak ada di input
    // Mendukung parsial update (misal hanya status aktif)
    $nama          = $input['nama'] ?? $oldProduk['nama'];
    $sku           = $input['sku'] ?? $oldProduk['sku'];
    $merek         = $input['merek'] ?? $oldProduk['merek'];
    $kategori_id   = $input['kategori_id'] ?? $oldProduk['kategori_id'];
    $deskripsi     = $input['deskripsi'] ?? $oldProduk['deskripsi'];
    $spesifikasi   = isset($input['spesifikasi']) ? json_encode($input['spesifikasi']) : $oldProduk['spesifikasi'];
    $harga_normal  = $input['harga_normal'] ?? $oldProduk['harga_normal'];
    $harga_promo   = array_key_exists('harga_promo', $input) ? $input['harga_promo'] : $oldProduk['harga_promo'];
    $stok          = $input['stok'] ?? $oldProduk['stok'];
    $foto_urls     = isset($input['foto_urls']) ? json_encode($input['foto_urls']) : $oldProduk['foto_urls'];
    $is_promo      = isset($input['is_promo']) ? (int)$input['is_promo'] : (int)$oldProduk['is_promo'];
    $promo_mulai   = array_key_exists('promo_mulai', $input) ? $input['promo_mulai'] : $oldProduk['promo_mulai'];
    $promo_selesai = array_key_exists('promo_selesai', $input) ? $input['promo_selesai'] : $oldProduk['promo_selesai'];
    $is_aktif      = isset($input['is_aktif']) ? (int)$input['is_aktif'] : (int)$oldProduk['is_aktif'];

    $stmt = $pdo->prepare("
        UPDATE produk 
        SET nama=?, sku=?, merek=?, kategori_id=?, deskripsi=?, spesifikasi=?, 
            harga_normal=?, harga_promo=?, stok=?, foto_urls=?, is_promo=?, 
            promo_mulai=?, promo_selesai=?, is_aktif=? 
        WHERE id=?
    ");
    
    $params = [
        $nama, $sku, $merek, $kategori_id, $deskripsi, $spesifikasi, 
        $harga_normal, $harga_promo, $stok, $foto_urls, $is_promo, 
        $promo_mulai, $promo_selesai, $is_aktif, $id
    ];

    if ($stmt->execute($params)) {
        $updated = array_merge($oldProduk, $input);
        $updated['id'] = (int)$id;
        sendResponse(true, $updated, 'Produk berhasil diperbarui');
    } else {
        sendResponse(false, null, 'Gagal memperbarui produk di database');
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(false, null, 'ID produk tidak ada');
    }
    $stmt = $pdo->prepare("DELETE FROM produk WHERE id = ?");
    if ($stmt->execute([$id])) {
        sendResponse(true, null, 'Produk dihapus');
    } else {
        sendResponse(false, null, 'Gagal menghapus produk');
    }
}
?>
