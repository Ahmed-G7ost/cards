import React from 'react';

// Lightweight stat card used across the dashboard
export default function StatCard({ icon: Icon, label, value, suffix, trend, gradient = 'from-indigo-500 to-violet-500', accent = 'bg-white/15' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-md shadow-indigo-100`}>
      <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] opacity-90 font-semibold tracking-wide">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-black num-ar leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-sm opacity-85 mr-1">{suffix}</span>}
          </div>
          {trend != null && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 rounded-full px-2.5 py-1">
              {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {Math.abs(trend)}% عن الأسبوع الماضي
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${accent} flex items-center justify-center backdrop-blur`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
