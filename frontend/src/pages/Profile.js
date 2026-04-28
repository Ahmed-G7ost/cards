import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { auth } from '../firebase';
import {
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  User2, Mail, Lock, ShieldCheck, KeyRound, CheckCircle2, Waves,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { auth: user, records, distributors } = useData();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPass, setEmailCurrentPass] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  // إحصائيات بسيطة
  const totalOps = records.length;
  const totalDist = distributors.length;

  async function handleUpdateName() {
    if (!displayName.trim()) {
      toast.error('يرجى إدخال الاسم');
      return;
    }
    setNameSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success('تم تحديث الاسم بنجاح');
    } catch (err) {
      toast.error('فشل التحديث: ' + (err?.message || ''));
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangeEmail() {
    if (!newEmail.trim() || !emailCurrentPass) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (newEmail.trim() === auth.currentUser.email) {
      toast.error('البريد الإلكتروني الجديد يطابق الحالي');
      return;
    }
    setEmailSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, emailCurrentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false,
      };
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim(), actionCodeSettings);
      toast.success('تم إرسال رابط التحقق إلى البريد الجديد، يرجى تأكيده لإتمام التغيير');
      setNewEmail('');
      setEmailCurrentPass('');
    } catch (err) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('كلمة المرور الحالية غير صحيحة');
      } else if (err?.code === 'auth/email-already-in-use') {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
      } else if (err?.code === 'auth/requires-recent-login') {
        toast.error('يرجى تسجيل الدخول مجدداً ثم المحاولة');
      } else if (err?.code === 'auth/unauthorized-continue-uri') {
        toast.error('يرجى إضافة رابط الموقع في Firebase Console ضمن Authorized Domains');
      } else {
        toast.error('فشل تحديث البريد: ' + (err?.message || ''));
      }
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPass || !newPass || !confirmPass) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (newPass.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setPassSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      toast.success('تم تغيير كلمة المرور بنجاح');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('كلمة المرور الحالية غير صحيحة');
      } else {
        toast.error('فشل تغيير كلمة المرور: ' + (err?.message || ''));
      }
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-up max-w-2xl">
      {/* بطاقة الملف الشخصي */}
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <User2 className="w-4 h-4" />
            </div>
            الملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* الأفاتار والمعلومات */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-lg truncate">
                {user?.name || 'مسؤول'}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user?.email || ''}</span>
              </div>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
                <ShieldCheck className="w-3 h-3 ml-1" /> مسؤول النظام
              </Badge>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <Waves className="w-4 h-4" />
                <span className="text-xs font-bold">Live Net</span>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 text-center">
              <div className="text-2xl font-black text-indigo-600 num-ar">{totalOps.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-bold mt-0.5">إجمالي العمليات</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 text-center">
              <div className="text-2xl font-black text-violet-600 num-ar">{totalDist.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-bold mt-0.5">عدد الموزعين</div>
            </div>
          </div>

          {/* تحديث الاسم */}
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              اسم العرض
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
                />
              </div>
              <Button
                onClick={handleUpdateName}
                disabled={nameSaving}
                className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {nameSaving ? '...' : <><CheckCircle2 className="w-4 h-4 ml-1.5" /> حفظ</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تغيير البريد الإلكتروني */}
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            تغيير البريد الإلكتروني
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              البريد الإلكتروني الحالي
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                value={user?.email || ''}
                disabled
                className="pr-10 h-11 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              البريد الإلكتروني الجديد
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني الجديد"
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              كلمة المرور للتأكيد
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={emailCurrentPass}
                onChange={(e) => setEmailCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <Button
            onClick={handleChangeEmail}
            disabled={emailSaving}
            className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
          >
            {emailSaving ? 'جاري الإرسال...' : <><CheckCircle2 className="w-4 h-4 ml-2" /> إرسال رابط التحقق</>}
          </Button>
          <p className="text-[11px] text-slate-400 text-center">سيتم إرسال رابط تحقق إلى البريد الجديد لإتمام التغيير</p>
        </CardContent>
      </Card>

      {/* تغيير كلمة المرور */}
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              كلمة المرور الحالية
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              كلمة المرور الجديدة
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
              تأكيد كلمة المرور الجديدة
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passSaving}
            className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            {passSaving ? 'جاري التحديث...' : <><ShieldCheck className="w-4 h-4 ml-2" /> تغيير كلمة المرور</>}
          </Button>
          <p className="text-[11px] text-slate-400 text-center">كلمة المرور يجب أن تكون 6 أحرف على الأقل</p>
        </CardContent>
      </Card>
    </div>
  );
}
