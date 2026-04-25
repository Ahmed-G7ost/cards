import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useData } from '../context/DataContext';

export default function Layout() {
  const { auth } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitleMap = {
    '/': { title: 'لوحة التحكم', subtitle: 'نظرة سريعة على أداء الشبكة' },
    '/operations': { title: 'العمليات', subtitle: 'تسجيل طبعات الفروخ والدفعات المالية' },
    '/distributors': { title: 'الموزعون', subtitle: 'قائمة الموزعين وملخص الديون' },
    '/reports': { title: 'التقارير', subtitle: 'كشوف مفصلة وإغلاقات يومية' },
    '/settings': { title: 'الإعدادات', subtitle: 'ضبط تكلفة الفرخ، النسخ الاحتياطي والاستثناءات' },
  };
  const page = pageTitleMap[location.pathname] || pageTitleMap['/'];

  return (
    <div className="min-h-screen flex bg-[#f6f7fb]" dir="rtl">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar title={page.title} subtitle={page.subtitle} user={auth} onLogout={() => navigate('/login')} />
        <div className="p-5 md:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </div>
        <footer className="mt-auto px-8 py-6 text-xs text-slate-500 border-t border-slate-200/70 bg-white/40">
          © {new Date().getFullYear()} لايف نت — جميع الحقوق محفوظة · نظام إدارة مبيعات الفروخ
        </footer>
      </main>
    </div>
  );
}
