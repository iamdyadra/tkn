// AdminLaporanPage — laporan dengan BarChart + LineChart + tabel ringkasan
// T5: Export CSV nyata + Cetak dengan @media print
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, TrendingUp, Users, Download, Printer, X } from 'lucide-react';
import { pesananApi, userApi, produkApi } from '@/lib/api';
import type { Pesanan, User, Produk } from '@/types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

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

// ── CSV Export helper ──────────────────────────────────────────────
function exportCsv(pesanan: Pesanan[], dateLabel: string) {
  const headers = ['Kode Pesanan', 'Nama Sales', 'Nama Pelanggan', 'Perusahaan', 'Total (Rp)', 'Status', 'Tanggal'];

  const rows = pesanan.map(p => {
    const tgl = p.created_at
      ? format(parseISO(p.created_at), 'd MMM yyyy', { locale: idLocale })
      : '-';
    const STATUS_LABEL: Record<string, string> = {
      draft: 'Draft', diproses: 'Diproses', dikirim: 'Dikirim',
      diterima: 'Diterima', dibatalkan: 'Dibatalkan',
    };
    return [
      p.kode,
      p.sales_nama ?? '-',
      p.nama_pelanggan,
      p.perusahaan ?? '-',
      String(p.total),
      STATUS_LABEL[p.status] ?? p.status,
      tgl,
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `laporan-penjualan-${dateLabel}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminLaporanPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [sales, setSales] = useState<User[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSales, setFilterSales] = useState('semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([pesananApi.getAll(), userApi.getSales(), produkApi.getAllAdmin()]).then(([p, s, pr]) => {
      setPesanan(p);
      setSales(s);
      setProduk(pr);
      setLoading(false);
    });

    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const filteredPesanan = useMemo(() => {
    return pesanan.filter(p => {
      const matchSales = filterSales === 'semua' || String(p.sales_id) === filterSales;
      const pDate = p.created_at?.slice(0, 10) ?? '';
      const matchFrom = !dateFrom || pDate >= dateFrom;
      const matchTo = !dateTo || pDate <= dateTo;
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

  // ── Handler Export CSV ────────────────────────────────────────────
  const handleExportCsv = () => {
    if (filteredPesanan.length === 0) {
      toast.warning('Tidak ada data untuk diekspor');
      return;
    }
    const dateLabel = new Date().toISOString().slice(0, 10);
    exportCsv(filteredPesanan, dateLabel);
    toast.success(`CSV berhasil diekspor (${filteredPesanan.length} pesanan)`);
  };

  // ── Handler Print ─────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-orange-600 border-t-transparent" />
    </div>
  );

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          /* Force layout containers to render scrollable area normally */
          html, body, #root,
          .flex.h-screen,
          .flex-1.flex.flex-col,
          main.flex-1,
          .overflow-hidden,
          .overflow-auto {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }

          /* Reset main content spacing */
          main.flex-1 {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Sembunyikan elemen navigasi & kontrol */
          nav, aside, header, .no-print,
          [data-sidebar], [data-navbar],
          .admin-sidebar, .admin-navbar,
          button, .btn-group,
          [role="combobox"], [data-radix-select] {
            display: none !important;
          }

          /* Setup Page Margins & A4 formatting */
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }

          /* Header print */
          .print-header {
            display: block !important;
            margin-bottom: 20px !important;
            border-bottom: 2px solid #cbd5e1 !important;
            padding-bottom: 10px !important;
          }

          /* Ringkasan Cepat layout */
          .print-summary-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
            width: 100% !important;
          }
          .print-summary-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 10px 12px !important;
            background-color: #f8fafc !important;
            box-shadow: none !important;
          }

          /* Stack charts to prevent truncation */
          .print-charts-row {
            display: block !important;
            width: 100% !important;
          }
          .print-chart-card {
            width: 100% !important;
            margin-bottom: 24px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            padding: 16px !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .recharts-wrapper, .recharts-wrapper svg {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Table card container for printing */
          .print-table-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            padding: 16px !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
            margin-bottom: 24px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            break-inside: auto !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 600 !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          th, td {
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 8px 10px !important;
            text-align: left;
          }
          td.text-center, th.text-center {
            text-align: center !important;
          }
          td.text-right, th.text-right {
            text-align: right !important;
          }

          /* Prevent truncation of customer/product names */
          .print-no-truncate {
            max-width: none !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
          }

          /* Force exact color reproduction in print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media screen {
          .print-header { display: none; }
        }
      `}</style>

      <div ref={printRef} className="space-y-6">
        {/* Print Header — hanya muncul saat print */}
        <div className="print-header mb-4">
          <h1 className="text-2xl font-bold">TKN Travel E-Catalogue — Laporan Penjualan</h1>
          <p className="text-gray-500 text-sm">
            Dicetak pada: {format(new Date(), 'd MMMM yyyy, HH:mm', { locale: idLocale })}
            {filterSales !== 'semua' && ` · Sales: ${sales.find(s => String(s.id) === filterSales)?.nama}`}
            {dateFrom && ` · Dari: ${dateFrom}`}
            {dateTo && ` · s.d: ${dateTo}`}
          </p>
          <hr className="mt-2" />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-600" /> Laporan & Analitik
            </h1>
            <p className="text-sm text-gray-500">{filteredPesanan.length} pesanan dalam filter</p>
          </div>
          <div className="flex gap-2 no-print">
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" /> Cetak Laporan
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={handleExportCsv}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 no-print">
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
              <Button variant="ghost" size="sm" className="h-9 text-gray-500 gap-1"
                onClick={() => { setFilterSales('semua'); setDateFrom(''); setDateTo(''); }}>
                <X className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
        </Card>

        {/* Ringkasan Cepat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print-summary-grid">
          {[
            { label: 'Total Pesanan', value: filteredPesanan.length, color: 'orange' },
            { label: 'Selesai (Diterima)', value: filteredPesanan.filter(p => p.status === 'diterima').length, color: 'emerald' },
            { label: 'Nilai Total', value: formatRupiah(filteredPesanan.reduce((s, p) => s + p.total, 0)), color: 'blue', isRp: true },
            { label: 'Dibatalkan', value: filteredPesanan.filter(p => p.status === 'dibatalkan').length, color: 'red' },
          ].map((s, i) => (
            <Card key={i} className="p-4 print-summary-card">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color === 'emerald' ? 'text-emerald-600' : s.color === 'red' ? 'text-red-500' : s.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
                {s.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 print-charts-row">
          {/* Bar Chart — Top 10 Produk */}
          <Card className="p-5 print-chart-card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-orange-600" /> Top 10 Produk Terlaris
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
                    width={130}
                    tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 20) + '…' : v}
                  />
                  <Tooltip cursor={{ fill: '#eef2ff' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Qty Terjual" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Line Chart — Tren Mingguan */}
          <Card className="p-5 print-chart-card">
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
        <Card className="p-5 print-table-card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-600" /> Ringkasan Performa Sales
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
                      <span className="inline-block bg-orange-100 text-orange-700 rounded-full px-3 text-sm font-medium">{s.jumlah}</span>
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

        {/* Tabel Detail Pesanan — untuk Print */}
        <Card className="p-5 print-table-card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-gray-500" /> Detail Transaksi ({filteredPesanan.length} pesanan)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Kode</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Sales</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Pelanggan</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Total</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(isPrinting ? filteredPesanan : filteredPesanan.slice(0, 50)).map(p => {
                  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
                    draft:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-600' },
                    diproses:   { label: 'Diproses',   cls: 'bg-blue-100 text-blue-700' },
                    dikirim:    { label: 'Dikirim',    cls: 'bg-amber-100 text-amber-700' },
                    diterima:   { label: 'Diterima',   cls: 'bg-emerald-100 text-emerald-700' },
                    dibatalkan: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
                  };
                  const s = STATUS_LABEL[p.status] ?? { label: p.status, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs text-orange-700">{p.kode}</td>
                      <td className="py-2 px-3 text-gray-700 text-xs">{p.sales_nama}</td>
                      <td className="py-2 px-3 text-gray-700 text-xs max-w-[140px] truncate print-no-truncate">{p.nama_pelanggan}</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900 text-xs">{formatRupiah(p.total)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {p.created_at ? format(parseISO(p.created_at), 'd MMM yyyy', { locale: idLocale }) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {filteredPesanan.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">Tidak ada data pesanan</td></tr>
                )}
                {!isPrinting && filteredPesanan.length > 50 && (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-xs text-gray-400">
                      Menampilkan 50 dari {filteredPesanan.length} pesanan. Export CSV untuk data lengkap.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
