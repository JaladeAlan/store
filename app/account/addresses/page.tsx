'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Address } from '@/types';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const EMPTY_FORM = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  country: 'Nigeria',
  is_default: false,
};

export default function AddressesPage() {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    setAddresses((data as Address[]) || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // If setting as default, clear other defaults first
    if (form.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { error } = await supabase.from('addresses').insert({
      user_id: user.id,
      ...form,
    });

    if (error) {
      toast.error('Failed to save address');
    } else {
      toast.success('Address saved');
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      loadAddresses();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete address');
    } else {
      toast.success('Address removed');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);

    if (error) {
      toast.error('Failed to update default');
    } else {
      toast.success('Default address updated');
      loadAddresses();
    }
  };

  if (loading) {
    return (
      <div className="container-luxe py-10">
        <div className="max-w-2xl space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-32 bg-sand shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter container-luxe py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="section-subtitle mb-2">Account</p>
          <h1 className="section-title">Saved Addresses</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          <Plus size={13} />
          Add Address
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-blush p-6 mb-8 max-w-2xl space-y-4">
          <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink">
            New Address
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Label</label>
              <select
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="input-field"
              >
                {['Home', 'Work', 'Other'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Address Line 1 *</label>
              <input
                type="text"
                required
                value={form.address_line1}
                onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Address Line 2</label>
              <input
                type="text"
                value={form.address_line2}
                onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                className="input-field"
                placeholder="Apartment, suite (optional)"
              />
            </div>
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">State *</label>
              <select
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-field"
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 accent-ink"
            />
            <span className="text-xs font-body text-stone">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving…' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin size={32} className="text-stone mx-auto mb-4" strokeWidth={1} />
          <p className="font-display text-xl text-ink mb-2">No saved addresses</p>
          <p className="text-sm text-stone font-body">
            Add an address to speed up future checkouts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-5 border transition-colors duration-200 ${
                address.is_default ? 'border-gold bg-blush' : 'border-sand'
              }`}
            >
              {address.is_default && (
                <span className="absolute top-3 right-3 text-[9px] tracking-widest uppercase font-body text-gold flex items-center gap-1">
                  <Check size={10} /> Default
                </span>
              )}
              <p className="text-[10px] tracking-widest uppercase font-body text-stone mb-2">
                {address.label}
              </p>
              <p className="text-sm font-body font-medium text-ink">{address.full_name}</p>
              <p className="text-xs font-body text-stone mt-1 leading-relaxed">
                {address.address_line1}
                {address.address_line2 && `, ${address.address_line2}`}
                <br />
                {address.city}, {address.state}
                <br />
                {address.phone}
              </p>

              <div className="flex items-center gap-4 mt-4">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs font-body text-stone hover:text-ink transition-colors duration-200"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-xs font-body text-stone hover:text-red-500 transition-colors duration-200 flex items-center gap-1 ml-auto"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}