// BuatPesananPage — membuat draft pesanan dari cart
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { pesananApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Minus, Plus, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Pesanan } from '@/types';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const schema = z.object({
  nama_pelanggan: z.string().min(3, 'Nama pelanggan wajib diisi'),
  perusahaan: z.string().min(2, 'Nama perusahaan wajib diisi'),
  telepon_pelanggan: z.string().min(9, 'Nomor telepon tidak valid'),
  alamat_pengiriman: z.string().min(10, 'Alamat pengiriman wajib diisi'),
  catatan: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function BuatPesananPage() {
  const { items, removeItem, updateQty, clearCart, totalHarga } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [successKode, setSuccessKode] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) { toast.warning('Tambahkan layanan ke pesanan terlebih dahulu'); return; }
    setSubmitting(true);

    const isOffline = !navigator.onLine;
    const pesananItems = items.map(i => ({
      produk_id: i.produk.id,
      nama_produk: i.produk.nama,
      sku: i.produk.sku,
      foto_url: i.produk.foto_urls[0],
      harga_satuan: i.produk.harga_promo ?? i.produk.harga_normal,
      qty: i.qty,
      subtotal: (i.produk.harga_promo ?? i.produk.harga_normal) * i.qty,
    }));

    try {
      const pesanan = await pesananApi.create({
        ...data,
        catatan: data.catatan ?? '',
        sales_id: user!.id,
        sales_nama: user!.nama,
        items: pesananItems,
        total: totalHarga,
        offline_pending: isOffline,
      } as Omit<Pesanan, 'id' | 'kode' | 'status' | 'created_at'>);

      setSuccessKode(pesanan.kode);
      clearCart();
    } catch (e) {
      console.error(e);
      toast.error('Gagal membuat pesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (successKode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-emerald-100 rounded-full p-6">
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {successKode.startsWith('OFFLINE-') ? 'Pesanan Disimpan Offline!' : 'Pesanan Berhasil!'}
          </h2>
          <p className="text-gray-500">
            {successKode.startsWith('OFFLINE-') 
              ? 'Koneksi terputus. Pesanan Anda disimpan lokal dan akan dikirim saat online.' 
              : 'Pesanan Anda telah dibuat dengan kode:'}
          </p>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-indigo-700">{successKode}</p>
          </div>
          <p className="text-sm text-gray-500">
            {successKode.startsWith('OFFLINE-')
              ? 'Mohon jangan hapus data browser hingga sinkronisasi berhasil.'
              : 'Catat kode ini untuk tracking status pesanan Anda'}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate('/katalog')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Ke Katalog
            </Button>
            <Button onClick={() => navigate('/pesanan/riwayat')} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              Lihat Riwayat Pesanan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/katalog" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Katalog
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" /> Buat Pesanan
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-600">Pesanan masih kosong</h2>
            <p className="text-gray-400 text-sm mt-1">Tambahkan layanan dari katalog</p>
            <Link to="/katalog">
              <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">Ke Katalog</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-5 gap-6">
              {/* ── Left: Cart ──────────────────────────────── */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Layanan Dipesan ({items.length})</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map(({ produk, qty }) => {
                      const harga = produk.harga_promo ?? produk.harga_normal;
                      return (
                        <div key={produk.id} className="p-4 flex gap-3">
                          <img src={produk.foto_urls?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'; }} alt={produk.nama} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{produk.nama}</p>
                            <p className="text-xs text-gray-500">{produk.merek} · {produk.sku}</p>
                            <p className="text-sm font-bold text-indigo-700 mt-1">{formatRupiah(harga)}/unit</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button onClick={() => removeItem(produk.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button type="button" onClick={() => updateQty(produk.id, qty - 1)} className="px-2 py-1 hover:bg-gray-100">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 py-1 text-sm font-semibold min-w-[2rem] text-center">{qty}</span>
                              <button type="button" onClick={() => updateQty(produk.id, qty + 1)} className="px-2 py-1 hover:bg-gray-100">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{formatRupiah(harga * qty)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Pelanggan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <h2 className="font-semibold text-gray-900">Data Pelanggan</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="nama_pelanggan">Nama Pelanggan *</Label>
                      <Input id="nama_pelanggan" placeholder="Nama PIC" {...register('nama_pelanggan')} className={errors.nama_pelanggan ? 'border-red-400' : ''} />
                      {errors.nama_pelanggan && <p className="text-xs text-red-500">{errors.nama_pelanggan.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="perusahaan">Nama Perusahaan *</Label>
                      <Input id="perusahaan" placeholder="PT. / CV. / dll" {...register('perusahaan')} className={errors.perusahaan ? 'border-red-400' : ''} />
                      {errors.perusahaan && <p className="text-xs text-red-500">{errors.perusahaan.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="telepon_pelanggan">No. Telepon *</Label>
                      <Input id="telepon_pelanggan" placeholder="021-xxxx / 08xx" {...register('telepon_pelanggan')} className={errors.telepon_pelanggan ? 'border-red-400' : ''} />
                      {errors.telepon_pelanggan && <p className="text-xs text-red-500">{errors.telepon_pelanggan.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="alamat_pengiriman">Alamat Pengiriman *</Label>
                    <Textarea id="alamat_pengiriman" placeholder="Jl. ... No. ..., Kota, Provinsi" rows={3} {...register('alamat_pengiriman')} className={errors.alamat_pengiriman ? 'border-red-400' : ''} />
                    {errors.alamat_pengiriman && <p className="text-xs text-red-500">{errors.alamat_pengiriman.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="catatan">Catatan Pesanan (opsional)</Label>
                    <Textarea id="catatan" placeholder="Catatan tambahan untuk tim..." rows={2} {...register('catatan')} />
                  </div>
                </div>
              </div>

              {/* ── Right: Summary ──────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
                  <h2 className="font-semibold text-gray-900">Ringkasan Pesanan</h2>
                  <div className="space-y-2">
                    {items.map(({ produk, qty }) => {
                      const harga = produk.harga_promo ?? produk.harga_normal;
                      return (
                        <div key={produk.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate flex-1 pr-2">{produk.nama} <span className="text-gray-400">×{qty}</span></span>
                          <span className="font-medium text-gray-900 flex-shrink-0">{formatRupiah(harga * qty)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-indigo-700 text-lg">{formatRupiah(totalHarga)}</span>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Memproses...
                      </span>
                    ) : (
                      <><CheckCircle className="h-5 w-5" /> Kirim Pesanan</>
                    )}
                  </Button>
                  {!navigator.onLine && (
                    <p className="text-xs text-amber-600 text-center">⚠️ Pesanan akan disimpan offline & sinkron saat online</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
