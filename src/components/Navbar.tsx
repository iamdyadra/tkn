// Navbar — navigasi utama untuk halaman SALES
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, BarChart2, Tag, History, BookOpen,
  Menu, X, User, LogOut, ChevronDown, Wifi, WifiOff, ArrowLeftRight, Map, BadgeDollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const navLinks = [
  { to: '/katalog', label: 'Katalog', icon: BookOpen },
  { to: '/promo', label: 'Promo', icon: Tag },
  { to: '/pesanan/riwayat', label: 'Riwayat', icon: History },
  { to: '/komisi', label: 'Komisi Saya', icon: BadgeDollarSign },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: compareItems } = useCompare();
  const { isOnline, lastSynced } = useOffline();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* ── Offline Banner ─────────────────────────────────────── */}
      {!isOnline && (
        <div className="bg-tkn-deep text-white text-xs text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>
            Mode Offline — Data terakhir diperbarui:{' '}
            {lastSynced
              ? format(lastSynced, 'dd MMM yyyy, HH:mm', { locale: idLocale })
              : 'Belum pernah sinkron'}
          </span>
        </div>
      )}

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/96 backdrop-blur-md border-b border-orange-100 shadow-sm shadow-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-sunset text-white rounded-xl p-1.5 group-hover:shadow-sunset transition-all duration-300">
                <Map className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-tkn-navyDark text-base tracking-tight uppercase leading-tight">
                  TKN <span className="text-tkn-orange">Travel</span>
                </span>
                <span className="text-[10px] text-orange-500 font-medium tracking-widest uppercase leading-none">
                  Your Travel Solution
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            {user && (
              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(to)
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Online indicator */}
              {isOnline && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                  <Wifi className="h-3 w-3" />
                  Online
                </span>
              )}

              {user ? (
                <>
                  {/* Compare button */}
                  {compareItems.length > 0 && (
                    <Link to="/bandingkan">
                      <Button variant="outline" size="sm" className="relative gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400">
                        <ArrowLeftRight className="h-4 w-4" />
                        <span className="hidden sm:inline">Bandingkan</span>
                        <Badge className="bg-tkn-orange text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                          {compareItems.length}
                        </Badge>
                      </Button>
                    </Link>
                  )}

                  {/* Cart button */}
                  <Link to="/pesanan/buat">
                    <Button variant="outline" size="sm" className="relative gap-1.5 border-orange-200 hover:border-orange-400 hover:bg-orange-50">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden sm:inline">Pesanan</span>
                      {totalItems > 0 && (
                        <Badge className="bg-tkn-navy text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-gray-700 hover:bg-orange-50">
                        <div className="bg-sunset text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm">
                          {user?.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:inline text-sm font-medium max-w-24 truncate">{user?.nama}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 border-orange-100">
                      <div className="px-3 py-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-t-md">
                        <p className="font-semibold text-sm text-gray-900 truncate">{user?.nama}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-orange-600 capitalize font-bold mt-0.5 uppercase tracking-wider">{user?.role}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {user?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer text-tkn-navy font-medium">
                            <BarChart2 className="h-4 w-4 mr-2 text-tkn-orange" /> Dashboard Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" /> Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="bg-sunset hover:shadow-sunset text-white border-none transition-all duration-300">
                    Masuk
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-orange-50"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-orange-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive(to)
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-sunset hover:shadow-sunset transition-all"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
