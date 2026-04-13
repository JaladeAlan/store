'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const supabase = createClient();
  const appname = process.env.NEXT_PUBLIC_APP_NAME;

  // Handle the hash fragment from Supabase email link (token_hash flow)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast.success('Email verified! Welcome.');
        router.push('/account/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setResent(true);
      setCooldown(60);
      toast.success('Verification email resent!');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="font-display text-3xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300 inline-block mb-10">
          {appname}
        </Link>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blush flex items-center justify-center">
            <Mail size={28} className="text-gold" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-display text-3xl text-ink mb-3">Check your inbox</h1>

        {email ? (
          <p className="text-sm text-stone font-body mb-2 leading-relaxed">
            We sent a verification link to{' '}
            <span className="text-ink font-medium">{email}</span>
          </p>
        ) : (
          <p className="text-sm text-stone font-body mb-2 leading-relaxed">
            A verification email has been sent to your address.
          </p>
        )}

        <p className="text-xs text-stone font-body mb-8">
          Click the link in the email to verify your account. Check your spam folder if you don't see it.
        </p>

        {resent && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-xs font-body mb-4">
            <CheckCircle size={13} />
            Email resent successfully
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
          {resending
            ? 'Sending…'
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend Verification Email'}
        </button>

        <p className="text-center text-xs text-stone font-body mt-6">
          Wrong email?{' '}
          <Link href="/auth/register" className="text-ink hover:text-gold transition-colors duration-200">
            Sign up again
          </Link>
          {' · '}
          <Link href="/auth/login" className="text-ink hover:text-gold transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}