import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Settings2, DollarSign, EyeOff, Database, AlertTriangle, Phone, MessageSquare, CheckCircle2, CreditCard, UserPlus, User, KeyRound } from 'lucide-react';
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
  const { settings, setSettings, distributors, resetData, saveDistributorInitialDebts,
    phones: fbPhones, savePhones, internetMsg: fbInternetMsg, paymentMsg: fbPaymentMsg,
    notifMsg: fbNotifMsg, saveMessages, DEFAULT_INTERNET_MSG, DEFAULT_PAYMENT_MSG, DEFAULT_NOTIF_MSG,
    createUser, auth } = useData();
  const [cost, setCost] = useState(settings.cost);
  const [defaultPrice, setDefaultPrice] = useState(settings.defaultPrice);
  const [prices, setPrices] = useState(settings.prices || { '8 ساعات': 70, '10 ساعات': 90, '24 ساعة': 150 });
  const [confirmReset, setConfirmReset] = useState(false);

  // الديون القديمة
  const [initialDebts, setInitialDebts] = useState({});
  const [debtsSaved, setDebtsSaved] = useState(false);
  const [debtsDistributorName, setDebtsDistributorName] = useState('');
  const [debtsDistributorAmount, setDebtsDistributorAmount] = useState('');

  const [phones, setPhones] = useState({});
  const [phonesSaved, setPhonesSaved] = useState(false);

  const [internetMsg, setInternetMsg] = useState(DEFAULT_INTERNET_MSG);
  const [paymentMsg, setPaymentMsg] = useState(DEFAULT_PAYMENT_MSG);
  const [notifMsg, setNotifMsg] = useState(DEFAULT_NOTIF_MSG);
  const [msgSaved, setMsgSaved] = useState(false);

  // إنشاء حساب جديد
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('reader');
  const [newUserShowPass, setNewUserShowPass] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // مزامنة الأرقام والرسائل من Firebase عند تحميلها
  React.useEffect(() => {
    if (fbPhones && Object.keys(fbPhones).length > 0) setPhones(fbPhones);
  }, [fbPhones]);

  React.useEffect(() => {
    if (fbInternetMsg) setInternetMsg(fbInternetMsg);
  }, [fbInternetMsg]);

  React.useEffect(() => {
    if (fbPaymentMsg) setPaymentMsg(fbPaymentMsg);
  }, [fbPaymentMsg]);

  React.useEffect(() => {
    if (fbNotifMsg) setNotifMsg(fbNotifMsg);
  }, [fbNotifMsg]);

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

  async function savePhones_fn() {
    try {
      await savePhones(phones);
      setPhonesSaved(true);
      toast.success('تم حفظ أرقام الجوال في Firebase ☁️');
      setTimeout(() => setPhonesSaved(false), 2000);
    } catch (err) {
      toast.error('فشل الحفظ: ' + (err?.message || ''));
    }
  }

  function addDebtEntry() {
    const name = debtsDistributorName.trim();
    const amount = Number(debtsDistributorAmount);
    if (!name) { toast.error('أدخل اسم الموزع'); return; }
    if (!amount || amount <= 0) { toast.error('أدخل مبلغ دين صحيح'); return; }
    setInitialDebts((prev) => ({ ...prev, [name]: amount }));
    setDebtsDistributorName('');
    setDebtsDistributorAmount('');
  }

  function removeDebtEntry(name) {
    setInitialDebts((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }

  async function saveInitialDebts_fn() {
    if (Object.keys(initialDebts).length === 0) { toast.error('أضف دينًا واحدًا على الأقل'); return; }
    try {
      const count = await saveDistributorInitialDebts(initialDebts);
      setDebtsSaved(true);
      toast.success(`تم تسجيل الديون القديمة لـ ${count} موزع ☁️`);
      setInitialDebts({});
      setTimeout(() => setDebtsSaved(false), 2000);
    } catch (err) {
      toast.error('فشل الحفظ: ' + (err?.message || ''));
    }
  }

  async function saveMessages_fn() {
    try {
      await saveMessages({ internetMsg, paymentMsg, notifMsg });
      setMsgSaved(true);
      toast.success('تم حفظ نصوص الرسائل في Firebase ☁️');
      setTimeout(() => setMsgSaved(false), 2000);
    } catch (err) {
      toast.error('فشل الحفظ: ' + (err?.message || ''));
    }
  }

  function resetMessages() {
    setInternetMsg(DEFAULT_INTERNET_MSG);
    setPaymentMsg(DEFAULT_PAYMENT_MSG);
    setNotifMsg(DEFAULT_NOTIF_MSG);
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
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

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
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

      {/* Phone Numbers per Distributor */}
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            أرقام جوال الموزعين
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">أضف رقم الجوال لكل موزع لاستخدامه في إرسال الرسائل عبر واتساب</p>
        </CardHeader>
        <CardContent>
          {distributors.length === 0 && (
            <div className="py-8 text-center text-slate-500">لا يوجد موزعون بعد</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {distributors.map((d) => (
              <div key={d.name} className="rounded-xl border border-slate-100 dark:border-slate-700 p-3 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.name}</div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phones[d.name] || ''}
                    onChange={(e) => setPhones({ ...phones, [d.name]: e.target.value })}
                    className="pr-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}
          </div>
          {distributors.length > 0 && (
            <Button
              onClick={savePhones_fn}
              className={`rounded-xl font-bold h-10 px-6 ${phonesSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'} text-white`}
            >
              {phonesSaved ? <><CheckCircle2 className="w-4 h-4 ml-2" /> تم الحفظ</> : <><Phone className="w-4 h-4 ml-2" /> حفظ الأرقام</>}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            نصوص الرسائل التلقائية
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            المتغيرات المتاحة:{' '}
            {['{DATE}', '{QTY}', '{TYPE}', '{TOTAL}', '{PAID}', '{REMAIN}'].map((v) => (
              <code key={v} className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[11px] ml-1">{v}</code>
            ))}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              رسالة استلام فروخ إنترنت
            </Label>
            <Textarea
              value={internetMsg}
              onChange={(e) => setInternetMsg(e.target.value)}
              rows={5}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl text-sm leading-relaxed resize-none mt-1"
              placeholder="اكتب نص رسالة استلام الفروخ..."
            />
            <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mb-1">📱 معاينة الرسالة:</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500 whitespace-pre-line leading-relaxed">
                {internetMsg.replace('{DATE}', '2024-04-15').replace('{QTY}', '500').replace('{TYPE}', '10 ساعات').replace('{TOTAL}', '45,000').replace('{REMAIN}', '12,500').replace('{PAID}', '0')}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              رسالة تسديد دفعة
            </Label>
            <Textarea
              value={paymentMsg}
              onChange={(e) => setPaymentMsg(e.target.value)}
              rows={5}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl text-sm leading-relaxed resize-none mt-1"
              placeholder="اكتب نص رسالة تسديد الدفعة..."
            />
            <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mb-1">📱 معاينة الرسالة:</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 whitespace-pre-line leading-relaxed">
                {paymentMsg.replace('{DATE}', '2024-04-15').replace('{PAID}', '5,000').replace('{REMAIN}', '7,500').replace('{QTY}', '0').replace('{TYPE}', '').replace('{TOTAL}', '0')}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
              رسالة إرسال إشعار للموزعين
            </Label>
            <p className="text-[11px] text-slate-400 mb-1">المتغيرات: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[11px]">{"{NAME}"}</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[11px]">{"{DEBT}"}</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[11px]">{"{DATE}"}</code></p>
            <Textarea
              value={notifMsg}
              onChange={(e) => setNotifMsg(e.target.value)}
              rows={4}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl text-sm leading-relaxed resize-none mt-1"
              placeholder="اكتب نص رسالة الإشعار..."
            />
            <div className="mt-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
              <p className="text-[11px] text-sky-700 dark:text-sky-400 font-bold mb-1">📱 معاينة الرسالة:</p>
              <p className="text-[11px] text-sky-600 dark:text-sky-500 whitespace-pre-line leading-relaxed">
                {notifMsg.replace('{NAME}', 'أحمد محمد').replace('{DEBT}', '5,000').replace('{DATE}', '2024-04-15')}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={saveMessages_fn}
              className={`rounded-xl font-bold h-10 px-6 ${msgSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
            >
              {msgSaved ? <><CheckCircle2 className="w-4 h-4 ml-2" /> تم الحفظ</> : <><MessageSquare className="w-4 h-4 ml-2" /> حفظ الرسائل</>}
            </Button>
            <Button variant="outline" onClick={resetMessages} className="rounded-xl font-bold h-10 px-6 dark:border-slate-600">
              إعادة الافتراضي
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
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

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            تسجيل ديون قديمة على الموزعين
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">لو صفّرت البيانات وأردت إدخال الديون المتبقية من الفترة السابقة، أضفها هنا وسيتم تسجيلها كرصيد منقول</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* إدخال موزع جديد */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">اسم الموزع</Label>
              <Input
                placeholder="اسم الموزع..."
                value={debtsDistributorName}
                onChange={(e) => setDebtsDistributorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDebtEntry()}
                className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">مبلغ الدين (₪)</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  placeholder="0"
                  value={debtsDistributorAmount}
                  onChange={(e) => setDebtsDistributorAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDebtEntry()}
                  className="pr-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={addDebtEntry} className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold">
                + إضافة
              </Button>
            </div>
          </div>

          {/* قائمة الديون المدخلة */}
          {Object.keys(initialDebts).length > 0 && (
            <div className="rounded-xl border border-orange-100 dark:border-orange-800 overflow-hidden">
              <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-2 text-xs font-bold text-orange-700 dark:text-orange-400 flex justify-between">
                <span>الموزع</span>
                <span>المبلغ</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {Object.entries(initialDebts).map(([name, amount]) => (
                  <div key={name} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeDebtEntry(name)}
                        className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 transition-colors text-xs font-bold"
                      >
                        ×
                      </button>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400 num-ar">{Number(amount).toLocaleString()} ₪</span>
                  </div>
                ))}
              </div>
              <div className="bg-orange-50/60 dark:bg-orange-900/10 px-4 py-2 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الإجمالي</span>
                <span className="text-sm font-extrabold text-orange-700 dark:text-orange-400 num-ar">
                  {Object.values(initialDebts).reduce((s, v) => s + Number(v), 0).toLocaleString()} ₪
                </span>
              </div>
            </div>
          )}

          {Object.keys(initialDebts).length === 0 && (
            <div className="py-6 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              لم تُضَف ديون بعد — أدخل اسم الموزع والمبلغ ثم اضغط "إضافة"
            </div>
          )}

          {Object.keys(initialDebts).length > 0 && (
            <Button
              onClick={saveInitialDebts_fn}
              className={`rounded-xl font-bold h-10 px-6 ${debtsSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
            >
              {debtsSaved
                ? <><CheckCircle2 className="w-4 h-4 ml-2" /> تم التسجيل</>
                : <><CreditCard className="w-4 h-4 ml-2" /> تسجيل الديون القديمة</>
              }
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            إنشاء حساب مستخدم جديد
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">فقط المسؤول يستطيع إنشاء حسابات جديدة. يبقى المسؤول مسجلاً دخوله بعد الإنشاء مباشرة.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> الاسم (اختياري)
              </Label>
              <Input
                placeholder="اسم المستخدم..."
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="text-indigo-500">@</span> البريد الإلكتروني
              </Label>
              <Input
                type="email"
                placeholder="user@livenet.ps"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  type={newUserShowPass ? 'text' : 'password'}
                  placeholder="6 أحرف على الأقل..."
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl pl-10"
                />
                <button
                  type="button"
                  onClick={() => setNewUserShowPass(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {newUserShowPass
                    ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* اختيار دور المستخدم */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> دور المستخدم
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: 'admin',
                    label: 'مسؤول',
                    desc: 'صلاحيات كاملة',
                    color: 'rose',
                    icon: '🔑',
                  },
                  {
                    value: 'manager',
                    label: 'مدير',
                    desc: 'إدارة العمليات',
                    color: 'amber',
                    icon: '🛠️',
                  },
                  {
                    value: 'reader',
                    label: 'قارئ',
                    desc: 'عرض فقط',
                    color: 'sky',
                    icon: '👁️',
                  },
                ].map((r) => {
                  const selected = newUserRole === r.value;
                  const colorMap = {
                    rose: selected
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-rose-300',
                    amber: selected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-amber-300',
                    sky: selected
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-sky-300',
                  };
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setNewUserRole(r.value)}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1 transition-all cursor-pointer ${colorMap[r.color]}`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <span className="text-sm font-bold">{r.label}</span>
                      <span className="text-[11px] opacity-75">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            onClick={async () => {
              if (!newUserEmail.trim()) { toast.error('أدخل البريد الإلكتروني'); return; }
              if (newUserPassword.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
              setCreatingUser(true);
              const res = await createUser(newUserEmail.trim(), newUserPassword, newUserName.trim() || undefined, newUserRole);
              setCreatingUser(false);
              if (res.ok) {
                const roleLabels = { admin: 'مسؤول', manager: 'مدير', reader: 'قارئ' };
                toast.success(`✅ تم إنشاء الحساب بنجاح: ${newUserEmail.trim()} (${roleLabels[newUserRole]})`);
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserName('');
                setNewUserRole('reader');
              } else {
                toast.error(res.message);
              }
            }}
            disabled={creatingUser}
            className="rounded-xl font-bold h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {creatingUser
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin ml-2 inline-block" /> جارٍ الإنشاء...</>
              : <><UserPlus className="w-4 h-4 ml-2" /> إنشاء الحساب</>
            }
          </Button>

          <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-3 flex items-start gap-2">
            <div className="text-indigo-500 text-lg">ℹ️</div>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
              بعد إنشاء الحساب، يمكن للمستخدم الجديد تسجيل الدخول بالبريد وكلمة المرور التي أدخلتها. يتم تحديد الصلاحيات حسب الدور المختار: <strong>مسؤول</strong> (صلاحيات كاملة)، <strong>مدير</strong> (إدارة العمليات)، <strong>قارئ</strong> (عرض فقط). أنت كمسؤول ستبقى مسجلاً دخولك.
            </p>
          </div>
        </CardContent>
      </Card>

            <Card className="card-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
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
