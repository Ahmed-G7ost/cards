import React, { useState } from 'react';
import OperationForm from '../components/OperationForm';
import TransactionsTable from '../components/TransactionsTable';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, ListChecks } from 'lucide-react';

export default function Operations() {
  const { records } = useData();
  const [editingRecord, setEditingRecord] = useState(null);

  return (
    <div className="space-y-6 animate-fade-up">
      <Card className="card-soft border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              {editingRecord ? 'تعديل عملية' : 'تسجيل عملية جديدة'}
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">قم بتسجيل توريد فروخ أو دفعة مالية من الموزع</p>
          </div>
          {editingRecord && (
            <Button variant="outline" onClick={() => setEditingRecord(null)}>إلغاء التعديل</Button>
          )}
        </CardHeader>
        <CardContent>
          <OperationForm editing={editingRecord} onDone={() => setEditingRecord(null)} />
        </CardContent>
      </Card>

      <Card className="card-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ListChecks className="w-4 h-4" />
            </div>
            سجل العمليات
            <span className="text-xs text-slate-400 font-semibold mr-2">({records.length.toLocaleString()})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable onEdit={(rec) => {
            setEditingRecord(rec);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
