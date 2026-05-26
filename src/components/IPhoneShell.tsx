'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface IPhoneShellProps {
  children: React.ReactNode;
}

export const IPhoneShell: React.FC<IPhoneShellProps> = ({ children }) => {
  const [time, setTime] = useState('18:54');

  useEffect(() => {
    // Live status bar clock
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full md:w-[393px] md:h-[852px] md:rounded-[55px] md:ring-[12px] md:ring-slate-950 md:shadow-2xl md:border-[4px] md:border-slate-800 bg-background overflow-hidden flex flex-col transition-all duration-300">
      {/* iOS Status Bar (Desktop Simulator only) */}
      <div className="hidden md:flex absolute top-0 left-0 right-0 h-11 items-center justify-between px-8 text-xs font-semibold text-slate-900 select-none z-50 pointer-events-none">
        <span className="text-[14px] leading-none tracking-tight">{time}</span>
        
        {/* Dynamic Island */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[110px] h-[30px] bg-slate-950 rounded-full flex items-center justify-center transition-all duration-300 hover:w-[240px] hover:h-[35px]" />

        <div className="flex items-center gap-1.5 text-[14px]">
          <Signal size={14} className="stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-tighter">5G</span>
          <Wifi size={14} className="stroke-[2.5]" />
          <Battery size={20} className="stroke-[1.5] fill-slate-900" />
        </div>
      </div>

      {/* Notch spacer for mobile/simulator differences */}
      <div className="hidden md:block h-11 w-full bg-background" />

      {/* Main app body */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </div>

      {/* iOS Home Indicator Bar (Desktop Simulator only) */}
      <div className="hidden md:flex absolute bottom-1.5 left-0 right-0 h-5 justify-center items-center pointer-events-none z-50">
        <div className="w-[134px] h-[5px] bg-slate-900/40 rounded-full" />
      </div>
      <div className="hidden md:block h-5 w-full bg-background" />
    </div>
  );
};
