// PromoPage — halaman Promo Layanan dengan hero banner, countdown, filter & sort
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { produkApi } from '@/lib/api';
import type { Produk } from '@/types';
import { Tag, Clock, Sparkles, Filter, ArrowUpDown, ShoppingBag } from 'lucide-react';
import { differenceInSeconds, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function getDiskonPersen(normal: number, promo: number) {
  return Math.round((1 - promo / normal) * 100);
}

// ── Per-card countdown hook ──────────────────────────────────
function useCountdownSeconds(targetDate?: string) {
  const [seconds, setSeconds] = useState(() => {
    if (!targetDate) return 0;
    const ds = targetDate.includes(' ') ? targetDate.replace(' ', 'T') : targetDate;
    return Math.max(0, differenceInSeconds(parseISO(ds), new Date()));
  });

  useEffect(() => {
    if (!targetDate) return;
    const ds = targetDate.includes(' ') ? targetDate.replace(' ', 'T') : targetDate;
    const update = () => setSeconds(Math.max(0, differenceInSeconds(parseISO(ds), new Date())));
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return seconds;
}

function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const seconds = useCountdownSeconds(targetDate);
  if (!targetDate) return null;

  const h   = Math.floor(seconds / 3600);
  const m   = Math.floor((seconds % 3600) / 60);
  const s   = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (seconds === 0) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3 text-red-500" />
        <span className="text-red-600 font-semibold">Promo Berakhir</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <Clock className="h-3 w-3 text-amber-500" />
      <span className="text-amber-600 font-semibold">
        Berakhir: {pad(h)}j {pad(m)}m {pad(s)}d
      </span>
    </div>
  );
}

// ── Enhanced Promo Card ───────────────────────────────────────
function PromoCard({ produk }: { produk: Produk }) {
  const seconds = useCountdownSeconds(produk.promo_selesai);
  const expired = produk.promo_selesai ? seconds === 0 : false;
  if (expired) return null; // auto-hide expired

  const diskon = produk.harga_promo ? getDiskonPersen(produk.harga_normal, produk.harga_promo) : 0;
  const hemat  = produk.harga_promo ? produk.harga_normal - produk.harga_promo : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Discount badge */}
      {diskon > 0 && (
        <div className="absolute top-2 right-2 z-10 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #E84E1B, #C0330D)' }}>
          -{diskon}%
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={produk.foto_urls?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'}
          alt={produk.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{produk.kategori_nama}</span>
          <span className="text-xs text-orange-600 font-medium">{produk.merek}</span>
        </div>

        <Link to={`/katalog/${produk.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-orange-700 transition-colors">
            {produk.nama}
          </h3>
        </Link>

        {/* Countdown timer */}
        <CountdownTimer targetDate={produk.promo_selesai} />

        {/* Pricing */}
        <div className="mt-auto space-y-0.5">
          {produk.harga_promo ? (
            <>
              <p className="text-xs text-gray-400 line-through">{formatRupiah(produk.harga_normal)}</p>
              <p className="text-lg font-black text-tkn-orange">{formatRupiah(produk.harga_promo)}</p>
              {hemat > 0 && (
                <p className="text-xs font-semibold" style={{ color: '#1B3A6B' }}>
                  💰 Hemat {formatRupiah(hemat)}
                </p>
              )}
            </>
          ) : (
            <p className="text-base font-bold text-gray-900">{formatRupiah(produk.harga_normal)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type SortKey = 'diskon' | 'harga_asc' | 'harga_desc' | 'terbaru';

export default function PromoPage() {
  const [produkPromo, setProdukPromo] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('semua');
  const [sort, setSort] = useState<SortKey>('diskon');

  useEffect(() => {
    produkApi.getPromo().then(data => {
      setProdukPromo(data);
      setLoading(false);
    });
  }, []);

  // Unique categories from promo products
  const kategoriOptions = useMemo(() => {
    const map = new Map<number, string>();
    produkPromo.forEach(p => { if (!map.has(p.kategori_id)) map.set(p.kategori_id, p.kategori_nama); });
    return Array.from(map.entries());
  }, [produkPromo]);

  const maxDiskon = produkPromo.length > 0
    ? Math.max(...produkPromo.map(p => p.is_promo && p.harga_promo ? getDiskonPersen(p.harga_normal, p.harga_promo) : 0))
    : 0;

  const filtered = useMemo(() => {
    const list = filterKategori === 'semua'
      ? [...produkPromo]
      : produkPromo.filter(p => String(p.kategori_id) === filterKategori);

    switch (sort) {
      case 'diskon':
        list.sort((a, b) => {
          const da = a.harga_promo ? getDiskonPersen(a.harga_normal, a.harga_promo) : 0;
          const db = b.harga_promo ? getDiskonPersen(b.harga_normal, b.harga_promo) : 0;
          return db - da;
        });
        break;
      case 'harga_asc':
        list.sort((a, b) => (a.harga_promo ?? a.harga_normal) - (b.harga_promo ?? b.harga_normal));
        break;
      case 'harga_desc':
        list.sort((a, b) => (b.harga_promo ?? b.harga_normal) - (a.harga_promo ?? a.harga_normal));
        break;
      case 'terbaru':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return list;
  }, [produkPromo, filterKategori, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Banner ───────────────────────────────────── */}
      <div className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #0C1730 0%, #1B3A6B 30%, #E84E1B 70%, #F5A623 100%)' }}>
        {/* Decorative radial glows */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(27,58,107,0.3) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              {/* Animated badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-1.5 mb-4">
                <span className="animate-bounce">🔥</span>
                <span className="text-sm font-semibold text-white">Limited Time</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                Promo Spesial TKN
              </h1>
              <p className="text-orange-200 mt-2 text-lg">Penawaran terbaik pilihan tim kami</p>
              <div className="flex items-center gap-2 mt-3">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-sm text-white/80">Stok &amp; waktu terbatas — jangan sampai kehabisan!</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-sm border border-orange-400/25 rounded-2xl px-5 py-4 text-center">
                <p className="text-3xl font-black">{produkPromo.length}</p>
                <p className="text-orange-200 text-xs mt-1">Promo Aktif</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-orange-400/25 rounded-2xl px-5 py-4 text-center">
                <p className="text-3xl font-black">{maxDiskon}%</p>
                <p className="text-orange-200 text-xs mt-1">Diskon Maks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Filter & Sort Bar ──────────────────────────────── */}
        {!loading && produkPromo.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Kategori:</span>
            </div>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger id="promo-filter-kategori" className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                {kategoriOptions.map(([id, nama]) => (
                  <SelectItem key={id} value={String(id)}>{nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
              <ArrowUpDown className="h-4 w-4" />
              <span>Urutkan:</span>
            </div>
            <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
              <SelectTrigger id="promo-sort" className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diskon">Diskon Terbesar</SelectItem>
                <SelectItem value="harga_asc">Harga Terendah</SelectItem>
                <SelectItem value="harga_desc">Harga Tertinggi</SelectItem>
                <SelectItem value="terbaru">Terbaru</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-gray-400">{filtered.length} produk</span>
          </div>
        )}

        {/* ── Section Header ─────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Layanan Sedang Promo</h2>
        </div>

        {/* ── Loading ────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : produkPromo.length === 0 ? (
          /* ── Empty State ─────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center shadow-sm">
            <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-orange-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Belum ada promo aktif saat ini</h3>
            <p className="text-gray-400 text-sm mb-6">Pantau terus halaman ini untuk penawaran terbaru!</p>
            <Link to="/katalog">
              <Button variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                <Tag className="h-4 w-4" />
                Lihat Semua Katalog
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
            <p className="text-gray-500">Tidak ada promo untuk kategori ini</p>
            <Button variant="ghost" size="sm" className="mt-2 text-orange-600" onClick={() => setFilterKategori('semua')}>
              Tampilkan Semua
            </Button>
          </div>
        ) : (
          /* ── Product Grid ──────────────────────────────────── */
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <PromoCard key={p.id} produk={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
