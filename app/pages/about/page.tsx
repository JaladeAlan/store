import type { Metadata } from 'next';

const appname = process.env.NEXT_PUBLIC_APP_NAME;

export const metadata: Metadata = { title: `About ${appname}` };

export default function AboutPage() {
  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-subtitle mb-3">Our Story</p>
          <h1 className="section-title mb-10">About {appname}</h1>

          <div className="space-y-6 text-sm font-body text-stone leading-relaxed">
            <p>
              {appname} was born from a simple belief: that Nigerians deserve access to
              premium contemporary fashion without compromise. We curate elevated essentials —
              pieces designed to move with you, speak for you, and endure beyond trends.
            </p>

            <h2 className="font-display text-xl text-ink pt-4">Our Philosophy</h2>
            <p>
              We believe great style begins with intentional choices. Every piece in our
              collection is selected for its quality of construction, versatility of wear,
              and longevity of design. We champion the idea that less — when chosen well —
              is always more.
            </p>

            <h2 className="font-display text-xl text-ink pt-4">Crafted for the Modern Nigerian</h2>
            <p>
              Our collections speak to the discerning individual who values refinement
              without ostentation. From Lagos boardrooms to weekend getaways, {appname}
              pieces are designed to transition effortlessly through every chapter of your day.
            </p>

            <h2 className="font-display text-xl text-ink pt-4">Sustainability</h2>
            <p>
              We are committed to responsible sourcing. Our partners are selected based on
              ethical production standards, fair labour practices, and environmental
              stewardship. When you invest in {appname}, you invest in fashion that considers
              its footprint.
            </p>

            <div className="border-t border-sand pt-8 mt-8">
              <p className="text-xs tracking-widest uppercase font-body font-medium text-ink mb-2">
                Questions?
              </p>
              <p>
                We'd love to hear from you.{' '}
                <a href="/pages/contact" className="text-gold hover:text-gold-dark transition-colors duration-200">
                  Get in touch
                </a>
                {' '}with our team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}