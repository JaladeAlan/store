'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): { score: number; label: string; color: string } {
  const passed = requirements.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: passed, label: 'Very weak', color: 'bg-red-500' };
  if (passed === 2) return { score: passed, label: 'Weak', color: 'bg-orange-400' };
  if (passed === 3) return { score: passed, label: 'Fair', color: 'bg-yellow-400' };
  if (passed === 4) return { score: passed, label: 'Strong', color: 'bg-lime-500' };
  return { score: passed, label: 'Very strong', color: 'bg-green-500' };
}

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [ready, setReady] = useState(false);

  const supabase = createClient();
  const appname = process.env.NEXT_PUBLIC_APP_NAME;
  const strength = getStrength(password);

  // Supabase sends the user here with a session after clicking the email link.
  // We listen for PASSWORD_RECOVERY event to confirm we have a valid session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if session already exists (page reload after email click)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const failedReqs = requirements.filter((r) => !r.test(password));
    if (failedReqs.length > 0) {
      toast.error(`Password must include: ${failedReqs[0].label.toLowerCase()}`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      router.push('/account/dashboard');
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone font-body">Validating reset link…</p>
          <p className="text-xs text-stone font-body mt-2">
            If this takes too long,{' '}
            <Link href="/auth/forgot-password" className="text-ink hover:text-gold transition-colors duration-200">
              request a new link
            </Link>
          </p>
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
            Set a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="input-field pr-10"
                placeholder="Create a strong password"
                autoFocus
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

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-sand'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-body text-stone">
                  Strength: <span className="text-ink">{strength.label}</span>
                </p>
              </div>
            )}

            {/* Requirements checklist */}
            {(passwordFocused || password.length > 0) && (
              <ul className="mt-2 space-y-1">
                {requirements.map((req) => {
                  const passed = req.test(password);
                  return (
                    <li key={req.label} className="flex items-center gap-2">
                      {passed ? (
                        <Check size={11} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <X size={11} className="text-stone flex-shrink-0" />
                      )}
                      <span className={`text-[11px] font-body ${passed ? 'text-green-600' : 'text-stone'}`}>
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-field pr-10 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-300 focus:border-red-500'
                    : confirmPassword && confirmPassword === password
                    ? 'border-green-400'
                    : ''
                }`}
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors duration-200"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[11px] text-red-500 font-body mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || strength.score < 3}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}