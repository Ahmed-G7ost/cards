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
import { Users, Search, UserCog, MessageSquareText, Phone, AlertCircle, CheckCircle2, Settings2, Copy, Send, X } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export default function Distributors() {
  const { distributors, records, bulkRenameDistributor, phones, notifMsg, DEFAULT_NOTIF_MSG, saveMessages, paymentMsg, internetMsg } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [renameOpen, setRenameOpen] = useState(false);
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [notifDistributor, setNotifDistributor] = useState(null); // dialog إرسال إشعار
  const [editNotifMsgOpen, setEditNotifMsgOpen] = useState(false); // dialog تعديل رسالة الإشعار
  const [editNotifMsgText, setEditNotifMsgText] = useState('');
  const [notifMsgSaved, setNotifMsgSaved] = useState(false);

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

  // بناء رسالة الإشعار للموزع
  function buildNotifMsg(d) {
    const today = new Date().toLocaleDateString('ar-EG');
    return (notifMsg || DEFAULT_NOTIF_MSG)
      .replace(/\{NAME\}/g, d.name)
      .replace(/\{DEBT\}/g, d.debt.toLocaleString())
      .replace(/\{DATE\}/g, today);
  }

  function getDistribPhone(name) {
    return (phones || {})[name] || '';
  }

  function openNotifSms(d) {
    const phone = getDistribPhone(d.name);
    const msg = buildNotifMsg(d);
    window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`;
  }

  function openNotifWhatsapp(d) {
    const phone = getDistribPhone(d.name).replace(/\D/g, '');
    const msg = buildNotifMsg(d);
    const num = phone ? (phone.startsWith('0') ? '972' + phone.slice(1) : phone) : '';
    const url = num
      ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  async function saveNotifMsg() {
    try {
      await saveMessages({ internetMsg, paymentMsg, notifMsg: editNotifMsgText });
      setNotifMsgSaved(true);
      toast.success('تم حفظ رسالة الإشعار ☁️');
      setTimeout(() => { setNotifMsgSaved(false); setEditNotifMsgOpen(false); }, 1500);
    } catch (err) {
      toast.error('فشل الحفظ: ' + (err?.message || ''));
    }
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
              <Button variant="outline" onClick={() => { setEditNotifMsgText(notifMsg || DEFAULT_NOTIF_MSG); setEditNotifMsgOpen(true); }} className="rounded-xl font-bold text-violet-700 border-violet-200 hover:bg-violet-50">
                <Settings2 className="w-4 h-4 ml-2" /> إعدادات رسالة الإشعار
              </Button>
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
                      type="button"
                      onClick={() => setNotifDistributor(d)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 py-2 hover:bg-sky-100"
                      style={{ transition: 'background-color .2s' }}
                    >
                      <MessageSquareText className="w-3.5 h-3.5" /> إرسال إشعار
                    </button>
                    <a href="#" className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 py-2 hover:bg-indigo-100" style={{ transition: 'background-color .2s' }}>
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

      {/* ===== Dialog إرسال إشعار ===== */}
      <Dialog open={!!notifDistributor} onOpenChange={(o) => !o && setNotifDistributor(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <MessageSquareText className="w-4 h-4" />
              </div>
              إرسال إشعار — {notifDistributor?.name}
            </DialogTitle>
            <DialogDescription>اختر طريقة إرسال الإشعار للموزع</DialogDescription>
          </DialogHeader>

          {notifDistributor && (
            <>
              {/* رقم الهاتف */}
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${getDistribPhone(notifDistributor.name) ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                <Phone className="w-4 h-4 shrink-0" />
                {getDistribPhone(notifDistributor.name)
                  ? <span dir="ltr">{getDistribPhone(notifDistributor.name)}</span>
                  : <span className="text-xs">لم يُضف رقم جوال — يمكنك إضافته من الإعدادات</span>
                }
              </div>

              {/* معاينة الرسالة */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 whitespace-pre-line text-sm leading-relaxed text-sky-900">
                {buildNotifMsg(notifDistributor)}
              </div>

              <DialogFooter className="flex-wrap gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => { navigator.clipboard.writeText(buildNotifMsg(notifDistributor)); toast.success('تم نسخ الرسالة'); }}
                  className="rounded-xl font-bold flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> نسخ
                </Button>
                <Button
                  onClick={() => openNotifSms(notifDistributor)}
                  variant="outline"
                  className="rounded-xl font-bold flex items-center gap-2 border-sky-200 text-sky-700 hover:bg-sky-50"
                >
                  <Send className="w-4 h-4" /> إرسال SMS
                </Button>
                <Button
                  onClick={() => openNotifWhatsapp(notifDistributor)}
                  className="rounded-xl font-bold flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  إرسال واتساب
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Dialog تعديل رسالة الإشعار ===== */}
      <Dialog open={editNotifMsgOpen} onOpenChange={(o) => { if (!o) setEditNotifMsgOpen(false); }}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                <Settings2 className="w-4 h-4" />
              </div>
              إعدادات رسالة إرسال الإشعار
            </DialogTitle>
            <DialogDescription>
              المتغيرات المتاحة:{' '}
              {['{NAME}', '{DEBT}', '{DATE}'].map((v) => (
                <code key={v} className="bg-slate-100 px-1 rounded text-[11px] ml-1">{v}</code>
              ))}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={editNotifMsgText}
              onChange={(e) => setEditNotifMsgText(e.target.value)}
              rows={6}
              className="bg-slate-50 rounded-xl text-sm leading-relaxed resize-none"
              placeholder="اكتب نص رسالة الإشعار..."
            />
            {/* معاينة */}
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
              <p className="text-[11px] text-sky-700 font-bold mb-1">📱 معاينة:</p>
              <p className="text-[11px] text-sky-600 whitespace-pre-line leading-relaxed">
                {(editNotifMsgText || '').replace('{NAME}', 'أحمد محمد').replace('{DEBT}', '5,000').replace('{DATE}', new Date().toLocaleDateString('ar-EG'))}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditNotifMsgText(DEFAULT_NOTIF_MSG); }} className="rounded-xl font-bold">
              إعادة الافتراضي
            </Button>
            <Button variant="outline" onClick={() => setEditNotifMsgOpen(false)} className="rounded-xl font-bold">
              إلغاء
            </Button>
            <Button
              onClick={saveNotifMsg}
              className={`rounded-xl font-bold flex items-center gap-2 ${notifMsgSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
            >
              {notifMsgSaved ? <><CheckCircle2 className="w-4 h-4" /> تم الحفظ</> : 'حفظ الرسالة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
