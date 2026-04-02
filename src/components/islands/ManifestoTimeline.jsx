import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { title: 'Regenerative repair', desc: 'Rebuild damaged tissue — joints, cartilage, organs. Not just treating symptoms. Fixing the source.' },
  { title: 'Immune modulation', desc: 'Calm overactive immune systems. Autoimmune diseases, graft-vs-host, transplant rejection.' },
  { title: 'No matching required', desc: "Unlike cord blood, MSCs don't need HLA matching. Any family member could benefit." },
  { title: 'Anti-inflammatory', desc: 'MSCs are natural anti-inflammatory factories. Chronic inflammation drives dozens of diseases.' },
  { title: 'Tissue engineering', desc: 'Building blocks for lab-grown cartilage, bone, even organ scaffolds.' },
  { title: 'Drug delivery', desc: 'Engineered to carry therapeutics directly to tumors and damaged sites.' },
  { title: 'Neuroprotection', desc: "Slowing Alzheimer's, Parkinson's, ALS — medicine's biggest unsolved problems." },
  { title: 'Neonatal rescue', desc: "Protecting preterm babies' brains, lungs, and guts in the critical first days of life." },
  { title: 'Personalized medicine', desc: 'Your cord tissue as starting material for therapies tailored specifically to you.' },
  { title: 'Longevity science', desc: 'MSC secretome studied for cellular rejuvenation and anti-aging.' },
];

export default function ManifestoTimeline() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const pathBgRef = useRef(null);
  const dotRefs = useRef([]);
  const itemRefs = useRef([]);
  const [pathLength, setPathLength] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { setReducedMotion(true); return; }

    function buildPath() {
      const container = containerRef.current;
      const path = pathRef.current;
      const pathBg = pathBgRef.current;
      if (!container || !path || !dotRefs.current.length) return 0;

      const containerRect = container.getBoundingClientRect();
      const positions = dotRefs.current.map((dot) => {
        if (!dot) return { y: 0 };
        const r = dot.getBoundingClientRect();
        return { y: r.top - containerRect.top + r.height / 2 };
      });

      // Build a simple vertical path through dots with subtle wobble
      let d = `M 0 ${positions[0].y}`;
      for (let i = 1; i < positions.length; i++) {
        const prevY = positions[i - 1].y;
        const curY = positions[i].y;
        const midY = (prevY + curY) / 2;
        d += ` C 3 ${midY}, -3 ${midY}, 0 ${curY}`;
      }

      path.setAttribute('d', d);
      pathBg.setAttribute('d', d);

      const len = path.getTotalLength();
      setPathLength(len);
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      return len;
    }

    // Build path after layout settles
    const timer = setTimeout(() => {
      requestAnimationFrame(() => buildPath());
    }, 200);

    const onResize = () => buildPath();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Scroll handler for line drawing + item reveal
  useEffect(() => {
    if (reducedMotion || !pathLength) return;

    let rafId = null;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const container = containerRef.current;
        const path = pathRef.current;
        if (!container || !path) return;

        const rect = container.getBoundingClientRect();
        const viewH = window.innerHeight;
        const progress = Math.max(0, Math.min(1,
          (viewH * 0.7 - rect.top) / rect.height
        ));

        path.style.strokeDashoffset = pathLength * (1 - progress);

        // Reveal items as line reaches them
        itemRefs.current.forEach((item, i) => {
          if (!item) return;
          const threshold = (i + 0.5) / ITEMS.length;
          if (progress >= threshold) {
            item.classList.add('v2-tl-visible');
          }
        });
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
    return () => { window.removeEventListener('scroll', onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, [pathLength, reducedMotion]);

  return (
    <div ref={containerRef} style={{ position: 'relative', paddingLeft: 60, maxWidth: 640, margin: '0 auto' }}>
      <svg
        style={{
          position: 'absolute',
          left: 24,
          top: 0,
          width: 2,
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <path
          ref={pathBgRef}
          fill="none"
          stroke="rgba(79,163,184,0.1)"
          strokeWidth={2}
        />
        <path
          ref={pathRef}
          fill="none"
          stroke="#4FA3B8"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {ITEMS.map((item, i) => (
        <div
          key={i}
          ref={(el) => (itemRefs.current[i] = el)}
          className={reducedMotion ? 'v2-tl-visible' : ''}
          style={{
            padding: '28px 0',
            position: 'relative',
            opacity: reducedMotion ? 1 : 0.1,
            transform: reducedMotion ? 'none' : 'translateX(-16px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Dot */}
          <div
            ref={(el) => (dotRefs.current[i] = el)}
            style={{
              position: 'absolute',
              left: -44,
              top: 36,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#0F2B35',
              border: '2px solid rgba(79,163,184,0.25)',
              transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
              zIndex: 2,
            }}
            className="v2-tl-dot"
          />
          {/* Number */}
          <div
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 28,
              color: 'rgba(79,163,184,0.2)',
              lineHeight: 1,
              marginBottom: 4,
              transition: 'color 0.5s',
            }}
            className="v2-tl-num"
          >
            {String(i + 1).padStart(2, '0')}
          </div>
          {/* Title */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 4,
              fontFamily: 'Lato, sans-serif',
              transition: 'color 0.5s',
            }}
            className="v2-tl-title"
          >
            {item.title}
          </div>
          {/* Description */}
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.2)',
              lineHeight: 1.55,
              fontFamily: 'Lato, sans-serif',
              transition: 'color 0.5s',
            }}
            className="v2-tl-desc"
          >
            {item.desc}
          </div>
        </div>
      ))}

      <style>{`
        .v2-tl-visible {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
        .v2-tl-visible .v2-tl-dot {
          background: #4FA3B8 !important;
          border-color: #4FA3B8 !important;
          box-shadow: 0 0 16px rgba(79,163,184,0.35);
        }
        .v2-tl-visible .v2-tl-num { color: rgba(79,163,184,0.5) !important; }
        .v2-tl-visible .v2-tl-title { color: rgba(255,255,255,0.85) !important; }
        .v2-tl-visible .v2-tl-desc { color: rgba(255,255,255,0.4) !important; }
        @media (max-width: 900px) {
          .v2-tl-visible, [style*="paddingLeft"] {
            padding-left: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
