// LoginPage — autentikasi dengan role-based redirect
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Map, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    const user = await login(data.email, data.password);
    setLoading(false);
    if (!user) {
      setError('Email atau password salah. Silakan coba lagi.');
      return;
    }
    navigate(user.role === 'admin' ? '/admin' : '/katalog', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #0C1730 0%, #1B3A6B 35%, #C2410C 75%, #F97316 100%)' }}>
      {/* Decorative radial glows */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 90%, rgba(249,115,22,0.25) 0%, transparent 60%)' }} />
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100/50 overflow-hidden">
          {/* Header — sunset gradient */}
          <div className="px-8 py-8 text-center" style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F97316 50%, #E84E1B 100%)' }}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <Map className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">TKN Travel</h1>
            <p className="text-orange-100 text-sm mt-1 font-medium">E-Catalogue &amp; Pemesanan</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Masuk ke Akun</h2>
              <p className="text-gray-500 text-sm mt-1">Masukkan email dan password Anda</p>
            </div>

            {error && (
              <Alert variant="destructive" className="py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className={errors.email ? 'border-red-400' : ''}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 h-11 font-bold text-white border-none transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #F5A623, #F97316, #E84E1B)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Memproses...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Masuk
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-orange-600 font-medium hover:underline">
                Daftar di sini
              </Link>
            </p>

            {/* Demo hint */}
            <div className="bg-orange-50 rounded-lg p-3 space-y-1.5 text-xs text-gray-600 border border-orange-100">
              <p className="font-semibold text-orange-700">Akun Demo:</p>
              <p><strong>Admin:</strong> admin@tkntravel.com / admin123</p>
              <p><strong>Sales:</strong> budi@tkntravel.com / sales123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
