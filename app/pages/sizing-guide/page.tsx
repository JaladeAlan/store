import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sizing Guide' };

const sizeChart = [
  { size: 'XS', chest: '82–86', waist: '66–70', hips: '88–92' },
  { size: 'S',  chest: '86–90', waist: '70–74', hips: '92–96' },
  { size: 'M',  chest: '90–94', waist: '74–78', hips: '96–100' },
  { size: 'L',  chest: '94–98', waist: '78–82', hips: '100–104' },
  { size: 'XL', chest: '98–104', waist: '82–88', hips: '104–110' },
  { size: 'XXL', chest: '104–110', waist: '88–94', hips: '110–116' },
  { size: 'XXXL', chest: '110–116', waist: '94–100', hips: '116–122' },
];

export default function SizingGuidePage() {
  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-subtitle mb-3">Fit Guide</p>
          <h1 className="section-title mb-10">Sizing Guide</h1>

          <div className="space-y-10 text-sm font-body text-stone leading-relaxed">
            <section>
              <h2 className="font-display text-xl text-ink mb-4">How to Measure</h2>
              <div className="space-y-4">
                {[
                  { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
                  { label: 'Waist', desc: 'Measure around your natural waistline, at the narrowest part of your torso.' },
                  { label: 'Hips', desc: 'Measure around the fullest part of your hips, about 20cm below your waist.' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex gap-4">
                    <span className="text-[10px] tracking-widest uppercase font-medium text-ink w-16 flex-shrink-0 pt-0.5">
                      {label}
                    </span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl text-ink mb-6">Size Chart (cm)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-sand">
                      {['Size', 'Chest', 'Waist', 'Hips'].map((h) => (
                        <th key={h} className="text-left py-3 pr-6 text-xs tracking-widest uppercase text-stone font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((row) => (
                      <tr key={row.size} className="border-b border-sand hover:bg-blush transition-colors duration-200">
                        <td className="py-3 pr-6 font-medium text-ink">{row.size}</td>
                        <td className="py-3 pr-6 text-stone">{row.chest}</td>
                        <td className="py-3 pr-6 text-stone">{row.waist}</td>
                        <td className="py-3 pr-6 text-stone">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-stone mt-4">
                All measurements are in centimetres. If you're between sizes, we recommend sizing up.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-ink mb-4">Fit Notes</h2>
              <p>
                Our pieces are designed with a relaxed contemporary fit. Oversized styles run
                intentionally large — check individual product descriptions for specific fit notes.
                Still unsure?{' '}
                <a href="/pages/contact" className="text-gold hover:text-gold-dark transition-colors duration-200">
                  Ask our team
                </a>{' '}
                for advice before ordering.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}