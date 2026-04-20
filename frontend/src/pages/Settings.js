import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Settings2, DollarSign, EyeOff, Database, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, setSettings, distributors, resetData } = useData();
  const [cost, setCost] = useState(settings.cost);
  const [defaultPrice, setDefaultPrice] = useState(settings.defaultPrice);
  const [prices, setPrices] = useState(settings.prices || { '8 ساعات': 70, '10 ساعات': 90, '24 ساعة': 150 });
  const [confirmReset, setConfirmReset] = useState(false);

  function saveFinancials() {
    setSettings({
      ...settings,
      cost: Number(cost) || 0,
      defaultPrice: Number(defaultPrice) || 0,
      prices: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, Number(v) || 0])),
    });
    toast.success('تم حفظ الإعدادات');
  }

  function toggleExclude(name) {
    const current = settings.excluded || [];
    const has = current.includes(name);
    const next = has ? current.filter((n) => n !== name) : [...current, name];
    setSettings({ ...settings, excluded: next });
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            الإعدادات المالية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-600 mb-1 block">تكلفة الفرخ الواحد (₪)</Label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="pr-10 h-11 bg-slate-50 rounded-xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">تستخدم لحساب صافي الأرباح</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 mb-1 block">سعر البيع الافتراضي (₪)</Label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className="pr-10 h-11 bg-slate-50 rounded-xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">يظهر بشكل تلقائي في نموذج العملية</p>
          </div>
          <div className="flex items-end">
            <Button onClick={saveFinancials} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            الأسعار حسب نوع الفرخ
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">يتم اختيار السعر تلقائياً في نموذج العملية عند اختيار نوع الفرخ.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(prices).map((type) => (
            <div key={type}>
              <Label className="text-xs font-bold text-slate-600 mb-1 block">{type}</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input type="number" value={prices[type]} onChange={(e) => setPrices({ ...prices, [type]: e.target.value })} className="pr-10 h-11 bg-slate-50 rounded-xl" />
              </div>
            </div>
          ))}
          <div className="flex items-end">
            <Button onClick={saveFinancials} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              حفظ الأسعار
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            استثناء موزعين من إجمالي الشبكة
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">عند الإيقاف، لا يدخل مديونية الموزع ضمن إجمالي ديون الشبكة</p>
        </CardHeader>
        <CardContent>
          {distributors.length === 0 && <div className="py-8 text-center text-slate-500">لا يوجد موزعون</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {distributors.map((d) => {
              const included = !(settings.excluded || []).includes(d.name);
              return (
                <div key={d.name} className={`flex items-center justify-between rounded-xl p-3 border ${included ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 num-ar">{d.debt.toLocaleString()} ₪</div>
                  </div>
                  <Switch checked={included} onCheckedChange={() => toggleExclude(d.name)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            إدارة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-extrabold text-rose-800">تصفير كل البيانات</div>
              <div className="text-xs text-rose-700">سيتم حذف جميع السجلات بشكل نهائي. يُنصح بتحميل نسخة احتياطية قبل المتابعة.</div>
            </div>
            <Button variant="destructive" onClick={() => setConfirmReset(true)} className="rounded-xl">تصفير الآن</Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف جميع العمليات والموزعين. هذا الإجراء غير قابل للتراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { try { await resetData(); toast.success('تم تصفير البيانات'); } catch (err) { toast.error('فشل الحذف: ' + (err?.message || '')); } setConfirmReset(false); }} className="bg-rose-600 hover:bg-rose-700">نعم، صفّر</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
