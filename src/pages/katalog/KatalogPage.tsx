// KatalogPage — halaman utama sales dengan filter lengkap
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useCompare } from '@/contexts/CompareContext';
import { produkApi, kategoriApi } from '@/lib/api';
import type { Produk, Kategori } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

const MAX_HARGA = 200000000;

function formatRp(n: number) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)}jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

export default function KatalogPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [filterKategori, setFilterKategori] = useState<number[]>([]);
  const [filterMerek, setFilterMerek] = useState<string[]>([]);
  const [hargaRange, setHargaRange] = useState([0, MAX_HARGA]);
  const [hanyaAda, setHanyaAda] = useState(false);
  const [hanyaPromo, setHanyaPromo] = useState(false);
  const [showMerek, setShowMerek] = useState(false);
  const { items: compareItems } = useCompare();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([produkApi.getAll(), kategoriApi.getAll()]).then(([p, k]) => {
      setProduk(p);
      setKategori(k);
      setLoading(false);
    });
  }, []);

  // Debounce search 300ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const merekList = useMemo(() => [...new Set(produk.map(p => p.merek))].sort(), [produk]);

  const toggleKategori = useCallback((id: number) => {
    setFilterKategori(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  }, []);

  const toggleMerek = useCallback((m: string) => {
    setFilterMerek(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }, []);

  const resetFilter = () => {
    setFilterKategori([]);
    setFilterMerek([]);
    setHargaRange([0, MAX_HARGA]);
    setHanyaAda(false);
    setHanyaPromo(false);
  };

  const activeFilterCount = filterKategori.length + filterMerek.length +
    (hargaRange[0] > 0 || hargaRange[1] < MAX_HARGA ? 1 : 0) +
    (hanyaAda ? 1 : 0) + (hanyaPromo ? 1 : 0);

  const filtered = useMemo(() => {
    return produk.filter(p => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q || p.nama.toLowerCase().includes(q) ||
        p.merek.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.kategori_nama.toLowerCase().includes(q);
      const hargaEfektif = p.harga_promo ?? p.harga_normal;
      const matchHarga = hargaEfektif >= hargaRange[0] && hargaEfektif <= hargaRange[1];
      const matchKat = filterKategori.length === 0 || filterKategori.includes(p.kategori_id);
      const matchMerek = filterMerek.length === 0 || filterMerek.includes(p.merek);
      const matchStok = !hanyaAda || p.stok > 0;
      const matchPromo = !hanyaPromo || p.is_promo;
      return matchSearch && matchHarga && matchKat && matchMerek && matchStok && matchPromo;
    });
  }, [produk, debouncedSearch, filterKategori, filterMerek, hargaRange, hanyaAda, hanyaPromo]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Reset */}
      {activeFilterCount > 0 && (
        <button onClick={resetFilter} className="text-xs text-red-500 hover:underline flex items-center gap-1">
          <X className="h-3 w-3" /> Reset semua filter ({activeFilterCount})
        </button>
      )}

      {/* Kategori */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">Kategori</p>
        <div className="space-y-2">
          {kategori.map(k => (
            <div key={k.id} className="flex items-center gap-2">
              <Checkbox
                id={`kat-${k.id}`}
                checked={filterKategori.includes(k.id)}
                onCheckedChange={() => toggleKategori(k.id)}
              />
              <Label htmlFor={`kat-${k.id}`} className="text-sm font-normal cursor-pointer">{k.nama}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Merek */}
      <div>
        <button
          className="flex items-center gap-1 text-sm font-semibold text-gray-800 mb-3 w-full justify-between"
          onClick={() => setShowMerek(!showMerek)}
        >
          Merek
          {showMerek ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showMerek && (
          <div className="space-y-2">
            {merekList.map(m => (
              <div key={m} className="flex items-center gap-2">
                <Checkbox
                  id={`merek-${m}`}
                  checked={filterMerek.includes(m)}
                  onCheckedChange={() => toggleMerek(m)}
                />
                <Label htmlFor={`merek-${m}`} className="text-sm font-normal cursor-pointer">{m}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Harga */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Rentang Harga</p>
        <p className="text-xs text-gray-500 mb-3">{formatRp(hargaRange[0])} — {formatRp(hargaRange[1])}</p>
        <Slider
          min={0}
          max={MAX_HARGA}
          step={2000000}
          value={hargaRange}
          onValueChange={setHargaRange}
          className="mb-1"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Rp 0</span>
          <span>{formatRp(MAX_HARGA)}</span>
        </div>
      </div>

      {/* Stok */}
      <div className="flex items-center gap-3">
        <Switch id="filter-stok" checked={hanyaAda} onCheckedChange={setHanyaAda} />
        <Label htmlFor="filter-stok" className="text-sm cursor-pointer">Stok tersedia saja</Label>
      </div>

      {/* Promo */}
      <div className="flex items-center gap-3">
        <Switch id="filter-promo" checked={hanyaPromo} onCheckedChange={setHanyaPromo} />
        <Label htmlFor="filter-promo" className="text-sm cursor-pointer">Promo Layanan saja</Label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Katalog Layanan</h1>
          <p className="text-indigo-200 mt-1 text-sm">Temukan produk terbaik untuk kebutuhan pelanggan Anda</p>
          {/* Search Bar */}
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari layanan, merek, SKU, atau kategori..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── Desktop Filter Sidebar ─────────────────────── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filter
                </h2>
                {activeFilterCount > 0 && (
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">{activeFilterCount}</Badge>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterDrawer(true)}
                  className="lg:hidden gap-1.5 relative"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                {debouncedSearch && (
                  <span className="text-sm text-gray-500">
                    Hasil untuk "<span className="font-medium text-gray-900">{debouncedSearch}</span>"
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{filtered.length} layanan</p>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Tidak ada layanan ditemukan</p>
                <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci atau filter</p>
                <Button variant="outline" onClick={resetFilter} className="mt-4">Reset Filter</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => <ProductCard key={p.id} produk={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────────────────────── */}
      {filterDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDrawer(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Filter Layanan</h2>
              <button onClick={() => setFilterDrawer(false)} className="text-gray-500 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
            <div className="p-4 border-t">
              <Button onClick={() => setFilterDrawer(false)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Tampilkan {filtered.length} Layanan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Compare Button ────────────────────────── */}
      {compareItems.length > 0 && (
        <Link
          to="/bandingkan"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="text-sm font-semibold">Bandingkan ({compareItems.length})</span>
        </Link>
      )}
    </div>
  );
}
