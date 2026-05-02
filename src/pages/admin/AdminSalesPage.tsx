// AdminSalesPage — manajemen akun sales
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { userApi, pesananApi } from '@/lib/api';
import type { User, Pesanan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const schema = z.object({
  nama: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  telepon: z.string().min(9),
  wilayah: z.string().min(2),
});
type FormData = z.infer<typeof schema>;

export default function AdminSalesPage() {
  const [sales, setSales] = useState<User[]>([]);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [s, p] = await Promise.all([userApi.getSales(), pesananApi.getAll()]);
    setSales(s);
    setPesanan(p);
    setLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await userApi.create({ ...data, role: 'sales', is_aktif: true } as Omit<User, 'id' | 'created_at'>);
      toast.success('Akun sales berhasil ditambahkan');
      setModalOpen(false);
      reset();
      load();
    } catch { toast.error('Gagal menambahkan akun'); }
    finally { setSubmitting(false); }
  };

  const toggleAktif = async (u: User) => {
    await userApi.setActive(u.id, !u.is_aktif);
    toast.success(u.is_aktif ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
    load();
  };

  // Statistik per sales
  const getSalesStats = (salesId: number) => {
    const sp = pesanan.filter(p => p.sales_id === salesId);
    const total = sp.reduce((s, p) => s + p.total, 0);
    return { jumlah: sp.length, total };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Tim Sales
          </h1>
          <p className="text-sm text-gray-500">{sales.length} anggota sales</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" /> Tambah Sales
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-200" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sales</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Wilayah</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total Pesanan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nilai Pesanan</th>
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
                        <div className="bg-indigo-100 text-indigo-700 rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {s.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.nama}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.wilayah ?? '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-0.5 text-sm font-medium">
                        {stats.jumlah}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatRupiah(stats.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={s.is_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                        {s.is_aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAktif(s)}
                        className={`gap-1.5 text-xs h-7 ${s.is_aktif ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {s.is_aktif ? <><ToggleRight className="h-4 w-4" /> Nonaktifkan</> : <><ToggleLeft className="h-4 w-4" /> Aktifkan</>}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Sales */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Akun Sales Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label>Nama Lengkap *</Label>
              <Input {...register('nama')} placeholder="Nama sales" className={errors.nama ? 'border-red-400' : ''} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" {...register('email')} placeholder="email@domain.com" className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Password *</Label>
                <Input type="password" {...register('password')} placeholder="Min 6 karakter" className={errors.password ? 'border-red-400' : ''} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>No. Telepon *</Label>
                <Input {...register('telepon')} placeholder="08xxx" className={errors.telepon ? 'border-red-400' : ''} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Wilayah Sales *</Label>
              <Input {...register('wilayah')} placeholder="Jabodetabek, Jawa Barat, dll" className={errors.wilayah ? 'border-red-400' : ''} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? 'Menyimpan...' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
