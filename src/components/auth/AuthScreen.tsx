import React, { useState } from 'react';
import { AuthCard } from './AuthCard';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { APP_CONFIG } from '../../lib/appConfig';

function PockitLogo({ size = 48 }: { size?: number }) {
  return (
    <div 
      className="overflow-hidden flex items-center justify-center shrink-0 animate-fade-in" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    >
      <img 
        src="/transparent-icon.png"
        alt="Pockit Logo"
        className="object-contain scale-[2.2]" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      />
    </div>
  );
}

export function AuthScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] min-h-full w-full px-5 py-8 overflow-y-auto relative">
      <div className="w-full max-w-sm mx-auto mb-6 text-center mt-auto flex flex-col items-center gap-3">
        <PockitLogo size={52} />
        <span className="font-extrabold text-[24px] tracking-tight text-[#0b1c30]">
          {APP_CONFIG.appName}
        </span>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {APP_CONFIG.tagline}
        </p>
      </div>
      
      <AuthCard 
        title={isLoginMode ? 'Welcome back' : 'Start your journey'} 
        subtitle={isLoginMode ? `Sign in to your ${APP_CONFIG.appName} account` : 'Create a secure personal finance account'}
      >
        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <SignUpForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </AuthCard>

      <div className="w-full max-w-sm mx-auto mt-8 mb-auto text-center text-[12px] text-[#76777d] space-y-2 pb-6">
        <p>© 2026 {APP_CONFIG.appName}</p>
        <p>Security &middot; Privacy &middot; Terms</p>
      </div>
    </div>
  );
}

