'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the "current" URL so we can detect actual navigations
  // (ignore clicks that go to the same page).
  const currentUrl = useRef(pathname + searchParams.toString());

  // Show loader when an <a> tag is clicked toward a different route.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore: external links, anchors, mailto/tel, download links,
      // new-tab clicks, or links that open in a different target.
      const isExternal = href.startsWith('http') || href.startsWith('//');
      const isAnchor = href.startsWith('#');
      const isSpecial = href.startsWith('mailto:') || href.startsWith('tel:');
      const isNewTab =
        target.getAttribute('target') === '_blank' ||
        e.ctrlKey || e.metaKey || e.shiftKey;
      const hasDownload = target.hasAttribute('download');

      if (isExternal || isAnchor || isSpecial || isNewTab || hasDownload) return;

      // Build the full target path for comparison
      const url = new URL(href, window.location.origin);
      const targetUrl = url.pathname + url.search;

      // Don't show loader if navigating to the same page
      if (targetUrl === currentUrl.current) return;

      // Show the overlay immediately on click
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    };

    // Capture phase so we intercept before Next.js router handles it
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Hide loader once the new page's pathname is committed
  useEffect(() => {
    const newUrl = pathname + searchParams.toString();
    currentUrl.current = newUrl;

    // Small delay so the page content has time to paint before fade-out
    hideTimer.current = setTimeout(() => setVisible(false), 100);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes luxeReveal {
          0%   { clip-path: inset(0 100% 0 0); }
          50%  { clip-path: inset(0 0%   0 0); }
          100% { clip-path: inset(0 0    0 100%); }
        }
        @keyframes luxeSlide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes luxeFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes luxeFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .nl-overlay {
          position: fixed;
          inset: 0;
          background: #FAF9F6;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: luxeFadeIn 0.15s ease-out forwards;
        }
        .nl-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .nl-wordmark {
          position: relative;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.875rem;
          letter-spacing: 0.35em;
          color: #1A1A1A;
          user-select: none;
        }
        .nl-wordmark-base {
          opacity: 0.15;
        }
        .nl-wordmark-reveal {
          position: absolute;
          inset: 0;
          animation: luxeReveal 1.6s ease-in-out infinite;
        }
        .nl-bar-track {
          width: 6rem;
          height: 1px;
          background: #E8E0D5;
          overflow: hidden;
        }
        .nl-bar-fill {
          height: 100%;
          width: 100%;
          background: #B8975A;
          animation: luxeSlide 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="nl-overlay" aria-hidden="true">
        <div className="nl-inner">
          <div className="nl-wordmark">
            <span className="nl-wordmark-base">
              {process.env.NEXT_PUBLIC_APP_NAME || 'LUXE'}
            </span>
            <span className="nl-wordmark-reveal">
              {process.env.NEXT_PUBLIC_APP_NAME || 'LUXE'}
            </span>
          </div>
          <div className="nl-bar-track">
            <div className="nl-bar-fill" />
          </div>
        </div>
      </div>
    </>
  );
}