'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const appname = process.env.NEXT_PUBLIC_APP_NAME;

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — replace with your email API (e.g. Resend, SendGrid)
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    toast.success("Message sent! We'll be in touch soon.");
    setLoading(false);
  };

  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="section-subtitle mb-3">Get in Touch</p>
          <h1 className="section-title mb-12">Contact Us</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <p className="text-sm font-body text-stone leading-relaxed">
                  Have a question about sizing, an order, or just want to say hello?
                  Our team typically responds within 24 hours on business days.
                </p>
              </div>

              {[
                { icon: Mail, label: 'Email', value: `hello@${(appname || 'luxe').toLowerCase()}.ng` },
                { icon: MessageSquare, label: 'WhatsApp', value: '+234 800 000 0000' },
                { icon: Clock, label: 'Hours', value: 'Mon – Fri, 9am – 6pm WAT' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blush flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-body font-medium text-stone mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-body text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            {sent ? (
              <div className="bg-blush p-8 flex flex-col items-center justify-center text-center">
                <Mail size={32} className="text-gold mb-4" strokeWidth={1.5} />
                <h2 className="font-display text-2xl text-ink mb-2">Message received</h2>
                <p className="text-sm font-body text-stone">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="label">Email Address *</label>
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
                  <label className="label">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order enquiry</option>
                    <option value="return">Returns & exchanges</option>
                    <option value="sizing">Sizing help</option>
                    <option value="product">Product question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none h-32"
                    placeholder="Tell us how we can help…"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}