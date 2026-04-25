import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Users, Search, UserCog, MessageSquareText, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function buildMsg(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export default function Distributors() {
  const { distributors, records, bulkRenameDistributor, settings } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [renameOpen, setRenameOpen] = useState(false);
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');

  const filtered = useMemo(() => {
    return distributors.filter((d) => {
      if (q && !d.name.includes(q)) return false;
      if (status === 'debt' && d.debt <= 0) return false;
      if (status === 'clear' && d.debt > 0) return false;
      return true;
    });
  }, [distributors, q, status]);

  function lastRecordOf(name) {
    return [...records].filter((r) => r.name === name).sort((a, b) => b.ts - a.ts)[0];
  }

  function getSmsLink(d) {
    const phone = settings.phones?.[d.name] || '';
    const last = lastRecordOf(d.name);
    const isChicks = last?.opType === 'طبعة';
    const template = isChicks
      ? (settings.msgChicks || 'مرحبا {name}، رصيدك الحالي: {remain} ₪')
      : (settings.msgPayment || 'مرحبا {name}، تم استلام دفعتك. الرصيد المتبقي: {remain} ₪');

    const msg = buildMsg(template, {
      name: d.name,
      date: last?.date || new Date().toLocaleDateString('ar-EG'),
      remain: d.debt.toLocaleString(),
      type: last?.chickenType || '',
      qty: last?.qty?.toLocaleString() || '',
      price: last?.price?.toLocaleString() || '',
      paid: last?.paid?.toLocaleString() || '',
    });

    return phone ? `sms:${phone}?body=${encodeURIComponent(msg)}` : `sms:?body=${encodeURIComponent(msg)}`;
  }

  function getCallLink(d) {
    const phone = settings.phones?.[d.name];
    return phone ? `tel:${phone}` : '#';
  }

  async function handleRename() {
    if (!oldName || !newName.trim()) {
      toast.error('يرجى اختيار الموزع وإدخال الاسم الجديد');
      return;
    }
    try {
      const count = await bulkRenameDistributor(oldName, newName.trim());
      toast.success(`تم تحديث ${count} سجل`);
      setRenameOpen(false);
      setOldName('');
      setNewName('');
    } catch (err) {
      toast.error('فشل التحديث: ' + (err?.message || ''));
    }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="card-soft border-0 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2 dark:text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              قائمة الموزعين
              <span className="text-xs text-slate-400 font-semibold mr-2">({filtered.length.toLocaleString()})</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRenameOpen(true)} className="rounded-xl font-bold dark:border-slate-700 dark:text-slate-200">
                <UserCog className="w-4 h-4 ml-2" /> تعديل اسم موزع
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-2">
              <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
                <Search className="w-3 h-3" /> البحث
              </Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم..." className="h-10 bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <Label className="text-[11px] text-slate-500 font-bold mb-1 block">الحالة</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="debt">عليه ديون</SelectItem>
                  <SelectItem value="clear">مسدد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500">لا يوجد موزعون بالمعايير المحددة</div>
            )}
            {filtered.map((d) => {
              const critical = d.debt >= 5000;
              const last = lastRecordOf(d.name);
              const phone = settings.phones?.[d.name];
              return (
                <div
                  key={d.name}
                  className={`relative rounded-2xl border ${critical ? 'border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'} p-4 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-sm`}
                  style={{ transition: 'border-color .2s, box-shadow .2s' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black">
                        {d.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{d.name}</div>
                        <div className="text-[11px] text-slate-500">آخر عملية: {d.lastDate}</div>
                        {phone && (
                          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">{phone}</div>
                        )}
                      </div>
                    </div>
                    {critical ? (
                      <Badge className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 font-bold">
                        <AlertCircle className="w-3 h-3 ml-1" /> مديونية مرتفعة
                      </Badge>
                    ) : d.debt > 0 ? (
                      <Badge className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-700 font-bold">عليه ديون</Badge>
                    ) : (
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 ml-1" /> مسدد
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">الدين</div>
                      <div className="text-sm font-extrabold num-ar text-rose-600 dark:text-rose-400">{d.debt.toLocaleString()} ₪</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">العمليات</div>
                      <div className="text-sm font-extrabold num-ar text-indigo-700 dark:text-indigo-400">{d.recordsCount}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">آخر نوع</div>
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate">{last?.chickenType && last.chickenType !== '-' ? last.chickenType : 'دفعة'}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={getSmsLink(d)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 py-2 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                      style={{ transition: 'background-color .2s' }}
                    >
                      <MessageSquareText className="w-3.5 h-3.5" /> إرسال إشعار
                    </a>
                    <a
                      href={getCallLink(d)}
                      onClick={!phone ? (e) => { e.preventDefault(); toast.error(`لا يوجد رقم جوال لـ ${d.name} — أضفه من الإعدادات`); } : undefined}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg py-2 ${phone ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                      style={{ transition: 'background-color .2s' }}
                    >
                      <Phone className="w-3.5 h-3.5" /> اتصال
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>تعديل اسم موزع في كل السجلات</DialogTitle>
            <DialogDescription>سيتم تغيير الاسم في كافة العمليات المرتبطة بهذا الموزع.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold text-slate-600 mb-1 block">الاسم الحالي</Label>
              <Select value={oldName} onValueChange={setOldName}>
                <SelectTrigger className="h-11 bg-slate-50">
                  <SelectValue placeholder="-- اختر --" />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((d) => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-600 mb-1 block">الاسم الجديد</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اكتب الاسم الجديد" className="h-11 bg-slate-50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>إلغاء</Button>
            <Button onClick={handleRename} className="bg-indigo-600 hover:bg-indigo-700">تحديث الآن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
