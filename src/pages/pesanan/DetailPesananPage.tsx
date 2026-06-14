// DetailPesananPage — detail + tracking timeline pesanan
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Stepper from '@/components/Stepper';
import { pesananApi } from '@/lib/api';
import type { Pesanan } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Building2, Phone, MapPin, FileText, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { PesananStatus } from '@/types';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG: Record<PesananStatus, { label: string; class: string }> = {
  draft:       { label: 'Draft',      class: 'bg-gray-100 text-gray-700' },
  diproses:    { label: 'Diproses',   class: 'bg-blue-100 text-blue-700' },
  dikirim:     { label: 'Dikirim',    class: 'bg-amber-100 text-amber-700' },
  diterima:    { label: 'Diterima',   class: 'bg-emerald-100 text-emerald-700' },
  dibatalkan:  { label: 'Dibatalkan', class: 'bg-red-100 text-red-700' },
};

export default function DetailPesananPage() {
  const { kode } = useParams();
  const navigate = useNavigate();
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kode) { navigate('/pesanan/riwayat'); return; }
    pesananApi.getByKode(kode).then(p => {
      if (!p) { navigate('/pesanan/riwayat'); return; }
      setPesanan(p);
      setLoading(false);
    });
  }, [kode, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    </div>
  );

  if (!pesanan) return null;

  const cfg = STATUS_CONFIG[pesanan.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/pesanan/riwayat" className="text-orange-600 hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Riwayat
          </Link>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <h1 className="font-mono font-bold text-xl text-gray-900">{pesanan.kode}</h1>
            <Badge className={`text-sm font-medium ${cfg.class}`}>{cfg.label}</Badge>
            {pesanan.offline_pending && <Badge className="bg-amber-100 text-amber-700 text-xs">Pending Sync</Badge>}
          </div>
          <p className="text-sm text-gray-500">
            {pesanan.created_at
              ? format(parseISO(pesanan.created_at), 'd MMMM yyyy', { locale: idLocale })
              : '—'}
          </p>
        </div>

        {/* ── Tracking ─────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Status Pengiriman</h2>
          <Stepper currentStatus={pesanan.status} />
        </Card>

        {/* ── Info Pelanggan ───────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informasi Pelanggan</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Nama</p>
                <p className="text-sm font-medium text-gray-900">{pesanan.nama_pelanggan}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Perusahaan</p>
                <p className="text-sm font-medium text-gray-900">{pesanan.perusahaan}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="text-sm font-medium text-gray-900">{pesanan.telepon_pelanggan}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Alamat Pengiriman</p>
                <p className="text-sm font-medium text-gray-900">{pesanan.alamat_pengiriman}</p>
              </div>
            </div>
            {pesanan.catatan && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Catatan</p>
                  <p className="text-sm text-gray-700 italic">"{pesanan.catatan}"</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Produk ───────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Layanan Dipesan</h2>
          <div className="divide-y divide-gray-100 -mx-2">
            {pesanan.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-2">
                <img src={item.foto_url} alt={item.nama_produk} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.nama_produk}</p>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{formatRupiah(item.harga_satuan)} × {item.qty}</p>
                </div>
                <p className="font-bold text-gray-900 flex-shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Keseluruhan</span>
            <span className="text-xl font-bold text-orange-700">{formatRupiah(pesanan.total)}</span>
          </div>
        </Card>

        {/* Back */}
        <div className="flex justify-between">
          <Link to="/pesanan/riwayat">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
