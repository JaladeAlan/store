export default function Loading() {

const appname = process.env.NEXT_PUBLIC_APP_NAME ;
  return (
    <>
      <style>{`
        @keyframes revealText {
          0%   { clip-path: inset(0 100% 0 0); }
          50%  { clip-path: inset(0 0%   0 0); }
          100% { clip-path: inset(0 0    0 100%); }
        }
        @keyframes slideBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .luxe-loader-wrap {
          position: fixed;
          inset: 0;
          background: #FAF9F6;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .luxe-loader-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .luxe-loader-wordmark {
          position: relative;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.875rem;
          letter-spacing: 0.35em;
          color: #1A1A1A;
          user-select: none;
        }
        .luxe-loader-wordmark-base {
          opacity: 0.15;
        }
        .luxe-loader-wordmark-reveal {
          position: absolute;
          inset: 0;
          animation: revealText 1.6s ease-in-out infinite;
        }
        .luxe-loader-bar-track {
          width: 6rem;
          height: 1px;
          background: #E8E0D5;
          overflow: hidden;
        }
        .luxe-loader-bar-fill {
          height: 100%;
          width: 100%;
          background: #B8975A;
          animation: slideBar 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="luxe-loader-wrap">
        <div className="luxe-loader-inner">
          <div className="luxe-loader-wordmark">
            <span className="luxe-loader-wordmark-base">{appname}</span>
            <span className="luxe-loader-wordmark-reveal" aria-hidden="true">{appname}</span>
          </div>
          <div className="luxe-loader-bar-track">
            <div className="luxe-loader-bar-fill" />
          </div>
        </div>
      </div>
    </>
  );
}