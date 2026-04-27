import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  ref as dbRef,
  onValue,
  push,
  update,
  remove,
  set as dbSet,
} from 'firebase/database';

const DataContext = createContext(null);

const SETTINGS_KEY = 'livenet_settings_v1';

const defaultSettings = {
  cost: 25, // تكلفة الفرخ الواحد
  defaultPrice: 90,
  prices: {
    '8 ساعات': 90,
    '10 ساعات': 90,
    '24 ساعة': 135,
  },
  excluded: [], // موزعون مستثنون من إجمالي الشبكة
};

const DEFAULT_INTERNET_MSG = `السلام عليكم ورحمة الله،\nنُعلمكم باستلام طردة الفروخ الخاصة بكم بتاريخ {DATE}.\nالعدد: {QTY} فرخ | النوع: {TYPE}\nالسعر الإجمالي: {TOTAL} ₪ | الرصيد المستحق: {REMAIN} ₪\nشركة Live Net لخدمات الإنترنت 🌐`;

const DEFAULT_PAYMENT_MSG = `السلام عليكم ورحمة الله،\nتم استلام دفعتكم بتاريخ {DATE} وقيمتها {PAID} ₪.\nالرصيد المتبقي: {REMAIN} ₪\nشكراً لتعاملكم معنا 🙏\nشركة Live Net لخدمات الإنترنت`;

const DEFAULT_NOTIF_MSG = `السلام عليكم ورحمة الله،\nنُذكّركم بأن رصيدكم المستحق لدى شركة Live Net هو: {DEBT} ₪\nالموزع: {NAME} | التاريخ: {DATE}\nيُرجى التواصل لتسوية الرصيد.\nشركة Live Net لخدمات الإنترنت 🌐`;

export function DataProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [auth_, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed, prices: { ...defaultSettings.prices, ...(parsed.prices || {}) } };
      }
    } catch (_) {}
    return defaultSettings;
  });

  // أرقام الهواتف والرسائل من Firebase
  const [phones, setPhones] = useState({});
  const [internetMsg, setInternetMsg] = useState(DEFAULT_INTERNET_MSG);
  const [paymentMsg, setPaymentMsg] = useState(DEFAULT_PAYMENT_MSG);
  const [notifMsg, setNotifMsg] = useState(DEFAULT_NOTIF_MSG);
  const [notifications, setNotifications] = useState([]);

  // Persist settings locally (they are per-device UI settings)
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Watch Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser({ email: user.email, name: user.displayName || user.email?.split('@')[0] || 'مسؤول', uid: user.uid });
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firebase Realtime Database when authenticated
  useEffect(() => {
    if (!auth_) {
      setRecords([]);
      return;
    }
    setDataLoading(true);
    const distributorsRef = dbRef(db, 'distributors');
    const unsub = onValue(
      distributorsRef,
      (snap) => {
        const val = snap.val();
        const list = val
          ? Object.entries(val).map(([id, data]) => ({ id, ...data }))
          : [];
        // Ensure ts is a number
        list.forEach((r) => {
          r.ts = Number(r.ts) || 0;
        });
        setRecords(list.sort((a, b) => b.ts - a.ts));
        setDataLoading(false);
      },
      (err) => {
        console.error('DB error', err);
        setDataLoading(false);
      }
    );

    // تحميل أرقام الهواتف من Firebase
    const phonesRef = dbRef(db, 'config/phones');
    const unsubPhones = onValue(phonesRef, (snap) => {
      const val = snap.val();
      if (val) setPhones(val);
    });

    // تحميل نصوص الرسائل من Firebase
    const messagesRef = dbRef(db, 'config/messages');
    const unsubMessages = onValue(messagesRef, (snap) => {
      const val = snap.val();
      if (val) {
        if (val.internetMsg) setInternetMsg(val.internetMsg);
        if (val.paymentMsg) setPaymentMsg(val.paymentMsg);
        if (val.notifMsg) setNotifMsg(val.notifMsg);
      }
    });

    // تحميل الإشعارات من Firebase
    const notifRef = dbRef(db, 'notifications');
    const unsubNotif = onValue(notifRef, (snap) => {
      const val = snap.val();
      const list = val
        ? Object.entries(val).map(([id, data]) => ({ id, ...data }))
        : [];
      setNotifications(list.sort((a, b) => (b.ts || 0) - (a.ts || 0)));
    });

    return () => {
      unsub();
      unsubPhones();
      unsubMessages();
      unsubNotif();
    };
  }, [auth_]);

  // ===== Auth =====
  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (err) {
      let msg = 'فشل تسجيل الدخول';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = 'البريد أو كلمة المرور غير صحيحة';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'محاولات كثيرة، يرجى المحاولة لاحقاً';
      } else if (err?.code === 'auth/network-request-failed') {
        msg = 'تحقق من اتصال الإنترنت';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'صيغة البريد الإلكتروني غير صحيحة';
      }
      return { ok: false, message: msg };
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (_) {}
  }

  // ===== CRUD =====
  async function addRecord(data) {
    const clean = { ...data };
    delete clean.id;
    const distributorsRef = dbRef(db, 'distributors');
    const newRef = push(distributorsRef, clean);
    // Log the action
    try {
      const logsRef = dbRef(db, 'system_logs');
      push(logsRef, {
        action: 'إضافة',
        details: clean,
        user: auth_?.email || 'unknown',
        ts: Date.now(),
      });
    } catch (_) {}
    return newRef.key;
  }

  async function updateRecord(id, patch) {
    const clean = { ...patch };
    delete clean.id;
    const recRef = dbRef(db, `distributors/${id}`);
    await update(recRef, clean);
    try {
      const logsRef = dbRef(db, 'system_logs');
      push(logsRef, {
        action: 'تعديل',
        details: { id, ...clean },
        user: auth_?.email || 'unknown',
        ts: Date.now(),
      });
    } catch (_) {}
  }

  async function deleteRecord(id) {
    const recRef = dbRef(db, `distributors/${id}`);
    await remove(recRef);
    try {
      const logsRef = dbRef(db, 'system_logs');
      push(logsRef, {
        action: 'حذف',
        details: { id },
        user: auth_?.email || 'unknown',
        ts: Date.now(),
      });
    } catch (_) {}
  }

  async function bulkRenameDistributor(oldName, newName) {
    const updates = {};
    let count = 0;
    records.forEach((r) => {
      if (r.name === oldName) {
        updates[`distributors/${r.id}/name`] = newName;
        count++;
      }
    });
    if (count > 0) {
      await update(dbRef(db), updates);
    }
    return count;
  }

  async function restoreFromBackup(data) {
    if (!Array.isArray(data)) return 0;
    const updates = {};
    data.forEach((item) => {
      const clean = { ...item };
      const id = clean.id || push(dbRef(db, 'distributors')).key;
      delete clean.id;
      updates[`distributors/${id}`] = clean;
    });
    await update(dbRef(db), updates);
    return data.length;
  }

  async function resetData() {
    await dbSet(dbRef(db, 'distributors'), null);
  }

  // ===== حفظ أرقام الهواتف في Firebase =====
  async function savePhones(phonesData) {
    await dbSet(dbRef(db, 'config/phones'), phonesData);
    setPhones(phonesData);
  }

  // ===== حفظ نصوص الرسائل في Firebase =====
  async function saveMessages(msgs) {
    await dbSet(dbRef(db, 'config/messages'), msgs);
    if (msgs.internetMsg) setInternetMsg(msgs.internetMsg);
    if (msgs.paymentMsg) setPaymentMsg(msgs.paymentMsg);
    if (msgs.notifMsg !== undefined) setNotifMsg(msgs.notifMsg);
  }

  // ===== إضافة إشعار في Firebase =====
  async function addNotification(notif) {
    const notifRef = dbRef(db, 'notifications');
    await push(notifRef, { ...notif, ts: Date.now(), read: false });
  }

  // ===== تعليم إشعار كمقروء =====
  async function markNotificationRead(id) {
    await update(dbRef(db, `notifications/${id}`), { read: true });
  }

  // ===== حذف إشعار =====
  async function deleteNotification(id) {
    await remove(dbRef(db, `notifications/${id}`));
  }

  // ===== تعليم كل الإشعارات كمقروءة =====
  async function markAllNotificationsRead() {
    const updates = {};
    notifications.forEach((n) => {
      if (!n.read) updates[`notifications/${n.id}/read`] = true;
    });
    if (Object.keys(updates).length > 0) await update(dbRef(db), updates);
  }

  // ===== Derived =====
  const distributors = useMemo(() => {
    const map = new Map();

    // Group all records by distributor name
    records.forEach((r) => {
      if (!map.has(r.name)) {
        map.set(r.name, {
          name: r.name,
          ops: [],
        });
      }
      map.get(r.name).ops.push(r);
    });

    const result = [];
    map.forEach(({ name, ops }) => {
      // Sort operations by timestamp ascending (oldest first) to replay in order
      const sorted = [...ops].sort((a, b) => a.ts - b.ts);

      // Compute real debt by replaying all operations in chronological order:
      // - طبعة (batch/receive): adds qty * price to the debt
      // - دفعة (payment): subtracts the paid amount from the debt
      let debt = 0;
      sorted.forEach((r) => {
        const isBatch = r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'));
        if (isBatch) {
          const qty = Number(r.qty) || 0;
          const price = Number(r.price) || 0;
          debt += qty * price;
        } else {
          const paid = Number(r.paid) || 0;
          debt -= paid;
        }
      });

      // Get the most recent record for display metadata
      const latest = [...ops].sort((a, b) => b.ts - a.ts)[0];

      result.push({
        name,
        debt: Math.round(debt),
        lastDate: latest?.date || '',
        lastTs: latest?.ts || 0,
        recordsCount: ops.length,
      });
    });

    return result.sort((a, b) => b.debt - a.debt);
  }, [records]);

  const metrics = useMemo(() => {
    const cost = settings.cost || 50;
    let totalSales = 0;
    let netProfit = 0;
    let totalChicks = 0;
    let totalPaid = 0;

    records.forEach((r) => {
      if (r.opType === 'طبعة' || (r.type && r.type.includes('طبعة'))) {
        const qty = Number(r.qty) || 0;
        const price = Number(r.price) || 0;
        totalSales += qty * price;
        totalChicks += qty;
      }
      const paid = Number(r.paid) || 0;
      const price = Number(r.price) || 90;
      if (paid > 0 && price > 0) {
        const earnedQty = paid / price;
        netProfit += earnedQty * (price - cost);
      }
      totalPaid += paid;
    });

    const networkDebt = distributors
      .filter((d) => !settings.excluded.includes(d.name))
      .reduce((sum, d) => sum + (d.debt > 0 ? d.debt : 0), 0);

    return {
      totalSales: Math.round(totalSales),
      netProfit: Math.round(netProfit),
      totalChicks,
      totalPaid: Math.round(totalPaid),
      networkDebt: Math.round(networkDebt),
    };
  }, [records, settings, distributors]);

  const value = {
    records,
    auth: auth_,
    authLoading,
    dataLoading,
    login,
    logout,
    addRecord,
    updateRecord,
    deleteRecord,
    bulkRenameDistributor,
    restoreFromBackup,
    resetData,
    distributors,
    metrics,
    settings,
    setSettings,
    // Firebase phones & messages
    phones,
    savePhones,
    internetMsg,
    paymentMsg,
    saveMessages,
    DEFAULT_INTERNET_MSG,
    DEFAULT_PAYMENT_MSG,
    notifMsg,
    DEFAULT_NOTIF_MSG,
    // Notifications
    notifications,
    addNotification,
    markNotificationRead,
    deleteNotification,
    markAllNotificationsRead,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
