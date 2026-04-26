import React from 'react';
import { Bell, Search, User2, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export default function TopBar({ title, subtitle, user, onLogout }) {
  const { logout, metrics } = useData();

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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
      <div className="flex items-center gap-4 px-5 md:px-8 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 truncate">{title}</h1>
            <Badge variant="secondary" className="hidden md:inline-flex bg-indigo-50 text-indigo-700 border-indigo-100 font-bold">
              {today}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 w-[340px]">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="ابحث عن موزع أو عملية..."
            className="border-none bg-transparent focus-visible:ring-0 h-8 px-1 text-sm"
          />
          <kbd className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">Ctrl K</kbd>
        </div>

        <button
          className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white"
          style={{ transition: 'background-color .2s' }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
              style={{ transition: 'background-color .2s, border-color .2s' }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold">
                {user?.name?.slice(0, 1) || 'A'}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'مسؤول'}</div>
                <div className="text-[11px] text-slate-500">{user?.email || ''}</div>
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
