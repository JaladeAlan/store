import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const footerLinks = {
  Shop: [
    { href: '/shop/products', label: 'All Products' },
    { href: '/shop/products?category=new-arrivals', label: 'New Arrivals' },
    { href: '/shop/products?featured=true', label: 'Featured' },
    { href: '/shop/products?category=sale', label: 'Sale' },
  ],
  Help: [
    { href: '/pages/sizing-guide', label: 'Sizing Guide' },
    { href: '/pages/shipping', label: 'Shipping & Returns' },
    { href: '/pages/care', label: 'Care Instructions' },
    { href: '/pages/faq', label: 'FAQ' },
  ],
  Company: [
    { href: '/pages/about', label: 'About LUXE' },
    { href: '/pages/sustainability', label: 'Sustainability' },
    { href: '/pages/careers', label: 'Careers' },
    { href: '/pages/contact', label: 'Contact' },
  ],
};

export function Footer() {
  const appname = process.env.NEXT_PUBLIC_APP_NAME;
  return (
    <footer className="bg-ink text-ivory">
      {/* Main Footer */}
      <div className="container-luxe py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-3xl tracking-[0.25em] text-ivory hover:text-gold-light transition-colors duration-300"
            >
              {appname}
            </Link>
            <p className="mt-4 text-sm text-stone leading-relaxed max-w-xs font-body">
              Elevated essentials for the discerning individual. Crafted with
              intention, worn with purpose.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone hover:text-gold-light transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone hover:text-gold-light transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone hover:text-gold-light transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-widest uppercase font-body font-medium text-ivory mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone hover:text-ivory transition-colors duration-200 font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone/20">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone font-body">
            © {new Date().getFullYear()} LUXE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/pages/privacy"
              className="text-xs text-stone hover:text-ivory transition-colors duration-200 font-body"
            >
              Privacy Policy
            </Link>
            <Link
              href="/pages/terms"
              className="text-xs text-stone hover:text-ivory transition-colors duration-200 font-body"
            >
              Terms of Service
            </Link>
          </div>
          {/* Payment Badges */}
          <div className="flex items-center gap-3 text-xs text-stone font-body">
            <span className="border border-stone/30 px-2 py-0.5 rounded">Paystack</span>
            <span className="border border-stone/30 px-2 py-0.5 rounded">Monnify</span>
            <span className="border border-stone/30 px-2 py-0.5 rounded">Visa</span>
            <span className="border border-stone/30 px-2 py-0.5 rounded">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
