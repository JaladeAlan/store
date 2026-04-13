// components/shop/NewsletterBanner.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function NewsletterBanner() {
  const appname = process.env.NEXT_PUBLIC_APP_NAME;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Welcome to ${appname}. Expect something special.`);
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-20 bg-espresso">
      <div className="container-luxe text-center">
        <p className="text-gold-light text-xs tracking-[0.3em] uppercase font-body mb-4">
          Inner Circle
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-ivory mb-4">
          First to know. Always.
        </h2>
        <p className="text-stone text-sm font-body max-w-md mx-auto mb-10 leading-relaxed">
          Join the {appname} inner circle for exclusive access to new arrivals, private
          sales, and curated style notes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 bg-transparent border border-stone/40 px-5 py-3.5 text-sm text-ivory placeholder-stone/60 font-body focus:outline-none focus:border-gold transition-colors duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-gold whitespace-nowrap disabled:opacity-60"
          >
            {loading ? 'Joining...' : 'Join Now'}
          </button>
        </form>

        <p className="text-stone/60 text-[11px] font-body mt-4 tracking-wide">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}