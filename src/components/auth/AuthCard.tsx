import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm mx-auto p-[24px] bg-[#ffffff] rounded-[16px] shadow-ambient-lg flex flex-col space-y-6 z-10 relative border border-slate-50">
      <div className="text-center space-y-2">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] leading-[40px] text-[#0b1c30]">{title}</h1>
        {subtitle && <p className="text-[14px] leading-[20px] text-[#45464d] px-4">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
