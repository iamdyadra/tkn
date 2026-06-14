// AdminKategoriPage — CRUD kategori dengan TanStack Query
// Spec: ikon = input text nama Lucide, warna = input text class Tailwind
// Delete: alert tampilkan jumlah produk, cascade via ON DELETE CASCADE
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Tag, AlertTriangle } from 'lucide-react';
import { kategoriApi, produkApi } from '@/lib/api';
import type { Kategori } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const schema = z.object({
  nama:     z.string().min(2, 'Nama minimal 2 karakter'),
  ikon:     z.string().min(1, 'Ikon wajib diisi (nama Lucide, contoh: map, plane, hotel)'),
  warna:    z.string().min(1, 'Warna wajib diisi (class Tailwind, contoh: bg-blue-500)'),
  deskripsi: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminKategoriPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen]   = useState(false);
  const [editKat, setEditKat]       = useState<Kategori | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────
  const { data: kategori = [], isLoading } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => kategoriApi.getAll(),
  });

  const { data: produk = [] } = useQuery({
    queryKey: ['produk-admin'],
    queryFn: () => produkApi.getAllAdmin(),
  });

  // Hitung produk per kategori
  const produkCount: Record<number, number> = {};
  produk.forEach(p => {
    produkCount[p.kategori_id] = (produkCount[p.kategori_id] ?? 0) + 1;
  });

  // Jumlah produk di kategori yang hendak dihapus
  const deleteTargetProdukCount = deleteTarget ? (produkCount[deleteTarget.id] ?? 0) : 0;

  // ── Form ─────────────────────────────────────────────────────
  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ikon: 'tag', warna: 'bg-blue-500', deskripsi: '' },
  });

  const warnaWatch = watch('warna');
  const ikonWatch  = watch('ikon');

  // ── Mutations ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Omit<Kategori, 'id' | 'created_at'>) => kategoriApi.create(data),
    onSuccess: () => {
      toast.success('Kategori berhasil ditambahkan');
      qc.invalidateQueries({ queryKey: ['kategori'] });
      setModalOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? 'Gagal menambahkan kategori'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Kategori> }) => kategoriApi.update(id, data),
    onSuccess: () => {
      toast.success('Kategori berhasil diperbarui');
      qc.invalidateQueries({ queryKey: ['kategori'] });
      setModalOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? 'Gagal memperbarui kategori'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => kategoriApi.delete(id),
    onSuccess: (_, _id) => {
      const count = deleteTargetProdukCount;
      toast.success(
        count > 0
          ? `Kategori beserta ${count} produk berhasil dihapus`
          : 'Kategori berhasil dihapus'
      );
      qc.invalidateQueries({ queryKey: ['kategori'] });
      qc.invalidateQueries({ queryKey: ['produk-admin'] });
      setDeleteOpen(false);
      setDeleteTarget(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? 'Gagal menghapus kategori');
      setDeleteOpen(false);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────
  const openAdd = () => {
    setEditKat(null);
    reset({ ikon: 'tag', warna: 'bg-blue-500', nama: '', deskripsi: '' });
    setModalOpen(true);
  };

  const openEdit = (k: Kategori) => {
    setEditKat(k);
    reset({ nama: k.nama, ikon: k.ikon, warna: k.warna, deskripsi: k.deskripsi ?? '' });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      nama:      data.nama,
      ikon:      data.ikon,
      warna:     data.warna,
      deskripsi: data.deskripsi ?? '',
    };
    if (editKat) {
      updateMutation.mutate({ id: editKat.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Kategori</h1>
          <p className="text-sm text-gray-500">{kategori.length} kategori terdaftar</p>
        </div>
        <Button id="btn-tambah-kategori" onClick={openAdd} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {/* Tabel Kategori */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kategori</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Ikon</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Warna</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Deskripsi</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Produk</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : kategori.map(k => {
              const count = produkCount[k.id] ?? 0;
              return (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900">{k.nama}</p>
                  </td>
                  <td className="py-3 px-4">
                    {/* Preview: kotak kecil dengan class warna + nama ikon sebagai teks */}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${k.warna}`}>
                        {k.ikon.slice(0, 2).toUpperCase()}
                      </div>
                      <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{k.ikon}</code>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex-shrink-0 ${k.warna}`} />
                      <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{k.warna}</code>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px]">
                    <p className="line-clamp-2">{k.deskripsi || '—'}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${count > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                      {count} produk
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(k)} className="h-7 w-7 p-0 text-gray-500 hover:text-orange-700">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setDeleteTarget(k); setDeleteOpen(true); }}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && kategori.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Tag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Belum ada kategori</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Form Modal ─────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editKat ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nama */}
            <div className="space-y-1">
              <Label>Nama Kategori *</Label>
              <Input {...register('nama')} placeholder="Paket Wisata, Tiket Pesawat, ..." className={errors.nama ? 'border-red-400' : ''} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>

            {/* Ikon */}
            <div className="space-y-1">
              <Label>Nama Ikon Lucide *</Label>
              <div className="flex gap-2 items-center">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${warnaWatch || 'bg-gray-400'}`}>
                  {(ikonWatch || 'ic').slice(0, 2).toUpperCase()}
                </div>
                <Input
                  {...register('ikon')}
                  placeholder="map, plane, hotel, ship, shield-check, ..."
                  className={`flex-1 ${errors.ikon ? 'border-red-400' : ''}`}
                />
              </div>
              <p className="text-xs text-gray-400">
                Contoh: map, plane, hotel, ship, car, users, file-text, briefcase, shield-check
              </p>
              {errors.ikon && <p className="text-xs text-red-500">{errors.ikon.message}</p>}
            </div>

            {/* Warna */}
            <div className="space-y-1">
              <Label>Class Warna Tailwind *</Label>
              <div className="flex gap-2 items-center">
                <div className={`w-9 h-9 rounded-lg flex-shrink-0 border border-gray-200 ${warnaWatch || 'bg-gray-200'}`} />
                <Input
                  {...register('warna')}
                  placeholder="bg-blue-500, bg-emerald-500, bg-amber-600, ..."
                  className={`flex-1 ${errors.warna ? 'border-red-400' : ''}`}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[
                  'bg-blue-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-600',
                  'bg-indigo-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500',
                  'bg-teal-500', 'bg-slate-700',
                ].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { const el = document.querySelector('[name="warna"]') as HTMLInputElement; if (el) { el.value = c; el.dispatchEvent(new Event('input', { bubbles: true })); } }}
                    className={`w-6 h-6 rounded-full ${c} border-2 ${warnaWatch === c ? 'border-gray-900 scale-110' : 'border-transparent'} transition-all hover:scale-110`}
                    title={c}
                  />
                ))}
              </div>
              {errors.warna && <p className="text-xs text-red-500">{errors.warna.message}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>Deskripsi <span className="text-gray-400">(opsional)</span></Label>
              <Textarea {...register('deskripsi')} rows={2} placeholder="Deskripsi singkat kategori ini..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isMutating || isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isMutating ? 'Menyimpan...' : editKat ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Hapus Kategori?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Kategori <strong>"{deleteTarget?.nama}"</strong> akan dihapus permanen.
                </p>
                {deleteTargetProdukCount > 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <strong>⚠️ Peringatan:</strong> Menghapus kategori ini akan menghapus{' '}
                    <strong>{deleteTargetProdukCount} produk</strong> yang terkait secara permanen.
                    Tindakan ini tidak dapat dibatalkan.
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Kategori ini tidak memiliki produk. Penghapusan aman untuk dilakukan.
                  </p>
                )}
              </div>
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
              {deleteMutation.isPending
                ? 'Menghapus...'
                : deleteTargetProdukCount > 0
                  ? `Ya, Hapus Beserta ${deleteTargetProdukCount} Produk`
                  : 'Ya, Hapus Kategori'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
