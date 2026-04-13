'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to verify.');
      router.push('/auth/verify?email=' + encodeURIComponent(form.email));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300">
            LUXE
          </Link>
          <p className="text-stone text-xs tracking-widest uppercase font-body mt-4">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Repeat password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-stone font-body mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-ink hover:text-gold transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
