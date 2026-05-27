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
      iconClass: 'text-[#6cf8bb]', // Secondary Container light positive green
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-rose-400', // Destructive rose warning
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-400', // Amber warning
    },
    info: {
      icon: Info,
      iconClass: 'text-sky-400', // Info blue
    },
  }[type];

  const IconComponent = config.icon;

  return (
    <div 
      className="w-full max-w-[342px] mx-auto bg-[#0b1c30]/98 backdrop-blur-md border border-[#213145]/80 shadow-[0_12px_40px_rgba(0,0,0,0.22)] rounded-2xl p-4 flex items-center justify-between pointer-events-auto animate-slide-down transition-all duration-300 select-none"
    >
      <div className="flex items-center gap-3">
        <IconComponent size={18} className={`${config.iconClass} shrink-0`} />
        <span className="text-xs font-semibold text-[#eaf1ff] leading-snug">
          {message}
        </span>
      </div>
      <button 
        onClick={onClose}
        className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
