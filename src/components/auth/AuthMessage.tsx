import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthMessageProps {
  message: string;
  type?: 'error' | 'success';
}

export function AuthMessage({ message, type = 'error' }: AuthMessageProps) {
  if (!message) return null;

  const isError = type === 'error';
  
  return (
    <div 
      className={`flex items-start space-x-2 p-3 rounded-[8px] text-[13px] leading-snug
        ${isError ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#6cf8bb] text-[#00714d]'}`}
    >
      <div className="shrink-0 mt-0.5">
        {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      </div>
      <div>{message}</div>
    </div>
  );
}
