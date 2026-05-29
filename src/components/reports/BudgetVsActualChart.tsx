'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatCompactCurrency } from '../../lib/finance/formatters';
import { BudgetVsActualItem } from '../../lib/finance/reportData';
import { ReportEmptyState } from './ReportEmptyState';
import { useApp } from '../../context/AppContext';

interface BudgetVsActualChartProps {
  data: BudgetVsActualItem[];
}

const CustomTooltip = ({ active, payload, label, showAmounts }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-[10px]">
      <p className="font-extrabold text-slate-800 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {showAmounts ? formatCompactCurrency(p.value ?? 0, 'IDR') : '••••••'}
        </p>
      ))}
    </div>
  );
};

export const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ data }) => {
  const { showAmounts } = useApp();
  const hasData = data.some((d) => d.planned > 0 || d.actual > 0);
  if (!hasData) return <ReportEmptyState message="No budget data for this month." />;

  return (
    <div className="space-y-3">
      <div className="h-52 w-full text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tick={{ fontSize: 9, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => showAmounts ? formatCompactCurrency(v, 'IDR') : '••'}
            />
            <Tooltip content={<CustomTooltip showAmounts={showAmounts} />} />
            <Bar dataKey="planned" name="Planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isOverBudget ? '#f43f5e' : '#0f172a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + over-budget indicators */}
      <div className="flex items-center gap-4 text-[9px] font-semibold text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-slate-200 inline-block" /> Planned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-[#0f172a] inline-block" /> Actual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" /> Over budget
        </span>
      </div>

      {data.filter((d) => d.isOverBudget).map((d) => (
        <div
          key={d.name}
          className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-[10px]"
        >
          <span className="text-rose-500 font-extrabold">⚠</span>
          <span className="text-rose-700 font-semibold">
            {d.name} exceeded by{' '}
            <strong>{showAmounts ? formatCompactCurrency(d.actual - d.planned, 'IDR') : '••••••'}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};
