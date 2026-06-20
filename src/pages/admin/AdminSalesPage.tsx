// AdminSalesPage — manajemen akun sales
// T6: Sesuai spec — tidak ada hapus permanen, hanya aktif/nonaktif + edit data
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ToggleLeft, ToggleRight, Users, Pencil, Phone, MapPin, Calendar, Trash2 } from 'lucide-react';
import { userApi, pesananApi } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// Schema tambah akun baru
const createSchema = z.object({
  nama:     z.string().min(3, 'Nama minimal 3 karakter'),
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  telepon:  z.string().min(9, 'Nomor telepon tidak valid'),
  wilayah:  z.string().min(2, 'Wilayah wajib diisi'),
});

// Schema edit data sales (tanpa password)
const editSchema = z.object({
  nama:    z.string().min(3, 'Nama minimal 3 karakter'),
  email:   z.string().email('Format email tidak valid'),
  telepon: z.string().min(9, 'Nomor telepon tidak valid'),
  wilayah: z.string().min(2, 'Wilayah wajib diisi'),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function AdminSalesPage() {
  const qc = useQueryClient();

  // Modal states
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [editTarget, setEditTarget]       = useState<User | null>(null);
  const [editOpen, setEditOpen]           = useState(false);
  const [toggleTarget, setToggleTarget]   = useState<User | null>(null);
  const [toggleOpen, setToggleOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen]       = useState(false);

  // Forms
  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });
  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  // ── Queries ────────────────────────────────────────────────
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => userApi.getSales(),
  });

  const { data: pesanan = [] } = useQuery({
    queryKey: ['pesanan-all'],
    queryFn: () => pesananApi.getAll(),
  });

  // ── Mutations ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateFormData) =>
      userApi.create({ ...data, role: 'sales', is_aktif: true } as Omit<User, 'id' | 'created_at'>),
    onSuccess: () => {
      toast.success('Akun sales berhasil ditambahkan');
      qc.invalidateQueries({ queryKey: ['sales'] });
      setAddModalOpen(false);
      createForm.reset();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal menambahkan akun'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditFormData }) =>
      userApi.updateSales(id, data as { nama: string; email: string; telepon: string; wilayah: string }),
    onSuccess: () => {
      toast.success('Data sales berhasil diperbarui');
      qc.invalidateQueries({ queryKey: ['sales'] });
      setEditOpen(false);
      setEditTarget(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal memperbarui data sales'),
  });

  const toggleMutation = useMutation({
    mutationFn: (u: User) => userApi.setActive(u.id, !u.is_aktif),
    onSuccess: (_, u) => {
      toast.success(u.is_aktif ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
      qc.invalidateQueries({ queryKey: ['sales'] });
      setToggleOpen(false);
      setToggleTarget(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal mengubah status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteSales(id),
    onSuccess: () => {
      toast.success('Akun sales berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['sales'] });
      setDeleteOpen(false);
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal menghapus akun sales'),
  });

  // ── Handlers ───────────────────────────────────────────────
  const openEdit = (u: User) => {
    setEditTarget(u);
    editForm.reset({
      nama:    u.nama,
      email:   u.email,
      telepon: u.telepon ?? '',
      wilayah: u.wilayah ?? '',
    });
    setEditOpen(true);
  };

  const openToggle = (u: User) => {
    setToggleTarget(u);
    setToggleOpen(true);
  };

  // ── Stat helper ────────────────────────────────────────────
  const getSalesStats = (salesId: number) => {
    const sp = pesanan.filter(p => p.sales_id === salesId);
    return { jumlah: sp.length, total: sp.reduce((s, p) => s + p.total, 0) };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" /> Tim Sales
          </h1>
          <p className="text-sm text-gray-500">{sales.length} anggota sales · {sales.filter(s => s.is_aktif).length} aktif</p>
        </div>
        <Button id="btn-tambah-sales" onClick={() => setAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus className="h-4 w-4" /> Tambah Sales
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-200" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sales</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Telepon</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Wilayah</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total Pesanan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nilai Pesanan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Bergabung</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map(s => {
                const stats = getSalesStats(s.id);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.is_aktif ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-700 rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.nama}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {s.telepon ?? '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {s.wilayah ?? '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-orange-100 text-orange-700 rounded-full px-3 py-0.5 text-sm font-medium">
                        {stats.jumlah}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 text-xs">{formatRupiah(stats.total)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {s.created_at ? format(parseISO(s.created_at), 'd MMM yyyy', { locale: idLocale }) : '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={s.is_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                        {s.is_aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit data */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(s)}
                          className="h-7 w-7 p-0 text-gray-500 hover:text-orange-700 hover:bg-orange-50"
                          title="Edit data sales"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Toggle aktif/nonaktif */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openToggle(s)}
                          disabled={toggleMutation.isPending}
                          className={`gap-1.5 text-xs h-7 px-2 ${s.is_aktif ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={s.is_aktif ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                        >
                          {s.is_aktif
                            ? <><ToggleRight className="h-3.5 w-3.5" /> Nonaktifkan</>
                            : <><ToggleLeft className="h-3.5 w-3.5" /> Aktifkan</>}
                        </Button>

                        {/* Hapus akun */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget(s);
                            setDeleteOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Hapus akun sales"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Belum ada akun sales</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Tambah Sales ──────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Akun Sales Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(data => createMutation.mutate(data))} className="space-y-3">
            <div className="space-y-1">
              <Label>Nama Lengkap *</Label>
              <Input {...createForm.register('nama')} placeholder="Nama sales" className={createForm.formState.errors.nama ? 'border-red-400' : ''} />
              {createForm.formState.errors.nama && <p className="text-xs text-red-500">{createForm.formState.errors.nama.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" {...createForm.register('email')} placeholder="email@domain.com" className={createForm.formState.errors.email ? 'border-red-400' : ''} />
              {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Password *</Label>
                <Input type="password" {...createForm.register('password')} placeholder="Min 6 karakter" className={createForm.formState.errors.password ? 'border-red-400' : ''} />
                {createForm.formState.errors.password && <p className="text-xs text-red-500">{createForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>No. Telepon *</Label>
                <Input {...createForm.register('telepon')} placeholder="08xxx" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Wilayah Sales *</Label>
              <Input {...createForm.register('wilayah')} placeholder="Jabodetabek, Jawa Barat, dll" className={createForm.formState.errors.wilayah ? 'border-red-400' : ''} />
              {createForm.formState.errors.wilayah && <p className="text-xs text-red-500">{createForm.formState.errors.wilayah.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
                {createMutation.isPending ? 'Menyimpan...' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Edit Sales ────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Data Sales — {editTarget?.nama}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(data => editTarget && updateMutation.mutate({ id: editTarget.id, data }))} className="space-y-3">
            <div className="space-y-1">
              <Label>Nama Lengkap *</Label>
              <Input {...editForm.register('nama')} placeholder="Nama sales" className={editForm.formState.errors.nama ? 'border-red-400' : ''} />
              {editForm.formState.errors.nama && <p className="text-xs text-red-500">{editForm.formState.errors.nama.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" {...editForm.register('email')} placeholder="email@domain.com" className={editForm.formState.errors.email ? 'border-red-400' : ''} />
              {editForm.formState.errors.email && <p className="text-xs text-red-500">{editForm.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>No. Telepon *</Label>
                <Input {...editForm.register('telepon')} placeholder="08xxx" />
              </div>
              <div className="space-y-1">
                <Label>Wilayah Sales *</Label>
                <Input {...editForm.register('wilayah')} placeholder="Jabodetabek, dll" className={editForm.formState.errors.wilayah ? 'border-red-400' : ''} />
              </div>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
              Password tidak ditampilkan di sini. Gunakan fitur reset password jika diperlukan.
            </p>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Konfirmasi Toggle Aktif ────────────── */}
      <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.is_aktif ? 'Nonaktifkan Akun Sales?' : 'Aktifkan Akun Sales?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.is_aktif
                ? <>Akun <strong>{toggleTarget?.nama}</strong> akan dinonaktifkan. Sales tidak dapat login hingga diaktifkan kembali.</>
                : <>Akun <strong>{toggleTarget?.nama}</strong> akan diaktifkan kembali dan dapat login ke sistem.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                if (toggleTarget) toggleMutation.mutate(toggleTarget);
              }}
              disabled={toggleMutation.isPending}
              className={toggleTarget?.is_aktif ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {toggleMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : toggleTarget?.is_aktif ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* ── AlertDialog Konfirmasi Hapus Akun ────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Sales?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{deleteTarget?.nama}</strong> akan dihapus permanen dari sistem. 
              <br />
              <span className="text-xs text-amber-600 font-semibold mt-2 block">
                Catatan: Hanya akun sales tanpa riwayat pesanan yang dapat dihapus. Jika sales sudah memiliki pesanan, harap nonaktifkan akun sebagai gantinya.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </span>
              ) : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
