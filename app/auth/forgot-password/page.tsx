'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const supabase = createClient();
  const appname = process.env.NEXT_PUBLIC_APP_NAME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="font-display text-3xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300 inline-block mb-10">
            {appname}
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blush flex items-center justify-center">
              <CheckCircle size={28} className="text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl text-ink mb-3">Check your inbox</h1>
          <p className="text-sm text-stone font-body mb-2 leading-relaxed">
            We sent a password reset link to <span className="text-ink font-medium">{email}</span>
          </p>
          <p className="text-xs text-stone font-body mb-8">
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Link href="/auth/login" className="btn-primary w-full inline-flex items-center justify-center">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300">
            {appname}
          </Link>
          <p className="text-stone text-xs tracking-widest uppercase font-body mt-4">
            Reset your password
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-blush flex items-center justify-center">
            <Mail size={20} className="text-gold" strokeWidth={1.5} />
          </div>
        </div>

        <p className="text-sm text-stone font-body text-center mb-8 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-xs text-stone font-body mt-8">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-ink hover:text-gold transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}