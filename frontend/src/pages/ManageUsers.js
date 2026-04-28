import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref as dbRef, onValue, update, remove } from 'firebase/database';
import { useData } from '../context/DataContext';
import {
  Users,
  Shield,
  Briefcase,
  BookOpen,
  Trash2,
  Pencil,
  CheckCircle2,
  X,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const ROLES = [
  {
    value: 'admin',
    label: 'مسؤول',
    desc: 'صلاحيات كاملة',
    icon: Shield,
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-300 dark:border-rose-700',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    textColor: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
    ring: 'ring-2 ring-rose-400',
  },
  {
    value: 'manager',
    label: 'مدير',
    desc: 'إضافة وتعديل',
    icon: Briefcase,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-300 dark:border-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    ring: 'ring-2 ring-amber-400',
  },
  {
    value: 'reader',
    label: 'قارئ',
    desc: 'عرض فقط',
    icon: BookOpen,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-300 dark:border-emerald-700',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    ring: 'ring-2 ring-emerald-400',
  },
];

function getRoleInfo(roleValue) {
  return ROLES.find((r) => r.value === roleValue) || ROLES[2];
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ManageUsers() {
  const { auth, userRole } = useData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const usersRef = dbRef(db, 'users');
    const unsub = onValue(usersRef, (snap) => {
      const val = snap.val();
      const list = val
        ? Object.entries(val).map(([uid, data]) => ({ uid, ...data }))
        : [];
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function startEdit(user) {
    setEditingId(user.uid);
    setEditRole(user.role || 'reader');
    setEditName(user.displayName || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditRole('');
    setEditName('');
  }

  async function saveEdit(uid) {
    setSavingId(uid);
    try {
      await update(dbRef(db, `users/${uid}`), {
        displayName: editName.trim(),
        role: editRole,
      });
      toast.success('تم تحديث بيانات الحساب بنجاح ✅');
      cancelEdit();
    } catch (err) {
      toast.error('حدث خطأ أثناء التحديث');
    }
    setSavingId(null);
  }

  async function confirmDelete(uid) {
    setDeletingId(uid);
    try {
      // الخطوة 1: حذف من Firebase Authentication عبر الـ backend أولاً
      const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:8001`;

      let authDeleted = false;
      try {
        const res = await fetch(`${backendUrl}/api/users/${uid}`, { method: 'DELETE' });
        if (res.ok) {
          authDeleted = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          // إذا المستخدم غير موجود في Auth أصلاً، نعتبره محذوفاً
          if (res.status === 404) {
            authDeleted = true;
          } else {
            toast.error(`فشل حذف تسجيل الدخول: ${errData.detail || 'خطأ من السيرفر'}`);
            setDeletingId(null);
            setConfirmDeleteId(null);
            return;
          }
        }
      } catch (networkErr) {
        toast.error('تعذّر الاتصال بالسيرفر. تأكد من تشغيل الـ Backend وإعداد FIREBASE_SERVICE_ACCOUNT_KEY');
        setDeletingId(null);
        setConfirmDeleteId(null);
        return;
      }

      // الخطوة 2: بعد نجاح حذف Authentication، احذف من Realtime Database
      if (authDeleted) {
        await remove(dbRef(db, `users/${uid}`));
        toast.success('تم حذف الحساب نهائياً من Firebase Authentication وقاعدة البيانات ✅');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف: ' + (err.message || ''));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-full p-4 sm:p-8 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-semibold">هذه الصفحة للمسؤول فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">إدارة الحسابات</h1>
              <p className="text-sm text-slate-500">عرض وتعديل وحذف الحسابات المنشأة</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>تسجيل دخول حالي: <span className="font-bold">{auth?.email}</span> · يمكنك تعديل أدوار الحسابات أو حذفها.</span>
          </div>
        </div>

        {/* Content */}
        <div className="card-soft p-6 animate-fade-up">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-400">جاري تحميل الحسابات...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="w-12 h-12 text-slate-200 dark:text-slate-700" />
              <p className="text-slate-400 text-sm">لا توجد حسابات منشأة حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const isEditing = editingId === user.uid;
                const isCurrentUser = auth?.uid === user.uid;

                return (
                  <div
                    key={user.uid}
                    className={[
                      'rounded-2xl border transition-all duration-200',
                      isEditing
                        ? roleInfo.bg + ' ' + roleInfo.border
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
                    ].join(' ')}
                  >
                    {/* Card main row */}
                    <div className="flex items-center gap-4 p-4">
                      {/* Role icon */}
                      <div className={['w-11 h-11 rounded-xl flex items-center justify-center shrink-0', roleInfo.iconBg].join(' ')}>
                        <RoleIcon className={['w-5 h-5', roleInfo.iconColor].join(' ')} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {user.displayName || '—'}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold">أنت</span>
                          )}
                          <span className={['text-[11px] px-2 py-0.5 rounded-full font-bold', roleInfo.badgeBg].join(' ')}>
                            {roleInfo.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          أُنشئ بواسطة: <span className="font-medium">{user.createdBy || '—'}</span> · {formatDate(user.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(user)}
                            className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => setConfirmDeleteId(user.uid)}
                              className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Edit panel */}
                    {isEditing && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
                        {/* Edit name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الاسم</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>

                        {/* Role selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">نوع الحساب</label>
                          <div className="grid grid-cols-3 gap-2">
                            {ROLES.map((r) => {
                              const Icon = r.icon;
                              const isSelected = editRole === r.value;
                              return (
                                <button
                                  key={r.value}
                                  type="button"
                                  onClick={() => setEditRole(r.value)}
                                  className={[
                                    'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center cursor-pointer transition-all duration-200',
                                    isSelected
                                      ? r.bg + ' ' + r.border + ' ' + r.ring
                                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300',
                                  ].join(' ')}
                                >
                                  {isSelected && (
                                    <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center">
                                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 12 12" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="2,6.5 5,9.5 10,3" />
                                      </svg>
                                    </span>
                                  )}
                                  <span className={['w-8 h-8 rounded-lg flex items-center justify-center', isSelected ? r.iconBg : 'bg-slate-100 dark:bg-slate-700'].join(' ')}>
                                    <Icon className={['w-4 h-4', isSelected ? r.iconColor : 'text-slate-400'].join(' ')} />
                                  </span>
                                  <span className={['text-xs font-extrabold', isSelected ? r.textColor : 'text-slate-600 dark:text-slate-300'].join(' ')}>
                                    {r.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={() => saveEdit(user.uid)}
                            disabled={savingId === user.uid}
                            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200"
                          >
                            {savingId === user.uid ? (
                              <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                جاري الحفظ...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                حفظ التعديلات
                              </span>
                            )}
                          </Button>
                          <button
                            onClick={cancelEdit}
                            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete confirm panel */}
                    {confirmDeleteId === user.uid && (
                      <div className="px-4 pb-4 border-t border-rose-200 dark:border-rose-800/60 pt-4 bg-rose-50/60 dark:bg-rose-900/10 rounded-b-2xl">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">تأكيد الحذف</p>
                            <p className="text-xs text-rose-500 mt-0.5">
                              سيتم حذف بيانات الحساب من قاعدة البيانات. لن يستطيع المستخدم الدخول بعد ذلك.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmDelete(user.uid)}
                            disabled={deletingId === user.uid}
                            className="flex-1 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                          >
                            {deletingId === user.uid ? (
                              <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                جاري الحذف...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                نعم، احذف
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Count */}
        {!loading && users.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            إجمالي الحسابات: <span className="font-bold text-slate-600 dark:text-slate-300">{users.length}</span>
          </p>
        )}
      </div>
    </div>
  );
}
