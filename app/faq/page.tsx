'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'Once your order is shipped, you will receive an email with tracking information. You can also view your order status in your account under "My Orders".',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major debit and credit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments through Paystack and Monnify.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Orders can be cancelled or modified within 1 hour of placement. After that, the order enters fulfilment and changes are no longer possible. Contact us immediately if you need to make a change.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are typically processed within 1–2 business days. Delivery to major cities takes 3–5 business days. Remote areas may take 5–7 business days.',
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes! Orders over ₦50,000 qualify for free delivery. Orders between ₦20,000 and ₦49,999 are charged ₦1,500, and orders below ₦20,000 are charged ₦2,500.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 14 days of delivery for unworn items with original tags. See our Shipping & Returns page for full details.',
  },
  {
    q: 'How do I know which size to order?',
    a: 'Check our sizing guide for measurements. If you\'re between sizes, we recommend sizing up. Our team is also happy to advise — just contact us.',
  },
  {
    q: 'Are the colours accurate in photos?',
    a: 'We do our best to represent colours accurately, but screen calibrations vary. If colour accuracy is critical, feel free to contact us and we can provide additional photos.',
  },
  {
    q: 'Do you restock sold-out items?',
    a: 'Popular items are sometimes restocked. You can follow us on social media or join our newsletter to be notified of restocks.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-subtitle mb-3">Help</p>
          <h1 className="section-title mb-10">Frequently Asked Questions</h1>

          <div className="divide-y divide-sand">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between text-left gap-4"
                >
                  <span className="text-sm font-body font-medium text-ink">{faq.q}</span>
                  <span className="flex-shrink-0 text-stone">
                    {open === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {open === i && (
                  <p className="mt-3 text-sm font-body text-stone leading-relaxed pr-8">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-sand text-center">
            <p className="text-sm font-body text-stone mb-4">Can't find what you're looking for?</p>
            <a href="/pages/contact" className="btn-secondary text-xs">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}