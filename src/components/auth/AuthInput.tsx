import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export function AuthInput({ label, icon, type, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 flex flex-col">
      <div className="flex justify-between items-end">
        <label className="text-[11px] font-semibold tracking-wider uppercase text-[#45464d]">
          {label}
        </label>
        {isPassword && (
          <button type="button" className="text-[11px] font-medium text-[#45464d] hover:text-[#0b1c30]">
            Forgot Password?
          </button>
        )}
      </div>
      <div 
        className={`relative flex items-center h-[48px] px-3 rounded-[8px] border transition-colors bg-white
          ${isFocused ? 'border-[#0f172a]' : 'border-[#e2e8f0]'}`}
      >
        {icon && (
          <div className={`mr-2 flex items-center justify-center transition-colors ${isFocused ? 'text-[#0b1c30]' : 'text-[#76777d]'}`}>
            {icon}
          </div>
        )}
        <input
          {...props}
          type={inputType}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          className="flex-1 w-full bg-transparent outline-none text-[14px] text-[#0b1c30] placeholder:text-[#76777d]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-[#76777d] hover:text-[#0b1c30] focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}
      </div>
    </div>
  );
}
