import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { OfflineProvider } from '@/contexts/OfflineContext';

// Route Guards
import { ProtectedRoute, AdminRoute, SalesRoute } from '@/components/ProtectedRoute';

// Layouts
import AdminLayout from '@/components/AdminLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Sales Pages
import KatalogPage from '@/pages/katalog/KatalogPage';
import DetailProdukPage from '@/pages/katalog/DetailProdukPage';
import BandingkanPage from '@/pages/katalog/BandingkanPage';
import BuatPesananPage from '@/pages/pesanan/BuatPesananPage';
import RiwayatPesananPage from '@/pages/pesanan/RiwayatPesananPage';
import DetailPesananPage from '@/pages/pesanan/DetailPesananPage';
import PromoPage from '@/pages/promo/PromoPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProdukPage from '@/pages/admin/AdminProdukPage';
import AdminKategoriPage from '@/pages/admin/AdminKategoriPage';
import AdminPesananPage from '@/pages/admin/AdminPesananPage';
import AdminSalesPage from '@/pages/admin/AdminSalesPage';
import AdminLaporanPage from '@/pages/admin/AdminLaporanPage';
import HomePage from '@/pages/HomePage';

import NotFound from '@/pages/NotFound';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <OfflineProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner richColors position="top-right" />
              <BrowserRouter basename="/tkn">
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<HomePage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Sales Routes */}
                  <Route path="/katalog" element={<SalesRoute><KatalogPage /></SalesRoute>} />
                  <Route path="/katalog/:id" element={<SalesRoute><DetailProdukPage /></SalesRoute>} />
                  <Route path="/bandingkan" element={<SalesRoute><BandingkanPage /></SalesRoute>} />
                  <Route path="/pesanan/buat" element={<SalesRoute><BuatPesananPage /></SalesRoute>} />
                  <Route path="/pesanan/riwayat" element={<SalesRoute><RiwayatPesananPage /></SalesRoute>} />
                  <Route path="/pesanan/:kode" element={<SalesRoute><DetailPesananPage /></SalesRoute>} />
                  <Route path="/promo" element={<SalesRoute><PromoPage /></SalesRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="produk" element={<AdminProdukPage />} />
                    <Route path="kategori" element={<AdminKategoriPage />} />
                    <Route path="pesanan" element={<AdminPesananPage />} />
                    <Route path="sales" element={<AdminSalesPage />} />
                    <Route path="laporan" element={<AdminLaporanPage />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OfflineProvider>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
