'use client';
import React from 'react';
import { BarChart2 } from 'lucide-react';

interface ReportEmptyStateProps {
  message?: string;
}

export const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({
  message = 'No data available for this period.',
}) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-300 select-none">
    <BarChart2 size={28} strokeWidth={1.5} />
    <span className="text-[10px] font-semibold text-slate-400 text-center">{message}</span>
  </div>
);
