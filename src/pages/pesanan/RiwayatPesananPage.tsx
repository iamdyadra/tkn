// RiwayatPesananPage — daftar pesanan sales yang login
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { pesananApi } from '@/lib/api';
import type { Pesanan, PesananStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronRight, Search, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

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

const ALL_STATUSES: PesananStatus[] = ['draft', 'diproses', 'dikirim', 'diterima', 'dibatalkan'];

export default function RiwayatPesananPage() {
  const { user } = useAuth();
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PesananStatus | 'semua'>('semua');
  const [search, setSearch] = useState('');

  useEffect(() => {
    pesananApi.getByUser(user!.id).then(data => {
      const sorted = [...data].sort((a, b) => b.created_at.localeCompare(a.created_at));
      // Admin bisa lihat semua
      if (user?.role === 'admin') {
        pesananApi.getAll().then(all => {
          const sorted2 = [...all].sort((a, b) => b.created_at.localeCompare(a.created_at));
          setPesanan(sorted2);
          setLoading(false);
        });
      } else {
        setPesanan(sorted);
        setLoading(false);
      }
    });
  }, [user]);

  const filtered = pesanan.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || p.kode.toLowerCase().includes(q) || p.nama_pelanggan.toLowerCase().includes(q) || p.perusahaan.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            Riwayat Pesanan
          </h1>
          <Link to="/pesanan/buat">
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">+ Buat Pesanan</Button>
          </Link>
        </div>

        {/* Filter strip */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'semua' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'}`}
          >
            Semua
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'}`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode atau pelanggan..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada pesanan ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Ubah filter atau coba kata kunci lain</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-indigo-700">{p.kode}</span>
                        <Badge className={`text-xs font-medium ${cfg.class}`}>{cfg.label}</Badge>
                        {p.offline_pending && <Badge className="text-xs bg-amber-100 text-amber-700">Offline</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <p className="text-sm text-gray-700 font-medium">{p.nama_pelanggan} — {p.perusahaan}</p>
                        <p className="text-xs text-gray-400">{format(parseISO(p.created_at), 'd MMM yyyy', { locale: idLocale })}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{p.items.length} produk</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{formatRupiah(p.total)}</p>
                      <Link to={`/pesanan/${p.kode}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 mt-1">
                          Detail <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
