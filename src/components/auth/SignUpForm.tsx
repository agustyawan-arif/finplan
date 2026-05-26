import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { AuthInput } from './AuthInput';
import { AuthMessage } from './AuthMessage';
import { Mail, Lock } from 'lucide-react';

export function SignUpForm({ onToggleMode }: { onToggleMode: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created. Please check your email to confirm your account.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-5">
      <AuthMessage message={error || ''} type="error" />
      <AuthMessage message={success || ''} type="success" />
      
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

      <div className="flex items-start space-x-3 pt-2">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 text-[#0F172A] bg-white border-[#e2e8f0] rounded focus:ring-[#0F172A] accent-[#0F172A]"
          />
        </div>
        <div className="text-[12px] text-[#45464d] leading-snug">
          <label htmlFor="terms" className="cursor-pointer">
            I agree to the <span className="font-semibold text-[#0b1c30]">Terms of Service</span> and <span className="font-semibold text-[#0b1c30]">Privacy Policy</span>
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-[48px] bg-[#0F172A] text-white rounded-[16px] font-semibold text-[16px] hover:opacity-90 disabled:opacity-70 transition-opacity"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
      
      <div className="text-center pt-2">
        <p className="text-[14px] text-[#45464d]">
          Already have an account?{' '}
          <button type="button" onClick={onToggleMode} className="text-[#0b1c30] font-semibold hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}
