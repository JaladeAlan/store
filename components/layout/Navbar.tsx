'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/shop/products', label: 'Shop' },
  { href: '/shop/products?category=new-arrivals', label: 'New Arrivals' },
  { href: '/shop/products?category=collections', label: 'Collections' },
  { href: '/shop/products?featured=true', label: 'Featured' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const isHome = pathname === '/';
  const appname = process.env.NEXT_PUBLIC_APP_NAME;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled || !isHome
            ? 'bg-ivory/95 backdrop-blur-sm border-b border-sand'
            : 'bg-transparent'
        )}
      >
        <div className="container-luxe">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Nav Links (desktop) */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs tracking-widest uppercase font-body hover-underline transition-colors duration-200',
                    pathname === link.href ? 'text-ink' : 'text-stone hover:text-ink'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile: Menu button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-1 text-ink"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Center: Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-[0.25em] text-ink hover:text-gold transition-colors duration-300"
            >
              {appname}
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 md:gap-5">
              <Link
                href="/search"
                className="text-ink hover:text-gold transition-colors duration-200"
                aria-label="Search"
              >
                <Search size={18} />
              </Link>

              <Link
                href="/account/dashboard"
                className="hidden md:block text-ink hover:text-gold transition-colors duration-200"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              <Link
                href="/account/wishlist"
                className="relative text-ink hover:text-gold transition-colors duration-200"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-ivory text-[9px] font-body font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleCart}
                className="relative text-ink hover:text-gold transition-colors duration-200"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-ink text-ivory text-[9px] font-body font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-20" />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-ivory flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-sand">
              <span className="font-display text-xl tracking-widest">LUXE</span>
              <button onClick={() => setIsMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm tracking-widest uppercase font-body text-ink hover:text-gold transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-sand space-y-4">
              <Link
                href="/account/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-body text-ink"
              >
                <User size={16} />
                My Account
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="block btn-secondary w-full text-center text-xs"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
