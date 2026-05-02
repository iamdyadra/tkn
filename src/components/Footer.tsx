// Footer website TKN
import { Plane, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TKN</span>
            </div>
            <p className="text-sm opacity-80">
              PT. Travella Kreasi Nusantara — Your Travel Solution. Mitra perjalanan terpercaya sejak 2015.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Layanan</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/paket/tour" className="hover:opacity-100">Paket Tour</Link></li>
              <li><Link to="/paket/umroh" className="hover:opacity-100">Paket Umroh</Link></li>
              <li>Tiket Pesawat</li>
              <li>Reservasi Hotel</li>
            </ul>
          </div>

          {/* Link */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Perusahaan</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/#tentang" className="hover:opacity-100">Tentang Kami</Link></li>
              <li><Link to="/#kontak" className="hover:opacity-100">Kontak</Link></li>
              <li>Kebijakan Privasi</li>
              <li>Syarat & Ketentuan</li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                Jl. Jombang Raya No. 35C, Tangerang Selatan
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                (021) 3529 6792
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                info@travellakreasi.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-sm opacity-60">
          © {new Date().getFullYear()} PT. Travella Kreasi Nusantara. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
