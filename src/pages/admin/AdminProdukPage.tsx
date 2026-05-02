// AdminProdukPage — CRUD produk dengan modal form
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Package, PlusCircle, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { produkApi, kategoriApi } from '@/lib/api';
import type { Produk, Kategori } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const schema = z.object({
  nama: z.string().min(3),
  sku: z.string().min(2),
  merek: z.string().min(2),
  kategori_id: z.coerce.number().min(1),
  deskripsi: z.string().min(10),
  harga_normal: z.coerce.number().min(1000),
  harga_promo: z.coerce.number().optional(),
  stok: z.coerce.number().min(0),
  foto_url: z.string().url('URL foto tidak valid'),
  is_promo: z.boolean(),
  promo_mulai: z.string().optional(),
  promo_selesai: z.string().optional(),
  is_aktif: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function AdminProdukPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduk, setEditProduk] = useState<Produk | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Produk | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_promo: false, is_aktif: true },
  });
  const isPromo = watch('is_promo');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [p, k] = await Promise.all([produkApi.getAllAdmin(), kategoriApi.getAll()]);
    setProduk(p);
    setKategori(k);
    setLoading(false);
  };

  const openAdd = () => {
    setEditProduk(null);
    setSpecs([]);
    reset({ is_promo: false, is_aktif: true, stok: 0, harga_normal: 0 });
    setModalOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditProduk(p);
    setSpecs(p.spesifikasi || []);
    reset({
      nama: p.nama, sku: p.sku, merek: p.merek, kategori_id: p.kategori_id,
      deskripsi: p.deskripsi, harga_normal: p.harga_normal, harga_promo: p.harga_promo,
      stok: p.stok, foto_url: p.foto_urls?.[0] ?? '', is_promo: p.is_promo,
      promo_mulai: p.promo_mulai, promo_selesai: p.promo_selesai, is_aktif: p.is_aktif,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const kat = kategori.find(k => k.id === data.kategori_id);
      
      // Ensure we have multiple URLs if it's a placeholder, else just use what's given
      const foto_urls = data.foto_url.includes('unsplash.com') || data.foto_url.includes('picsum.photos') 
        ? [data.foto_url, data.foto_url.replace(/(\?|&|$)/, '$1v=1'), data.foto_url.replace(/(\?|&|$)/, '$1v=2')]
        : [data.foto_url];

      const payload = {
        ...data,
        kategori_nama: kat?.nama ?? '',
        foto_urls,
        spesifikasi: specs,
        harga_promo: data.is_promo ? data.harga_promo : null,
        promo_mulai: data.is_promo ? data.promo_mulai : null,
        promo_selesai: data.is_promo ? data.promo_selesai : null,
      };

      if (editProduk) {
        await produkApi.update(editProduk.id, payload);
        toast.success('Layanan berhasil diperbarui');
      } else {
        await produkApi.create(payload as Omit<Produk, 'id' | 'created_at'>);
        toast.success('Layanan berhasil ditambahkan');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error('Gagal menyimpan layanan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await produkApi.delete(deleteDialog.id);
      toast.success('Layanan berhasil dihapus');
      load();
    } catch (e) {
      toast.error('Gagal menghapus layanan');
    } finally {
      setDeleteDialog(null);
    }
  };

  const addSpec = () => {
    if (!newSpec.key || !newSpec.value) return;
    setSpecs([...specs, { ...newSpec }]);
    setNewSpec({ key: '', value: '' });
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const toggleAktif = async (p: Produk) => {
    await produkApi.update(p.id, { is_aktif: !p.is_aktif });
    toast.success(p.is_aktif ? 'Produk dinonaktifkan' : 'Produk diaktifkan');
    load();
  };

  const filtered = produk.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.merek.toLowerCase().includes(q);
    const matchKat = filterKat === 'semua' || String(p.kategori_id) === filterKat;
    return matchSearch && matchKat;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-sm text-gray-500">{produk.length} total produk</p>
        </div>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" /> Tambah Layanan
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari layanan, SKU, merek..." className="pl-9" />
        </div>
        <Select value={filterKat} onValueChange={setFilterKat}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Kategori</SelectItem>
            {kategori.map(k => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Layanan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kategori</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Harga</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Stok</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Promo</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(p => (
              <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.is_aktif ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={p.foto_urls?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'; }} alt={p.nama} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{p.nama}</p>
                      <p className="text-xs text-gray-400">{p.merek} · {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{p.kategori_nama}</td>
                <td className="py-3 px-4 text-right">
                  {p.is_promo && p.harga_promo ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">{formatRupiah(p.harga_normal)}</p>
                      <p className="font-semibold text-emerald-600">{formatRupiah(p.harga_promo)}</p>
                    </>
                  ) : (
                    <p className="font-medium text-gray-900">{formatRupiah(p.harga_normal)}</p>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-sm font-medium ${p.stok === 0 ? 'text-red-500' : p.stok <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {p.stok}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {p.is_promo ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">Promo</Badge> : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge className={p.is_aktif ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-gray-100 text-gray-500 text-xs'}>
                    {p.is_aktif ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0 text-gray-600 hover:text-indigo-700">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleAktif(p)} className={`h-8 w-8 p-0 ${p.is_aktif ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {p.is_aktif ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteDialog(p)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduk ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nama Layanan *</Label>
                <Input {...register('nama')} placeholder="Nama Layanan" className={errors.nama ? 'border-red-400' : ''} />
                {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>SKU *</Label>
                <Input {...register('sku')} placeholder="SKU-XXX" className={errors.sku ? 'border-red-400' : ''} />
              </div>
              <div className="space-y-1">
                <Label>Merek *</Label>
                <Input {...register('merek')} placeholder="Brand / merek" />
              </div>
              <div className="space-y-1">
                <Label>Kategori *</Label>
                <Select onValueChange={v => setValue('kategori_id', Number(v))} defaultValue={editProduk ? String(editProduk.kategori_id) : ''}>
                  <SelectTrigger className={errors.kategori_id ? 'border-red-400' : ''}><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {kategori.map(k => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Harga Normal (Rp) *</Label>
                <Input type="number" {...register('harga_normal')} placeholder="0" className={errors.harga_normal ? 'border-red-400' : ''} />
              </div>
              <div className="space-y-1">
                <Label>Stok *</Label>
                <Input type="number" {...register('stok')} placeholder="0" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>URL Foto *</Label>
                <Input {...register('foto_url')} placeholder="https://picsum.photos/seed/xxx/400/300" className={errors.foto_url ? 'border-red-400' : ''} />
                {errors.foto_url && <p className="text-xs text-red-500">{errors.foto_url.message}</p>}
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Deskripsi *</Label>
                <Textarea {...register('deskripsi')} rows={3} placeholder="Deskripsi produk..." className={errors.deskripsi ? 'border-red-400' : ''} />
              </div>

              {/* Spesifikasi Editor */}
              <div className="col-span-2 space-y-3">
                <Label>Spesifikasi / Detail Layanan</Label>
                <div className="flex gap-2">
                  <Input value={newSpec.key} onChange={e => setNewSpec({ ...newSpec, key: e.target.value })} placeholder="Key (misal: Durasi)" className="flex-1" />
                  <Input value={newSpec.value} onChange={e => setNewSpec({ ...newSpec, value: e.target.value })} placeholder="Value (misal: 3 Hari 2 Malam)" className="flex-1" />
                  <Button type="button" onClick={addSpec} variant="outline" size="icon" className="shrink-0"><PlusCircle className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {specs.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-700">{s.key}: <span className="font-normal text-gray-500">{s.value}</span></span>
                      <button type="button" onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Toggle */}
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <Switch id="is_promo" checked={isPromo} onCheckedChange={v => setValue('is_promo', v)} />
                  <Label htmlFor="is_promo">Aktifkan Promo</Label>
                </div>
                {isPromo && (
                  <div className="grid sm:grid-cols-3 gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="space-y-1">
                      <Label className="text-xs">Harga Promo (Rp)</Label>
                      <Input type="number" {...register('harga_promo')} placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tanggal Mulai</Label>
                      <Input type="date" {...register('promo_mulai')} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tanggal Selesai</Label>
                      <Input type="date" {...register('promo_selesai')} />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <Switch id="is_aktif" checked={watch('is_aktif')} onCheckedChange={v => setValue('is_aktif', v)} />
                <Label htmlFor="is_aktif">Produk Aktif</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? 'Menyimpan...' : editProduk ? 'Perbarui' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Layanan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "<strong>{deleteDialog?.nama}</strong>"? Tindakan ini tidak dapat dibatalkan.
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
