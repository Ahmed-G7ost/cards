import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { Wallet, Network, TrendingUp, Coins, ArrowUpRight, Package, Users, CalendarCheck2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { records, distributors, metrics } = useData();

  const recent = useMemo(() => [...records].sort((a, b) => b.ts - a.ts).slice(0, 8), [records]);

  const topDistributors = useMemo(
    () => [...distributors].filter((d) => d.debt > 0).slice(0, 6),
    [distributors]
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMetrics = useMemo(() => {
    let sales = 0, paid = 0, chicks = 0, count = 0;
    records.forEach((r) => {
      if (r.date === todayStr) {
        count++;
        sales += (Number(r.qty) || 0) * (Number(r.price) || 0);
        paid += Number(r.paid) || 0;
        if (r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'))) {
          chicks += Number(r.qty) || 0;
        }
      }
    });
    return { sales, paid, chicks, count };
  }, [records, todayStr]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Network}
          label="إجمالي ديون الشبكة"
          value={metrics.networkDebt}
          suffix="₪"
          gradient="from-indigo-500 via-indigo-500 to-violet-500"
          trend={6}
        />
        <StatCard
          icon={TrendingUp}
          label="إجمالي المبيعات"
          value={metrics.totalSales}
          suffix="₪"
          gradient="from-emerald-500 to-teal-500"
          trend={8}
        />
        <StatCard
          icon={Coins}
          label="صافي الأرباح"
          value={metrics.netProfit}
          suffix="₪"
          gradient="from-rose-500 to-pink-500"
          trend={4}
        />
        <StatCard
          icon={Wallet}
          label="إجمالي المقبوضات"
          value={metrics.totalPaid}
          suffix="₪"
          gradient="from-amber-500 to-orange-500"
          trend={-2}
        />
      </div>

      {/* Today summary + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card-soft p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">أداء المبيعات الأسبوعي</h3>
              <p className="text-xs text-slate-500 mt-1">إجمالي قيمة الفروخ المباعة خلال آخر 7 أيام</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> المبيعات
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> المقبوضات
              </span>
            </div>
          </div>
          <SalesChart records={records} />
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900">ملخص اليوم</h3>
            <CalendarCheck2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            <MiniRow icon={Package} label="فروخ مباعة" value={`${todayMetrics.chicks}`} accent="indigo" />
            <MiniRow icon={TrendingUp} label="قيمة المبيعات" value={`${todayMetrics.sales.toLocaleString()} ₪`} accent="emerald" />
            <MiniRow icon={Wallet} label="المقبوضات" value={`${todayMetrics.paid.toLocaleString()} ₪`} accent="amber" />
            <MiniRow icon={ArrowUpRight} label="عدد العمليات" value={`${todayMetrics.count}`} accent="rose" />
          </div>
          <Link to="/operations" className="mt-5 inline-flex items-center justify-center w-full gap-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold py-2.5 text-sm hover:bg-indigo-100" style={{ transition: 'background-color .2s' }}>
            تسجيل عملية جديدة <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top distributors + recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900">أعلى الموزعين مديونية</h3>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2.5">
            {topDistributors.length === 0 && <Empty label="لا توجد ديون حالياً" />}
            {topDistributors.map((d, i) => {
              const max = topDistributors[0]?.debt || 1;
              const pct = Math.max(4, Math.round((d.debt / max) * 100));
              return (
                <div key={d.name} className="rounded-xl border border-slate-100 p-3 hover:border-indigo-100 hover:bg-indigo-50/40" style={{ transition: 'background-color .2s, border-color .2s' }}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">{i + 1}</div>
                      <div>
                        <div className="font-bold text-slate-800">{d.name}</div>
                        <div className="text-[11px] text-slate-500">آخر عملية: {d.lastDate}</div>
                      </div>
                    </div>
                    <div className="text-rose-600 font-extrabold num-ar">{d.debt.toLocaleString()} ₪</div>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-2 card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900">آخر العمليات</h3>
            <Link to="/operations" className="text-xs text-indigo-600 font-bold hover:text-indigo-800" style={{ transition: 'color .2s' }}>عرض الكل</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recent.length === 0 && <Empty label="لا توجد عمليات بعد" />}
            {recent.map((r) => {
              const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
              return (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isBatch ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {isBatch ? <Package className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.date} · {isBatch ? `${r.qty} فرخ · ${r.chickenType}` : `دفعة ${Number(r.paid).toLocaleString()} ₪`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={isBatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}>
                      {isBatch ? 'استلام' : 'دفعة'}
                    </Badge>
                    <div className="text-sm font-extrabold num-ar text-rose-600">{Number(r.remain).toLocaleString()} ₪</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRow({ icon: Icon, label, value, accent = 'indigo' }) {
  const map = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-600 font-semibold">{label}</span>
      </div>
      <div className="font-extrabold text-slate-900 num-ar">{value}</div>
    </div>
  );
}

function Empty({ label }) {
  return <div className="py-8 text-center text-sm text-slate-500">{label}</div>;
}
