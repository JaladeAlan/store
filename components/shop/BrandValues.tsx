import { Truck, RefreshCw, Shield, Leaf } from 'lucide-react';

const values = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary shipping on orders over ₦50,000',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '14-day hassle-free return policy',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Protected by Paystack & Monnify',
  },
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'Ethically sourced materials & production',
  },
];

export function BrandValues() {
  return (
    <section className="py-16 border-t border-b border-sand">
      <div className="container-luxe">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="flex justify-center mb-4">
                <Icon size={20} className="text-gold" strokeWidth={1.5} />
              </div>
              <h4 className="text-xs tracking-widest uppercase font-body font-medium text-ink mb-2">
                {title}
              </h4>
              <p className="text-xs text-stone font-body leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
