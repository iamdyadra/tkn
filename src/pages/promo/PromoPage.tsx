// PromoPage — halaman Promo Layanan dengan countdown timer
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { produkApi } from '@/lib/api';
import type { Produk } from '@/types';
import { Tag, Clock, Sparkles } from 'lucide-react';
import { format, differenceInSeconds, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function useCountdown(targetDate?: string) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!targetDate) return;
    
    // Normalize targetDate: ensure it handles space or T, and ensure it ends with a time
    let dateStr = targetDate;
    if (!dateStr.includes('T') && !dateStr.includes(' ')) {
      dateStr += 'T23:59:59';
    } else if (dateStr.includes(' ')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    const target = parseISO(dateStr);
    const update = () => {
      const diff = differenceInSeconds(target, new Date());
      setSeconds(Math.max(0, diff));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, secs, expired: seconds === 0 && !!targetDate };
}

function CountdownBadge({ targetDate }: { targetDate?: string }) {
  const { days, hours, minutes, secs, expired } = useCountdown(targetDate);
  if (!targetDate || expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Clock className="h-3.5 w-3.5 text-amber-500" />
      <span className="text-amber-600 font-medium">
        Berakhir dalam{' '}
        {days > 0 && `${days}h `}
        {pad(hours)}:{pad(minutes)}:{pad(secs)}
      </span>
    </div>
  );
}

export default function PromoPage() {
  const [produkPromo, setProdukPromo] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    produkApi.getPromo().then(data => {
      setProdukPromo(data);
      setLoading(false);
    });
  }, []);

  // Produk dengan promo paling dekat berakhir (untuk highlight di banner)
  const featured = produkPromo.length > 0 
    ? [...produkPromo].sort((a, b) => (a.promo_selesai ?? '9999') < (b.promo_selesai ?? '9999') ? -1 : 1)[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <Badge className="bg-white/20 text-white border-white/30">Promo Terbatas</Badge>
              </div>
              <h1 className="text-3xl font-bold">Penawaran Spesial</h1>
              <p className="text-emerald-100 mt-1">Dapatkan harga terbaik sebelum kehabisan!</p>
              {featured?.promo_selesai && (
                <p className="text-emerald-200 text-sm mt-2">
                  Promo berlaku hingga {format(parseISO(featured.promo_selesai), 'd MMMM yyyy', { locale: idLocale })}
                </p>
              )}
            </div>
            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold">{produkPromo.length}</p>
                <p className="text-emerald-100 text-sm">Promo Layanan</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold">
                  {Math.max(...produkPromo.map(p => p.is_promo && p.harga_promo
                    ? Math.round((1 - p.harga_promo / p.harga_normal) * 100)
                    : 0))}%
                </p>
                <p className="text-emerald-100 text-sm">Diskon Maks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Layanan Sedang Promo</h2>
          <span className="text-sm text-gray-500">({produkPromo.length} produk)</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : produkPromo.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada Promo Layanan saat ini</p>
          </div>
        ) : (
          <>
            {/* Per-promo groups dengan countdown */}
            {produkPromo.some(p => p.promo_selesai) && (
              <div className="space-y-8">
                {/* Group by promo deadline */}
                {[...new Set(produkPromo.map(p => p.promo_selesai ?? 'none'))].map(deadline => {
                  const group = produkPromo.filter(p => (p.promo_selesai ?? 'none') === deadline);
                  return (
                    <div key={deadline}>
                      {deadline !== 'none' && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <CountdownBadge targetDate={deadline} />
                          <span className="text-xs text-gray-400 ml-auto">
                            s/d {format(parseISO(deadline), 'd MMM yyyy', { locale: idLocale })}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.map(p => (
                          <div key={p.id} className="relative transition-transform hover:scale-[1.02]">
                            <ProductCard produk={p} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
