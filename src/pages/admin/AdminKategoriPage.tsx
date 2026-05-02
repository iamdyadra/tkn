// AdminKategoriPage — CRUD kategori produk
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { kategoriApi, produkApi } from '@/lib/api';
import type { Kategori } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Cpu, Briefcase, Armchair, Package, Network, Shield } from 'lucide-react';

const IKON_OPTIONS = ['Cpu', 'Briefcase', 'Armchair', 'Package', 'Network', 'Shield', 'Tag', 'Box', 'Monitor'];
const WARNA_OPTIONS = ['indigo', 'blue', 'amber', 'emerald', 'purple', 'red', 'pink', 'orange'];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Briefcase, Armchair, Package, Network, Shield, Tag,
};

const schema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  ikon: z.string().min(1),
  warna: z.string().min(1),
  deskripsi: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminKategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [produkCount, setProdukCount] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Kategori | null>(null);
  const [editKat, setEditKat] = useState<Kategori | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ikon: 'Tag', warna: 'indigo' },
  });

  const selectedWarna = watch('warna');
  const selectedIkon = watch('ikon');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [k, p] = await Promise.all([kategoriApi.getAll(), produkApi.getAllAdmin()]);
    setKategori(k);
    const counts: Record<number, number> = {};
    p.forEach(pr => { counts[pr.kategori_id] = (counts[pr.kategori_id] ?? 0) + 1; });
    setProdukCount(counts);
    setLoading(false);
  };

  const openAdd = () => {
    setEditKat(null);
    reset({ ikon: 'Tag', warna: 'indigo', nama: '', deskripsi: '' });
    setModalOpen(true);
  };

  const openEdit = (k: Kategori) => {
    setEditKat(k);
    reset({ nama: k.nama, ikon: k.ikon, warna: k.warna, deskripsi: k.deskripsi });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (editKat) {
        await kategoriApi.update(editKat.id, { ...data, deskripsi: data.deskripsi ?? '' } as Partial<Kategori>);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await kategoriApi.create({ ...data, deskripsi: data.deskripsi ?? '' } as Omit<Kategori, 'id' | 'created_at'>);
        toast.success('Kategori berhasil ditambahkan');
      }
      setModalOpen(false);
      load();
    } catch { toast.error('Gagal menyimpan kategori'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    await kategoriApi.delete(deleteDialog.id);
    toast.success('Kategori dihapus');
    setDeleteDialog(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Kategori</h1>
          <p className="text-sm text-gray-500">{kategori.length} kategori terdaftar</p>
        </div>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategori.map(k => {
            const IconComp = ICON_MAP[k.ikon] ?? Tag;
            const count = produkCount[k.id] ?? 0;
            return (
              <div key={k.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-${k.warna}-100`}>
                      <IconComp className={`h-5 w-5 text-${k.warna}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{k.nama}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{count} produk</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(k)} className="h-7 w-7 p-0 text-gray-500 hover:text-indigo-700">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteDialog(k)} className="h-7 w-7 p-0 text-gray-500 hover:text-red-500" disabled={count > 0}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {k.deskripsi && <p className="text-xs text-gray-500 mt-3 line-clamp-2">{k.deskripsi}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editKat ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nama Kategori *</Label>
              <Input {...register('nama')} placeholder="Nama kategori" className={errors.nama ? 'border-red-400' : ''} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Ikon</Label>
              <div className="flex flex-wrap gap-2">
                {IKON_OPTIONS.map(ikon => {
                  const I = ICON_MAP[ikon] ?? Tag;
                  return (
                    <button
                      type="button"
                      key={ikon}
                      onClick={() => setValue('ikon', ikon)}
                      className={`p-2 rounded-lg border-2 transition-all ${selectedIkon === ikon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                      title={ikon}
                    >
                      <I className="h-4 w-4 text-gray-700" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex flex-wrap gap-2">
                {WARNA_OPTIONS.map(w => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setValue('warna', w)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all capitalize bg-${w}-100 text-${w}-700 ${selectedWarna === w ? `border-${w}-500` : 'border-transparent'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea {...register('deskripsi')} rows={2} placeholder="Deskripsi singkat..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? 'Menyimpan...' : editKat ? 'Perbarui' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori "<strong>{deleteDialog?.nama}</strong>" akan dihapus permanen. Pastikan tidak ada produk yang terhubung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
