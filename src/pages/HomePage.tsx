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
      <section className="relative bg-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80"
            alt="TKN Travel Agency"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 via-indigo-900/60 to-indigo-900/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-8">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            COMPANY PROFILE PT. TRAVELLA KREASI NUSANTARA
          </div>

          <p className="text-xl md:text-2xl text-indigo-200 mb-2 font-medium tracking-widest uppercase">
            TKN TRAVEL AGENCY
          </p>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
            PT. TRAVELLA <span className="text-indigo-300">KREASI NUSANTARA</span>
          </h1>

          <p className="text-xl md:text-2xl text-white mb-4 font-bold italic">
            "YOUR TRAVEL SOLUTION"
          </p>

          <p className="text-sm text-indigo-300 mb-10">
            <Mail className="inline h-3.5 w-3.5 mr-1" />
            Travellakreasinusantara@gmail.com
          </p>

          {/* Layanan list from doc */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12 max-w-4xl mx-auto">
            {['TOUR', 'FLIGHT', 'OUTBOUND', 'HOTELS', 'PROMOTION', 'UMROH', 'MERCHANDISE', 'LOGISTICS / CARGO', 'WEDDING', 'RENT CAR'].map((label) => (
              <span key={label} className="text-xs font-bold tracking-widest text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                {label}
              </span>
            ))}
          </div>

          <Link to="/katalog">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-full px-10 text-base shadow-lg shadow-emerald-900/30">
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
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Tentang Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6 tracking-tight">ABOUT US</h2>
            <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full mb-6" />

            <div className="flex items-start gap-2 text-sm text-gray-500 justify-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
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
            {/* Visi */}
            <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">VISI</h3>
                <p className="text-lg font-bold text-indigo-600 mb-3 tracking-wide">"YOUR TRAVEL SOLUTION"</p>
                <p className="text-gray-600 italic">
                  TRAVELLA KREASI NUSANTARA berkomitmen pada kepuasan pelanggan untuk mendapatkan pelayanan terbaik.
                </p>
              </div>
            </div>

            {/* Misi */}
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">MISI</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-600">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                    </div>
                    Menjadi partner Anda dalam menemukan solusi untuk perjalanan Anda.
                  </li>
                  <li className="flex items-start gap-3 text-gray-600">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                    </div>
                    Melayani dengan sepenuh hati dan memberikan penawaran dengan harga dan kualitas terbaik.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE DETAIL (Exact as doc) ────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Keunggulan Layanan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">SERVICE</h2>
            <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. 24 HR */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">24 HOUR RESERVATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Memberikan pelayanan untuk setiap permintaan pembelian tiket pesawat, kereta api, voucher hotel, umroh, dan haji plus dengan mudah, cepat dan praktis kapan saja. Karena Anda tidak perlu lagi ke counter tiket, dengan sistem yang kami miliki customer akan mendapatkan e-ticket sesuai bookingan yang didapat. Kami juga melayani paket wedding, logistik cargo untuk layanan pengiriman paket Anda.
              </p>
            </div>

            {/* 2. Tour */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">TOUR PACKAGE</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Pelayanan paket tour wisata diberikan untuk menunjang kebutuhan Anda dalam melakukan perjalanan perusahaan, bisnis, liburan dan keperluan lainnya yang dapat dibooking dan dijadwalkan serta dilakukannya pembayaran secara langsung, sehingga mempermudah customer dalam melakukan perjalanan wisata tanpa perlu lagi memikirkan jadwal perjalanan, biaya, transportasi.
              </p>
            </div>

            {/* 3. Konsultan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full lg:col-span-1">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">TRAVEL KONSULTAN & PPOB</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify mb-4">
                Perusahaan menyediakan konsultasi bagi Anda yang ingin membuka usaha tour & travel dengan memberikan pelayanan terbaik hingga sampai proses launching usaha.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Pelayanan PPOB, Pulsa Elektrik, diberikan kepada Anda yang ingin melakukan pembayaran tagihan PLN, Telkom, PDAM, Kartu Prabayar, dll. Secara mudah, cepat dan praktis. Karena dilakukan pada sistem yang sudah terintegrasi langsung oleh provider.
              </p>
            </div>

            {/* 4. Discount */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">DISCOUNT CARD</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Kami mempunyai produk unggulan yaitu <strong>MERCHANT BOOK TKN Card Discount</strong>, kartu pintar dapat digunakan sebagai kartu diskon saat Anda mengunjungi tempat wisata, hotel dsb. Di tempat-tempat tertentu yang sudah bekerja sama dengan kami.
              </p>
            </div>

            {/* 5. Wedding */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">WEDDING & EVENT ORGANIZER</h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Kami juga hadir untuk mewujudkan acara yang penuh kenangan, dari pernikahan impian hingga perayaan momen berharga lainnya. Dengan tim yang berpengalaman dan penuh kreativitas, kami siap merancang setiap detail agar acara Anda berjalan lancar, indah, berkesan, dan memuaskan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER / COVER BELAKANG ─────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 mb-16 px-4 py-12 border border-gray-800 rounded-3xl bg-gray-800/20">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 rounded-xl p-2.5">
                  <Map className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">TKN TRAVEL AGENCY</h2>
                  <p className="text-indigo-400 text-sm font-medium">PT. TRAVELLA KREASI NUSANTARA</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm max-w-md">
                Menjadi partner Anda dalam menemukan solusi untuk perjalanan Anda. Melayani dengan sepenuh hati dan memberikan penawaran dengan harga dan kualitas terbaik.
              </p>
              <div className="pt-4 flex items-center gap-2 text-indigo-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium tracking-wide">Travellakreasinusantara@gmail.com</span>
              </div>
            </div>

            {/* Kontak */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-indigo-600 pl-4">KONTAK KAMI</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-gray-200 mb-1 uppercase tracking-wider">OFFICE ADDRESS</p>
                    <p className="text-gray-400 leading-relaxed">
                      Jl Jombang Raya No 35 C Kel. Pd. Pucung<br />
                      Kec. Pd. Aren, Tangerang Selatan 15229
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-gray-200 mb-1 uppercase tracking-wider">CUSTOMER SERVICE</p>
                    <p className="text-2xl font-bold text-indigo-400 tracking-tighter">(021) 3529 6792</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-600 tracking-widest uppercase mb-4">
              TOUR • FLIGHT • OUTBOUND • HOTELS • PROMOTION • UMROH • MERCHANDISE • LOGISTICS • WEDDING • RENT CAR
            </p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PT. TRAVELLA KREASI NUSANTARA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
