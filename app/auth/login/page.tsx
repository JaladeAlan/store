'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/account/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const supabase = createClient();
  const appname = process.env.NEXT_PUBLIC_APP_NAME;

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Make common errors friendlier
      if (error.message.toLowerCase().includes('invalid login')) {
        toast.error('Incorrect email or password');
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        toast.error('Please verify your email first');
        router.push('/auth/verify?email=' + encodeURIComponent(email));
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success('Check your email for a login code');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome!');
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300">
            {appname}
          </Link>
          <p className="text-stone text-xs tracking-widest uppercase font-body mt-4">
            Sign in to your account
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border border-sand mb-8">
          <button
            onClick={() => setOtpMode(false)}
            className={`flex-1 py-2.5 text-xs tracking-widest uppercase font-body transition-colors duration-200 ${
              !otpMode ? 'bg-ink text-ivory' : 'text-stone hover:text-ink'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setOtpMode(true)}
            className={`flex-1 py-2.5 text-xs tracking-widest uppercase font-body transition-colors duration-200 ${
              otpMode ? 'bg-ink text-ivory' : 'text-stone hover:text-ink'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Password login */}
        {!otpMode && (
          <form onSubmit={handleEmailPassword} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-stone hover:text-ink font-body transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Magic link — send OTP */}
        {otpMode && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {/* Magic link — verify OTP */}
        {otpMode && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-stone font-body text-center">
              Enter the 6-digit code sent to{' '}
              <strong className="text-ink">{email}</strong>
            </p>
            <div>
              <label className="label">Verification Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center tracking-[0.5em] text-lg"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="w-full text-xs text-stone hover:text-ink font-body transition-colors duration-200"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="text-center text-xs text-stone font-body mt-8">
          New to {appname}?{' '}
          <Link href="/auth/register" className="text-ink hover:text-gold transition-colors duration-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}