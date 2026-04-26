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
  Bell,
  User2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';

export default function Sidebar() {
  const { logout, metrics, notifications } = useData();
  const navigate = useNavigate();
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const items = [
    { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { to: '/operations', label: 'العمليات', icon: Receipt },
    { to: '/distributors', label: 'الموزعون', icon: Users2 },
    { to: '/reports', label: 'التقارير', icon: FileBarChart2 },
    { to: '/notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
    { to: '/settings', label: 'الإعدادات', icon: Settings2 },
  ];

  function handleLogout() {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  }

  return (
    <aside className="w-[260px] shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-slate-700/70 sidebar-shadow">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-slate-100 dark:border-slate-700/70">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200">
            <Waves className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-tight">لايف نت</div>
            <div className="text-[11px] text-slate-500 tracking-wide">Live Net · Management</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold',
                'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
                isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm' : '',
              ].join(' ')
            }
            style={{ transition: 'background-color .2s, color .2s' }}
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      'w-9 h-9 rounded-lg flex items-center justify-center relative',
                      isActive
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:text-indigo-600',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" />
                    {badge > 0 && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
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
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/70">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500 to-violet-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 shimmer pointer-events-none" />
          <div className="text-xs opacity-90 mb-1">إجمالي ديون الشبكة</div>
          <div className="text-2xl font-black num-ar">{metrics.networkDebt.toLocaleString()} ₪</div>
          <div className="text-[11px] opacity-80 mt-2">متابعة لحظية لوضع السوق</div>
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl border ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`
          }
          style={{ transition: 'background-color .2s' }}
        >
          <User2 className="w-4 h-4" />
          الملف الشخصي
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl text-rose-600 border border-rose-100 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40"
          style={{ transition: 'background-color .2s' }}
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
