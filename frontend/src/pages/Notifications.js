import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Bell, BellOff, CheckCheck, Trash2, AlertCircle, CheckCircle2, Info, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
}

const TYPE_CONFIG = {
  debt: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-800', badge: 'bg-rose-100 text-rose-700' },
  payment: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
  info: { icon: Info, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-100 dark:border-sky-800', badge: 'bg-sky-100 text-sky-700' },
  trend: { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800', badge: 'bg-indigo-100 text-indigo-700' },
};

export default function Notifications() {
  const { notifications, markNotificationRead, deleteNotification, markAllNotificationsRead } = useData();
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
    } catch (err) {
      toast.error('فشل التحديث');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      toast.success('تم حذف الإشعار');
    } catch (err) {
      toast.error('فشل الحذف');
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      toast.success('تم تعليم الكل كمقروء');
    } catch (err) {
      toast.error('فشل التحديث');
    }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="card-soft border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              الإشعارات
              {unreadCount > 0 && (
                <Badge className="bg-rose-100 text-rose-700 border border-rose-200 font-bold">
                  {unreadCount} جديد
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAll} className="rounded-xl font-bold text-xs h-9 px-3">
                  <CheckCheck className="w-3.5 h-3.5 ml-1.5" /> تعليم الكل كمقروء
                </Button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-3">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'unread', label: 'غير مقروء' },
              { key: 'read', label: 'مقروء' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  'px-4 py-1.5 rounded-xl text-xs font-bold border',
                  filter === f.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700',
                ].join(' ')}
                style={{ transition: 'background-color .2s, color .2s' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
              <BellOff className="w-10 h-10 opacity-30" />
              <div className="font-semibold">لا توجد إشعارات</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={[
                      'relative rounded-2xl border p-4 flex items-start gap-3',
                      cfg.bg, cfg.border,
                      !n.read ? 'ring-1 ring-inset ring-indigo-100 dark:ring-indigo-800' : 'opacity-75',
                    ].join(' ')}
                    style={{ transition: 'opacity .2s' }}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-indigo-500" />
                    )}

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{n.title || 'إشعار'}</div>
                          {n.body && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{n.body}</div>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1">{timeAgo(n.ts)}</div>
                        </div>
                        <Badge className={`shrink-0 text-[10px] font-bold border-0 ${cfg.badge}`}>
                          {n.type === 'debt' ? 'ديون' : n.type === 'payment' ? 'دفعة' : n.type === 'trend' ? 'تقرير' : 'معلومة'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                          title="تعليم كمقروء"
                          style={{ transition: 'background-color .2s' }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-rose-500 hover:bg-rose-50"
                        title="حذف"
                        style={{ transition: 'background-color .2s' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
