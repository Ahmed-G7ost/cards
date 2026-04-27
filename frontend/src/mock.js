// Mock initial data for Live Net Management System
// هذه بيانات وهمية للتجربة - سيتم ربطها مع قاعدة بيانات لاحقاً

const names = [
  'أحمد الحمد', 'محمد العلي', 'ياسر أبو زيد', 'خالد السالم', 'عمر القاسم',
  'فادي الجابر', 'سامر الخطيب', 'بلال شاهين', 'رامي النجار', 'هشام المصري'
];

const chickenTypes = ['8 ساعات', '10 ساعات', '24 ساعة'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function seedRecords() {
  const records = [];
  let idCounter = 1;

  names.forEach((name, idx) => {
    let debt = 0;
    // Add 3-5 batches per distributor
    const batchCount = 3 + (idx % 3);
    for (let i = 0; i < batchCount; i++) {
      const qty = 5 + Math.floor(Math.random() * 15);
      const price = 90;
      const old = debt;
      const amount = qty * price;
      debt = old + amount;
      records.push({
        id: `rec_${idCounter++}`,
        name,
        type: `طبعة (${100 + i})`,
        opType: 'طبعة',
        chickenType: chickenTypes[i % 3],
        date: daysAgo(20 - i * 3 - idx),
        batch: 100 + i,
        qty,
        price,
        old,
        paid: 0,
        remain: debt,
        note: i === 0 ? 'دفعة أولى' : '',
        ts: Date.now() - (20 - i * 3 - idx) * 86400000,
      });

      // Sometimes add a payment
      if (i < batchCount - 1 && Math.random() > 0.4) {
        const paid = Math.min(debt, Math.floor(Math.random() * debt * 0.7) + 200);
        const remain = debt - paid;
        records.push({
          id: `rec_${idCounter++}`,
          name,
          type: 'دفعة مالية',
          opType: 'دفعة',
          chickenType: '-',
          date: daysAgo(20 - i * 3 - idx - 1),
          batch: 0,
          qty: 0,
          price: 0,
          old: debt,
          paid,
          remain,
          note: 'تسديد',
          ts: Date.now() - (20 - i * 3 - idx - 1) * 86400000,
        });
        debt = remain;
      }
    }
  });

  return records.sort((a, b) => b.ts - a.ts);
}

export const initialRecords = seedRecords();

export const initialUser = {
  email: 'admin@livenet.ps',
  password: 'admin123',
  name: 'مدير النظام',
};

export const companyInfo = {
  name: 'لايف نت',
  nameEn: 'Live Net',
  tagline: 'لخدمات الإنترنت وإدارة مبيعات الفروخ',
  owner: 'الإدارة العامة',
  phone: '0599-000000',
};
