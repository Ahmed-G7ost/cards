import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { User2, Tag, Package, Calendar, Hash, Banknote, Wallet, AlertCircle, FileSignature, Save, ListFilter } from 'lucide-react';
import { toast } from 'sonner';

const CHICK_TYPES = ['8 ساعات', '10 ساعات', '24 ساعة'];

export default function OperationForm({ editing, onDone }) {
  const { records, addRecord, updateRecord, distributors, settings } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [opType, setOpType] = useState('طبعة');
  const [name, setName] = useState('');
  const [chickenType, setChickenType] = useState('10 ساعات');
  const [date, setDate] = useState(todayStr);
  const [batch, setBatch] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(settings.prices?.['10 ساعات'] || settings.defaultPrice || 90);
  const [paid, setPaid] = useState(0);
  const [note, setNote] = useState('');
  const [manualPrice, setManualPrice] = useState(false);

  // Auto-update price when chicken type changes (unless user manually edited)
  useEffect(() => {
    if (!manualPrice && !editing) {
      const p = settings.prices?.[chickenType];
      if (p !== undefined) setPrice(p);
    }
  }, [chickenType, settings.prices, manualPrice, editing]);

  // Fill state on editing
  useEffect(() => {
    if (editing) {
      const isBatch = editing.opType === 'طبعة' || (editing.type && editing.type.includes('طبعة'));
      setOpType(isBatch ? 'طبعة' : 'دفعة');
      setName(editing.name || '');
      setChickenType(editing.chickenType && editing.chickenType !== '-' ? editing.chickenType : '10 ساعات');
      setDate(editing.date || todayStr);
      setBatch(editing.batch || '');
      setQty(editing.qty || '');
      setPrice(editing.price || settings.prices?.[editing.chickenType] || settings.defaultPrice || 90);
      setPaid(editing.paid || 0);
      setNote(editing.note || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Old debt derived from last record of the selected distributor (excluding the one being edited)
  const oldDebt = useMemo(() => {
    if (!name) return 0;
    const pool = editing ? records.filter((r) => r.id !== editing.id) : records;
    const list = pool.filter((r) => r.name === name).sort((a, b) => b.ts - a.ts);
    return list.length ? Number(list[0].remain) || 0 : 0;
  }, [name, records, editing]);

  const qtyNum = Number(qty) || 0;
  const priceNum = Number(price) || 0;
  const paidNum = Number(paid) || 0;
  const currentTotal = opType === 'طبعة' ? qtyNum * priceNum + oldDebt : oldDebt;
  const remain = Math.round(currentTotal - paidNum);

  const errors = useMemo(() => {
    const errs = [];
    if (!name.trim()) errs.push('أدخل اسم الموزع');
    if (opType === 'طبعة' && qtyNum <= 0) errs.push('أدخل عدد الفروخ');
    if (opType === 'دفعة' && paidNum <= 0) errs.push('أدخل قيمة الدفعة');
    if (opType === 'دفعة' && oldDebt <= 0 && !editing) errs.push('لا توجد مستحقات على هذا الموزع');
    if (opType === 'دفعة' && paidNum > oldDebt) errs.push('المبلغ المدفوع أكبر من الدين الحالي');
    return errs;
  }, [name, opType, qtyNum, paidNum, oldDebt, editing]);

  async function submit(e) {
    e.preventDefault();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const data = {
      name: name.trim(),
      opType,
      type: opType === 'طبعة' ? `طبعة (${batch || 0})` : 'دفعة مالية',
      chickenType: opType === 'طبعة' ? chickenType : '-',
      date,
      batch: Number(batch) || 0,
      qty: opType === 'طبعة' ? qtyNum : 0,
      price: opType === 'طبعة' ? priceNum : 0,
      old: Math.round(oldDebt),
      paid: opType === 'دفعة' ? paidNum : 0,
      remain,
      note: note.trim(),
      ts: Date.now(),
    };

    try {
      if (editing) {
        await updateRecord(editing.id, data);
        toast.success('تم تحديث العملية بنجاح');
        onDone?.();
      } else {
        await addRecord(data);
        toast.success('تم حفظ العملية بنجاح');
      }

      if (!editing) {
        setName('');
        setQty('');
        setPaid(0);
        setNote('');
        setBatch('');
        setManualPrice(false);
      }
    } catch (err) {
      toast.error('فشل الحفظ: ' + (err?.message || 'تحقق من الاتصال'));
    }
  }

  const datalist = distributors.map((d) => d.name);
  const isBatch = opType === 'طبعة';

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Op Type */}
      <div className="col-span-1 md:col-span-2 xl:col-span-1">
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <ListFilter className="w-3.5 h-3.5 text-indigo-500" /> نوع العملية
        </Label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          {['طبعة', 'دفعة'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setOpType(v)}
              className={`py-2.5 rounded-lg text-sm font-bold ${opType === v ? 'bg-white text-indigo-700 shadow' : 'text-slate-600'}`}
              style={{ transition: 'background-color .2s, color .2s' }}
            >
              {v === 'طبعة' ? 'استلام فروخ' : 'دفعة مالية'}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <User2 className="w-3.5 h-3.5 text-indigo-500" /> اسم الموزع
        </Label>
        <Input
          list="distributors-list"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ابحث أو أضف موزع..."
          className="h-11 rounded-xl bg-slate-50 border-slate-200"
        />
        <datalist id="distributors-list">
          {datalist.map((n) => <option key={n} value={n} />)}
        </datalist>
      </div>

      {/* Date */}
      <div>
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> التاريخ
        </Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
      </div>

      {/* Batch (only batches) */}
      {isBatch && (
        <>
          <div>
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" /> نوع الفرخ
            </Label>
            <Select value={chickenType} onValueChange={setChickenType}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHICK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> رقم الطبعة
            </Label>
            <Input type="number" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="100" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-500" /> العدد
            </Label>
            <Input type="number" step="0.5" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="10" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Banknote className="w-3.5 h-3.5 text-indigo-500" /> السعر (₪)
            </Label>
            <Input type="number" value={price} onChange={(e) => { setManualPrice(true); setPrice(e.target.value); }} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
            <p className="text-[10px] text-slate-400 mt-1">السعر الافتراضي: <button type="button" onClick={() => { setManualPrice(false); setPrice(settings.prices?.[chickenType] || 90); }} className="text-indigo-600 font-bold hover:underline">{settings.prices?.[chickenType] || 90} ₪</button></p>
          </div>
        </>
      )}

      {/* Payment (only payments) */}
      {!isBatch && (
        <div>
          <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
            <Wallet className="w-3.5 h-3.5 text-indigo-500" /> المبلغ المدفوع (₪)
          </Label>
          <Input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
        </div>
      )}

      {/* Old debt (readonly) */}
      <div>
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> الدين السابق
        </Label>
        <Input readOnly value={Math.round(oldDebt).toLocaleString()} className="h-11 rounded-xl bg-amber-50 border-amber-200 font-bold num-ar text-amber-800" />
      </div>

      {/* Net remaining */}
      <div>
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> صافي الدين الجديد
        </Label>
        <Input readOnly value={remain.toLocaleString()} className="h-11 rounded-xl bg-rose-50 border-rose-200 font-extrabold num-ar text-rose-700" />
      </div>

      {/* Note */}
      <div className="col-span-full">
        <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <FileSignature className="w-3.5 h-3.5 text-indigo-500" /> ملاحظات
        </Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="أي ملاحظة إضافية..." className="rounded-xl bg-slate-50 border-slate-200 min-h-[80px]" />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="col-span-full rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {errors[0]}
        </div>
      )}

      <div className="col-span-full flex gap-3">
        <Button type="submit" className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shadow-indigo-200">
          <Save className="w-4 h-4 ml-2" />
          {editing ? 'تحديث العملية' : 'حفظ العملية'}
        </Button>
      </div>
    </form>
  );
}
