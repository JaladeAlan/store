import type { Metadata } from 'next';

const appname = process.env.NEXT_PUBLIC_APP_NAME;

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-subtitle mb-3">Legal</p>
          <h1 className="section-title mb-2">Privacy Policy</h1>
          <p className="text-xs text-stone font-body mb-10">Last updated: January 2025</p>

          <div className="space-y-8 text-sm font-body text-stone leading-relaxed">
            {[
              {
                title: '1. Information We Collect',
                body: `When you create an account or place an order, we collect your name, email address, phone number, and delivery address. We also collect payment reference data (we do not store card numbers — all payments are processed securely by Paystack or Monnify). We automatically collect browsing data such as pages visited and time spent on the site.`,
              },
              {
                title: '2. How We Use Your Information',
                body: `We use your data to process orders, communicate order updates, personalise your shopping experience, and improve our services. With your consent, we may send promotional emails. You can unsubscribe at any time.`,
              },
              {
                title: '3. Data Sharing',
                body: `${appname} does not sell your personal data. We share your information only with trusted service providers necessary to fulfil your order (e.g. delivery partners, payment processors), and only to the extent required.`,
              },
              {
                title: '4. Data Security',
                body: `We implement industry-standard security measures including SSL encryption, row-level database security, and secure authentication. No system is 100% secure, but we take your privacy seriously.`,
              },
              {
                title: '5. Cookies',
                body: `We use essential cookies to keep you logged in and maintain your cart. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though this may affect some functionality.`,
              },
              {
                title: '6. Your Rights',
                body: `You may request access to, correction of, or deletion of your personal data at any time by contacting us. Account holders can update their profile information directly from their account dashboard.`,
              },
              {
                title: '7. Contact',
                body: `For any privacy-related questions, contact us through our contact page. We aim to respond within 2 business days.`,
              },
            ].map(({ title, body }) => (
              <section key={title}>
                <h2 className="font-display text-lg text-ink mb-3">{title}</h2>
                <p>{body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}