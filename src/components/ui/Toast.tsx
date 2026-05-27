'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Color configurations mapping perfectly to DESIGN.md tokens and visual intent
  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: 'text-emerald-500',
      borderClass: 'border-emerald-500/15',
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-rose-500',
      borderClass: 'border-rose-500/15',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-500',
      borderClass: 'border-amber-500/15',
    },
    info: {
      icon: Info,
      iconClass: 'text-slate-500',
      borderClass: 'border-slate-500/15',
    },
  }[type];

  const IconComponent = config.icon;

  return (
    <div 
      className={`w-full max-w-[340px] mx-auto bg-white/95 backdrop-blur-md border ${config.borderClass} shadow-ambient-lg rounded-2xl p-4 flex items-center justify-between pointer-events-auto animate-slide-down transition-all duration-300 select-none`}
    >
      <div className="flex items-center gap-3">
        <IconComponent size={18} className={`${config.iconClass} shrink-0`} />
        <span className="text-xs font-semibold text-[#0b1c30] leading-snug">
          {message}
        </span>
      </div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer shrink-0 ml-2"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
