// AdminLayout — sidebar layout untuk halaman admin
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ClipboardList, Users,
  BarChart2, Menu, X, LogOut, ChevronRight, Map, BadgeDollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/produk', label: 'Produk', icon: Package },
  { to: '/admin/kategori', label: 'Kategori', icon: Tag },
  { to: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
  { to: '/admin/komisi', label: 'Komisi', icon: BadgeDollarSign },
  { to: '/admin/sales', label: 'Tim Sales', icon: Users },
  { to: '/admin/laporan', label: 'Laporan', icon: BarChart2 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-tkn-navy/60 bg-tkn-navyDark/40',
        collapsed && 'justify-center px-2'
      )}>
        {/* Sunset logo badge */}
        <div className="bg-sunset rounded-xl p-1.5 flex-shrink-0 shadow-sm">
          <Map className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-extrabold text-white text-sm leading-none tracking-tight uppercase">TKN Travel</p>
            <p className="text-orange-400 text-xs mt-0.5 tracking-wider">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {sidebarLinks.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive(to, exact)
                ? 'bg-tkn-orange text-white shadow-md shadow-orange-900/30'
                : 'text-orange-100/80 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className={cn(
              'h-4.5 w-4.5 flex-shrink-0 transition-colors',
              isActive(to, exact) ? 'text-white' : 'text-orange-300 group-hover:text-white'
            )} />
            {!collapsed && label}
            {!collapsed && isActive(to, exact) && <ChevronRight className="ml-auto h-4 w-4 text-white/70" />}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className={cn('border-t border-tkn-navy/60 p-3 bg-tkn-navyDark/20', collapsed && 'px-2')}>
        {!collapsed && (
          <div className="mb-2 px-2 py-1.5 bg-white/5 rounded-lg">
            <p className="text-white text-sm font-semibold truncate">{user?.nama}</p>
            <p className="text-orange-300/80 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            'w-full text-orange-100 hover:text-white hover:bg-red-500/20 transition-colors',
            collapsed ? 'justify-center px-2' : 'justify-start gap-2'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && 'Keluar'}
        </Button>
        {!collapsed && (
          <Link to="/katalog" className="block mt-1">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-orange-300 hover:text-white hover:bg-white/10 text-xs">
              ← Ke Halaman Sales
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar — Navy Blue theme */}
      <aside className={cn(
        'hidden lg:flex flex-col transition-all duration-300 flex-shrink-0',
        'bg-navy-deep',
        /* inline gradient since Tailwind bg-image classes need full class names */
        collapsed ? 'w-16' : 'w-60'
      )}
        style={{ background: 'linear-gradient(to bottom, #0C1730, #1B3A6B)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-60 flex flex-col shadow-2xl"
            style={{ background: 'linear-gradient(to bottom, #0C1730, #1B3A6B)' }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header — white with sunset accent */}
        <header className="bg-white border-b border-orange-100 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
          {/* Mobile menu toggle */}
          <Button variant="ghost" size="sm" className="lg:hidden hover:bg-orange-50" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          {/* Desktop collapse toggle */}
          <Button variant="ghost" size="sm" className="hidden lg:flex hover:bg-orange-50" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>

          {/* Breadcrumb */}
          <div className="flex-1">
            <nav className="text-sm text-gray-500">
              <span className="text-orange-500 font-medium">Admin</span>
              {location.pathname !== '/admin' && (
                <>
                  <span className="mx-1.5 text-orange-300">/</span>
                  <span className="text-tkn-navyDark font-semibold capitalize">
                    {sidebarLinks.find(l => l.to !== '/admin' && location.pathname.startsWith(l.to))?.label ?? ''}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-2.5">
            <div className="bg-sunset text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.nama.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user?.nama}</p>
              <p className="text-xs text-orange-500 font-medium">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
