import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
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
import { Users, Search, UserCog, MessageSquareText, Phone, AlertCircle, CheckCircle2, MessageCircle, MessageSquare, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function Distributors() {
  const { distributors, records, bulkRenameDistributor, phones, notifyMsg } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [renameOpen, setRenameOpen] = useState(false);
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [notifyDialog, setNotifyDialog] = useState(null); // { name, phone, msg }
  const [copied, setCopied] = useState(false);

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

  function openNotifyDialog(d) {
    const phone = phones[d.name] || '';
    const msg = (notifyMsg || '')
      .replace(/{NAME}/g, d.name)
      .replace(/{REMAIN}/g, d.debt.toLocaleString());
    setNotifyDialog({ name: d.name, phone, msg });
    setCopied(false);
  }

  function handleNotifyWhatsApp() {
    if (!notifyDialog) return;
    const waPhone = notifyDialog.phone.replace(/^0/, '972').replace(/\D/g, '');
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(notifyDialog.msg)}`, '_blank');
  }

  function handleNotifySMS() {
    if (!notifyDialog) return;
    window.location.href = `sms:${notifyDialog.phone}?body=${encodeURIComponent(notifyDialog.msg)}`;
  }

  function handleNotifyCopy() {
    if (!notifyDialog) return;
    navigator.clipboard.writeText(notifyDialog.msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
      <Card className="card-soft border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              قائمة الموزعين
              <span className="text-xs text-slate-400 font-semibold mr-2">({filtered.length.toLocaleString()})</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRenameOpen(true)} className="rounded-xl font-bold">
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم..." className="h-10 bg-slate-50" />
            </div>
            <div>
              <Label className="text-[11px] text-slate-500 font-bold mb-1 block">الحالة</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 bg-slate-50">
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

          {/* Grid of distributor cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500">لا يوجد موزعون بالمعايير المحددة</div>
            )}
            {filtered.map((d) => {
              const critical = d.debt >= 5000;
              const last = lastRecordOf(d.name);
              return (
                <div key={d.name} className={`relative rounded-2xl border ${critical ? 'border-rose-200 bg-rose-50/40' : 'border-slate-100 bg-white'} p-4 hover:border-indigo-200 hover:shadow-sm`} style={{ transition: 'border-color .2s, box-shadow .2s' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black">
                        {d.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 truncate">{d.name}</div>
                        <div className="text-[11px] text-slate-500">آخر عملية: {d.lastDate}</div>
                      </div>
                    </div>
                    {critical ? (
                      <Badge className="bg-rose-100 text-rose-700 border border-rose-200 font-bold">
                        <AlertCircle className="w-3 h-3 ml-1" /> مديونية مرتفعة
                      </Badge>
                    ) : d.debt > 0 ? (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-bold">عليه ديون</Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                        <CheckCircle2 className="w-3 h-3 ml-1" /> مسدد
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">الدين</div>
                      <div className="text-sm font-extrabold num-ar text-rose-600">{d.debt.toLocaleString()} ₪</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">العمليات</div>
                      <div className="text-sm font-extrabold num-ar text-indigo-700">{d.recordsCount}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="text-[10px] text-slate-500 font-bold">آخر نوع</div>
                      <div className="text-xs font-extrabold text-slate-700 truncate">{last?.chickenType && last.chickenType !== '-' ? last.chickenType : 'دفعة'}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => openNotifyDialog(d)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 py-2 hover:bg-sky-100"
                      style={{ transition: 'background-color .2s' }}
                    >
                      <MessageSquareText className="w-3.5 h-3.5" /> إرسال إشعار
                    </button>
                    {phones[d.name] ? (
                      <a
                        href={`tel:${phones[d.name]}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 py-2 hover:bg-indigo-100"
                        style={{ transition: 'background-color .2s' }}
                        title={`اتصال بـ ${phones[d.name]}`}
                      >
                        <Phone className="w-3.5 h-3.5" /> اتصال
                      </a>
                    ) : (
                      <span
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-slate-50 text-slate-400 py-2 cursor-not-allowed"
                        title="لم يُسجَّل رقم جوال"
                      >
                        <Phone className="w-3.5 h-3.5" /> اتصال
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notify Dialog */}
      <Dialog open={!!notifyDialog} onOpenChange={() => setNotifyDialog(null)}>
        <DialogContent className="sm:max-w-[420px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="w-4 h-4 text-sky-600" />
              إرسال إشعار — {notifyDialog?.name}
            </DialogTitle>
            <DialogDescription>
              {notifyDialog?.phone ? (
                <span className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span dir="ltr">{notifyDialog.phone}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 text-xs mt-1">
                  <Phone className="w-3 h-3" />
                  لم يُضف رقم جوال —{' '}
                  <Link to="/settings" className="underline font-bold hover:text-amber-700" onClick={() => setNotifyDialog(null)}>
                    أضفه من الإعدادات
                  </Link>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[80px]">
            {notifyDialog?.msg}
          </div>
          <div className="space-y-2 pt-1">
            <button
              onClick={handleNotifyWhatsApp}
              disabled={!notifyDialog?.phone}
              className={`w-full flex items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-colors ${notifyDialog?.phone ? 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <MessageCircle className="w-4 h-4" /> واتساب
            </button>
            <button
              onClick={handleNotifySMS}
              disabled={!notifyDialog?.phone}
              className={`w-full flex items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-colors ${notifyDialog?.phone ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <MessageSquare className="w-4 h-4" /> SMS
            </button>
            <button
              onClick={handleNotifyCopy}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border font-bold py-2.5 text-sm transition-colors ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {copied ? <><CheckCircle2 className="w-4 h-4" /> تم النسخ!</> : <><Copy className="w-4 h-4" /> نسخ الرسالة</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
