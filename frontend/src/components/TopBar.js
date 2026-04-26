import React from 'react';
import { Bell, User2, LogOut, Moon, Sun } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useDarkMode } from '../context/DarkModeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export default function TopBar({ title, subtitle, user, onLogout }) {
  const { logout, metrics } = useData();
  const { dark, toggle } = useDarkMode();

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleLogout() {
    logout();
    toast.success('تم تسجيل الخروج');
    onLogout?.();
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/70">
      <div className="flex items-center gap-4 px-5 md:px-8 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
            <Badge variant="secondary" className="hidden md:inline-flex bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 font-bold">
              {today}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex-1" />



        <button
          onClick={toggle}
          className="relative w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
          style={{ transition: 'background-color .2s' }}
          title={dark ? 'وضع نهاري' : 'وضع ليلي'}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className="relative w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
          style={{ transition: 'background-color .2s' }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              style={{ transition: 'background-color .2s, border-color .2s' }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold">
                {user?.name?.slice(0, 1) || 'A'}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'مسؤول'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email || ''}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User2 className="w-4 h-4 ml-2" /> الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-700 focus:bg-rose-50">
              <LogOut className="w-4 h-4 ml-2" /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
