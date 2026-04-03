import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift,
  Star, Globe, BookHeart, Shield,
  ChevronDown, ArrowRight,
} from 'lucide-react';

const ICON_MAP = {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift,
  Star, Globe, BookHeart, Shield,
};

const SECTIONS = [
  {
    label: 'Cord Blood Guide',
    href: '/learn/',
    items: [
      { title: 'What Is Cord Blood', href: '/learn/what-is-cord-blood', icon: 'Droplet', desc: 'Your baby\u2019s umbilical cord blood is a rich source of hematopoietic stem cells, the same type used in bone marrow transplants. Collected once, at birth.' },
      { title: 'What Is Cord Tissue', href: '/learn/what-is-cord-tissue', icon: 'Dna', desc: 'Cord tissue contains mesenchymal stem cells (MSCs), a different cell type with emerging applications in regenerative medicine.' },
      { title: 'Public vs. Private Banking', href: '/learn/public-vs-private-banking', icon: 'Scale', desc: 'Public banking donates for anyone in need. Private banking reserves exclusively for your family.' },
      { title: 'How Your Family Can Use It', href: '/learn/how-your-family-can-use-it', icon: 'Users', desc: 'Cord blood can potentially be used by the child, siblings, and in some cases parents.' },
      { title: 'How Collection Works', href: '/learn/how-collection-works', icon: 'Clock', desc: 'Collection is safe, painless, and takes less than 5 minutes after delivery.' },
      { title: 'FAQ', href: '/learn/faq', icon: 'CircleHelp', desc: 'Answers to common questions about cord blood banking, including timing, cost, safety, and storage.' },
    ],
  },
  {
    label: 'Plans & Programs',
    href: '/pricing',
    items: [
      { title: 'Pricing', href: '/pricing', icon: 'Tag', desc: 'Cord blood, cord tissue, or both. Find the plan that fits your family with flexible payment options.' },
      { title: 'Public Bank Access', href: '/public-bank-access', icon: 'Search', desc: 'Search StemCyte\u2019s public bank inventory for matching cord blood units. Available as a paid add-on at $299, or included free with Cord Blood & Tissue plans.' },
      { title: 'Special Programs', href: '/special-programs', icon: 'Gift', desc: 'Military families, healthcare workers, and partner organizations may qualify for special pricing and programs.' },
    ],
  },
  {
    label: 'Our Story',
    href: '/our-story/',
    items: [
      { title: 'Why StemCyte', href: '/why-stemcyte', icon: 'Star', desc: 'What sets StemCyte apart: our science, our people, and our commitment to every family we serve.' },
      { title: 'Our Impact', href: '#', icon: 'Globe', desc: 'StemCyte cord blood units have been shipped to transplant centers worldwide, helping patients find a path forward.' },
      { title: 'Patient Stories', href: '/patient-stories', icon: 'BookHeart', desc: 'Real families whose lives were changed by cord blood transplants. Their stories, in their own words.' },
      { title: 'LifeSaver Guarantee', href: '/lifesaver-guarantee', icon: 'Shield', desc: 'If your child ever needs their cord blood for a qualifying transplant, StemCyte stands behind you.' },
    ],
  },
];

// Pages that exist — all others get href="#"
const EXISTING_PAGES = new Set([
  '/pricing', '/public-bank-access', '/special-programs',
  '/our-story/', '/why-stemcyte', '/patient-stories', '/lifesaver-guarantee',
]);

function resolveHref(href) {
  if (href === '#') return '#';
  return EXISTING_PAGES.has(href) ? href : '#';
}

export default function SpotlightNav() {
  const [openIdx, setOpenIdx] = useState(-1);
  const [activeItem, setActiveItem] = useState(0);
  const [prevKey, setPrevKey] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [itemsWidth, setItemsWidth] = useState(0);
  const panelRef = useRef(null);
  const navRef = useRef(null);

  const [navTheme, setNavTheme] = useState('light');

  // Watch nav scroll state and theme
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const check = () => {
      if (nav.classList.contains('scrolled')) {
        setNavTheme('scrolled');
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        if (nav.classList.contains('dark-hero') || nav.classList.contains('plum-hero')) {
          setNavTheme('dark');
        } else {
          setNavTheme('light');
        }
      }
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(nav, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Measure nav buttons position to align dropdown items
  const measureNavLinks = useCallback(() => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setItemsWidth(window.innerWidth - rect.left);
  }, []);

  useEffect(() => {
    measureNavLinks();
    window.addEventListener('resize', measureNavLinks);
    return () => window.removeEventListener('resize', measureNavLinks);
  }, [measureNavLinks]);

  const isOpen = openIdx >= 0;
  const section = isOpen ? SECTIONS[openIdx] : null;
  const item = section ? section.items[activeItem] : null;
  const itemKey = section ? `${openIdx}-${activeItem}` : '';

  const close = useCallback(() => {
    setOpenIdx(-1);
    setActiveItem(0);
    setPrevKey('');
  }, []);

  const toggle = useCallback((idx) => {
    if (openIdx === idx) {
      close();
    } else {
      measureNavLinks();
      setOpenIdx(idx);
      setActiveItem(0);
      setPrevKey(`${idx}-0`);
    }
  }, [openIdx, close, measureNavLinks]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Animate preview on item change
  const previewRef = useRef(null);
  useEffect(() => {
    if (!previewRef.current || itemKey === prevKey) return;
    const el = previewRef.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px) scale(0.97)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
    setPrevKey(itemKey);
  }, [itemKey, prevKey]);

  const IconComponent = item ? ICON_MAP[item.icon] : null;

  return (
    <>
      {/* Nav buttons */}
      <div ref={navRef} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {SECTIONS.map((sec, i) => {
          const isActive = openIdx === i;
          const defaultColor = isScrolled ? '#6B5A63' : navTheme === 'dark' ? 'rgba(44,42,38,0.6)' : 'rgba(255,255,255,0.75)';
          const hoverColor = isScrolled ? '#2D1A24' : navTheme === 'dark' ? '#2C2A26' : '#fff';
          const hoverBg = isScrolled ? '#F5EDF2' : navTheme === 'dark' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)';
          const activeColor = isScrolled ? '#6C1A55' : navTheme === 'dark' ? '#2C2A26' : '#fff';
          const activeBg = isScrolled ? '#F2E0EB' : navTheme === 'dark' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)';

          return (
            <button
              key={sec.label}
              onClick={() => toggle(i)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? activeColor : defaultColor,
                background: isActive ? activeBg : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'Lato, sans-serif',
                transition: 'color 0.2s, background 0.2s',
                WebkitFontSmoothing: 'antialiased',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = hoverColor;
                  e.currentTarget.style.background = hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = defaultColor;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {sec.label}
              <ChevronDown
                size={14}
                strokeWidth={2}
                style={{
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 998,
          background: 'rgba(45, 26, 36, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Dropdown panel — edge-to-edge */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#FFFDF9',
          borderBottom: '1px solid rgba(108,26,85,0.08)',
          boxShadow: '0 12px 40px rgba(61,15,49,0.08)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)',
          boxSizing: 'border-box',
        }}
      >
        {section && (
          <div style={{
            display: 'flex',
            minHeight: '320px',
          }}>
            {/* Left panel — preview */}
            <div style={{
              flex: 1,
              padding: '32px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid rgba(108,26,85,0.06)',
            }}>
              {item && (
                <div
                  ref={previewRef}
                  style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '15px',
                    background: '#FAF5F8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                  }}>
                    {IconComponent && (
                      <IconComponent
                        size={28}
                        strokeWidth={1.1}
                        color="#6C1A55"
                      />
                    )}
                  </div>

                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.55rem',
                    fontWeight: 500,
                    color: '#2D1A24',
                    lineHeight: 1.2,
                    margin: '0 0 14px 0',
                  }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontSize: '0.925rem',
                    lineHeight: 1.75,
                    color: '#6B5A63',
                    maxWidth: '340px',
                    margin: '0 0 24px 0',
                  }}>
                    {item.desc}
                  </p>

                  <a
                    href={resolveHref(item.href)}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#6C1A55',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'gap 0.2s',
                      fontFamily: 'Lato, sans-serif',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.gap = '12px'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.gap = '8px'; }}
                  >
                    Learn more <ArrowRight size={14} strokeWidth={2} />
                  </a>
                </div>
              )}
            </div>

            {/* Right panel — items list, aligned to nav buttons */}
            <div style={{
              width: itemsWidth > 0 ? `${itemsWidth}px` : '40%',
              flexShrink: 0,
              padding: '28px 48px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',
            }}>
              {section.items.map((it, idx) => {
                const isActive = activeItem === idx;
                return (
                  <a
                    key={it.title}
                    href={resolveHref(it.href)}
                    onMouseEnter={() => setActiveItem(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isActive ? '#F8F3F6' : 'transparent',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseLeave={() => {}}
                  >
                    <span style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#733A5C' : '#998B90',
                      minWidth: '20px',
                      transition: 'color 0.15s, font-weight 0.15s',
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontFamily: 'Lato, sans-serif',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#8C4670' : '#635558',
                      transition: 'color 0.15s, font-weight 0.15s',
                      whiteSpace: 'nowrap',
                    }}>
                      {it.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
