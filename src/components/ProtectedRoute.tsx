// ProtectedRoute — guard untuk berbagai role
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; }

/** Redirect ke /login jika belum autentikasi */
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirect ke /admin jika bukan admin */
export function AdminRoute({ children }: Props) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/katalog" replace />;
  return <>{children}</>;
}

/** Redirect ke /login jika bukan sales atau admin */
export function SalesRoute({ children }: Props) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'sales' && role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
