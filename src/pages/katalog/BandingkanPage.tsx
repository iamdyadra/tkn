// BandingkanPage — perbandingan 2-4 produk side by side
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Trash2, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Produk } from '@/types';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// Ambil semua unique spec keys dari Semua Layanan
function getAllSpecKeys(items: Produk[]): string[] {
  const keys = new Set<string>();
  items.forEach(p => p.spesifikasi.forEach(s => keys.add(s.key)));
  return [...keys];
}

// Cek apakah nilai spec berbeda di antar produk
function isSpecDifferent(items: Produk[], key: string): boolean {
  const values = items.map(p => p.spesifikasi.find(s => s.key === key)?.value ?? '—');
  return new Set(values).size > 1;
}

export default function BandingkanPage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  const handleAddCart = (produk: Produk) => {
    if (produk.stok === 0) { toast.warning('Stok produk habis'); return; }
    addItem(produk, 1);
    toast.success(`${produk.nama} ditambahkan ke pesanan`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <ArrowLeftRight className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Belum ada produk untuk dibandingkan</h2>
          <p className="text-gray-400 text-sm mt-2">Tambahkan 2–4 produk dari katalog untuk membandingkannya</p>
          <Link to="/katalog">
            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700 gap-2">
              <ArrowLeft className="h-4 w-4" /> Ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const specKeys = getAllSpecKeys(items);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/katalog" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
              Perbandingan Produk
            </h1>
            <Badge className="bg-indigo-100 text-indigo-700">{items.length} produk</Badge>
          </div>
          <Button variant="outline" onClick={clearCompare} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Hapus Semua
          </Button>
        </div>

        {items.length < 2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            Tambahkan minimal 2 produk untuk membandingkan. Saat ini hanya ada 1 produk.
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* ── Foto Row ──────────────────────────────────── */}
            <div className="grid bg-white rounded-t-xl border border-gray-200 border-b-0" style={{ gridTemplateColumns: `160px repeat(${items.length}, 1fr)` }}>
              <div className="p-4 bg-gray-50 rounded-tl-xl flex items-end">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Layanan</span>
              </div>
              {items.map(p => (
                <div key={p.id} className="p-4 text-center border-l border-gray-200">
                  <div className="relative inline-block">
                    <img
                      src={p.foto_urls[0]}
                      alt={p.nama}
                      className="w-full max-w-[160px] aspect-[4/3] object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                      title="Hapus dari perbandingan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {p.is_promo && <Badge className="bg-emerald-500 text-white mt-2 text-xs">PROMO</Badge>}
                </div>
              ))}
            </div>

            {/* ── Nama & Merek ───────────────────────────────── */}
            <CompareRow label="Nama Layanan" highlight={false} items={items.length}>
              {items.map(p => (
                <div key={p.id} className="p-3 border-l border-gray-200">
                  <Link to={`/katalog/${p.id}`} className="text-sm font-semibold text-indigo-700 hover:underline line-clamp-2">{p.nama}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">{p.merek} · {p.sku}</p>
                </div>
              ))}
            </CompareRow>

            {/* ── Kategori ───────────────────────────────────── */}
            <CompareRow label="Kategori" highlight={isSpecDifferent(items, '_kategori')} items={items.length}>
              {items.map(p => (
                <div key={p.id} className="p-3 border-l border-gray-200 text-sm text-gray-700">{p.kategori_nama}</div>
              ))}
            </CompareRow>

            {/* ── Harga ──────────────────────────────────────── */}
            <CompareRow label="Harga" highlight={true} items={items.length}>
              {items.map(p => (
                <div key={p.id} className="p-3 border-l border-gray-200">
                  {p.is_promo && p.harga_promo ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">{formatRupiah(p.harga_normal)}</p>
                      <p className="text-sm font-bold text-emerald-600">{formatRupiah(p.harga_promo)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-gray-900">{formatRupiah(p.harga_normal)}</p>
                  )}
                </div>
              ))}
            </CompareRow>

            {/* ── Stok ───────────────────────────────────────── */}
            <CompareRow label="Stok" highlight={true} items={items.length}>
              {items.map(p => (
                <div key={p.id} className="p-3 border-l border-gray-200">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${p.stok === 0 ? 'text-red-600' : p.stok <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    <Package className="h-3.5 w-3.5" />
                    {p.stok === 0 ? 'Habis' : `${p.stok} unit`}
                  </span>
                </div>
              ))}
            </CompareRow>

            {/* ── Spesifikasi ────────────────────────────────── */}
            {specKeys.map(key => {
              const isDiff = isSpecDifferent(items, key);
              return (
                <CompareRow key={key} label={key} highlight={isDiff} items={items.length}>
                  {items.map(p => (
                    <div key={p.id} className={`p-3 border-l border-gray-200 text-sm ${isDiff ? 'font-medium' : 'text-gray-700'}`}>
                      {p.spesifikasi.find(s => s.key === key)?.value ?? '—'}
                    </div>
                  ))}
                </CompareRow>
              );
            })}

            {/* ── Aksi ───────────────────────────────────────── */}
            <div className="grid bg-white rounded-b-xl border border-gray-200 border-t border-t-gray-200" style={{ gridTemplateColumns: `160px repeat(${items.length}, 1fr)` }}>
              <div className="p-4 bg-gray-50 rounded-bl-xl flex items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</span>
              </div>
              {items.map(p => (
                <div key={p.id} className="p-3 border-l border-gray-200">
                  <Button
                    size="sm"
                    onClick={() => handleAddCart(p)}
                    disabled={p.stok === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1.5 text-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {p.stok === 0 ? 'Habis' : '+ Pesanan'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component untuk row perbandingan
function CompareRow({
  label, highlight, items, children
}: { label: string; highlight: boolean; items: number; children: React.ReactNode }) {
  return (
    <div
      className={`grid border border-gray-200 border-t-0 ${highlight ? 'bg-yellow-50' : 'bg-white'}`}
      style={{ gridTemplateColumns: `160px repeat(${items}, 1fr)` }}
    >
      <div className={`p-3 flex items-start bg-gray-50 border-r border-gray-200 ${highlight ? 'bg-yellow-100/60' : ''}`}>
        <span className="text-xs font-semibold text-gray-600 leading-snug">{label}</span>
        {highlight && <span className="ml-1 text-[10px] text-amber-600 font-medium whitespace-nowrap">(beda)</span>}
      </div>
      {children}
    </div>
  );
}
