import React, { useMemo } from 'react';

// Dual-series bar + line chart in pure SVG (no extra dependency)
export default function SalesChart({ records }) {
  const data = useMemo(() => {
    const days = 7;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      let sales = 0, paid = 0;
      records.forEach((r) => {
        if (r.date === iso) {
          sales += (Number(r.qty) || 0) * (Number(r.price) || 0);
          paid += Number(r.paid) || 0;
        }
      });
      out.push({ date: iso, sales, paid, label: d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' }) });
    }
    return out;
  }, [records]);

  const W = 720;
  const H = 260;
  const padding = { top: 20, right: 20, bottom: 36, left: 46 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => Math.max(d.sales, d.paid)));
  const step = chartW / data.length;
  const barW = Math.min(28, step * 0.42);

  const linePath = data
    .map((d, i) => {
      const x = padding.left + i * step + step / 2;
      const y = padding.top + chartH - (d.paid / max) * chartH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-x-auto scroll-thin">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[680px] h-[260px]">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {gridLines.map((g, i) => {
          const y = padding.top + chartH * (1 - g);
          return (
            <g key={i}>
              <line x1={padding.left} x2={padding.left + chartW} y1={y} y2={y} stroke="#eef0f5" strokeDasharray="3 4" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Cairo">
                {Math.round(max * g).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {data.map((d, i) => {
          const x = padding.left + i * step + step / 2 - barW / 2;
          const h = (d.sales / max) * chartH;
          const y = padding.top + chartH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx={barW / 3} fill="url(#barGrad)">
                <title>{d.sales.toLocaleString()} ₪</title>
              </rect>
              <text x={padding.left + i * step + step / 2} y={H - 14} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="Cairo">
                {d.label}
              </text>
            </g>
          );
        })}

        {/* area under line */}
        <path
          d={`${linePath} L ${padding.left + (data.length - 1) * step + step / 2} ${padding.top + chartH} L ${padding.left + step / 2} ${padding.top + chartH} Z`}
          fill="url(#areaGrad)"
        />
        {/* line */}
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

        {/* line dots */}
        {data.map((d, i) => {
          const x = padding.left + i * step + step / 2;
          const y = padding.top + chartH - (d.paid / max) * chartH;
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#10b981" stroke="#fff" strokeWidth="2" />;
        })}
      </svg>
    </div>
  );
}
