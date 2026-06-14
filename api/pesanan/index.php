<?php
require_once '../config/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sales_id = $_GET['sales_id'] ?? null;
    $kode = $_GET['kode'] ?? null;
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;

    $query = "
        SELECT p.*, u.nama as sales_nama, u.nama as nama_sales, 
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', pi.id,
            'produk_id', pi.produk_id,
            'nama_produk', pr.nama,
            'sku', pr.sku,
            'foto_urls', pr.foto_urls,
            'harga_satuan', pi.harga_satuan,
            'qty', pi.qty,
            'subtotal', pi.subtotal
        )) FROM pesanan_items pi 
        JOIN produk pr ON pi.produk_id = pr.id 
        WHERE pi.pesanan_id = p.id) as items
        FROM pesanan p
        LEFT JOIN users u ON p.sales_id = u.id
    ";
    $params = [];
    $where = [];

    if ($id) {
        $where[] = "p.id = ?";
        $params[] = $id;
    }
    if ($sales_id) {
        $where[] = "p.sales_id = ?";
        $params[] = $sales_id;
    }
    if ($kode) {
        $where[] = "p.kode = ?";
        $params[] = $kode;
    }
    if ($status) {
        $where[] = "p.status = ?";
        $params[] = $status;
    }

    if (count($where) > 0) {
        $query .= " WHERE " . implode(" AND ", $where);
    }
    $query .= " ORDER BY p.created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $pesanan = $stmt->fetchAll();

    if (!$pesanan) {
        $pesanan = [];
    }

    // Process each pesanan to cast variables and format item images
    foreach ($pesanan as &$p) {
        $p['id'] = (int)$p['id'];
        $p['sales_id'] = (int)$p['sales_id'];
        $p['total'] = (int)$p['total'];
        $p['offline_pending'] = (bool)$p['offline_pending'];

        $items = $p['items'] ? json_decode($p['items'], true) : [];
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['produk_id'] = (int)$item['produk_id'];
            $item['harga_satuan'] = (int)$item['harga_satuan'];
            $item['qty'] = (int)$item['qty'];
            $item['subtotal'] = (int)$item['subtotal'];
            
            // Extract single image from array of image URLs
            if (isset($item['foto_urls'])) {
                $fotos = json_decode($item['foto_urls'], true);
                $item['foto_url'] = is_array($fotos) && count($fotos) > 0 ? $fotos[0] : '';
                unset($item['foto_urls']);
            } else {
                $item['foto_url'] = $item['foto_url'] ?? '';
            }
        }
        $p['items'] = $items;
    }

    if ($kode && count($pesanan) > 0) {
        sendResponse(true, $pesanan[0], 'Detail pesanan');
    } elseif ($kode && count($pesanan) === 0) {
        sendResponse(false, null, 'Pesanan tidak ditemukan');
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
    $offline_pending = isset($input['offline_pending']) && $input['offline_pending'] ? 1 : 0;
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO pesanan (kode, sales_id, nama_pelanggan, perusahaan, telepon_pelanggan, alamat_pengiriman, catatan, total, status, offline_pending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)");
        $stmt->execute([$kode, $sales_id, $nama_pelanggan, $perusahaan, $telepon_pelanggan, $alamat_pengiriman, $catatan, $total, $offline_pending]);
        $pesanan_id = $pdo->lastInsertId();

        if (isset($input['items']) && is_array($input['items'])) {
            $stmt_item = $pdo->prepare("INSERT INTO pesanan_items (pesanan_id, produk_id, harga_satuan, qty, subtotal) VALUES (?, ?, ?, ?, ?)");
            foreach ($input['items'] as $item) {
                $stmt_item->execute([$pesanan_id, $item['produk_id'], $item['harga_satuan'], $item['qty'], $item['subtotal']]);
            }
        }

        // --- HITUNG KOMISI OTOMATIS SAAT PESANAN DIBUAT ---
        // 1. Ambil semua kategori produk dalam pesanan ini
        $stmt_kat = $pdo->prepare("
            SELECT DISTINCT pr.kategori_id 
            FROM pesanan_items pi 
            JOIN produk pr ON pi.produk_id = pr.id 
            WHERE pi.pesanan_id = ?
        ");
        $stmt_kat->execute([$pesanan_id]);
        $kategori_ids = $stmt_kat->fetchAll(PDO::FETCH_COLUMN);

        // 2. Cari rule komisi yang paling cocok
        $rule = null;
        if (count($kategori_ids) > 0) {
            $placeholders = implode(',', array_fill(0, count($kategori_ids), '?'));
            $params = array_merge([$total], $kategori_ids);
            
            $stmt_rule = $pdo->prepare("
                SELECT * FROM komisi_rules 
                WHERE min_transaksi <= ?
                AND is_aktif = 1
                AND (
                    kategori_id IN ($placeholders)
                    OR kategori_id IS NULL
                )
                ORDER BY 
                    CASE WHEN kategori_id IS NOT NULL THEN 0 ELSE 1 END ASC,
                    min_transaksi DESC
                LIMIT 1
            ");
            $stmt_rule->execute($params);
            $rule = $stmt_rule->fetch();
        } else {
            $stmt_rule = $pdo->prepare("
                SELECT * FROM komisi_rules 
                WHERE min_transaksi <= ?
                AND is_aktif = 1
                AND kategori_id IS NULL
                ORDER BY min_transaksi DESC
                LIMIT 1
            ");
            $stmt_rule->execute([$total]);
            $rule = $stmt_rule->fetch();
        }

        // 3. Jika rule ditemukan dan sales_id tidak null, insert komisi
        if ($rule && $sales_id) {
            $nominal = ($rule['tipe'] === 'persentase') 
                ? (int)round($total * $rule['nilai'] / 100) 
                : (int)$rule['nilai'];
            $persen = ($rule['tipe'] === 'persentase') 
                ? (float)$rule['nilai'] 
                : (float)round(($nominal / $total) * 100, 2);
            
            $stmt_ins_komisi = $pdo->prepare("
                INSERT INTO komisi (pesanan_id, sales_id, rule_id, nilai_pesanan, persen_komisi, nominal_komisi, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            ");
            $stmt_ins_komisi->execute([$pesanan_id, $sales_id, $rule['id'], $total, $persen, $nominal]);
        }
        
        $pdo->commit();

        // Ambil data pesanan lengkap dari DB (termasuk created_at)
        $stmtFetch = $pdo->prepare("
            SELECT p.*, u.nama as sales_nama, u.nama as nama_sales
            FROM pesanan p
            LEFT JOIN users u ON p.sales_id = u.id
            WHERE p.id = ?
        ");
        $stmtFetch->execute([$pesanan_id]);
        $newPesanan = $stmtFetch->fetch();
        $newPesanan['id'] = (int)$newPesanan['id'];
        $newPesanan['sales_id'] = (int)$newPesanan['sales_id'];
        $newPesanan['total'] = (int)$newPesanan['total'];
        $newPesanan['offline_pending'] = (bool)$newPesanan['offline_pending'];

        // Fetch items untuk response
        $stmtItems = $pdo->prepare("
            SELECT pi.*, pr.nama as nama_produk, pr.sku, pr.foto_urls 
            FROM pesanan_items pi 
            JOIN produk pr ON pi.produk_id = pr.id 
            WHERE pi.pesanan_id = ?
        ");
        $stmtItems->execute([$pesanan_id]);
        $items = $stmtItems->fetchAll();
        foreach ($items as &$item) {
            $item['produk_id'] = (int)$item['produk_id'];
            $item['harga_satuan'] = (int)$item['harga_satuan'];
            $item['qty'] = (int)$item['qty'];
            $item['subtotal'] = (int)$item['subtotal'];
            $fotos = json_decode($item['foto_urls'], true);
            $item['foto_url'] = is_array($fotos) && count($fotos) > 0 ? $fotos[0] : '';
            unset($item['foto_urls']);
        }
        $newPesanan['items'] = $items;

        sendResponse(true, $newPesanan, 'Pesanan berhasil dibuat');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(false, null, 'Gagal membuat pesanan: ' . $e->getMessage());
    }
}
elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $_GET['id'] ?? null;

    if (!$id) {
        sendResponse(false, null, 'ID pesanan tidak disertakan');
    }

    if (isset($input['status'])) {
        $newStatus = $input['status'];

        $pdo->beginTransaction();
        try {
            // Fetch current pesanan to know old status & sales_id
            $stmtGet = $pdo->prepare("SELECT status, sales_id, total FROM pesanan WHERE id = ?");
            $stmtGet->execute([$id]);
            $pesanan = $stmtGet->fetch();

            if (!$pesanan) {
                $pdo->rollBack();
                sendResponse(false, null, 'Pesanan tidak ditemukan');
            }

            // Update status
            $stmtUpd = $pdo->prepare("UPDATE pesanan SET status = ? WHERE id = ?");
            $stmtUpd->execute([$newStatus, $id]);

            // Auto-create komisi when status changes to 'diproses'
            if ($newStatus === 'diproses' && $pesanan['status'] !== 'diproses' && $pesanan['sales_id']) {
                $sales_id      = (int)$pesanan['sales_id'];
                $total_pesanan = (int)$pesanan['total'];

                // Check if komisi already exists (idempotent)
                $stmtChk = $pdo->prepare("SELECT COUNT(*) FROM komisi WHERE pesanan_id = ?");
                $stmtChk->execute([$id]);
                $already = (int)$stmtChk->fetchColumn();

                if ($already === 0) {
                    // Fetch items with kategori_id and product name for audit trail
                    $stmtItems = $pdo->prepare("
                        SELECT pi.subtotal, pi.qty, pr.kategori_id, pr.nama AS nama_produk
                        FROM pesanan_items pi
                        JOIN produk pr ON pi.produk_id = pr.id
                        WHERE pi.pesanan_id = ?
                    ");
                    $stmtItems->execute([$id]);
                    $items = $stmtItems->fetchAll();

                    $total_nominal   = 0;
                    $applied_rule_id = null;
                    $audit_lines     = [];

                    foreach ($items as $item) {
                        $subtotal    = (int)$item['subtotal'];
                        $kategori_id = (int)$item['kategori_id'];
                        $nama_produk = $item['nama_produk'];

                        // Match category-specific rule first
                        $stmtRule = $pdo->prepare("
                            SELECT * FROM komisi_rules
                            WHERE kategori_id = ? AND is_aktif = 1 AND min_transaksi <= ?
                            ORDER BY min_transaksi DESC LIMIT 1
                        ");
                        $stmtRule->execute([$kategori_id, $subtotal]);
                        $rule = $stmtRule->fetch();

                        if (!$rule) {
                            // Fallback to global rule
                            $stmtGlobal = $pdo->prepare("
                                SELECT * FROM komisi_rules
                                WHERE kategori_id IS NULL AND is_aktif = 1 AND min_transaksi <= ?
                                ORDER BY min_transaksi DESC LIMIT 1
                            ");
                            $stmtGlobal->execute([$subtotal]);
                            $rule = $stmtGlobal->fetch();
                        }

                        if ($rule) {
                            $applied_rule_id = (int)$rule['id'];
                            if ($rule['tipe'] === 'persentase') {
                                $nominal = (int)round($subtotal * ((float)$rule['nilai'] / 100));
                                $audit_lines[] = "• {$nama_produk}: {$rule['nama_rule']} ({$rule['nilai']}%) → Rp " . number_format($nominal, 0, ',', '.');
                            } else {
                                $nominal = (int)$rule['nilai'];
                                $audit_lines[] = "• {$nama_produk}: {$rule['nama_rule']} (Nominal) → Rp " . number_format($nominal, 0, ',', '.');
                            }
                        } else {
                            // Default 5%
                            $nominal = (int)round($subtotal * 0.05);
                            $audit_lines[] = "• {$nama_produk}: Default Global (5%) → Rp " . number_format($nominal, 0, ',', '.');
                        }
                        $total_nominal += $nominal;
                    }

                    if (empty($items)) {
                        // No items, apply default 5% on total
                        $total_nominal = (int)round($total_pesanan * 0.05);
                        $audit_lines[] = "• (Tidak ada item) Default Global (5%)";
                    }

                    $eff_persen = $total_pesanan > 0
                        ? round(($total_nominal / $total_pesanan) * 100, 2)
                        : 5.00;

                    // Only write catatan for multi-item orders (single-item is clear from the rule)
                    $auto_catatan = count($audit_lines) > 1
                        ? "[Auto] Rincian aturan komisi:\n" . implode("\n", $audit_lines)
                        : null;

                    $stmtIns = $pdo->prepare("
                        INSERT INTO komisi
                            (pesanan_id, sales_id, rule_id, nilai_pesanan, persen_komisi, nominal_komisi, status, catatan)
                        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
                    ");
                    $stmtIns->execute([$id, $sales_id, $applied_rule_id, $total_pesanan, $eff_persen, $total_nominal, $auto_catatan]);
                }
            }

            $pdo->commit();
            sendResponse(true, null, 'Status diperbarui');
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(false, null, 'Gagal update status: ' . $e->getMessage());
        }
    }

    sendResponse(false, null, 'Data tidak valid');
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
