// AdminLaporanPage — laporan dengan BarChart + LineChart + tabel ringkasan
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, TrendingUp, Users, Download } from 'lucide-react';
import { pesananApi, userApi, produkApi } from '@/lib/api';
import type { Pesanan, User, Produk } from '@/types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function getWeekOfMonth(dateStr: string) {
  const d = new Date(dateStr);
  const date = d.getDate();
  const day = d.getDay();
  return Math.ceil((date + 6 - day) / 7);
}

const MINGGU_LABELS = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];

export default function AdminLaporanPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [sales, setSales] = useState<User[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSales, setFilterSales] = useState('semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    Promise.all([pesananApi.getAll(), userApi.getSales(), produkApi.getAllAdmin()]).then(([p, s, pr]) => {
      setPesanan(p);
      setSales(s);
      setProduk(pr);
      setLoading(false);
    });
  }, []);

  const filteredPesanan = useMemo(() => {
    return pesanan.filter(p => {
      const matchSales = filterSales === 'semua' || String(p.sales_id) === filterSales;
      const matchFrom = !dateFrom || p.created_at >= dateFrom;
      const matchTo = !dateTo || p.created_at <= dateTo;
      return matchSales && matchFrom && matchTo;
    });
  }, [pesanan, filterSales, dateFrom, dateTo]);

  // Top 10 produk terlaris berdasarkan item di pesanan
  const topProduk = useMemo(() => {
    const counts: Record<number, { nama: string; total: number }> = {};
    filteredPesanan.forEach(p => {
      p.items.forEach(item => {
        if (!counts[item.produk_id]) counts[item.produk_id] = { nama: item.nama_produk, total: 0 };
        counts[item.produk_id].total += item.qty;
      });
    });
    return Object.entries(counts)
      .map(([, v]) => v)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredPesanan]);

  // Tren pesanan per minggu (berdasarkan filter atau bulan berjalan)
  const trenMinggu = useMemo(() => {
    const data = MINGGU_LABELS.map((label, idx) => {
      const pInWeek = filteredPesanan.filter(p => {
        const week = getWeekOfMonth(p.created_at);
        return week === (idx + 1);
      });
      return {
        minggu: label,
        pesanan: pInWeek.length,
        pendapatan: pInWeek.reduce((sum, p) => sum + p.total, 0)
      };
    });
    return data;
  }, [filteredPesanan]);

  // Ringkasan per sales
  const ringkasanSales = useMemo(() => {
    return sales.map(s => {
      const sp = filteredPesanan.filter(p => p.sales_id === s.id);
      return {
        nama: s.nama,
        wilayah: s.wilayah ?? '—',
        jumlah: sp.length,
        total: sp.reduce((sum, p) => sum + p.total, 0),
        diterima: sp.filter(p => p.status === 'diterima').length,
      };
    }).sort((a, b) => b.total - a.total);
  }, [sales, filteredPesanan]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-600" /> Laporan & Analitik
          </h1>
          <p className="text-sm text-gray-500">{filteredPesanan.length} pesanan dalam filter</p>
        </div>
        <Button variant="outline" className="gap-2 text-sm" onClick={() => alert('Fitur export CSV segera hadir')}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Filter Sales</Label>
            <Select value={filterSales} onValueChange={setFilterSales}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Sales</SelectItem>
                {sales.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Dari Tanggal</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Hingga Tanggal</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 w-40" />
          </div>
          {(filterSales !== 'semua' || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" className="h-9 text-gray-500"
              onClick={() => { setFilterSales('semua'); setDateFrom(''); setDateTo(''); }}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Top 10 Produk */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-600" /> Top 10 Produk Terlaris
          </h2>
          {topProduk.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Tidak ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProduk} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nama"
                  tick={{ fontSize: 10 }}
                  width={100}
                  tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 12) + '…' : v}
                />
                <Tooltip cursor={{ fill: '#eef2ff' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Qty Terjual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Line Chart — Tren Mingguan */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Tren Pesanan Minggu Ini
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trenMinggu} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="minggu" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pesanan"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Pesanan"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabel Ringkasan per Sales */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" /> Ringkasan Performa Sales
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-500 text-xs uppercase">Sales</th>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-500 text-xs uppercase">Wilayah</th>
                <th className="text-center py-2.5 px-4 font-semibold text-gray-500 text-xs uppercase">Jml Pesanan</th>
                <th className="text-center py-2.5 px-4 font-semibold text-gray-500 text-xs uppercase">Selesai</th>
                <th className="text-right py-2.5 px-4 font-semibold text-gray-500 text-xs uppercase">Total Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ringkasanSales.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{s.nama}</td>
                  <td className="py-3 px-4 text-gray-600">{s.wilayah}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 text-sm font-medium">{s.jumlah}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-3 text-sm font-medium">{s.diterima}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">{formatRupiah(s.total)}</td>
                </tr>
              ))}
              {ringkasanSales.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
