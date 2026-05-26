'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCompactCurrency, formatIDR } from '../../lib/finance/formatters';
import { CashflowReportData } from '../../lib/finance/reportData';
import { ReportEmptyState } from './ReportEmptyState';

interface CashflowChartProps {
  data: CashflowReportData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-[10px]">
      <p className="font-extrabold text-slate-800 mb-1">{label}</p>
      <p style={{ color: payload[0]?.fill }} className="font-semibold">
        {formatCompactCurrency(Math.abs(payload[0]?.value ?? 0), 'IDR')}
      </p>
    </div>
  );
};

export const CashflowChart: React.FC<CashflowChartProps> = ({ data }) => {
  if (data.income === 0 && data.expense === 0) {
    return <ReportEmptyState message="No income or expense transactions this month." />;
  }

  const isNetPositive = data.net >= 0;

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="h-44 w-full text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.bars} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="35%">
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
              tickFormatter={(v) => formatCompactCurrency(Math.abs(v), 'IDR')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.bars.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-emerald-50 rounded-xl py-2">
          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">Income</p>
          <p className="font-black text-emerald-700">{formatCompactCurrency(data.income, 'IDR')}</p>
        </div>
        <div className="bg-rose-50 rounded-xl py-2">
          <p className="text-[8px] font-bold text-rose-500 uppercase tracking-wider">Expenses</p>
          <p className="font-black text-rose-700">{formatCompactCurrency(data.expense, 'IDR')}</p>
        </div>
        <div className={`${isNetPositive ? 'bg-indigo-50' : 'bg-amber-50'} rounded-xl py-2`}>
          <p className={`text-[8px] font-bold ${isNetPositive ? 'text-indigo-500' : 'text-amber-500'} uppercase tracking-wider`}>
            Net
          </p>
          <p className={`font-black ${isNetPositive ? 'text-indigo-700' : 'text-amber-700'}`}>
            {data.net < 0 ? '-' : '+'}{formatCompactCurrency(Math.abs(data.net), 'IDR')}
          </p>
        </div>
      </div>
    </div>
  );
};
