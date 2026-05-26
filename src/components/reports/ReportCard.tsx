'use client';
import React from 'react';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-ambient p-5 space-y-4">
    <div>
      <h3 className="text-xs font-extrabold text-[#0b1c30] tracking-tight">{title}</h3>
      {subtitle && (
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
          {subtitle}
        </span>
      )}
    </div>
    {children}
  </div>
);
