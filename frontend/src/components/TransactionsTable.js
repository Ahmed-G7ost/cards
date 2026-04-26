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
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Search,
  CalendarDays,
  MessageSquare,
  Pencil,
  Trash2,
  Phone,
  X,
  Copy,
  CheckCircle2,
  MessageCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function TransactionsTable({
  onEdit,
  hideFilters = false,
  nameFilter = '',
  fromFilter = '',
  toFilter = '',
}) {
  const {
    records,
    deleteRecord,
    phones,
    internetMsg,
    paymentMsg,
  } = useData();

  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [opTypeFilter, setOpTypeFilter] = useState('all');

  // Message dialog state
  const [msgDialog, setMsgDialog] = useState(null); // { record, text, phone }
  const [copied, setCopied] = useState(false);

  const effectiveName = hideFilters ? nameFilter : q;
  const effectiveFrom = hideFilters ? fromFilter : from;
  const effectiveTo = hideFilters ? toFilter : to;

  const filtered = useMemo(() => {
    return [...records]
      .filter((r) => {
        if (effectiveName && !r.name.includes(effectiveName)) return false;
        if (effectiveFrom && r.date < effectiveFrom) return false;
        if (effectiveTo && r.date > effectiveTo) return false;
        if (opTypeFilter !== 'all') {
          const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
          if (opTypeFilter === 'طبعة' && !isBatch) return false;
          if (opTypeFilter === 'دفعة' && isBatch) return false;
        }
        return true;
      })
      .sort((a, b) => b.ts - a.ts);
  }, [records, effectiveName, effectiveFrom, effectiveTo, opTypeFilter]);

  function buildMsg(r) {
    const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
    const template = isBatch ? internetMsg : paymentMsg;
    const total = isBatch
      ? (Number(r.qty) || 0) * (Number(r.price) || 0)
      : Number(r.paid) || 0;

    return template
      .replace(/{NAME}/g, r.name)
      .replace(/{DATE}/g, r.date)
      .replace(/{QTY}/g, (r.qty || 0).toString())
      .replace(/{TYPE}/g, r.chickenType && r.chickenType !== '-' ? r.chickenType : '')
      .replace(/{OLD}/g, Number(r.old || 0).toLocaleString())
      .replace(/{TOTAL}/g, total.toLocaleString())
      .replace(/{PAID}/g, Number(r.paid || 0).toLocaleString())
      .replace(/{REMAIN}/g, Number(r.remain || 0).toLocaleString());
  }

  function openMsgDialog(r) {
    const text = buildMsg(r);
    const phone = phones[r.name] || '';
    setMsgDialog({ record: r, text, phone });
    setCopied(false);
  }

  function handleCopy() {
    if (!msgDialog) return;
    navigator.clipboard.writeText(msgDialog.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWhatsApp() {
    if (!msgDialog) return;
    const phone = msgDialog.phone;
    const waPhone = phone.replace(/^0/, '972').replace(/\D/g, '');
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(msgDialog.text)}`;
    window.open(url, '_blank');
  }

  function handleSMS() {
    if (!msgDialog) return;
    const phone = msgDialog.phone;
    const url = `sms:${phone}?body=${encodeURIComponent(msgDialog.text)}`;
    window.location.href = url;
  }

  async function handleDelete(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    try {
      await deleteRecord(id);
      toast.success('تم الحذف بنجاح');
    } catch (err) {
      toast.error('فشل الحذف: ' + (err?.message || ''));
    }
  }

  const isBatchRecord = (r) => r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));

  return (
    <div>
      {/* Filters */}
      {!hideFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="md:col-span-1">
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
              <Search className="w-3 h-3" /> اسم الموزع
            </Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم الموزع..."
              className="h-10 bg-slate-50"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3 h-3" /> من تاريخ
            </Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 bg-slate-50"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3 h-3" /> إلى تاريخ
            </Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 bg-slate-50"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500 font-bold mb-1 block">نوع العملية</Label>
            <Select value={opTypeFilter} onValueChange={setOpTypeFilter}>
              <SelectTrigger className="h-10 bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="طبعة">استلام فروخ</SelectItem>
                <SelectItem value="دفعة">دفعة مالية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['الموزع', 'التاريخ', 'النوع', 'الفرخ', 'العدد', 'سابق (₪)', 'مدفوع (₪)', 'الرصيد (₪)', 'ملاحظات', ''].map((h) => (
                <th key={h} className="px-3 py-3 text-[11px] font-extrabold text-slate-500 text-right whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-16 text-slate-400 text-sm">
                  لا توجد سجلات بالمعايير المحددة
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const isBatch = isBatchRecord(r);
              return (
                <tr
                  key={r.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-3 py-3 font-extrabold text-slate-900 whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-3">
                    {isBatch ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[11px]">
                        ✈ استلام
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[11px]">
                        💰 دفعة
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                    {isBatch && r.chickenType && r.chickenType !== '-' ? (
                      <span className="text-indigo-600 font-bold">{r.chickenType}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-slate-700">
                    {isBatch ? (r.qty || '—') : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-500 num-ar">
                    {Number(r.old || 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-emerald-700 num-ar">
                    {Number(r.paid || 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-extrabold num-ar ${Number(r.remain) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Number(r.remain || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-400 text-xs max-w-[100px] truncate">
                    {r.note || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openMsgDialog(r)}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors"
                        title="إرسال رسالة"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(r)}
                          className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 font-bold">
        {filtered.length.toLocaleString()} سجل
      </div>

      {/* Message Dialog */}
      <Dialog open={!!msgDialog} onOpenChange={() => setMsgDialog(null)}>
        <DialogContent className="sm:max-w-[460px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              {msgDialog && (isBatchRecord(msgDialog.record)
                ? `رسالة استلام فروخ — ${msgDialog.record.name}`
                : `رسالة تسديد دفعة — ${msgDialog.record.name}`)}
            </DialogTitle>
            <DialogDescription>
              {msgDialog?.phone ? (
                <span className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span dir="ltr">{msgDialog.phone}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 text-xs mt-1">
                  <Phone className="w-3 h-3" />
                  لم يُضف رقم جوال لهذا الموزع —{' '}
                  <Link
                    to="/settings"
                    className="underline font-bold hover:text-amber-700"
                    onClick={() => setMsgDialog(null)}
                  >
                    يمكنك إضافته من الإعدادات
                  </Link>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Message preview */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[100px]">
            {msgDialog?.text}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {/* WhatsApp */}
            {msgDialog?.phone ? (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                واتساب
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-400 font-bold py-3 text-sm cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
                واتساب (لا يوجد رقم)
              </button>
            )}

            {/* SMS */}
            <button
              onClick={handleSMS}
              className={`w-full flex items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-colors ${
                msgDialog?.phone
                  ? 'bg-sky-500 hover:bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!msgDialog?.phone}
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border font-bold py-2.5 text-sm transition-colors ${
                copied
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copied ? (
                <><CheckCircle2 className="w-4 h-4" /> تم النسخ!</>
              ) : (
                <><Copy className="w-4 h-4" /> نسخ الرسالة</>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
