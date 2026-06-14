import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import {
  Plane, Map, Tent, Building, Moon, Gift, Truck, Heart, Car, Megaphone,
  ArrowRight, CheckCircle2, Phone, Mail, MapPin, Clock, Users, Star, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const services = [
    { icon: Map,       title: 'TOUR',               desc: 'Paket liburan dan wisata domestik & internasional' },
    { icon: Plane,     title: 'FLIGHT',              desc: 'Tiket pesawat & kereta api wisatawan domestik & internasional' },
    { icon: Tent,      title: 'OUTBOUND',            desc: 'Outbound training serta fun games' },
    { icon: Building,  title: 'HOTELS',              desc: 'Reservasi & voucher hotel perjalanan wisata & dinas' },
    { icon: Megaphone, title: 'PROMOTION',           desc: 'PPOB, Pulsa Elektrik & Konsultasi Usaha Travel' },
    { icon: Moon,      title: 'UMROH',               desc: 'Pelayanan ibadah Umroh dan Haji Plus' },
    { icon: Gift,      title: 'MERCHANDISE',         desc: 'MERCHANT BOOK TKN Card Discount & merchandise' },
    { icon: Truck,     title: 'LOGISTICS / CARGO',   desc: 'Layanan logistik pengiriman paket Anda' },
    { icon: Heart,     title: 'WEDDING',             desc: 'Event Organizer untuk mewujudkan acara impian' },
    { icon: Car,       title: 'RENT CAR',            desc: 'Penyediaan armada transportasi darat' },
  ];

  const serviceDetails = [
    {
      icon: Clock,
      title: '24 HOUR RESERVATION',
      desc: 'Memberikan pelayanan untuk setiap permintaan pembelian tiket pesawat, kereta api, voucher hotel, umroh, dan haji plus dengan mudah, cepat dan praktis kapan saja. Karena Anda tidak perlu lagi ke counter tiket, dengan sistem yang kami miliki customer akan mendapatkan e-ticket sesuai bookingan yang didapat. Kami juga melayani paket wedding, logistik cargo untuk layanan pengiriman paket Anda.',
    },
    {
      icon: Map,
      title: 'TOUR PACKAGE',
      desc: 'Pelayanan paket tour wisata diberikan untuk menunjang kebutuhan Anda dalam melakukan perjalanan perusahaan, bisnis, liburan dan keperluan lainnya yang dapat dibooking dan dijadwalkan serta dilakukannya pembayaran secara langsung, sehingga mempermudah customer dalam melakukan perjalanan wisata tanpa perlu lagi memikirkan jadwal perjalanan, biaya, transportasi.',
    },
    {
      icon: Briefcase,
      title: 'TRAVEL KONSULTAN & PPOB',
      desc: 'Perusahaan menyediakan konsultasi bagi Anda yang ingin membuka usaha tour & travel dengan memberikan pelayanan terbaik hingga sampai proses launching usaha. Pelayanan PPOB, Pulsa Elektrik, diberikan kepada Anda yang ingin melakukan pembayaran tagihan PLN, Telkom, PDAM, Kartu Prabayar, dll. Secara mudah, cepat dan praktis.',
    },
    {
      icon: Gift,
      title: 'DISCOUNT CARD',
      desc: 'Kami mempunyai produk unggulan yaitu MERCHANT BOOK TKN Card Discount, kartu pintar dapat digunakan sebagai kartu diskon saat Anda mengunjungi tempat wisata, hotel dsb. Di tempat-tempat tertentu yang sudah bekerja sama dengan kami.',
    },
    {
      icon: Heart,
      title: 'WEDDING & EVENT ORGANIZER',
      desc: 'Kami juga hadir untuk mewujudkan acara yang penuh kenangan, dari pernikahan impian hingga perayaan momen berharga lainnya. Dengan tim yang berpengalaman dan penuh kreativitas, kami siap merancang setiap detail agar acara Anda berjalan lancar, indah, berkesan, dan memuaskan.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO / COVER DEPAN ──────────────────────────────────── */}
      <section className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(160deg, #0C1730 0%, #1B3A6B 25%, #C2410C 65%, #F97316 85%, #F5A623 100%)' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80"
            alt="TKN Travel Agency"
            className="w-full h-full object-cover opacity-10 mix-blend-overlay"
          />
          {/* Sunset radial glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 80%, rgba(249,115,22,0.35) 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(27,58,107,0.4) 0%, transparent 50%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-1.5 text-sm text-orange-200 mb-8">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            COMPANY PROFILE PT. TRAVELLA KREASI NUSANTARA
          </div>

          <p className="text-xl md:text-2xl text-orange-300 mb-2 font-medium tracking-widest uppercase">
            TKN TRAVEL AGENCY
          </p>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
            PT. TRAVELLA{' '}
            <span style={{ background: 'linear-gradient(90deg, #F5A623, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              KREASI NUSANTARA
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-4 font-bold italic tracking-wide">
            "YOUR TRAVEL SOLUTION"
          </p>

          <p className="text-sm text-orange-300/90 mb-10">
            <Mail className="inline h-3.5 w-3.5 mr-1" />
            Travellakreasinusantara@gmail.com
          </p>

          {/* Layanan list */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12 max-w-4xl mx-auto">
            {['TOUR', 'FLIGHT', 'OUTBOUND', 'HOTELS', 'PROMOTION', 'UMROH', 'MERCHANDISE', 'LOGISTICS / CARGO', 'WEDDING', 'RENT CAR'].map((label) => (
              <span key={label} className="text-xs font-bold tracking-widest text-white/90 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
                {label}
              </span>
            ))}
          </div>

          <Link to="/katalog">
            <Button
              size="lg"
              className="text-white border-none rounded-full px-10 text-base font-bold shadow-lg transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F5A623, #F97316, #E84E1B)', boxShadow: '0 8px 32px rgba(249,115,22,0.45)' }}
            >
              Lihat Layanan Kami
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 50 800 60 720 30C640 0 240 50 0 0L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── ABOUT US ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-widest">Tentang Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6 tracking-tight">ABOUT US</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full mb-6" />

            <div className="flex items-start gap-2 text-sm text-gray-500 justify-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span className="text-left">
                Jl. Jombang Raya No. 35 C, Kel. Pondok Pucung, Kec. Pondok Aren,<br className="hidden sm:block" />
                Tangerang Selatan - Banten 15229
              </span>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed text-base text-justify">
              <p>
                <strong>TRAVELLA KREASI NUSANTARA</strong> berlokasi di kawasan perkantoran yang strategis dan mudah dijangkau di Jl. Jombang Raya No. 35 C, Kel. Pondok Pucung, Kec. Pondok Aren, Tangerang Selatan - Banten 15229
              </p>
              <p>
                Kami menjadi salah satu agen perjalanan di Indonesia yang menawarkan solusi perjalanan terlengkap baik untuk liburan pribadi maupun perjalanan bisnis Anda.
              </p>
              <p>
                Mencakup penyediaan jasa tiket untuk wisatawan domestik dan internasional di seluruh Indonesia, pengorganisasian paket tour domestik dan Internasional, reservasi hotel perjalanan wisata, perjalanan dinas, penyediaan transportasi, pemesanan hotel, program perjalanan insentif untuk perusahaan atau kelompok, outbound training serta fun games dan juga kami melayani paket umroh, paket wedding, logistik cargo untuk layanan pengiriman paket Anda.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Visi — Navy Blue (support / trust) */}
            <div
              className="p-8 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #122248 100%)' }}
            >
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}
                >
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">VISI</h3>
                <p className="text-lg font-bold text-orange-400 mb-3 tracking-wide">"YOUR TRAVEL SOLUTION"</p>
                <p className="text-orange-100/80 italic">
                  TRAVELLA KREASI NUSANTARA berkomitmen pada kepuasan pelanggan untuk mendapatkan pelayanan terbaik.
                </p>
              </div>
            </div>

            {/* Misi — Sunset Orange (dominant) */}
            <div
              className="p-8 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 50%, #FDBA74 100%)' }}
            >
              {/* Decorative */}
              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)', transform: 'translate(20%, 20%)' }} />
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #F97316, #E84E1B)' }}
                >
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">MISI</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Menjadi partner Anda dalam menemukan solusi untuk perjalanan Anda.
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Melayani dengan sepenuh hati dan memberikan penawaran dengan harga dan kualitas terbaik.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE DETAIL ────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'linear-gradient(to bottom, #FFF7ED, #FFFAF5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold text-xs uppercase tracking-widest bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">Keunggulan Layanan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">SERVICE</h2>
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #F5A623, #F97316, #E84E1B)' }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. 24 HR */}
            <div className="bg-white rounded-2xl p-7 border border-orange-100 shadow-sm hover:shadow-sunset transition-all duration-300 h-full group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)' }}>
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">24 HOUR RESERVATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Memberikan pelayanan untuk setiap permintaan pembelian tiket pesawat, kereta api, voucher hotel, umroh, dan haji plus dengan mudah, cepat dan praktis kapan saja.
              </p>
            </div>

            {/* 2. Tour */}
            <div className="bg-white rounded-2xl p-7 border border-orange-100 shadow-sm hover:shadow-sunset transition-all duration-300 h-full group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #F97316, #E84E1B)' }}>
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">TOUR PACKAGE</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Pelayanan paket tour wisata diberikan untuk menunjang kebutuhan Anda dalam melakukan perjalanan perusahaan, bisnis, liburan dan keperluan lainnya.
              </p>
            </div>

            {/* 3. Konsultan */}
            <div className="bg-white rounded-2xl p-7 border border-orange-100 shadow-sm hover:shadow-sunset transition-all duration-300 h-full group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #1B3A6B, #122248)' }}>
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">TRAVEL KONSULTAN & PPOB</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Perusahaan menyediakan konsultasi bagi Anda yang ingin membuka usaha tour & travel. Juga tersedia layanan PPOB, Pulsa Elektrik untuk pembayaran tagihan PLN, Telkom, PDAM, dll.
              </p>
            </div>

            {/* 4. Discount */}
            <div className="bg-white rounded-2xl p-7 border border-orange-100 shadow-sm hover:shadow-sunset transition-all duration-300 h-full group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #E84E1B, #C0330D)' }}>
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">DISCOUNT CARD</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Kami mempunyai produk unggulan yaitu <strong>MERCHANT BOOK TKN Card Discount</strong>, kartu pintar dapat digunakan sebagai kartu diskon saat Anda mengunjungi tempat wisata, hotel dsb.
              </p>
            </div>

            {/* 5. Wedding */}
            <div
              className="rounded-2xl p-7 shadow-sm hover:shadow-sunset transition-all duration-300 h-full md:col-span-2 group hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', border: '1px solid #FDBA74' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #F97316, #E84E1B)' }}>
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">WEDDING & EVENT ORGANIZER</h3>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">
                Kami juga hadir untuk mewujudkan acara yang penuh kenangan, dari pernikahan impian hingga perayaan momen berharga lainnya. Dengan tim yang berpengalaman dan penuh kreativitas, kami siap merancang setiap detail agar acara Anda berjalan lancar, indah, berkesan, dan memuaskan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER / COVER BELAKANG ─────────────────────────────── */}
      <footer className="text-white pt-20 pb-10" style={{ background: 'linear-gradient(to bottom, #0C1730, #122248)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sunset accent bar */}
          <div className="h-1 rounded-full mb-16 mx-auto max-w-xs" style={{ background: 'linear-gradient(to right, #F5A623, #F97316, #E84E1B)' }} />

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 mb-16 px-6 py-10 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2.5 shadow-lg" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316, #E84E1B)' }}>
                  <Map className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1">TKN TRAVEL AGENCY</h2>
                  <p className="text-orange-400 text-sm font-semibold tracking-wide">PT. TRAVELLA KREASI NUSANTARA</p>
                </div>
              </div>
              <p className="text-blue-100/70 leading-relaxed text-sm max-w-md">
                Menjadi partner Anda dalam menemukan solusi untuk perjalanan Anda. Melayani dengan sepenuh hati dan memberikan penawaran dengan harga dan kualitas terbaik.
              </p>
              <div className="flex items-center gap-2 text-orange-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium tracking-wide">Travellakreasinusantara@gmail.com</span>
              </div>
            </div>

            {/* Kontak */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest" style={{ borderLeft: '4px solid #F97316', paddingLeft: '1rem' }}>KONTAK KAMI</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'rgba(249,115,22,0.15)' }}>
                    <MapPin className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-orange-300 mb-1 uppercase tracking-wider">OFFICE ADDRESS</p>
                    <p className="text-blue-100/70 leading-relaxed">
                      Jl Jombang Raya No 35 C Kel. Pd. Pucung<br />
                      Kec. Pd. Aren, Tangerang Selatan 15229
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'rgba(249,115,22,0.15)' }}>
                    <Phone className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-orange-300 mb-1 uppercase tracking-wider">CUSTOMER SERVICE</p>
                    <p className="text-2xl font-extrabold tracking-tighter" style={{ background: 'linear-gradient(135deg, #F5A623, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>(021) 3529 6792</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center" style={{ borderTop: '1px solid rgba(249,115,22,0.2)' }}>
            <p className="text-xs text-orange-400/60 tracking-widest uppercase mb-3">
              TOUR • FLIGHT • OUTBOUND • HOTELS • PROMOTION • UMROH • MERCHANDISE • LOGISTICS • WEDDING • RENT CAR
            </p>
            <p className="text-sm text-blue-100/40">
              &copy; {new Date().getFullYear()} PT. TRAVELLA KREASI NUSANTARA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
