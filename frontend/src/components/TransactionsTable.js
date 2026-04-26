import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Edit3, Trash2, MessageSquareText, Package, Wallet, Calendar as CalIcon, Search, X, Copy, Send, Phone } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

const DEFAULT_INTERNET_MSG = `السلام عليكم ورحمة الله،
نُعلمكم باستلام طردة الفروخ الخاصة بكم بتاريخ {DATE}.
العدد: {QTY} فرخ | النوع: {TYPE}
السعر الإجمالي: {TOTAL} ₪ | الرصيد المستحق: {REMAIN} ₪
شركة Live Net لخدمات الإنترنت 🌐`;

const DEFAULT_PAYMENT_MSG = `السلام عليكم ورحمة الله،
تم استلام دفعتكم بتاريخ {DATE} وقيمتها {PAID} ₪.
الرصيد المتبقي: {REMAIN} ₪
شكراً لتعاملكم معنا 🙏
شركة Live Net لخدمات الإنترنت`;

function buildMessage(template, r) {
  const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
  const total = isBatch ? (Number(r.qty) * Number(r.price)).toLocaleString() : '0';
  return template
    .replace(/\{DATE\}/g, r.date || '')
    .replace(/\{QTY\}/g, r.qty || '0')
    .replace(/\{TYPE\}/g, r.chickenType || '-')
    .replace(/\{TOTAL\}/g, total)
    .replace(/\{PAID\}/g, Number(r.paid).toLocaleString())
    .replace(/\{REMAIN\}/g, Number(r.remain).toLocaleString());
}

export default function TransactionsTable({ onEdit, hideFilters = false, nameFilter, fromFilter, toFilter }) {
  const { records, deleteRecord, distributors, settings } = useData();
  const [innerName, setInnerName] = useState('');
  const [innerFrom, setInnerFrom] = useState('');
  const [innerTo, setInnerTo] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [limit, setLimit] = useState(25);
  const [msgRecord, setMsgRecord] = useState(null);

  const filter = hideFilters
    ? { name: nameFilter, from: fromFilter, to: toFilter }
    : { name: innerName, from: innerFrom, to: innerTo };

  const data = useMemo(() => {
    return records
      .filter((r) => {
        if (filter.name && !r.name.includes(filter.name)) return false;
        if (filter.from && r.date < filter.from) return false;
        if (filter.to && r.date > filter.to) return false;
        return true;
      })
      .sort((a, b) => b.ts - a.ts);
  }, [records, filter.name, filter.from, filter.to]);

  const shown = data.slice(0, limit);

  // Build the message text for a record using settings templates
  function getMessageText(r) {
    const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
    const template = isBatch
      ? (settings?.internetMsg || DEFAULT_INTERNET_MSG)
      : (settings?.paymentMsg || DEFAULT_PAYMENT_MSG);
    return buildMessage(template, r);
  }

  function getPhone(name) {
    return (settings?.phones || {})[name] || '';
  }

  async function doDelete() {
    if (confirmDel) {
      try {
        await deleteRecord(confirmDel);
        toast.success('تم حذف العملية');
      } catch (err) {
        toast.error('فشل الحذف: ' + (err?.message || ''));
      }
      setConfirmDel(null);
    }
  }

  // Message dialog helpers
  const msgText = msgRecord ? getMessageText(msgRecord) : '';
  const msgPhone = msgRecord ? getPhone(msgRecord.name) : '';
  const isMsgBatch = msgRecord
    ? (msgRecord.opType === 'طبعة' || (msgRecord.type && msgRecord.type.includes('طبعة')))
    : false;

  function copyMessage() {
    navigator.clipboard.writeText(msgText).then(() => {
      toast.success('تم نسخ الرسالة');
    });
  }

  function openWhatsapp() {
    const phone = msgPhone.replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/${phone.startsWith('0') ? '972' + phone.slice(1) : phone}?text=${encodeURIComponent(msgText)}`
      : `https://wa.me/?text=${encodeURIComponent(msgText)}`;
    window.open(url, '_blank');
  }

  function openSms() {
    const phone = msgPhone || '';
    window.location.href = `sms:${phone}?body=${encodeURIComponent(msgText)}`;
  }

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3">
          <div className="md:col-span-2">
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
              <Search className="w-3 h-3" /> بحث باسم الموزع
            </Label>
            <Input list="distributors-list2" value={innerName} onChange={(e) => setInnerName(e.target.value)} placeholder="اسم الموزع..." className="h-10 bg-white dark:bg-slate-800" />
            <datalist id="distributors-list2">
              {distributors.map((d) => <option key={d.name} value={d.name} />)}
            </datalist>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalIcon className="w-3 h-3" /> من تاريخ</Label>
            <Input type="date" value={innerFrom} onChange={(e) => setInnerFrom(e.target.value)} className="h-10 bg-white dark:bg-slate-800" />
          </div>
          <div className="relative">
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalIcon className="w-3 h-3" /> إلى تاريخ</Label>
            <Input type="date" value={innerTo} onChange={(e) => setInnerTo(e.target.value)} className="h-10 bg-white dark:bg-slate-800" />
            {(innerName || innerFrom || innerTo) && (
              <button
                type="button"
                onClick={() => { setInnerName(''); setInnerFrom(''); setInnerTo(''); }}
                className="absolute left-2 bottom-2 text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 rounded-md px-2 py-1 hover:bg-rose-100"
                style={{ transition: 'background-color .2s' }}
              >
                <X className="w-3 h-3" /> مسح
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto scroll-thin rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
              <th className="px-4 py-3 text-right font-bold">الموزع</th>
              <th className="px-4 py-3 font-bold">التاريخ</th>
              <th className="px-4 py-3 font-bold">النوع</th>
              <th className="px-4 py-3 font-bold">الفرخ</th>
              <th className="px-4 py-3 font-bold">العدد</th>
              <th className="px-4 py-3 font-bold">سابق (₪)</th>
              <th className="px-4 py-3 font-bold">مدفوع (₪)</th>
              <th className="px-4 py-3 font-bold">الرصيد (₪)</th>
              <th className="px-4 py-3 font-bold">ملاحظات</th>
              <th className="px-4 py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-sm text-slate-500">
                  لا توجد عمليات مطابقة
                </td>
              </tr>
            )}
            {shown.map((r) => {
              const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
              return (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/60" style={{ transition: 'background-color .2s' }}>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200">{r.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{r.date}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={isBatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}>
                      {isBatch ? <><Package className="w-3 h-3 ml-1" /> استلام</> : <><Wallet className="w-3 h-3 ml-1" /> دفعة</>}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700 dark:text-indigo-400">{isBatch ? r.chickenType || '-' : '-'}</td>
                  <td className="px-4 py-3 text-center num-ar dark:text-slate-300">{isBatch ? r.qty : '-'}</td>
                  <td className="px-4 py-3 text-center num-ar text-slate-700 dark:text-slate-400">{Number(r.old).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center num-ar text-emerald-700 dark:text-emerald-400 font-bold">{Number(r.paid).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center num-ar font-extrabold text-rose-600 dark:text-rose-400">{Number(r.remain).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 max-w-[160px] truncate">{r.note || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        title="إرسال رسالة"
                        onClick={() => setMsgRecord(r)}
                        className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900/50"
                        style={{ transition: 'background-color .2s' }}
                      >
                        <MessageSquareText className="w-4 h-4" />
                      </button>
                      <button type="button" title="تعديل" onClick={() => onEdit?.(r)} className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50" style={{ transition: 'background-color .2s' }}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button type="button" title="حذف" onClick={() => setConfirmDel(r.id)} className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/50" style={{ transition: 'background-color .2s' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > shown.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setLimit(limit + 25)} className="rounded-xl font-bold dark:border-slate-600">
            عرض المزيد (يتبقى {data.length - shown.length})
          </Button>
        </div>
      )}

      {/* Message Dialog */}
      <Dialog open={!!msgRecord} onOpenChange={(o) => !o && setMsgRecord(null)}>
        <DialogContent className="sm:max-w-[480px] dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMsgBatch ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}>
                <MessageSquareText className="w-4 h-4" />
              </div>
              رسالة {isMsgBatch ? 'استلام فروخ' : 'تسديد دفعة'} — {msgRecord?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Phone number display */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${msgPhone ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'}`}>
            <Phone className="w-4 h-4 shrink-0" />
            {msgPhone
              ? <span dir="ltr">{msgPhone}</span>
              : <span className="text-xs">لم يُضف رقم جوال لهذا الموزع — يمكنك إضافته من الإعدادات</span>
            }
          </div>

          {/* Message text */}
          <div className={`rounded-xl border p-4 whitespace-pre-line text-sm leading-relaxed ${isMsgBatch ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-900 dark:text-amber-300'}`}>
            {msgText}
          </div>

          <DialogFooter className="flex-wrap gap-2 sm:gap-2">
            <Button
              onClick={copyMessage}
              variant="outline"
              className="rounded-xl font-bold flex items-center gap-2 dark:border-slate-600"
            >
              <Copy className="w-4 h-4" /> نسخ الرسالة
            </Button>
            <Button
              onClick={openSms}
              variant="outline"
              className="rounded-xl font-bold flex items-center gap-2 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
            >
              <Send className="w-4 h-4" /> SMS
            </Button>
            <Button
              onClick={openWhatsapp}
              className="rounded-xl font-bold flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              واتساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف العملية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-rose-600 hover:bg-rose-700">نعم، احذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
