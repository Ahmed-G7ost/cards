import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Waves, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, TrendingUp, Wifi } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const { login, auth, authLoading } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <div className="text-sm text-slate-500 font-semibold">جاري التحقق من الجلسة...</div>
        </div>
      </div>
    );
  }

  if (auth) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast.success('مرحباً بك، تم تسجيل الدخول بنجاح');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between w-[52%] p-12 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.12) 0, transparent 45%)',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">لايف نت</div>
              <div className="text-xs opacity-80">Live Net · إدارة مبيعات الفروخ</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl xl:text-5xl font-black leading-tight">
            نظام ذكي لإدارة
            <br />
            <span className="text-white/90">مبيعات شبكتك</span>
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-md">
            تابع ديون الموزعين، طبعات الفروخ والأرباح اليومية من مكان واحد، بواجهة عربية سريعة وأنيقة.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: TrendingUp, label: 'تتبع الأرباح' },
              { icon: ShieldCheck, label: 'حماية البيانات' },
              { icon: Wifi, label: 'مزامنة فورية' },
            ].map(({ icon: I, label }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10">
                <I className="w-5 h-5 mb-2" />
                <div className="text-sm font-bold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-80 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> الإصدار 2.0 · تجربة محسّنة
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#f6f7fb]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg">لايف نت</div>
              <div className="text-xs text-slate-500">Live Net Management</div>
            </div>
          </div>

          <div className="card-soft p-8 animate-fade-up">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">مرحباً بعودتك</h1>
              <p className="text-slate-500 text-sm mt-1">سجّل دخولك للوصول إلى لوحة التحكم الخاصة بشبكتك</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 h-11 rounded-xl bg-slate-50 border-slate-200"
                    placeholder="admin@livenet.ps"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-bold">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 h-11 rounded-xl bg-slate-50 border-slate-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    style={{ transition: 'color .2s' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" defaultChecked className="accent-indigo-600" />
                  تذكّرني
                </label>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 font-bold" style={{ transition: 'color .2s' }}>نسيت كلمة المرور؟</a>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
                {loading ? 'جارٍ التحقق...' : 'دخول للنظام'}
              </Button>

              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
                استخدم بيانات الحساب المُنشأ في <span className="font-bold text-slate-700">Firebase Authentication</span> للمشروع.
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            © {new Date().getFullYear()} لايف نت · كل الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
