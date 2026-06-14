// ProductCard — kartu produk untuk grid katalog
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeftRight, Eye, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Produk } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';

interface Props {
  produk: Produk;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function getDiskonPersen(normal: number, promo: number) {
  return Math.round((1 - promo / normal) * 100);
}

function getStokColor(stok: number) {
  if (stok === 0) return 'text-red-600';
  if (stok <= 5) return 'text-amber-600';
  return 'text-tkn-navy';
}

export default function ProductCard({ produk }: Props) {
  const { addItem, isInCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare, canAdd } = useCompare();
  const inCart = isInCart(produk.id);
  const inCompare = isInCompare(produk.id);
  const habis = produk.stok === 0;

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (habis) return;
    addItem(produk, 1);
    toast.success(`${produk.nama} ditambahkan ke pesanan`, { duration: 2000 });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(produk.id);
      toast.info(`${produk.nama} dihapus dari perbandingan`);
    } else if (!canAdd) {
      toast.warning('Maksimal 4 produk untuk dibandingkan');
    } else {
      addToCompare(produk);
      toast.success(`${produk.nama} ditambahkan ke perbandingan`);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* ── Foto ─────────────────────────────────────────── */}
      <Link to={`/katalog/${produk.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={produk.foto_urls?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'}
          alt={produk.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80';
          }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {produk.is_promo && !habis && (
            <Badge className="text-white text-xs font-black px-2.5 py-0.5 shadow-lg border-none" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}>
              PROMO {getDiskonPersen(produk.harga_normal, produk.harga_promo!)}%
            </Badge>
          )}
          {habis && (
            <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 shadow">HABIS</Badge>
          )}
        </div>
        {/* Compare toggle */}
        <button
          onClick={handleCompare}
          className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-all shadow ${
            inCompare
              ? 'bg-orange-600 text-white'
              : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-orange-50'
          }`}
          title={inCompare ? 'Hapus dari perbandingan' : 'Tambah ke perbandingan'}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
      </Link>

      {/* ── Info ─────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
        {/* Kategori + Merek */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{produk.kategori_nama}</span>
          <span className="text-xs text-orange-600 font-medium">{produk.merek}</span>
        </div>

        {/* Nama */}
        <Link to={`/katalog/${produk.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-orange-700 transition-colors">
            {produk.nama}
          </h3>
        </Link>

        {/* Harga */}
        <div className="mt-auto">
          {produk.is_promo && produk.harga_promo ? (
            <div>
              <p className="text-xs text-gray-400 line-through leading-none">{formatRupiah(produk.harga_normal)}</p>
              <p className="text-base font-bold text-tkn-orange">{formatRupiah(produk.harga_promo)}</p>
            </div>
          ) : (
            <p className="text-base font-bold text-gray-900">{formatRupiah(produk.harga_normal)}</p>
          )}
        </div>

        {/* Stok */}
        <div className="flex items-center gap-1.5">
          <Package className={`h-3.5 w-3.5 ${getStokColor(produk.stok)}`} />
          <span className={`text-xs font-medium ${getStokColor(produk.stok)}`}>
            {habis ? 'Stok habis' : `Stok: ${produk.stok}`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Link to={`/katalog/${produk.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" /> Detail
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleAddCart}
            disabled={habis}
            className={`flex-1 gap-1.5 text-xs font-semibold text-white border-none transition-all ${
              inCart
                ? 'bg-tkn-navy hover:opacity-90'
                : ''
            }`}
            style={!inCart && !habis ? { background: 'linear-gradient(135deg, #F5A623, #F97316)' } : undefined}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {inCart ? 'Ditambah' : '+ Pesanan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
