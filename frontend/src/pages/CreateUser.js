import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Waves, Mail, Lock, Eye, EyeOff, User, ShieldCheck, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function CreateUser() {
  const { createUser, auth } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const res = await createUser(email.trim(), password, name.trim());
    setLoading(false);

    if (res.ok) {
      toast.success('تم إنشاء الحساب بنجاح ✅');
      setSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-8" dir="rtl">
      <div className="max-w-xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">إنشاء حساب جديد</h1>
              <p className="text-sm text-slate-500">هذه الصفحة للمسؤول فقط</p>
            </div>
          </div>

          {/* Admin info badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              تسجيل دخول حالي: <span className="font-bold">{auth?.email}</span> · أي حساب تنشئه سيتمكن من الدخول لهذا النظام.
            </span>
          </div>
        </div>

        {/* Form card */}
        <div className="card-soft p-8 animate-fade-up">

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm">تم إنشاء الحساب بنجاح! يمكن للمستخدم الآن تسجيل الدخول.</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300 font-bold">
                الاسم (اختياري)
              </Label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="displayName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pr-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  placeholder="اسم المستخدم الجديد"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="newEmail" className="text-slate-700 dark:text-slate-300 font-bold">
                البريد الإلكتروني <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="newEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  placeholder="user@livenet.ps"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300 font-bold">
                كلمة المرور <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="newPassword"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  style={{ transition: 'color .2s' }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">6 أحرف على الأقل</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-bold">
                تأكيد كلمة المرور <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={[
                    'pr-10 pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                    confirmPassword && password !== confirmPassword
                      ? 'border-rose-400 focus-visible:ring-rose-400'
                      : confirmPassword && password === confirmPassword
                      ? 'border-emerald-400 focus-visible:ring-emerald-400'
                      : '',
                  ].join(' ')}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  style={{ transition: 'color .2s' }}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-500 font-semibold">كلمتا المرور غير متطابقتين</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جاري الإنشاء...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  إنشاء الحساب
                </span>
              )}
            </Button>

            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-lg p-3 leading-relaxed">
              الحساب سيُنشأ في <span className="font-bold text-slate-700 dark:text-slate-300">Firebase Authentication</span> وسيتمكن المستخدم من الدخول للنظام فوراً.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
