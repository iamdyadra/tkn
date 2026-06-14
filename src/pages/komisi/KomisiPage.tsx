// KomisiPage — halaman komisi milik sales yang sedang login
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeDollarSign, Clock, CheckCircle2, Wallet, Filter, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { komisiApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { KomisiStatus } from '@/types';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<KomisiStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-gray-100 text-gray-600 border-gray-200' },
  disetujui: { label: 'Disetujui', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  dibayar:   { label: 'Dibayar',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ditolak:   { label: 'Ditolak',   className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function KomisiPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  const salesId = user?.id ?? 0;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['komisi-summary', salesId],
    queryFn: () => komisiApi.getSummary(salesId),
    enabled: !!salesId,
  });

  const { data: komisiList = [], isLoading } = useQuery({
    queryKey: ['komisi', salesId],
    queryFn: () => komisiApi.getBySales(salesId),
    enabled: !!salesId,
  });

  const filtered = filterStatus === 'semua'
    ? komisiList
    : komisiList.filter(k => k.status === filterStatus);

  const summaryCards = [
    {
      label: 'Total Pending',
      value: summaryLoading ? '...' : formatRupiah(summary?.total_pending ?? 0),
      icon: Clock,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      iconStyle: { background: '#E5E7EB' },
      iconColor: 'text-gray-500',
      textColor: 'text-gray-700',
    },
    {
      label: 'Total Disetujui',
      value: summaryLoading ? '...' : formatRupiah(summary?.total_disetujui ?? 0),
      icon: CheckCircle2,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconStyle: { background: 'linear-gradient(135deg, #3B6CB7, #1B3A6B)' },
      iconColor: 'text-white',
      textColor: 'text-tkn-navy',
    },
    {
      label: 'Total Dibayar',
      value: summaryLoading ? '...' : formatRupiah(summary?.total_dibayar ?? 0),
      icon: Wallet,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      iconStyle: { background: 'linear-gradient(135deg, #F5A623, #F97316)' },
      iconColor: 'text-white',
      textColor: 'text-tkn-orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #0C1730 0%, #1B3A6B 40%, #F97316 80%, #F5A623 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-lg p-2" style={{ background: 'rgba(249,115,22,0.25)', backdropFilter: 'blur(4px)' }}>
              <BadgeDollarSign className="h-6 w-6 text-orange-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Komisi Saya</h1>
              <p className="text-orange-200 text-sm">Rekap komisi dari setiap pesanan yang diproses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map(card => (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4 flex items-center gap-4`}>
              <div className="rounded-xl p-3 flex-shrink-0" style={card.iconStyle}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <p className={`text-lg font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Filter Status:</span>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="komisi-filter-status" className="w-40 h-9 text-sm bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disetujui">Disetujui</SelectItem>
              <SelectItem value="dibayar">Dibayar</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} komisi</span>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
            <TrendingUp className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada komisi</p>
            <p className="text-sm text-gray-400 mt-1">
              Komisi akan muncul otomatis saat pesanan berstatus <strong>Diproses</strong>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kode Pesanan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nilai Pesanan</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Komisi %</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nominal Komisi</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(k => {
                  const badge = STATUS_BADGE[k.status];
                  return (
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-orange-700 font-semibold text-xs">
                        {k.kode_pesanan ?? `#${k.pesanan_id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(k.created_at)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatRupiah(k.nilai_pesanan)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-orange-600 font-semibold">{k.persen_komisi}%</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-tkn-orange">{formatRupiah(k.nominal_komisi)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-xs border ${badge.className}`}>{badge.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs max-w-40 truncate">
                        {k.catatan ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
