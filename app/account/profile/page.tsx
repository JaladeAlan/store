'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [email, setEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data } = await supabase.from('users').select('full_name, phone').eq('id', user.id).single();
      if (data) setForm({ full_name: data.full_name || '', phone: data.phone || '' });
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="container-luxe py-10">
      <div className="max-w-md space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-sand shimmer" />)}
      </div>
    </div>
  );

  return (
    <div className="page-enter container-luxe py-10">
      <div className="mb-8">
        <p className="section-subtitle mb-2">Account</p>
        <h1 className="section-title">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-md space-y-5">
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="input-field bg-blush text-stone cursor-not-allowed"
          />
          <p className="text-[11px] text-stone font-body mt-1">Contact support to change your email</p>
        </div>
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="input-field"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field"
            placeholder="+234 800 000 0000"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-sand max-w-md">
        <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-4">Danger Zone</h2>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className="btn-secondary text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
