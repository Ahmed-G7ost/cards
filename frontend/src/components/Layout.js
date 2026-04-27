import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useData } from '../context/DataContext';

export default function Layout() {
  const { auth } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitleMap = {
    '/': { title: 'لوحة التحكم', subtitle: 'نظرة سريعة على أداء الشبكة' },
    '/operations': { title: 'العمليات', subtitle: 'تسجيل طبعات الفروخ والدفعات المالية' },
    '/distributors': { title: 'الموزعون', subtitle: 'قائمة الموزعين وملخص الديون' },
    '/reports': { title: 'التقارير', subtitle: 'كشوف مفصلة وإغلاقات يومية' },
    '/settings': { title: 'الإعدادات', subtitle: 'ضبط تكلفة الفرخ، النسخ الاحتياطي والاستثناءات' },
  };
  const page = pageTitleMap[location.pathname] || pageTitleMap['/'];

  return (
    <div className="min-h-screen flex bg-[#f6f7fb] dark:bg-[#0f1117]" dir="rtl">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar title={page.title} subtitle={page.subtitle} user={auth} onLogout={() => navigate('/login')} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="p-5 md:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </div>
        <footer className="mt-auto px-8 py-6 text-xs text-slate-500 dark:text-slate-600 border-t border-slate-200/70 dark:border-slate-700/70 bg-white/40 dark:bg-slate-900/40">
          © {new Date().getFullYear()} لايف نت — جميع الحقوق محفوظة · نظام إدارة مبيعات الفروخ
        </footer>
      </main>
    </div>
  );
}
