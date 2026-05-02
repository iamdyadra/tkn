// AdminDashboardPage — ringkasan statistik dan chart pesanan
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ClipboardList, AlertCircle, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { produkApi, pesananApi, userApi } from '@/lib/api';
import type { Pesanan, Produk } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const STATUS_CONFIG = {
  draft:      { label: 'Draft',      class: 'bg-gray-100 text-gray-700' },
  diproses:   { label: 'Diproses',   class: 'bg-blue-100 text-blue-700' },
  dikirim:    { label: 'Dikirim',    class: 'bg-amber-100 text-amber-700' },
  diterima:   { label: 'Diterima',   class: 'bg-emerald-100 text-emerald-700' },
  dibatalkan: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700' },
} as const;

export default function AdminDashboardPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [salesCount, setSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([pesananApi.getAll(), produkApi.getAllAdmin(), userApi.getSales()]).then(([p, pr, s]) => {
      setPesanan(p);
      setProduk(pr);
      setSalesCount(s.filter(u => u.is_aktif).length);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const pesananHariIni = pesanan.filter(p => p.created_at === today).length;
  const pesananPending = pesanan.filter(p => p.status === 'draft' || p.status === 'diproses').length;

  // Chart: pesanan per bulan (tahun ini)
  const year = new Date().getFullYear();
  const chartData = BULAN.map((bulan, idx) => ({
    bulan,
    pesanan: pesanan.filter(p => {
      const d = parseISO(p.created_at);
      return d.getFullYear() === year && d.getMonth() === idx;
    }).length,
  }));

  const recentPesanan = [...pesanan]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">Ringkasan performa dan aktivitas sistem</p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Produk', value: produk.filter(p => p.is_aktif).length, icon: Package, color: 'indigo', sub: `${produk.length} total termasuk nonaktif` },
          { label: 'Pesanan Hari Ini', value: pesananHariIni, icon: ClipboardList, color: 'blue', sub: 'Per hari ini' },
          { label: 'Pesanan Pending', value: pesananPending, icon: AlertCircle, color: 'amber', sub: 'Draft + Diproses' },
          { label: 'Sales Aktif', value: salesCount, icon: Users, color: 'emerald', sub: 'Sales aktif saat ini' },
        ].map((card, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-${card.color}-100`}>
                <card.icon className={`h-5 w-5 text-${card.color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Chart ──────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Pesanan per Bulan
            </h2>
            <p className="text-sm text-gray-500">Tahun {year}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
              cursor={{ fill: '#eef2ff' }}
            />
            <Bar dataKey="pesanan" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Pesanan" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Recent Orders ───────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
          <Link to="/admin/pesanan" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kode</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sales</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Pelanggan</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentPesanan.map(p => {
                const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <Link to={`/pesanan/${p.kode}`} className="font-mono text-indigo-700 hover:underline text-xs">{p.kode}</Link>
                    </td>
                    <td className="py-3 px-2 text-gray-700">{p.sales_nama}</td>
                    <td className="py-3 px-2 text-gray-700 max-w-[140px] truncate">{p.nama_pelanggan}</td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900">{formatRupiah(p.total)}</td>
                    <td className="py-3 px-2 text-right">
                      <Badge className={`text-xs ${cfg.class}`}>{cfg.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
