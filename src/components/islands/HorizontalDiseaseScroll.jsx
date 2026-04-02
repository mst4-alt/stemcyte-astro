import { useEffect, useRef, useState } from 'react';
import Odometer from './Odometer.jsx';

const CATEGORIES = [
  {
    name: 'Cancers',
    count: 22,
    color: '#4FA3B8',
    diseases: ['B-cell ALL', 'T-cell ALL', 'AML', 'APL', 'CML', 'JMML', 'CLL', 'Hodgkin', 'DLBCL', 'Follicular', 'Burkitt', 'Mantle cell', 'Myeloma', 'MDS', 'Prolymphocytic', 'LGL leukemia', 'Hairy cell', 'NLPHL', 'ALCL', 'Peripheral T-cell', 'Plasma cell', "Waldenström's"],
  },
  {
    name: 'Blood Disorders',
    count: 17,
    color: '#6B9BED',
    diseases: ['Sickle cell', 'Beta-thalassemia', 'Alpha-thalassemia', 'Aplastic anemia', 'Fanconi anemia', 'Diamond-Blackfan', 'PNH', 'Myelofibrosis', 'Osteopetrosis', 'Hb E-beta thal.', 'Dyserythropoietic', 'Pyruvate kinase', 'Red cell aplasia', 'Kostmann', 'Shwachman-Diamond', 'Dyskeratosis', 'Amegakaryocytic'],
  },
  {
    name: 'Immune Deficiencies',
    count: 30,
    color: '#5DB890',
    diseases: ['ADA-SCID', 'X-linked SCID', 'Wiskott-Aldrich', 'CGD', 'Omenn', 'IPEX', 'DiGeorge', 'HLH', 'Griscelli', 'JAK3 def.', 'XLP', 'Leukocyte adhesion', 'Chediak-Higashi', 'Bare lymphocyte', 'CD45 def.', 'ZAP70 def.', 'Coronin-1A', 'DOCK2 def.', 'PNP def.', 'Artemis def.', 'DNA ligase IV', 'ADA2 def.', 'CD40L def.', 'CD40 def.', 'AICDA def.', 'UNG def.', 'NEMO def.', 'Reticular dysgen.', 'CD3δ def.', 'CD3ε def.'],
  },
  {
    name: 'Metabolic Disorders',
    count: 16,
    color: '#E8C06E',
    diseases: ['Hurler', 'Krabbe', 'ALD', 'MLD', 'Gaucher', 'Wolman', 'Maroteaux-Lamy', 'Sly syndrome', 'Mannosidosis', 'Fucosidosis', 'Aspartylglucos.', 'Sialidosis', 'Farber', 'I-cell disease', 'Mannosidosis β', 'Gunther'],
  },
];

export default function HorizontalDiseaseScroll() {
  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const currentX = useRef(0);

  // Detect mobile + reduced motion on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setReducedMotion(true);
    if (window.innerWidth < 900) setIsMobile(true);
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (reducedMotion || isMobile) return;

    let rafId = null;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const outer = outerRef.current;
        const track = trackRef.current;
        const sticky = stickyRef.current;
        if (!outer || !track || !sticky) return;

        const rect = outer.getBoundingClientRect();
        const scrolled = -rect.top;
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) return;
        const progress = Math.max(0, Math.min(1, scrolled / scrollable));

        const maxTranslate = track.scrollWidth - sticky.offsetWidth + 96;
        const targetX = -(progress * Math.max(0, maxTranslate));
        currentX.current += (targetX - currentX.current) * 0.1;
        track.style.transform = `translateX(${currentX.current}px)`;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, [reducedMotion, isMobile]);

  const shouldStack = reducedMotion || isMobile;

  return (
    <div
      ref={outerRef}
      style={{ height: shouldStack ? 'auto' : '250vh', position: 'relative' }}
    >
      <div
        ref={stickyRef}
        style={{
          position: shouldStack ? 'relative' : 'sticky',
          top: 0,
          height: shouldStack ? 'auto' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: shouldStack ? 'flex-start' : 'center',
          padding: shouldStack ? '0' : '0 48px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: 20,
            willChange: shouldStack ? 'auto' : 'transform',
            flexDirection: shouldStack ? 'column' : 'row',
            padding: shouldStack ? '0' : '20px 0',
          }}
        >
          {CATEGORIES.map((cat, ci) => (
            <div
              key={ci}
              style={{
                flex: shouldStack ? 'none' : '0 0 400px',
                width: shouldStack ? '100%' : 400,
                borderRadius: 20,
                padding: '32px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <Odometer value={cat.count} suffix="+" color={cat.color} digitHeight={44} />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: cat.color,
                  letterSpacing: 0.5,
                  margin: '4px 0 20px',
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                {cat.name}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.diseases.map((d, di) => (
                  <span
                    key={di}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 100,
                      border: `1px solid ${cat.color}22`,
                      color: `${cat.color}AA`,
                      lineHeight: 1.3,
                      fontFamily: 'Lato, sans-serif',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
