// Footer website TKN
import { Plane, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-white" style={{ background: 'linear-gradient(to bottom, #0C1730, #122248)' }}>
      {/* Sunset accent line */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #F5A623, #F97316, #E84E1B, #C2410C)' }} />

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}>
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">TKN</span>
            </div>
            <p className="text-sm text-blue-100/70 leading-relaxed">
              PT. Travella Kreasi Nusantara — Your Travel Solution. Mitra perjalanan terpercaya sejak 2015.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-orange-400">Layanan</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link to="/paket/tour" className="hover:text-orange-400 transition-colors">Paket Tour</Link></li>
              <li><Link to="/paket/umroh" className="hover:text-orange-400 transition-colors">Paket Umroh</Link></li>
              <li className="hover:text-orange-400 transition-colors cursor-default">Tiket Pesawat</li>
              <li className="hover:text-orange-400 transition-colors cursor-default">Reservasi Hotel</li>
            </ul>
          </div>

          {/* Link */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-orange-400">Perusahaan</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link to="/#tentang" className="hover:text-orange-400 transition-colors">Tentang Kami</Link></li>
              <li><Link to="/#kontak" className="hover:text-orange-400 transition-colors">Kontak</Link></li>
              <li className="cursor-default">Kebijakan Privasi</li>
              <li className="cursor-default">Syarat & Ketentuan</li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-orange-400">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-blue-100/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                Jl. Jombang Raya No. 35C, Tangerang Selatan
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-orange-400" />
                (021) 3529 6792
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-orange-400" />
                info@travellakreasi.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-sm text-blue-100/40" style={{ borderTop: '1px solid rgba(249,115,22,0.2)' }}>
          © {new Date().getFullYear()} PT. Travella Kreasi Nusantara. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
