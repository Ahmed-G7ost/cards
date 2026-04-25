import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users2,
  FileBarChart2,
  Settings2,
  LogOut,
  Waves,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';

const items = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/operations', label: 'العمليات', icon: Receipt },
  { to: '/distributors', label: 'الموزعون', icon: Users2 },
  { to: '/reports', label: 'التقارير', icon: FileBarChart2 },
  { to: '/settings', label: 'الإعدادات', icon: Settings2 },
];

export default function Sidebar() {
  const { logout, metrics } = useData();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  }

  return (
    <aside className="w-[260px] shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-slate-800 sidebar-shadow">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/50">
            <Waves className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-50 text-lg leading-tight">لايف نت</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wide">Live Net · Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold',
                'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
                isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : '',
              ].join(' ')
            }
            style={{ transition: 'background-color .2s, color .2s' }}
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      isActive
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-indigo-900/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>{label}</span>
                </span>
                {isActive && <span className="w-1.5 h-6 rounded-full bg-indigo-600" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Stat */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500 to-violet-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 shimmer pointer-events-none" />
          <div className="text-xs opacity-90 mb-1">إجمالي ديون الشبكة</div>
          <div className="text-2xl font-black num-ar">{metrics.networkDebt.toLocaleString()} ₪</div>
          <div className="text-[11px] opacity-80 mt-2">متابعة لحظية لوضع السوق</div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30"
          style={{ transition: 'background-color .2s' }}
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
