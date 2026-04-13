import Link from 'next/link';
import type { ReactNode } from 'react';

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="page-enter">
      <div className="container-luxe py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          {subtitle && <p className="section-subtitle mb-3">{subtitle}</p>}
          <h1 className="section-title mb-10">{title}</h1>
          <div className="prose-luxe">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Shared prose styles injected via globals (add to globals.css)
// .prose-luxe p { @apply text-sm font-body text-stone leading-relaxed mb-4; }
// .prose-luxe h2 { @apply font-display text-xl text-ink mt-8 mb-4; }
// .prose-luxe h3 { @apply text-sm tracking-widest uppercase font-body font-medium text-ink mt-6 mb-3; }
// .prose-luxe ul { @apply space-y-2 mb-4; }
// .prose-luxe li { @apply text-sm font-body text-stone pl-4 relative before:absolute before:left-0 before:content-['—'] before:text-gold; }