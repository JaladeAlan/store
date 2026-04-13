import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping & Returns' };

export default function ShippingPage() {
  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-subtitle mb-3">Policies</p>
          <h1 className="section-title mb-10">Shipping & Returns</h1>

          <div className="space-y-10 text-sm font-body text-stone leading-relaxed">
            <section>
              <h2 className="font-display text-xl text-ink mb-4">Delivery</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-sand py-3">
                  <span className="font-medium text-ink">Orders over ₦50,000</span>
                  <span className="text-gold font-medium">Free delivery</span>
                </div>
                <div className="flex justify-between border-b border-sand py-3">
                  <span className="font-medium text-ink">Orders ₦20,000 – ₦49,999</span>
                  <span>₦1,500</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-ink">Orders under ₦20,000</span>
                  <span>₦2,500</span>
                </div>
              </div>
              <p className="mt-4">
                Orders are processed within 1–2 business days and typically delivered within
                3–5 business days across major Nigerian cities. Remote areas may take 5–7 days.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-ink mb-4">Returns</h2>
              <p className="mb-4">
                We accept returns within <strong className="text-ink">14 days</strong> of delivery
                for items in their original, unworn condition with tags attached.
              </p>
              <p className="mb-4">
                To initiate a return, contact our team at{' '}
                <a href="/pages/contact" className="text-gold hover:text-gold-dark transition-colors duration-200">
                  our contact page
                </a>{' '}
                with your order number. Return shipping costs are the customer's responsibility
                unless the item is faulty or incorrect.
              </p>
              <p>
                Refunds are processed within 5–7 business days of receiving the returned item.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-ink mb-4">Exchanges</h2>
              <p>
                Need a different size? We're happy to exchange within 14 days. Please initiate
                a return and place a new order for the correct size. This ensures the fastest
                turnaround for you.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-ink mb-4">Non-returnable Items</h2>
              <ul className="space-y-2">
                {['Sale items marked as final sale', 'Swimwear and underwear', 'Items without original tags', 'Items showing signs of wear'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}