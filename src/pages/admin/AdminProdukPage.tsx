// AdminProdukPage — CRUD produk dengan TanStack Query + useFieldArray
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, Package, PlusCircle, X, Image as ImageIcon,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { produkApi, kategoriApi } from '@/lib/api';
import type { Produk } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

// ── Zod Schema ─────────────────────────────────────────────────
const schema = z.object({
  nama:          z.string().min(3, 'Nama minimal 3 karakter'),
  sku:           z.string().min(2, 'SKU minimal 2 karakter'),
  merek:         z.string().min(2, 'Merek minimal 2 karakter'),
  kategori_id:   z.coerce.number().min(1, 'Pilih kategori'),
  deskripsi:     z.string().min(10, 'Deskripsi minimal 10 karakter'),
  spesifikasi:   z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })),
  harga_normal:  z.coerce.number().min(1000, 'Harga minimal Rp 1.000'),
  is_promo:      z.boolean(),
  harga_promo:   z.coerce.number().optional(),
  promo_mulai:   z.string().optional(),
  promo_selesai: z.string().optional(),
  stok:          z.coerce.number().min(0, 'Stok tidak boleh negatif'),
  foto_urls:     z.array(z.object({ url: z.string().url('URL tidak valid') })).min(1, 'Minimal 1 foto'),
  is_aktif:      z.boolean(),
}).superRefine((d, ctx) => {
  if (d.is_promo) {
    if (!d.harga_promo || d.harga_promo <= 0) {
      ctx.addIssue({ code: 'custom', path: ['harga_promo'], message: 'Harga promo wajib diisi dan > 0' });
    }
    if (!d.promo_mulai) {
      ctx.addIssue({ code: 'custom', path: ['promo_mulai'], message: 'Tanggal mulai promo wajib diisi' });
    }
    if (!d.promo_selesai) {
      ctx.addIssue({ code: 'custom', path: ['promo_selesai'], message: 'Tanggal selesai promo wajib diisi' });
    }
    if (d.promo_mulai && d.promo_selesai && d.promo_selesai <= d.promo_mulai) {
      ctx.addIssue({ code: 'custom', path: ['promo_selesai'], message: 'Tanggal selesai harus setelah tanggal mulai' });
    }
  }
});

type FormData = z.infer<typeof schema>;

export default function AdminProdukPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [filterKat, setFilterKat]   = useState('semua');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editProduk, setEditProduk] = useState<Produk | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Produk | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────
  const { data: produk = [], isLoading: produkLoading } = useQuery({
    queryKey: ['produk-admin'],
    queryFn: () => produkApi.getAllAdmin(),
  });

  const { data: kategori = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => kategoriApi.getAll(),
  });

  // ── Form ─────────────────────────────────────────────────────
  const {
    register, handleSubmit, reset, control, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_promo: false, is_aktif: true, stok: 0,
      spesifikasi: [], foto_urls: [{ url: '' }],
    },
  });

  const isPromo = watch('is_promo');

  const {
    fields: specFields, append: appendSpec, remove: removeSpec,
  } = useFieldArray({ control, name: 'spesifikasi' });

  const {
    fields: fotoFields, append: appendFoto, remove: removeFoto,
  } = useFieldArray({ control, name: 'foto_urls' });

  // ── Mutations ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Omit<Produk, 'id' | 'created_at'>) => produkApi.create(data),
    onSuccess: () => {
      toast.success('Produk berhasil ditambahkan');
      qc.invalidateQueries({ queryKey: ['produk-admin'] });
      setModalOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? 'Gagal menambahkan produk'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Produk> }) => produkApi.update(id, data),
    onSuccess: () => {
      toast.success('Produk berhasil diperbarui');
      qc.invalidateQueries({ queryKey: ['produk-admin'] });
      setModalOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? 'Gagal memperbarui produk'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => produkApi.delete(id),
    onSuccess: () => {
      toast.success('Produk berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['produk-admin'] });
      setDeleteOpen(false);
      setDeleteTarget(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? 'Gagal menghapus produk');
      setDeleteOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (p: Produk) => produkApi.update(p.id, { is_aktif: !p.is_aktif }),
    onSuccess: (_, p) => {
      toast.success(p.is_aktif ? 'Produk dinonaktifkan' : 'Produk diaktifkan');
      qc.invalidateQueries({ queryKey: ['produk-admin'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Gagal mengubah status'),
  });

  // ── Handlers ─────────────────────────────────────────────────
  const openAdd = () => {
    setEditProduk(null);
    reset({
      is_promo: false, is_aktif: true, stok: 0, harga_normal: 0,
      spesifikasi: [], foto_urls: [{ url: '' }],
    });
    setModalOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditProduk(p);
    reset({
      nama: p.nama,
      sku: p.sku,
      merek: p.merek,
      kategori_id: p.kategori_id,
      deskripsi: p.deskripsi,
      spesifikasi: p.spesifikasi || [],
      harga_normal: p.harga_normal,
      harga_promo: p.harga_promo,
      stok: p.stok,
      foto_urls: (p.foto_urls || []).map(url => ({ url })),
      is_promo: p.is_promo,
      promo_mulai: p.promo_mulai?.slice(0, 16),
      promo_selesai: p.promo_selesai?.slice(0, 16),
      is_aktif: p.is_aktif,
    });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const kat = kategori.find(k => k.id === data.kategori_id);
    const payload = {
      nama:           data.nama,
      sku:            data.sku.toUpperCase(),
      merek:          data.merek,
      kategori_id:    data.kategori_id,
      kategori_nama:  kat?.nama ?? '',
      deskripsi:      data.deskripsi,
      spesifikasi:    data.spesifikasi,
      harga_normal:   data.harga_normal,
      harga_promo:    data.is_promo ? (data.harga_promo ?? null) : null,
      stok:           data.stok,
      foto_urls:      data.foto_urls.map(f => f.url),
      is_promo:       data.is_promo,
      promo_mulai:    data.is_promo ? (data.promo_mulai ?? null) : null,
      promo_selesai:  data.is_promo ? (data.promo_selesai ?? null) : null,
      is_aktif:       data.is_aktif,
    };
    if (editProduk) {
      updateMutation.mutate({ id: editProduk.id, data: payload });
    } else {
      createMutation.mutate(payload as Omit<Produk, 'id' | 'created_at'>);
    }
  };

  // ── Filter ───────────────────────────────────────────────────
  const filtered = produk.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.merek.toLowerCase().includes(q);
    const matchKat = filterKat === 'semua' || String(p.kategori_id) === filterKat;
    return matchSearch && matchKat;
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-sm text-gray-500">{produk.length} total produk</p>
        </div>
        <Button id="btn-tambah-produk" onClick={openAdd} className="bg-orange-600 hover:bg-orange-700 gap-2">
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
          <SelectTrigger className="w-44"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
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
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">SKU</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kategori</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Harga Normal</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Harga Promo</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Stok</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Promo</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produkLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(p => (
              <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.is_aktif ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.foto_urls?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=80'}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=80'; }}
                      alt={p.nama}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{p.nama}</p>
                      <p className="text-xs text-gray-400">{p.merek}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.sku}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">{p.kategori_nama}</td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium text-xs">{formatRupiah(p.harga_normal)}</td>
                <td className="py-3 px-4 text-right text-xs">
                  {p.is_promo && p.harga_promo
                    ? <span className="text-emerald-600 font-semibold">{formatRupiah(p.harga_promo)}</span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-sm font-medium ${p.stok === 0 ? 'text-red-500' : p.stok <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {p.stok}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {p.is_promo
                    ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">Promo</Badge>
                    : <span className="text-gray-300 text-xs">—</span>
                  }
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge className={p.is_aktif ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-gray-100 text-gray-500 text-xs'}>
                    {p.is_aktif ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-7 w-7 p-0 text-gray-600 hover:text-orange-700">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => toggleMutation.mutate(p)}
                      disabled={toggleMutation.isPending}
                      className={`h-7 w-7 p-0 ${p.is_aktif ? 'text-emerald-600 hover:text-emerald-800' : 'text-gray-400 hover:text-emerald-600'}`}
                    >
                      {p.is_aktif ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => { setDeleteTarget(p); setDeleteOpen(true); }}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!produkLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* ── Form Modal ─────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduk ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Nama + SKU */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nama Layanan *</Label>
                <Input {...register('nama')} placeholder="Paket Wisata Bali..." className={errors.nama ? 'border-red-400' : ''} />
                {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>SKU * <span className="text-gray-400 text-xs">(auto-uppercase)</span></Label>
                <Input
                  {...register('sku')}
                  placeholder="PKG-BALI-32"
                  className={errors.sku ? 'border-red-400' : ''}
                  onChange={e => setValue('sku', e.target.value.toUpperCase())}
                />
                {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
              </div>
            </div>

            {/* Row 2: Merek + Kategori */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Merek *</Label>
                <Input {...register('merek')} placeholder="TKN Travel" className={errors.merek ? 'border-red-400' : ''} />
                {errors.merek && <p className="text-xs text-red-500">{errors.merek.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Kategori *</Label>
                <Controller
                  control={control}
                  name="kategori_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={v => field.onChange(Number(v))}
                    >
                      <SelectTrigger className={errors.kategori_id ? 'border-red-400' : ''}>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategori.map(k => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.kategori_id && <p className="text-xs text-red-500">{errors.kategori_id.message}</p>}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>Deskripsi *</Label>
              <Textarea {...register('deskripsi')} rows={3} placeholder="Deskripsi lengkap layanan..." className={errors.deskripsi ? 'border-red-400' : ''} />
              {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi.message}</p>}
            </div>

            {/* Spesifikasi — useFieldArray */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Spesifikasi / Detail</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => appendSpec({ key: '', value: '' })}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Tambah Spesifikasi
                </Button>
              </div>
              <div className="space-y-2">
                {specFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      {...register(`spesifikasi.${idx}.key`)}
                      placeholder="Key (contoh: Durasi)"
                      className="flex-1"
                    />
                    <Input
                      {...register(`spesifikasi.${idx}.value`)}
                      placeholder="Value (contoh: 3 Hari 2 Malam)"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(idx)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {specFields.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Belum ada spesifikasi. Klik "Tambah Spesifikasi" untuk menambahkan.</p>
                )}
              </div>
            </div>

            {/* Harga + Stok */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Harga Normal (Rp) *</Label>
                <Input type="number" {...register('harga_normal')} placeholder="0" className={errors.harga_normal ? 'border-red-400' : ''} />
                {errors.harga_normal && <p className="text-xs text-red-500">{errors.harga_normal.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Stok *</Label>
                <Input type="number" {...register('stok')} placeholder="0" className={errors.stok ? 'border-red-400' : ''} />
                {errors.stok && <p className="text-xs text-red-500">{errors.stok.message}</p>}
              </div>
            </div>

            {/* Foto URLs — useFieldArray */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Foto Produk *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => appendFoto({ url: '' })}
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Tambah Foto
                </Button>
              </div>
              {errors.foto_urls && !Array.isArray(errors.foto_urls) && (
                <p className="text-xs text-red-500">{(errors.foto_urls as { message?: string }).message}</p>
              )}
              <div className="space-y-2">
                {fotoFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input
                        {...register(`foto_urls.${idx}.url`)}
                        placeholder="https://images.example.com/photo.jpg"
                        className={errors.foto_urls?.[idx]?.url ? 'border-red-400' : ''}
                      />
                      {errors.foto_urls?.[idx]?.url && (
                        <p className="text-xs text-red-500">{errors.foto_urls[idx]?.url?.message}</p>
                      )}
                    </div>
                    {fotoFields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFoto(idx)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600 mt-0.5">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="is_promo"
                  render={({ field }) => (
                    <Switch id="is_promo" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="is_promo">Aktifkan Promo</Label>
              </div>
              {isPromo && (
                <div className="grid sm:grid-cols-3 gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="space-y-1">
                    <Label className="text-xs">Harga Promo (Rp) *</Label>
                    <Input type="number" {...register('harga_promo')} placeholder="0" className={errors.harga_promo ? 'border-red-400' : ''} />
                    {errors.harga_promo && <p className="text-xs text-red-500">{errors.harga_promo.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tanggal Mulai *</Label>
                    <Input type="datetime-local" {...register('promo_mulai')} className={errors.promo_mulai ? 'border-red-400' : ''} />
                    {errors.promo_mulai && <p className="text-xs text-red-500">{errors.promo_mulai.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tanggal Selesai *</Label>
                    <Input type="datetime-local" {...register('promo_selesai')} className={errors.promo_selesai ? 'border-red-400' : ''} />
                    {errors.promo_selesai && <p className="text-xs text-red-500">{errors.promo_selesai.message}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Is Aktif */}
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="is_aktif"
                render={({ field }) => (
                  <Switch id="is_aktif" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="is_aktif">Produk Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isMutating || isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isMutating ? 'Menyimpan...' : editProduk ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "<strong>{deleteTarget?.nama}</strong>"?
              Jika produk sudah ada dalam pesanan, penghapusan akan gagal.
              Tindakan ini tidak dapat dibatalkan.
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
              {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
