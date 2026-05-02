<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sales_id = $_GET['sales_id'] ?? null;
    $kode = $_GET['kode'] ?? null;

    $query = "
        SELECT p.*, u.nama as sales_nama
        FROM pesanan p
        LEFT JOIN users u ON p.sales_id = u.id
    ";
    $params = [];
    $where = [];

    if ($sales_id) {
        $where[] = "p.sales_id = ?";
        $params[] = $sales_id;
    }
    if ($kode) {
        $where[] = "p.kode = ?";
        $params[] = $kode;
    }

    if (count($where) > 0) {
        $query .= " WHERE " . implode(" AND ", $where);
    }
    $query .= " ORDER BY p.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $pesanan = $stmt->fetchAll();

    // Fetch items for each pesanan
    foreach ($pesanan as &$p) {
        $p['id'] = (int)$p['id'];
        $p['sales_id'] = (int)$p['sales_id'];
        $p['total'] = (int)$p['total'];
        $p['offline_pending'] = (bool)$p['offline_pending'];

        $stmt_items = $pdo->prepare("
            SELECT pi.*, pr.nama as nama_produk, pr.sku, pr.foto_urls 
            FROM pesanan_items pi 
            JOIN produk pr ON pi.produk_id = pr.id 
            WHERE pi.pesanan_id = ?
        ");
        $stmt_items->execute([$p['id']]);
        $items = $stmt_items->fetchAll();

        foreach ($items as &$item) {
            $item['produk_id'] = (int)$item['produk_id'];
            $item['harga_satuan'] = (int)$item['harga_satuan'];
            $item['qty'] = (int)$item['qty'];
            $item['subtotal'] = (int)$item['subtotal'];
            
            $fotos = json_decode($item['foto_urls'], true);
            $item['foto_url'] = is_array($fotos) && count($fotos) > 0 ? $fotos[0] : '';
            unset($item['foto_urls']);
        }
        $p['items'] = $items;
    }

    if ($kode && count($pesanan) > 0) {
        sendResponse(true, $pesanan[0], 'Detail pesanan');
    }
    
    sendResponse(true, $pesanan, 'Data pesanan');
}
elseif ($method === 'POST') {
    $input = getJsonInput();
    
    $kode = $input['kode'] ?? 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);
    $sales_id = $input['sales_id'] ?? null;
    $nama_pelanggan = $input['nama_pelanggan'] ?? '';
    $perusahaan = $input['perusahaan'] ?? '';
    $telepon_pelanggan = $input['telepon_pelanggan'] ?? '';
    $alamat_pengiriman = $input['alamat_pengiriman'] ?? '';
    $catatan = $input['catatan'] ?? '';
    $total = $input['total'] ?? 0;
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO pesanan (kode, sales_id, nama_pelanggan, perusahaan, telepon_pelanggan, alamat_pengiriman, catatan, total, status, offline_pending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0)");
        $stmt->execute([$kode, $sales_id, $nama_pelanggan, $perusahaan, $telepon_pelanggan, $alamat_pengiriman, $catatan, $total]);
        $pesanan_id = $pdo->lastInsertId();

        if (isset($input['items']) && is_array($input['items'])) {
            $stmt_item = $pdo->prepare("INSERT INTO pesanan_items (pesanan_id, produk_id, harga_satuan, qty, subtotal) VALUES (?, ?, ?, ?, ?)");
            foreach ($input['items'] as $item) {
                $stmt_item->execute([$pesanan_id, $item['produk_id'], $item['harga_satuan'], $item['qty'], $item['subtotal']]);
            }
        }
        
        $pdo->commit();
        $input['id'] = (int)$pesanan_id;
        $input['kode'] = $kode;
        $input['status'] = 'draft';
        sendResponse(true, $input, 'Pesanan berhasil dibuat');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(false, null, 'Gagal membuat pesanan: ' . $e->getMessage());
    }
}
elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $_GET['id'] ?? null;
    
    if (isset($input['status']) && count($input) <= 2) {
        $stmt = $pdo->prepare("UPDATE pesanan SET status = ? WHERE id = ?");
        if ($stmt->execute([$input['status'], $id])) {
            sendResponse(true, null, 'Status diperbarui');
        } else {
            sendResponse(false, null, 'Gagal update status');
        }
    }
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendResponse(false, null, 'ID pesanan tidak disertakan');
    }

    $pdo->beginTransaction();
    try {
        // Delete items first
        $stmt_items = $pdo->prepare("DELETE FROM pesanan_items WHERE pesanan_id = ?");
        $stmt_items->execute([$id]);

        // Delete order
        $stmt = $pdo->prepare("DELETE FROM pesanan WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();
        sendResponse(true, null, 'Pesanan berhasil dihapus');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(false, null, 'Gagal menghapus pesanan: ' . $e->getMessage());
    }
}
?>
