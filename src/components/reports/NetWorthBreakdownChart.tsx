'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactCurrency, formatIDR } from '../../lib/finance/formatters';
import { NetWorthBreakdownItem } from '../../lib/finance/reportData';
import { ReportEmptyState } from './ReportEmptyState';

const COLORS = [
  '#0f172a', '#10b981', '#6366f1', '#f43f5e',
  '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899',
  '#14b8a6', '#84cc16',
];

interface NetWorthBreakdownChartProps {
  data: NetWorthBreakdownItem[];
  total: number;
}

export const NetWorthBreakdownChart: React.FC<NetWorthBreakdownChartProps> = ({ data, total }) => {
  if (data.length === 0) return <ReportEmptyState message="No accounts or holdings found." />;

  return (
    <div className="space-y-4">
      {/* Donut + total */}
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
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCompactCurrency(Number(value ?? 0), 'IDR'), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
          <p className="text-base font-black text-[#0b1c30] leading-tight">{formatIDR(total)}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-[10px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600 truncate">{item.name}</span>
                  {item.type === 'holding' && (
                    <span className="text-[7px] font-extrabold bg-violet-50 text-violet-500 px-1 rounded uppercase shrink-0">
                      Asset
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-slate-100 rounded-full mt-0.5 w-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
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
