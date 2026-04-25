import React, { useMemo, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import TransactionsTable from '../components/TransactionsTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { FileText, Download, Upload, Printer, CalendarClock, Search, CalendarDays, TrendingUp, Wallet, Package, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const { records, restoreFromBackup } = useData();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dailyOpen, setDailyOpen] = useState(false);
  const fileInput = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMetrics = useMemo(() => {
    let sales = 0, paid = 0, chicks = 0, count = 0;
    records.forEach((r) => {
      if (r.date === todayStr) {
        count++;
        sales += (Number(r.qty) || 0) * (Number(r.price) || 0);
        paid += Number(r.paid) || 0;
        if (r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'))) chicks += Number(r.qty) || 0;
      }
    });
    return { sales, paid, chicks, count };
  }, [records, todayStr]);

  function downloadBackup() {
    if (records.length === 0) {
      toast.message('لا توجد بيانات لتصديرها');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `LiveNet_Backup_${todayStr}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('تم تنزيل النسخة الاحتياطية');
  }

  function handleRestore(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        const n = await restoreFromBackup(arr);
        toast.success(`تم استعادة ${n} سجل`);
      } catch (err) {
        toast.error('الملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function printPDF() {
    const filteredData = records
      .filter((r) => {
        if (name && !r.name.includes(name)) return false;
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        return true;
      })
      .sort((a, b) => b.ts - a.ts);

    if (filteredData.length === 0) {
      toast.message('لا توجد سجلات للطباعة');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG');
    const timeStr = now.toLocaleTimeString('ar-EG');
    const currentDebt = filteredData[0]?.remain || 0;
    const title = name || 'عام';

    const rows = filteredData.map((r) => {
      const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
      return `<tr>
        <td>${r.name}</td>
        <td>${r.date}</td>
        <td>${r.type}</td>
        <td>${isBatch ? (r.chickenType || '-') : '-'}</td>
        <td>${r.qty || '-'}</td>
        <td>${Number(r.old).toLocaleString()}</td>
        <td>${Number(r.paid).toLocaleString()}</td>
        <td><b>${Number(r.remain).toLocaleString()}</b></td>
        <td>${r.note || '-'}</td>
      </tr>`;
    }).join('');

    const w = window.open('', '', 'height=800,width=1100');
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>كشف مبيعات</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        body { font-family: 'Cairo', sans-serif; padding: 30px; color: #1e293b; background: #fff; }
        .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; color: #1e293b; }
        .header p { margin: 4px 0; font-size: 13px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 6px; text-align: center; font-size: 12px; }
        th { background-color: #f1f5f9; color: #4f46e5; }
        .total-box { margin-top: 16px; background: #eef2ff; padding: 14px; border-radius: 12px; border-right: 8px solid #4f46e5; display:flex; justify-content: space-between; align-items:center; }
        .total-label { font-size: 16px; font-weight: 700; color: #1e293b; }
        .total-value { font-size: 22px; font-weight: 900; color: #4f46e5; }
        .footer { margin-top: 50px; display:flex; justify-content: space-between; }
        .sig-box { text-align: center; width: 180px; }
        .sig-line { margin-top: 40px; border-bottom: 1px dashed #64748b; }
        .seal-box { border: 2px solid #4f46e5; padding: 10px; border-radius: 10px; color: #4f46e5; font-weight: bold; margin-top: 10px; }
      </style></head><body>
      <div class="header">
        <h1>كشف مبيعات واستلام</h1>
        <p>الموزع: <strong>${title}</strong> · من: ${from || '---'} إلى: ${to || '---'}</p>
        <p>Live Net لخدمات الإنترنت · ${dateStr} — ${timeStr}</p>
      </div>
      <table>
        <thead><tr>
          <th>الموزع</th><th>التاريخ</th><th>النوع</th><th>نوع فرخ انترنت</th><th>العدد</th><th>سابق</th><th>مدفوع</th><th>الرصيد</th><th>ملاحظات</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total-box">
        <span class="total-label">إجمالي الدين الحالي المطلوب:</span>
        <span class="total-value">${Math.round(currentDebt).toLocaleString()} ₪</span>
      </div>
      <div class="footer">
        <div class="sig-box"><p>توقيع المستلم</p><div class="sig-line"></div></div>
        <div class="sig-box"><p>ختم وتوقيع الإدارة</p><div class="seal-box">LIVE NET OFFICIAL</div></div>
      </div>
      <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
      </body></html>`);
    w.document.close();
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="card-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            أدوات التقارير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-1">
              <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1">
                <Search className="w-3 h-3" /> اسم الموزع
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الموزع..." className="h-10 bg-slate-50" />
            </div>
            <div>
              <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalendarDays className="w-3 h-3" /> من تاريخ</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 bg-slate-50" />
            </div>
            <div className="relative">
              <Label className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-1"><CalendarDays className="w-3 h-3" /> إلى تاريخ</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 bg-slate-50" />
              {(name || from || to) && (
                <button onClick={() => { setName(''); setFrom(''); setTo(''); }} className="absolute left-2 bottom-2 text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 rounded-md px-2 py-1 hover:bg-rose-100" style={{ transition: 'background-color .2s' }}>
                  <X className="w-3 h-3" /> مسح
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setDailyOpen(true)} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">
              <CalendarClock className="w-4 h-4 ml-2" /> إغلاق اليوم
            </Button>
            <Button onClick={printPDF} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold">
              <Printer className="w-4 h-4 ml-2" /> طباعة كشف PDF
            </Button>
            <Button onClick={downloadBackup} variant="outline" className="rounded-xl font-bold border-slate-200">
              <Download className="w-4 h-4 ml-2" /> نسخة احتياطية
            </Button>
            <Button onClick={() => fileInput.current?.click()} variant="outline" className="rounded-xl font-bold border-slate-200">
              <Upload className="w-4 h-4 ml-2" /> استعادة
            </Button>
            <input ref={fileInput} type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            نتائج البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable hideFilters nameFilter={name} fromFilter={from} toFilter={to} />
        </CardContent>
      </Card>

      <Dialog open={dailyOpen} onOpenChange={setDailyOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
              <CalendarClock className="w-5 h-5 text-violet-600" /> ملخص حركة اليوم
            </DialogTitle>
            <DialogDescription>نظرة سريعة على عمليات يوم {todayStr}</DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-indigo-500 to-violet-500 shadow">
            <div className="text-xs opacity-90 font-bold">إجمالي فروخ انترنت المباعة</div>
            <div className="text-3xl font-black num-ar mt-1">{todayMetrics.chicks.toLocaleString()} <span className="text-sm opacity-85">فرخ انترنت</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">المبيعات</div>
                <div className="font-extrabold text-emerald-700 num-ar">{todayMetrics.sales.toLocaleString()} ₪</div>
              </div>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">المقبوضات</div>
                <div className="font-extrabold text-sky-700 num-ar">{todayMetrics.paid.toLocaleString()} ₪</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <Package className="w-4 h-4" /> صافي ديون اليوم
            </div>
            <div className="text-lg font-extrabold num-ar text-rose-700">{(todayMetrics.sales - todayMetrics.paid).toLocaleString()} ₪</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDailyOpen(false)}>إغلاق</Button>
            <Button onClick={printPDF} className="bg-indigo-600 hover:bg-indigo-700"><Printer className="w-4 h-4 ml-2" /> طباعة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
