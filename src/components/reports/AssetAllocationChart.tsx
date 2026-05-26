'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactCurrency } from '../../lib/finance/formatters';
import { ReportEmptyState } from './ReportEmptyState';

const COLORS: Record<string, string> = {
  'Cash': '#f59e0b',
  'Bank accounts': '#0f172a',
  'Pockets': '#6366f1',
  'E-wallets': '#10b981',
  'Investments': '#8b5cf6',
  'Deposits': '#06b6d4',
};
const DEFAULT_COLORS = ['#ec4899', '#84cc16', '#14b8a6'];

interface AssetAllocationChartProps {
  data: { name: string; value: number }[];
  total: number;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ data, total }) => {
  if (data.length === 0) return <ReportEmptyState message="No asset data available." />;

  let defaultIdx = 0;
  const getColor = (name: string) => COLORS[name] ?? DEFAULT_COLORS[defaultIdx++ % DEFAULT_COLORS.length];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCompactCurrency(Number(value ?? 0), 'IDR'), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Assets</p>
          <p className="text-base font-black text-[#0b1c30] leading-tight">
            {formatCompactCurrency(total, 'IDR')}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {data.map((item) => {
          const color = getColor(item.name);
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="font-semibold text-slate-600 flex-1 truncate">{item.name}</span>
              <span className="font-bold text-[#0b1c30] shrink-0">
                {formatCompactCurrency(item.value, 'IDR')}
              </span>
              <span className="text-slate-400 font-semibold w-8 text-right shrink-0">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
