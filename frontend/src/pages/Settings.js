import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Settings2, DollarSign, EyeOff, Database, AlertTriangle, Phone, MessageSquareText } from 'lucide-react';
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
  const [phones, setPhones] = useState(settings.phones || {});
  const [msgChicks, setMsgChicks] = useState(
    settings.msgChicks ||
    'السلام عليكم {name}،\nنُحيطكم علماً باستلام طبعة جديدة بتاريخ {date}:\n• النوع: {type}\n• الكمية: {qty} طير\n• سعر الطير: {price} ₪\n• إجمالي المستحقات: {remain} ₪\nنرجو التكرم بالتسديد في أقرب وقت ممكن.\nشكراً لتعاملكم معنا 🐣'
  );
  const [msgPayment, setMsgPayment] = useState(
    settings.msgPayment ||
    'السلام عليكم {name}،\nتم استلام دفعتكم بتاريخ {date}:\n• المبلغ المدفوع: {paid} ₪\n• الرصيد المتبقي: {remain} ₪\nنشكركم على الالتزام ونتطلع لاستمرار تعاملكم معنا 💚'
  );

  function saveFinancials() {
    setSettings({
      ...settings,
      cost: Number(cost) || 0,
      defaultPrice: Number(defaultPrice) || 0,
      prices: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, Number(v) || 0])),
    });
    toast.success('تم حفظ الإعدادات المالية');
  }

  function savePhones() {
    setSettings({ ...settings, phones });
    toast.success('تم حفظ أرقام الجوال');
  }

  function saveMessages() {
    setSettings({ ...settings, msgChicks, msgPayment });
    toast.success('تم حفظ نصوص الرسائل');
  }

  function toggleExclude(name) {
    const current = settings.excluded || [];
    const has = current.includes(name);
    const next = has ? current.filter((n) => n !== name) : [...current, name];
    setSettings({ ...settings, excluded: next });
  }

  const phoneTags = ['يحوي {name} اسم الموزع', 'يحوي {date} التاريخ', 'يحوي {remain} الرصيد المتبقي'];
  const chickTags = [...phoneTags, 'يحوي {type} نوع الفرخ', 'يحوي {qty} الكمية', 'يحوي {price} سعر الطير'];
  const payTags = [...phoneTags, 'يحوي {paid} المبلغ المدفوع'];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Financial settings */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            الإعدادات المالية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">تكلفة الفرخ الواحد (₪)</Label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">تستخدم لحساب صافي الأرباح</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">سعر البيع الافتراضي (₪)</Label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl" />
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

      {/* Prices by type */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            الأسعار حسب نوع الفرخ
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">يتم اختيار السعر تلقائياً في نموذج العملية عند اختيار نوع الفرخ.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(prices).map((type) => (
            <div key={type}>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">{type}</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input type="number" value={prices[type]} onChange={(e) => setPrices({ ...prices, [type]: e.target.value })} className="pr-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl" />
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

      {/* Phone numbers per distributor */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              أرقام جوال الموزعين
            </CardTitle>
            <Button onClick={savePhones} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 px-5">
              حفظ الأرقام
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تُستخدم هذه الأرقام في إرسال الرسائل النصية وزر الاتصال في صفحة الموزعين.</p>
        </CardHeader>
        <CardContent>
          {distributors.length === 0 && (
            <div className="py-8 text-center text-slate-500">لا يوجد موزعون بعد</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {distributors.map((d) => (
              <div key={d.name} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{d.name}</Label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="tel"
                    value={phones[d.name] || ''}
                    onChange={(e) => setPhones({ ...phones, [d.name]: e.target.value })}
                    placeholder="05X-XXXXXXX"
                    className="pr-9 h-10 bg-white dark:bg-slate-900 rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message templates */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center justify-center">
                <MessageSquareText className="w-4 h-4" />
              </div>
              نصوص الرسائل
            </CardTitle>
            <Button onClick={saveMessages} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold h-10 px-5">
              حفظ الرسائل
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">قم بتخصيص نص الرسائل التي تُرسل للموزعين. يمكنك استخدام المتغيرات أدناه.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Chicks message */}
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">🐣 رسالة استلام الفروخ</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {chickTags.map((tag) => (
                <span key={tag} className="text-[10px] bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-700 rounded-md px-2 py-0.5 font-mono">{tag}</span>
              ))}
            </div>
            <Textarea
              value={msgChicks}
              onChange={(e) => setMsgChicks(e.target.value)}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[140px] font-mono text-sm leading-relaxed"
              dir="rtl"
            />
          </div>

          {/* Payment message */}
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">💰 رسالة تسديد الدفعة</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {payTags.map((tag) => (
                <span key={tag} className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-700 rounded-md px-2 py-0.5 font-mono">{tag}</span>
              ))}
            </div>
            <Textarea
              value={msgPayment}
              onChange={(e) => setMsgPayment(e.target.value)}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[120px] font-mono text-sm leading-relaxed"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exclude distributors */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            استثناء موزعين من إجمالي الشبكة
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">عند الإيقاف، لا يدخل مديونية الموزع ضمن إجمالي ديون الشبكة</p>
        </CardHeader>
        <CardContent>
          {distributors.length === 0 && <div className="py-8 text-center text-slate-500">لا يوجد موزعون</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {distributors.map((d) => {
              const included = !(settings.excluded || []).includes(d.name);
              return (
                <div key={d.name} className={`flex items-center justify-between rounded-xl p-3 border ${included ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 num-ar">{d.debt.toLocaleString()} ₪</div>
                  </div>
                  <Switch checked={included} onCheckedChange={() => toggleExclude(d.name)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reset data */}
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            إدارة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-rose-50/60 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-extrabold text-rose-800 dark:text-rose-300">تصفير كل البيانات</div>
              <div className="text-xs text-rose-700 dark:text-rose-400">سيتم حذف جميع السجلات بشكل نهائي. يُنصح بتحميل نسخة احتياطية قبل المتابعة.</div>
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
