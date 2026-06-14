// AdminPesananPage — kelola semua pesanan dengan update status
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { pesananApi, userApi } from '@/lib/api';
import type { Pesanan, PesananStatus, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, ClipboardList, ChevronRight, Trash2 } from 'lucide-react';
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

const NEXT_STATUS: Record<PesananStatus, PesananStatus | null> = {
  draft: 'diproses',
  diproses: 'dikirim',
  dikirim: 'diterima',
  diterima: null,
  dibatalkan: null,
};

export default function AdminPesananPage() {
  const queryClient = useQueryClient();
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [salesList, setSalesList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PesananStatus | 'semua'>('semua');
  const [filterSales, setFilterSales] = useState('semua');
  const [search, setSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ pesanan: Pesanan; toStatus: PesananStatus } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Pesanan | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [p, s] = await Promise.all([pesananApi.getAll(), userApi.getSales()]);
    const sorted = [...p].sort((a, b) => b.created_at.localeCompare(a.created_at));
    setPesanan(sorted);
    setSalesList(s);
    setLoading(false);
  };

  const filtered = pesanan.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchSales = filterSales === 'semua' || String(p.sales_id) === filterSales;
    const q = search.toLowerCase();
    const matchSearch = !q || p.kode.toLowerCase().includes(q) || p.nama_pelanggan.toLowerCase().includes(q);
    return matchStatus && matchSales && matchSearch;
  });

  const handleUpdateStatus = async () => {
    if (!confirmDialog) return;
    setUpdatingId(confirmDialog.pesanan.id);
    try {
      await pesananApi.updateStatus(confirmDialog.pesanan.id, confirmDialog.toStatus);
      toast.success(`Status diperbarui ke ${STATUS_CONFIG[confirmDialog.toStatus].label}`);
      setConfirmDialog(null);
      
      // Invalidate queries so commission pages update automatically
      queryClient.invalidateQueries({ queryKey: ['komisi'] });
      queryClient.invalidateQueries({ queryKey: ['komisi-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-komisi'] });
      
      load();
    } catch { toast.error('Gagal memperbarui status'); }
    finally { setUpdatingId(null); }
  };

  const handleBatalkan = async (p: Pesanan) => {
    setConfirmDialog({ pesanan: p, toStatus: 'dibatalkan' });
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setUpdatingId(deleteConfirm.id);
    try {
      await pesananApi.delete(deleteConfirm.id);
      toast.success('Pesanan berhasil dihapus');
      setDeleteConfirm(null);
      
      // Invalidate queries so commission pages update automatically
      queryClient.invalidateQueries({ queryKey: ['komisi'] });
      queryClient.invalidateQueries({ queryKey: ['komisi-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-komisi'] });
      
      load();
    } catch {
      toast.error('Gagal menghapus pesanan');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-orange-600" />
          Manajemen Pesanan
        </h1>
        <p className="text-sm text-gray-500">{pesanan.length} total pesanan</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kode atau pelanggan..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as PesananStatus | 'semua')}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            {(Object.keys(STATUS_CONFIG) as PesananStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSales} onValueChange={setFilterSales}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Sales</SelectItem>
            {salesList.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kode</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sales</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Pelanggan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tanggal</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : filtered.map(p => {
              const cfg = STATUS_CONFIG[p.status];
              const next = NEXT_STATUS[p.status];
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/pesanan/${p.kode}`} className="font-mono text-xs text-orange-700 hover:underline">{p.kode}</Link>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{p.sales_nama}</td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-medium">{p.nama_pelanggan}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{p.perusahaan}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                    {format(parseISO(p.created_at), 'd MMM yyyy', { locale: idLocale })}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatRupiah(p.total)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={`text-xs ${cfg.class}`}>{cfg.label}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {next && (
                        <Button
                          size="sm"
                          onClick={() => setConfirmDialog({ pesanan: p, toStatus: next })}
                          disabled={updatingId === p.id}
                          className="text-xs h-7 bg-orange-600 hover:bg-orange-700 px-2"
                        >
                          → {STATUS_CONFIG[next].label}
                        </Button>
                      )}
                      {p.status !== 'dibatalkan' && p.status !== 'diterima' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBatalkan(p)}
                          className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                        >
                          Batal
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(p)}
                        disabled={updatingId === p.id}
                        className="text-xs h-7 text-gray-400 hover:text-red-600 hover:bg-red-50 px-2"
                        title="Hapus Pesanan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Link to={`/pesanan/${p.kode}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Tidak ada pesanan ditemukan</p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Ubah status pesanan <strong className="font-mono">{confirmDialog?.pesanan.kode}</strong> menjadi{' '}
              <strong>{confirmDialog ? STATUS_CONFIG[confirmDialog.toStatus].label : ''}</strong>?
              {confirmDialog?.toStatus === 'dibatalkan' && ' Tindakan ini tidak dapat dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateStatus}
              className={confirmDialog?.toStatus === 'dibatalkan' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan <strong className="font-mono">{deleteConfirm?.kode}</strong>? 
              Tindakan ini akan menghapus data pesanan dan semua item di dalamnya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
