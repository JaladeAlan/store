'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-espresso">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80"
          alt="`${process.env.NEXT_PUBLIC_APP_NAME}` Hero"
          fill
          className="object-cover object-center opacity-60"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-luxe pb-20 md:pb-28">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="text-gold-light text-xs tracking-[0.35em] uppercase font-body mb-6 animate-fade-up">
            New Arrivals — 2025
          </p>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory leading-[0.95] mb-8 animate-fade-up [animation-delay:100ms]">
            Dressed
            <br />
            <em>for the</em>
            <br />
            Moment.
          </h1>

          {/* Subtext */}
          <p className="text-sand text-sm md:text-base font-body leading-relaxed max-w-sm mb-10 animate-fade-up [animation-delay:200ms]">
            Refined pieces that move with you. Elevated basics and statement
            silhouettes crafted for the modern Nigerian.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up [animation-delay:300ms]">
            <Link href="/shop/products" className="btn-gold">
              Shop Collection
            </Link>
            <Link
              href="/shop/products?featured=true"
              className="inline-flex items-center justify-center border border-ivory/40 text-ivory px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium transition-all duration-300 hover:border-ivory hover:bg-ivory/10"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-2 animate-fade-in [animation-delay:600ms]">
        <span className="text-ivory/50 text-[10px] tracking-widest uppercase font-body writing-vertical">
          Scroll
        </span>
        <div className="w-px h-12 bg-ivory/20 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-gold animate-[slideDown_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .writing-vertical {
          writing-mode: vertical-lr;
          text-orientation: mixed;
        }
      `}</style>
    </section>
  );
}
