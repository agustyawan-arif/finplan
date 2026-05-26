import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { AuthInput } from './AuthInput';
import { AuthMessage } from './AuthMessage';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginForm({ onToggleMode }: { onToggleMode: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <AuthMessage message={error || ''} type="error" />
      
      <div className="space-y-4">
        <AuthInput
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          icon={<Mail size={18} strokeWidth={1.5} />}
        />
        <AuthInput
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={18} strokeWidth={1.5} />}
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-[48px] bg-[#0F172A] text-white rounded-[16px] font-semibold text-[16px] hover:opacity-90 disabled:opacity-70 transition-opacity flex items-center justify-center space-x-2"
        >
          <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-[14px] text-[#45464d]">
          Don't have an account?{' '}
          <button type="button" onClick={onToggleMode} className="text-[#0b1c30] font-semibold hover:underline">
            Create Account
          </button>
        </p>
      </div>
    </form>
  );
}
