// AdminKomisiPage — halaman admin untuk kelola komisi & aturan komisi
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BadgeDollarSign, Plus, Pencil, Trash2, Check, X, Banknote, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { komisiApi, komisiRulesApi, kategoriApi } from '@/lib/api';
import type { Komisi, KomisiRule, KomisiStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<KomisiStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-gray-100 text-gray-600' },
  disetujui: { label: 'Disetujui', className: 'bg-blue-100 text-blue-700' },
  dibayar:   { label: 'Dibayar',   className: 'bg-emerald-100 text-emerald-700' },
  ditolak:   { label: 'Ditolak',   className: 'bg-red-100 text-red-700' },
};

// ── Rule Form Schema ─────────────────────────────────────────
const ruleSchema = z.object({
  nama_rule:     z.string().min(2, 'Nama rule minimal 2 karakter'),
  kategori_id:   z.string(),               // '' = semua kategori
  tipe:          z.enum(['persentase', 'nominal']),
  nilai:         z.number({ invalid_type_error: 'Nilai harus angka' }).positive('Nilai harus lebih dari 0'),
  min_transaksi: z.number().min(0),
  is_aktif:      z.boolean(),
});
type RuleFormData = z.infer<typeof ruleSchema>;

// ── Action Confirm State ─────────────────────────────────────
interface ConfirmState {
  open: boolean;
  action: 'setujui' | 'bayar' | 'tolak' | null;
  komisiId: number | null;
  salesNama?: string;
}

export default function AdminKomisiPage() {
  const qc = useQueryClient();

  // ── Tab 1: Daftar Komisi ──────────────────────────────────
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterSales, setFilterSales]   = useState('semua');
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, action: null, komisiId: null });
  const [catatanInput, setCatatanInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { data: komisiList = [], isLoading: komisiLoading } = useQuery({
    queryKey: ['admin-komisi'],
    queryFn: () => komisiApi.getAll(),
  });

  // Unique sales list from komisiList
  const salesOptions = Array.from(
    new Map(komisiList.map(k => [k.sales_id, k.sales_nama ?? `Sales #${k.sales_id}`])).entries()
  );

  const filteredKomisi = komisiList.filter(k => {
    const matchStatus = filterStatus === 'semua' || k.status === filterStatus;
    const matchSales  = filterSales  === 'semua' || String(k.sales_id) === filterSales;
    return matchStatus && matchSales;
  });

  const handleAction = (action: ConfirmState['action'], k: Komisi) => {
    setCatatanInput('');
    setConfirm({ open: true, action, komisiId: k.id, salesNama: k.sales_nama });
  };

  const doAction = async () => {
    if (!confirm.action || !confirm.komisiId) return;
    if (confirm.action === 'tolak' && !catatanInput.trim()) {
      toast.error('Catatan wajib diisi saat menolak komisi');
      return;
    }
    setActionLoading(true);
    try {
      const statusMap = { setujui: 'disetujui', bayar: 'dibayar', tolak: 'ditolak' } as const;
      await komisiApi.updateStatus(confirm.komisiId, statusMap[confirm.action], catatanInput || undefined);
      toast.success(
        confirm.action === 'setujui' ? 'Komisi disetujui' :
        confirm.action === 'bayar'   ? 'Komisi ditandai dibayar' :
        'Komisi ditolak'
      );
      qc.invalidateQueries({ queryKey: ['admin-komisi'] });
      setConfirm({ open: false, action: null, komisiId: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui komisi');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Tab 2: Aturan Komisi ──────────────────────────────────
  const [ruleDialogOpen, setRuleDialogOpen]       = useState(false);
  const [editingRule, setEditingRule]             = useState<KomisiRule | null>(null);
  const [deleteRuleTarget, setDeleteRuleTarget]   = useState<KomisiRule | null>(null);
  const [deleteRuleOpen, setDeleteRuleOpen]       = useState(false);

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['komisi-rules'],
    queryFn: () => komisiRulesApi.getAll(),
  });

  const { data: kategori = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => kategoriApi.getAll(),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { tipe: 'persentase', kategori_id: '', min_transaksi: 0, is_aktif: true },
  });

  const tipWatch = watch('tipe');

  const openAddRule = () => {
    setEditingRule(null);
    reset({ nama_rule: '', kategori_id: '', tipe: 'persentase', nilai: 0, min_transaksi: 0, is_aktif: true });
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule: KomisiRule) => {
    setEditingRule(rule);
    reset({
      nama_rule:     rule.nama_rule,
      kategori_id:   rule.kategori_id != null ? String(rule.kategori_id) : '',
      tipe:          rule.tipe,
      nilai:         rule.nilai,
      min_transaksi: rule.min_transaksi,
      is_aktif:      rule.is_aktif,
    });
    setRuleDialogOpen(true);
  };

  const createRuleMutation = useMutation({
    mutationFn: (data: Omit<KomisiRule, 'id' | 'created_at' | 'kategori_nama'>) => komisiRulesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['komisi-rules'] }); toast.success('Rule berhasil ditambahkan'); setRuleDialogOpen(false); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal menambahkan rule'),
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<KomisiRule> }) => komisiRulesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['komisi-rules'] }); toast.success('Rule berhasil diperbarui'); setRuleDialogOpen(false); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal memperbarui rule'),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => komisiRulesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['komisi-rules'] }); toast.success('Rule berhasil dihapus'); setDeleteRuleOpen(false); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal menghapus rule'),
  });

  const onRuleSubmit = (data: RuleFormData) => {
    const payload = {
      nama_rule:     data.nama_rule,
      kategori_id:   data.kategori_id !== '' ? parseInt(data.kategori_id) : null,
      tipe:          data.tipe,
      nilai:         data.nilai,
      min_transaksi: data.min_transaksi,
      is_aktif:      data.is_aktif,
    };
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data: payload });
    } else {
      createRuleMutation.mutate(payload);
    }
  };

  const confirmLabel = confirm.action === 'setujui' ? 'Setujui' : confirm.action === 'bayar' ? 'Bayar' : 'Tolak';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-orange-600" /> Manajemen Komisi
        </h1>
        <p className="text-sm text-gray-500">Kelola komisi sales dan aturan perhitungannya</p>
      </div>

      <Tabs defaultValue="daftar" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-64">
          <TabsTrigger value="daftar">Daftar Komisi</TabsTrigger>
          <TabsTrigger value="aturan">Aturan Komisi</TabsTrigger>
        </TabsList>

        {/* ══ TAB 1: DAFTAR KOMISI ══════════════════════════════ */}
        <TabsContent value="daftar" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="admin-komisi-filter-status" className="w-40 h-9 text-sm bg-white">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="dibayar">Dibayar</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSales} onValueChange={setFilterSales}>
              <SelectTrigger id="admin-komisi-filter-sales" className="w-48 h-9 text-sm bg-white">
                <SelectValue placeholder="Filter Sales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Sales</SelectItem>
                {salesOptions.map(([id, nama]) => (
                  <SelectItem key={id} value={String(id)}>{nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-400 ml-auto">{filteredKomisi.length} komisi</span>
          </div>

          {/* Table */}
          {komisiLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-xl border animate-pulse" />)}
            </div>
          ) : filteredKomisi.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <BadgeDollarSign className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada data komisi</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sales</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kode Pesanan</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nilai Pesanan</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">%</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nominal</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredKomisi.map(k => {
                    const badge = STATUS_BADGE[k.status];
                    return (
                      <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{k.sales_nama}</td>
                        <td className="py-3 px-4 font-mono text-orange-700 text-xs font-semibold">{k.kode_pesanan}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatRupiah(k.nilai_pesanan)}</td>
                        <td className="py-3 px-4 text-center text-orange-600 font-semibold">{k.persen_komisi}%</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatRupiah(k.nominal_komisi)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 justify-center flex-wrap">
                            {k.status === 'pending' && (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleAction('setujui', k)}>
                                  <Check className="h-3 w-3" /> Setujui
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleAction('tolak', k)}>
                                  <X className="h-3 w-3" /> Tolak
                                </Button>
                              </>
                            )}
                            {k.status === 'disetujui' && (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleAction('bayar', k)}>
                                  <Banknote className="h-3 w-3" /> Bayar
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleAction('tolak', k)}>
                                  <X className="h-3 w-3" /> Tolak
                                </Button>
                              </>
                            )}
                            {(k.status === 'dibayar' || k.status === 'ditolak') && (
                              <span className="text-xs text-gray-400">{formatDate(k.created_at)}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ══ TAB 2: ATURAN KOMISI ══════════════════════════════ */}
        <TabsContent value="aturan" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{rules.length} aturan terdaftar</p>
            <Button id="btn-tambah-rule" onClick={openAddRule} className="bg-orange-600 hover:bg-orange-700 gap-2 h-9 text-sm">
              <Plus className="h-4 w-4" /> Tambah Rule
            </Button>
          </div>

          {rulesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white rounded-xl border animate-pulse" />)}
            </div>
          ) : rules.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <AlertCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada aturan komisi</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nama Rule</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Berlaku untuk</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tipe</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nilai</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Min. Transaksi</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rules.map(r => (
                    <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.is_aktif ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 font-medium text-gray-900">{r.nama_rule}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {r.kategori_id == null ? (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">Semua Kategori</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{r.kategori_nama ?? `Kategori #${r.kategori_id}`}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={r.tipe === 'persentase' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                          {r.tipe === 'persentase' ? 'Persentase' : 'Nominal'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {r.tipe === 'persentase' ? `${r.nilai}%` : formatRupiah(r.nilai)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{r.min_transaksi > 0 ? formatRupiah(r.min_transaksi) : '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={r.is_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                          {r.is_aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50"
                            onClick={() => openEditRule(r)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                            onClick={() => { setDeleteRuleTarget(r); setDeleteRuleOpen(true); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ══ Confirm Action Dialog ═════════════════════════════ */}
      <AlertDialog open={confirm.open} onOpenChange={o => !o && setConfirm(prev => ({ ...prev, open: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm.action === 'setujui' ? 'Setujui Komisi?' :
               confirm.action === 'bayar'   ? 'Tandai Komisi Dibayar?' :
               'Tolak Komisi?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.action === 'tolak'
                ? 'Komisi akan ditolak. Berikan catatan alasan penolakan.'
                : `Konfirmasi tindakan untuk komisi sales ${confirm.salesNama ?? ''}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(confirm.action === 'tolak' || confirm.action === 'bayar') && (
            <div className="space-y-1 px-1">
              <Label htmlFor="komisi-catatan">
                Catatan {confirm.action === 'tolak' ? <span className="text-red-500">*</span> : '(opsional)'}
              </Label>
              <Input
                id="komisi-catatan"
                value={catatanInput}
                onChange={e => setCatatanInput(e.target.value)}
                placeholder={confirm.action === 'tolak' ? 'Alasan penolakan...' : 'Catatan pembayaran...'}
                className={confirm.action === 'tolak' && !catatanInput.trim() ? 'border-red-300' : ''}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); doAction(); }}
              disabled={actionLoading}
              className={
                confirm.action === 'tolak' ? 'bg-red-600 hover:bg-red-700' :
                confirm.action === 'bayar' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ Rule Form Dialog ══════════════════════════════════ */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule Komisi' : 'Tambah Rule Komisi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRuleSubmit)} className="space-y-4">
            {/* Nama rule */}
            <div className="space-y-1">
              <Label htmlFor="rule-nama">Nama Rule *</Label>
              <Input id="rule-nama" {...register('nama_rule')} placeholder="Komisi Paket Wisata" className={errors.nama_rule ? 'border-red-400' : ''} />
              {errors.nama_rule && <p className="text-xs text-red-500">{errors.nama_rule.message}</p>}
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <Label>Berlaku untuk Kategori</Label>
              <Select
                value={watch('kategori_id')}
                onValueChange={v => setValue('kategori_id', v, { shouldValidate: true })}
              >
                <SelectTrigger id="rule-kategori" className={errors.kategori_id ? 'border-red-400' : ''}>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori (Global)</SelectItem>
                  {kategori.map(k => (
                    <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipe */}
            <div className="space-y-1">
              <Label>Tipe Komisi *</Label>
              <div className="flex gap-4">
                {(['persentase', 'nominal'] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={t}
                      {...register('tipe')}
                      className="text-orange-600"
                    />
                    <span className="text-sm capitalize">{t === 'persentase' ? 'Persentase (%)' : 'Nominal (Rp)'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nilai */}
            <div className="space-y-1">
              <Label htmlFor="rule-nilai">
                Nilai {tipWatch === 'persentase' ? '(%)' : '(Rp)'} *
              </Label>
              <Input
                id="rule-nilai"
                type="number"
                step={tipWatch === 'persentase' ? '0.01' : '1'}
                {...register('nilai', { valueAsNumber: true })}
                placeholder={tipWatch === 'persentase' ? '5' : '50000'}
                className={errors.nilai ? 'border-red-400' : ''}
              />
              {errors.nilai && <p className="text-xs text-red-500">{errors.nilai.message}</p>}
            </div>

            {/* Min Transaksi */}
            <div className="space-y-1">
              <Label htmlFor="rule-min">Min. Transaksi (Rp)</Label>
              <Input
                id="rule-min"
                type="number"
                {...register('min_transaksi', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            {/* Is Aktif */}
            <div className="flex items-center gap-2">
              <input
                id="rule-aktif"
                type="checkbox"
                {...register('is_aktif')}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <Label htmlFor="rule-aktif" className="cursor-pointer">Rule Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? 'Menyimpan...' : editingRule ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ Delete Rule Confirm ═══════════════════════════════ */}
      <AlertDialog open={deleteRuleOpen} onOpenChange={setDeleteRuleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rule Komisi?</AlertDialogTitle>
            <AlertDialogDescription>
              Rule <strong>{deleteRuleTarget?.nama_rule}</strong> akan dihapus permanen. Jika rule sudah dipakai di data komisi, akan gagal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRuleTarget && deleteRuleMutation.mutate(deleteRuleTarget.id)}
              disabled={deleteRuleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRuleMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
