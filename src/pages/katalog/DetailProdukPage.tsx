// DetailProdukPage — halaman Detail Layanan dengan gallery dan spesifikasi
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ArrowLeftRight, Package, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { produkApi } from '@/lib/api';
import type { Produk } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function getStokColor(stok: number) {
  if (stok === 0) return 'text-red-600 bg-red-50';
  if (stok <= 5) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

export default function DetailProdukPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [serupa, setSerupa] = useState<Produk[]>([]);
  const { addItem } = useCart();
  const { addToCompare, removeFromCompare, isInCompare, canAdd } = useCompare();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    produkApi.getById(Number(id)).then(async p => {
      if (!p) { navigate('/katalog'); return; }
      setProduk(p);
      setLoading(false);
      // Produk serupa (sama kategori, beda id)
      const all = await produkApi.getAll();
      setSerupa(all.filter(x => x.kategori_id === p.kategori_id && x.id !== p.id).slice(0, 3));
    });
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    </div>
  );

  if (!produk) return null;

  const inCompare = isInCompare(produk.id);
  const habis = produk.stok === 0;
  const diskonPersen = produk.is_promo && produk.harga_promo
    ? Math.round((1 - produk.harga_promo / produk.harga_normal) * 100)
    : 0;

  const sisaHariPromo = produk.promo_selesai
    ? differenceInDays(parseISO(produk.promo_selesai), new Date())
    : null;

  const handleAddCart = () => {
    if (habis) return;
    addItem(produk, qty);
    toast.success(`${qty}x ${produk.nama} ditambahkan ke pesanan`);
  };

  const handleCompare = () => {
    if (inCompare) {
      removeFromCompare(produk.id);
      toast.info('Dihapus dari perbandingan');
    } else if (!canAdd) {
      toast.warning('Maksimal 4 produk untuk dibandingkan');
    } else {
      addToCompare(produk);
      toast.success('Ditambahkan ke perbandingan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/katalog" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Katalog
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{produk.nama}</span>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Gallery ──────────────────────────────────── */}
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <img
                src={produk.foto_urls?.[activePhoto] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'; }}
                alt={produk.nama}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {produk.foto_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-1 aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                    activePhoto === i ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'; }} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Info ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">{produk.kategori_nama}</Badge>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">SKU: {produk.sku}</span>
              {produk.is_promo && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 gap-1">
                  <Tag className="h-3 w-3" /> PROMO {diskonPersen}%
                </Badge>
              )}
            </div>

            {/* Nama & Merek */}
            <div>
              <p className="text-sm text-indigo-600 font-medium">{produk.merek}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{produk.nama}</h1>
            </div>

            {/* Harga */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1 border border-gray-200">
              {produk.is_promo && produk.harga_promo ? (
                <>
                  <p className="text-sm text-gray-400 line-through">{formatRupiah(produk.harga_normal)}</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatRupiah(produk.harga_promo)}</p>
                  {produk.promo_selesai && sisaHariPromo !== null && (
                    <p className="text-xs text-amber-600">
                      ⏱ Promo berakhir {format(parseISO(produk.promo_selesai), 'd MMMM yyyy', { locale: idLocale })}
                      {sisaHariPromo > 0 ? ` (${sisaHariPromo} hari lagi)` : ' (Hari ini!)'}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{formatRupiah(produk.harga_normal)}</p>
              )}
            </div>

            {/* Stok */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStokColor(produk.stok)}`}>
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">
                {habis ? 'Stok habis' : `Stok tersedia: ${produk.stok} unit`}
              </span>
            </div>

            {/* Qty + Actions */}
            {!habis && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                  >-</button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(produk.stok, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                  >+</button>
                </div>
                <p className="text-xs text-gray-500">Maks. {produk.stok} unit</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAddCart}
                disabled={habis}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2 h-11"
              >
                <ShoppingCart className="h-4 w-4" />
                {habis ? 'Stok Habis' : 'Tambah ke Pesanan'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCompare}
                className={`gap-2 h-11 ${inCompare ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : ''}`}
              >
                <ArrowLeftRight className="h-4 w-4" />
                {inCompare ? 'Dibandingkan' : 'Bandingkan'}
              </Button>
            </div>

            {/* Periode promo */}
            {produk.is_promo && produk.promo_mulai && produk.promo_selesai && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Tag className="h-3 w-3 text-emerald-500" />
                Periode promo: {format(parseISO(produk.promo_mulai), 'd MMM yyyy', { locale: idLocale })} –{' '}
                {format(parseISO(produk.promo_selesai), 'd MMM yyyy', { locale: idLocale })}
              </p>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Produk</h2>
          <div className={`text-gray-600 text-sm leading-relaxed overflow-hidden transition-all ${descExpanded ? '' : 'max-h-24'}`}>
            <p>{produk.deskripsi}</p>
          </div>
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="flex items-center gap-1 text-indigo-600 text-sm font-medium mt-2 hover:underline"
          >
            {descExpanded ? <><ChevronUp className="h-4 w-4" /> Sembunyikan</> : <><ChevronDown className="h-4 w-4" /> Selengkapnya</>}
          </button>
        </div>

        {/* Spesifikasi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spesifikasi Teknis</h2>
          <div className="divide-y divide-gray-100">
            {produk.spesifikasi.map((s, i) => (
              <div key={i} className="grid grid-cols-2 py-2.5 gap-4">
                <span className="text-sm text-gray-500">{s.key}</span>
                <span className="text-sm text-gray-900 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Produk Serupa */}
        {serupa.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Produk Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {serupa.map(p => <ProductCard key={p.id} produk={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
