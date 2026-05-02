// Navbar — navigasi utama untuk halaman SALES
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, BarChart2, Tag, History, BookOpen,
  Menu, X, User, LogOut, ChevronDown, Wifi, WifiOff, ArrowLeftRight, Map
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
        <div className="bg-amber-500 text-white text-xs text-center py-1.5 px-4 flex items-center justify-center gap-2">
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
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 text-white rounded-lg p-1.5 group-hover:bg-indigo-700 transition-colors">
                <Map className="h-5 w-5" />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight uppercase">
                TKN <span className="text-indigo-600">Travel</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600">
                  <Wifi className="h-3.5 w-3.5" />
                  Online
                </span>
              )}

              {user ? (
                <>
                  {/* Compare button */}
                  {compareItems.length > 0 && (
                    <Link to="/bandingkan">
                      <Button variant="outline" size="sm" className="relative gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <ArrowLeftRight className="h-4 w-4" />
                        <span className="hidden sm:inline">Bandingkan</span>
                        <Badge className="bg-indigo-600 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                          {compareItems.length}
                        </Badge>
                      </Button>
                    </Link>
                  )}

                  {/* Cart button */}
                  <Link to="/pesanan/buat">
                    <Button variant="outline" size="sm" className="relative gap-1.5">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden sm:inline">Pesanan</span>
                      {totalItems > 0 && (
                        <Badge className="bg-emerald-500 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-gray-700">
                        <div className="bg-indigo-100 text-indigo-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                          {user?.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:inline text-sm font-medium max-w-24 truncate">{user?.nama}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <div className="px-3 py-2">
                        <p className="font-medium text-sm text-gray-900 truncate">{user?.nama}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-indigo-600 capitalize font-medium mt-0.5">{user?.role}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {user?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <BarChart2 className="h-4 w-4 mr-2" /> Dashboard Admin
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
                  <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Masuk
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive(to)
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
