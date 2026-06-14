// AdminDashboardPage — T7: Dashboard analitik real-time dari endpoint /api/dashboard
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Package, ClipboardList, AlertCircle, Users, TrendingUp,
  ArrowRight, BadgeDollarSign, CheckCircle2, Truck, Ban, FileEdit, Tag,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG = {
  draft:      { label: 'Draft',      class: 'bg-gray-100 text-gray-700',     icon: FileEdit,     color: '#6b7280' },
  diproses:   { label: 'Diproses',   class: 'bg-blue-100 text-blue-700',     icon: ClipboardList, color: '#3b82f6' },
  dikirim:    { label: 'Dikirim',    class: 'bg-amber-100 text-amber-700',   icon: Truck,         color: '#f59e0b' },
  diterima:   { label: 'Diterima',   class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, color: '#10b981' },
  dibatalkan: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700',       icon: Ban,           color: '#ef4444' },
} as const;

export default function AdminDashboardPage() {
  const year = new Date().getFullYear();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard', year],
    queryFn: () => dashboardApi.getStats(year),
    staleTime: 30_000, // 30 detik
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );

  if (isError || !stats) return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-gray-600 font-medium">Gagal memuat data dashboard</p>
      <p className="text-gray-400 text-sm">Pastikan API backend berjalan dan database terhubung.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">Ringkasan performa dan aktivitas sistem · Tahun {stats.tahun}</p>
      </div>

      {/* ── Stat Cards Utama ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Produk Aktif',
            value: stats.total_produk_aktif,
            icon: Package,
            iconStyle: { background: 'linear-gradient(135deg, #F5A623, #F97316)' },
            sub: 'Produk tersedia di katalog',
          },
          {
            label: 'Pesanan Hari Ini',
            value: stats.pesanan_hari_ini,
            icon: ClipboardList,
            iconStyle: { background: 'linear-gradient(135deg, #3B6CB7, #1B3A6B)' },
            sub: `${stats.total_pesanan} total semua waktu`,
          },
          {
            label: 'Sales Aktif',
            value: stats.total_sales_aktif,
            icon: Users,
            iconStyle: { background: 'linear-gradient(135deg, #10b981, #059669)' },
            sub: 'Sales dapat login saat ini',
          },
          {
            label: 'Komisi Pending',
            value: stats.total_komisi_pending,
            icon: BadgeDollarSign,
            iconStyle: { background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' },
            sub: 'Menunggu persetujuan',
          },
          {
            label: 'Total Kategori',
            value: stats.total_kategori,
            icon: Tag,
            iconStyle: { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
            sub: 'Kategori produk aktif',
          },
        ].map((card, i) => (
          <Card key={i} className="p-5 border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="p-2.5 rounded-xl" style={card.iconStyle}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Breakdown Status Pesanan ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(status => {
          const cfg = STATUS_CONFIG[status];
          const count = stats.pesanan_by_status[status] ?? 0;
          const IconComp = cfg.icon;
          return (
            <Card key={status} className="p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="p-2 rounded-lg" style={{ backgroundColor: cfg.color + '15' }}>
                <IconComp className="h-4 w-4" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{cfg.label}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Pesanan per Bulan */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Pesanan per Bulan
              </h2>
              <p className="text-sm text-gray-500">Tahun {stats.tahun}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.pesanan_per_bulan} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FED7AA" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #FED7AA', boxShadow: '0 4px 6px -1px rgba(249,115,22,.15)' }}
                cursor={{ fill: 'rgba(249,115,22,0.08)' }}
                formatter={(value: number, name: string) => [
                  name === 'jumlah' ? value + ' pesanan' : formatRupiah(value),
                  name === 'jumlah' ? 'Jumlah' : 'Nilai'
                ]}
              />
              <Bar dataKey="jumlah" fill="url(#sunsetGrad)" radius={[4, 4, 0, 0]} name="jumlah">
                <defs>
                  <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A623" />
                    <stop offset="100%" stopColor="#E84E1B" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Horizontal Bar Chart — Top 5 Produk Terlaris */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Top 5 Produk Terlaris
              </h2>
              <p className="text-sm text-gray-500">Berdasarkan total qty terjual</p>
            </div>
          </div>
          {stats.top_produk.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-300">
              <Package className="h-12 w-12 mb-2" />
              <p className="text-sm text-gray-400">Belum ada data penjualan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.top_produk} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nama"
                  tick={{ fontSize: 10 }}
                  width={110}
                  tickFormatter={(v: string) => v.length > 15 ? v.slice(0, 13) + '…' : v}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [value + ' unit', 'Qty Terjual']}
                />
                <Bar dataKey="total_qty" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Qty" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── PieChart Breakdown Status Pesanan ───────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Distribusi Status Pesanan
          </h2>
          {stats.total_pesanan === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-300">
              <ClipboardList className="h-12 w-12 mb-2" />
              <p className="text-sm text-gray-400">Belum ada pesanan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.pesanan_by_status)
                    .filter(([, v]) => v > 0)
                    .map(([k, v]) => ({ name: STATUS_CONFIG[k as keyof typeof STATUS_CONFIG]?.label ?? k, value: v, color: STATUS_CONFIG[k as keyof typeof STATUS_CONFIG]?.color ?? '#ccc' }))}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {Object.entries(stats.pesanan_by_status)
                    .filter(([, v]) => v > 0)
                    .map(([k], i) => (
                      <Cell key={i} fill={STATUS_CONFIG[k as keyof typeof STATUS_CONFIG]?.color ?? '#ccc'} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [value + ' pesanan', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tren Nilai Pesanan per Bulan — dipindah dari bawah ke kanan */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Tren Nilai Penjualan per Bulan (Rp)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.pesanan_per_bulan} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [formatRupiah(value), 'Nilai Pesanan']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="nilai"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Nilai Pesanan"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Quick Links ──────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/pesanan', label: 'Kelola Pesanan', sub: `${stats.pesanan_by_status.draft ?? 0} draft menunggu`, color: 'orange' },
          { to: '/admin/komisi', label: 'Persetujuan Komisi', sub: `${stats.total_komisi_pending} komisi pending`, color: 'amber' },
          { to: '/admin/laporan', label: 'Lihat Laporan Lengkap', sub: 'Export CSV & cetak', color: 'emerald' },
        ].map((link, i) => (
          <Link key={i} to={link.to}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border hover:border-orange-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{link.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{link.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
