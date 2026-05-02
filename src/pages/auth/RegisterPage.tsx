// RegisterPage — pendaftaran akun sales baru
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Map, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  konfirmasi: z.string(),
  telepon: z.string().min(10, 'Nomor telepon tidak valid'),
  wilayah: z.string().min(2, 'Wilayah tidak boleh kosong'),
}).refine(d => d.password === d.konfirmasi, {
  message: 'Konfirmasi password tidak cocok',
  path: ['konfirmasi'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
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
    const ok = await authRegister({ nama: data.nama, email: data.email, password: data.password, telepon: data.telepon, wilayah: data.wilayah });
    setLoading(false);
    if (!ok) {
      setError('Email sudah terdaftar. Gunakan email lain.');
      return;
    }
    navigate('/katalog', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-3">
              <Map className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Daftar Akun TKN</h1>
            <p className="text-indigo-200 text-sm mt-0.5">TKN Travel — E-Catalogue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" placeholder="Nama lengkap" {...register('nama')} className={errors.nama ? 'border-red-400' : ''} />
                {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@domain.com" {...register('email')} className={errors.email ? 'border-red-400' : ''} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pr-9 ${errors.password ? 'border-red-400' : ''}`}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="konfirmasi">Konfirmasi</Label>
                <Input id="konfirmasi" type="password" placeholder="••••••••" {...register('konfirmasi')} className={errors.konfirmasi ? 'border-red-400' : ''} />
                {errors.konfirmasi && <p className="text-xs text-red-500">{errors.konfirmasi.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="telepon">No. Telepon</Label>
                <Input id="telepon" placeholder="08xxxxxxxxxx" {...register('telepon')} className={errors.telepon ? 'border-red-400' : ''} />
                {errors.telepon && <p className="text-xs text-red-500">{errors.telepon.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="wilayah">Wilayah Sales</Label>
                <Input id="wilayah" placeholder="Jabodetabek" {...register('wilayah')} className={errors.wilayah ? 'border-red-400' : ''} />
                {errors.wilayah && <p className="text-xs text-red-500">{errors.wilayah.message}</p>}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 h-10 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Mendaftar...
                </span>
              ) : (
                <><UserPlus className="h-4 w-4" /> Daftar Sekarang</>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
