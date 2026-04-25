import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Edit3, Trash2, MessageSquareText, Package, Wallet, Calendar as CalIcon, Search, X } from 'lucide-react';
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

export default function TransactionsTable({ onEdit, hideFilters = false, nameFilter, fromFilter, toFilter }) {
  const { records, deleteRecord, distributors } = useData();
  const [innerName, setInnerName] = useState('');
  const [innerFrom, setInnerFrom] = useState('');
  const [innerTo, setInnerTo] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [limit, setLimit] = useState(25);

  const filter = hideFilters ? { name: nameFilter, from: fromFilter, to: toFilter } : { name: innerName, from: innerFrom, to: innerTo };

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

  function smsHref(r) {
    const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
    const body = isBatch
      ? `Live Net | استلام فروخ انترنت\n\nالموزع: ${r.name}\nالنوع: ${r.chickenType || 'عام'}\nالعدد: ${r.qty} فرخ انترنت\nالرصيد السابق: ${r.old} ₪\nالرصيد الإجمالي: ${r.remain} ₪\n\nالتاريخ: ${r.date}\nشكراً لتعاملكم معنا.`
      : `Live Net | دفعة مالية\n\nالموزع: ${r.name}\nتم استلام دفعة بقيمة: ${r.paid} ₪\nالرصيد المتبقي: ${r.remain} ₪\n\nالتاريخ: ${r.date}\nشكراً لتعاملكم معنا.`;
    return `sms:?body=${encodeURIComponent(body)}`;
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

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="md:col-span-2">
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
              <Search className="w-3 h-3" /> بحث باسم الموزع
            </Label>
            <Input list="distributors-list2" value={innerName} onChange={(e) => setInnerName(e.target.value)} placeholder="اسم الموزع..." className="h-10 bg-white" />
            <datalist id="distributors-list2">
              {distributors.map((d) => <option key={d.name} value={d.name} />)}
            </datalist>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalIcon className="w-3 h-3" /> من تاريخ</Label>
            <Input type="date" value={innerFrom} onChange={(e) => setInnerFrom(e.target.value)} className="h-10 bg-white" />
          </div>
          <div className="relative">
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalIcon className="w-3 h-3" /> إلى تاريخ</Label>
            <Input type="date" value={innerTo} onChange={(e) => setInnerTo(e.target.value)} className="h-10 bg-white" />
            {(innerName || innerFrom || innerTo) && (
              <button
                type="button"
                onClick={() => { setInnerName(''); setInnerFrom(''); setInnerTo(''); }}
                className="absolute left-2 bottom-2 text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 rounded-md px-2 py-1 hover:bg-rose-100"
                style={{ transition: 'background-color .2s' }}
              >
                <X className="w-3 h-3" /> مسح
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto scroll-thin rounded-xl border border-slate-100">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="px-4 py-3 text-right font-bold">الموزع</th>
              <th className="px-4 py-3 font-bold">التاريخ</th>
              <th className="px-4 py-3 font-bold">النوع</th>
              <th className="px-4 py-3 font-bold">نوع فرخ انترنت</th>
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
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/70" style={{ transition: 'background-color .2s' }}>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{r.date}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={isBatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}>
                      {isBatch ? <><Package className="w-3 h-3 ml-1" /> استلام</> : <><Wallet className="w-3 h-3 ml-1" /> دفعة</>}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700">{isBatch ? r.chickenType || '-' : '-'}</td>
                  <td className="px-4 py-3 text-center num-ar">{isBatch ? r.qty : '-'}</td>
                  <td className="px-4 py-3 text-center num-ar text-slate-700">{Number(r.old).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center num-ar text-emerald-700 font-bold">{Number(r.paid).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center num-ar font-extrabold text-rose-600">{Number(r.remain).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 max-w-[160px] truncate">{r.note || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <a href={smsHref(r)} title="إرسال SMS" className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100" style={{ transition: 'background-color .2s' }}>
                        <MessageSquareText className="w-4 h-4" />
                      </a>
                      <button type="button" title="تعديل" onClick={() => onEdit?.(r)} className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100" style={{ transition: 'background-color .2s' }}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button type="button" title="حذف" onClick={() => setConfirmDel(r.id)} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100" style={{ transition: 'background-color .2s' }}>
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
          <Button variant="outline" onClick={() => setLimit(limit + 25)} className="rounded-xl font-bold">
            عرض المزيد (يتبقى {data.length - shown.length})
          </Button>
        </div>
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
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
