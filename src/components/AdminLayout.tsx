// AdminLayout — sidebar layout untuk halaman admin
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ClipboardList, Users,
  BarChart2, Menu, X, LogOut, ChevronRight, Map
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/produk', label: 'Produk', icon: Package },
  { to: '/admin/kategori', label: 'Kategori', icon: Tag },
  { to: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
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
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-indigo-700/40', collapsed && 'justify-center px-2')}>
        <div className="bg-white/20 rounded-lg p-1.5 flex-shrink-0">
          <Map className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">eCatalogue</p>
            <p className="text-indigo-300 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              isActive(to, exact)
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', isActive(to, exact) ? 'text-white' : 'text-indigo-300 group-hover:text-white')} />
            {!collapsed && label}
            {!collapsed && isActive(to, exact) && <ChevronRight className="ml-auto h-4 w-4 text-white/60" />}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className={cn('border-t border-indigo-700/40 p-3', collapsed && 'px-2')}>
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-white text-sm font-medium truncate">{user?.nama}</p>
            <p className="text-indigo-300 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn('w-full text-indigo-200 hover:text-white hover:bg-white/10', collapsed ? 'justify-center px-2' : 'justify-start gap-2')}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && 'Keluar'}
        </Button>
        {!collapsed && (
          <Link to="/katalog" className="block mt-1">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-indigo-200 hover:text-white hover:bg-white/10 text-xs">
              ← Ke Halaman Sales
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-indigo-700 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-indigo-700 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          {/* Mobile menu toggle */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          {/* Desktop collapse toggle */}
          <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>

          {/* Breadcrumb */}
          <div className="flex-1">
            <nav className="text-sm text-gray-500">
              <span>Admin</span>
              {location.pathname !== '/admin' && (
                <>
                  <span className="mx-1.5">/</span>
                  <span className="text-gray-900 font-medium capitalize">
                    {sidebarLinks.find(l => l.to !== '/admin' && location.pathname.startsWith(l.to))?.label ?? ''}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {user?.nama.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{user?.nama}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
