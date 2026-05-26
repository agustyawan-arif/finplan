import React, { useState } from 'react';
import { AuthCard } from './AuthCard';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

export function AuthScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] min-h-full w-full px-5 py-8 overflow-y-auto relative">
      <div className="w-full max-w-sm mx-auto mb-6 text-center mt-auto">
        <span className="font-extrabold text-[22px] tracking-tight text-[#0b1c30]">
          Finplan
        </span>
      </div>
      
      <AuthCard 
        title={isLoginMode ? 'Welcome back' : 'Start your journey'} 
        subtitle={isLoginMode ? 'Sign in to your Finplan account' : 'Create a secure personal finance account'}
      >
        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <SignUpForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </AuthCard>

      <div className="w-full max-w-sm mx-auto mt-8 mb-auto text-center text-[12px] text-[#76777d] space-y-2 pb-6">
        <p>© 2026 Finplan</p>
        <p>Security &middot; Privacy &middot; Terms</p>
      </div>
    </div>
  );
}
