import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift, Shield,
  Star, Globe, BookHeart,
  ChevronDown, ArrowRight,
} from 'lucide-react';

const ICON_MAP = {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift, Shield,
  Star, Globe, BookHeart,
};

const SECTIONS = [
  {
    label: 'Learn the Science',
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
      { title: 'LifeSaver Guarantee', href: '/lifesaver-guarantee', icon: 'Shield', desc: 'If your child ever needs their cord blood for a qualifying transplant, StemCyte stands behind you.' },
    ],
  },
  {
    label: 'Our Story',
    href: '/our-story/',
    items: [
      { title: 'Why StemCyte', href: '/why-stemcyte', icon: 'Star', desc: 'What sets StemCyte apart: our science, our people, and our commitment to every family we serve.' },
      { title: 'Our Impact', href: '#', icon: 'Globe', desc: 'StemCyte cord blood units have been shipped to transplant centers worldwide, helping patients find a path forward.' },
      { title: 'Patient Stories', href: '/patient-stories', icon: 'BookHeart', desc: 'Real families whose lives were changed by cord blood transplants. Their stories, in their own words.' },
    ],
  },
];

// ── Animation Styles ──────────────────────────────────────────
const ANIM_STYLES = [
  {
    name: 'Fade',
    panel: { transform: 'none', opacity: 0, transition: 'opacity 0.3s ease' },
    panelOpen: { transform: 'none', opacity: 1 },
    itemStagger: 0,
    itemFrom: { opacity: 0, transform: 'none' },
    itemTo: { opacity: 1, transform: 'none' },
    itemDuration: '0.3s',
    itemEasing: 'ease',
    previewFrom: { opacity: 0, transform: 'none' },
    previewTo: { opacity: 1, transform: 'none' },
    previewDuration: '0.3s',
    previewEasing: 'ease',
    overlay: '0.3s ease',
  },
  {
    name: 'Slide',
    panel: { transform: 'translateY(-8px)', opacity: 0, transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)' },
    panelOpen: { transform: 'translateY(0)', opacity: 1 },
    itemStagger: 40,
    itemFrom: { opacity: 0, transform: 'translateY(6px)' },
    itemTo: { opacity: 1, transform: 'translateY(0)' },
    itemDuration: '0.3s',
    itemEasing: 'cubic-bezier(0.16,1,0.3,1)',
    previewFrom: { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
    previewTo: { opacity: 1, transform: 'translateY(0) scale(1)' },
    previewDuration: '0.35s',
    previewEasing: 'cubic-bezier(0.16,1,0.3,1)',
    overlay: '0.35s ease',
  },
  {
    name: 'Scale',
    panel: { transform: 'scale(0.97) translateY(-4px)', opacity: 0, transition: 'opacity 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' },
    panelOpen: { transform: 'scale(1) translateY(0)', opacity: 1 },
    itemStagger: 30,
    itemFrom: { opacity: 0, transform: 'scale(0.95)' },
    itemTo: { opacity: 1, transform: 'scale(1)' },
    itemDuration: '0.28s',
    itemEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    previewFrom: { opacity: 0, transform: 'scale(0.92)' },
    previewTo: { opacity: 1, transform: 'scale(1)' },
    previewDuration: '0.35s',
    previewEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    overlay: '0.3s ease',
  },
  {
    name: 'Cascade',
    panel: { transform: 'translateY(-6px)', opacity: 0, transition: 'opacity 0.3s ease, transform 0.3s ease' },
    panelOpen: { transform: 'translateY(0)', opacity: 1 },
    itemStagger: 60,
    itemFrom: { opacity: 0, transform: 'translateX(12px)' },
    itemTo: { opacity: 1, transform: 'translateX(0)' },
    itemDuration: '0.32s',
    itemEasing: 'cubic-bezier(0.16,1,0.3,1)',
    previewFrom: { opacity: 0, transform: 'translateX(-12px)' },
    previewTo: { opacity: 1, transform: 'translateX(0)' },
    previewDuration: '0.35s',
    previewEasing: 'cubic-bezier(0.16,1,0.3,1)',
    overlay: '0.3s ease',
  },
  {
    name: 'Soft',
    panel: { transform: 'translateY(-3px)', opacity: 0, transition: 'opacity 0.5s ease, transform 0.5s ease' },
    panelOpen: { transform: 'translateY(0)', opacity: 1 },
    itemStagger: 50,
    itemFrom: { opacity: 0, transform: 'translateY(4px)' },
    itemTo: { opacity: 1, transform: 'translateY(0)' },
    itemDuration: '0.4s',
    itemEasing: 'ease',
    previewFrom: { opacity: 0, transform: 'translateY(4px)' },
    previewTo: { opacity: 1, transform: 'translateY(0)' },
    previewDuration: '0.4s',
    previewEasing: 'ease',
    overlay: '0.5s ease',
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
  const [animIdx, setAnimIdx] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spotlightNavAnimStyle');
      return saved !== null ? parseInt(saved, 10) : 1; // default to Slide
    }
    return 1;
  });
  const [itemsVisible, setItemsVisible] = useState(false);
  const panelRef = useRef(null);
  const navRef = useRef(null);
  const itemRefs = useRef([]);

  const anim = ANIM_STYLES[animIdx];

  const [navTheme, setNavTheme] = useState('light');

  // Cycle animation style
  const cycleAnim = useCallback(() => {
    setAnimIdx(prev => {
      const next = (prev + 1) % ANIM_STYLES.length;
      localStorage.setItem('spotlightNavAnimStyle', next);
      return next;
    });
  }, []);

  // Keyboard shortcut: A to cycle
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          cycleAnim();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cycleAnim]);

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
    setItemsVisible(false);
  }, []);

  const toggle = useCallback((idx) => {
    if (openIdx === idx) {
      close();
    } else {
      measureNavLinks();
      setOpenIdx(idx);
      setActiveItem(0);
      setPrevKey(`${idx}-0`);
      setItemsVisible(false);
      // Trigger items animation after panel starts opening
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setItemsVisible(true);
        });
      });
    }
  }, [openIdx, close, measureNavLinks]);

  // Also trigger items visible when switching sections
  useEffect(() => {
    if (isOpen) {
      setItemsVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setItemsVisible(true);
        });
      });
    }
  }, [openIdx]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Force nav to scrolled state when dropdown is open
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    if (isOpen) {
      nav.classList.remove('at-top');
      nav.classList.add('scrolled');
      nav.style.background = '#ffffff';
      nav.style.borderBottom = '1px solid rgba(108,26,85,0.10)';
      nav.style.boxShadow = '0 2px 8px rgba(61,15,49,0.07)';
    } else {
      nav.style.background = '';
      nav.style.borderBottom = '';
      nav.style.boxShadow = '';
      const hero = document.getElementById('hero');
      if (hero && hero.getBoundingClientRect().bottom >= 80) {
        nav.classList.add('at-top');
        nav.classList.remove('scrolled');
      }
    }
  }, [isOpen]);

  // Animate preview on item change
  const previewRef = useRef(null);
  useEffect(() => {
    if (!previewRef.current || itemKey === prevKey) return;
    const el = previewRef.current;
    el.style.opacity = anim.previewFrom.opacity ?? '0';
    el.style.transform = anim.previewFrom.transform || 'none';
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${anim.previewDuration} ${anim.previewEasing}, transform ${anim.previewDuration} ${anim.previewEasing}`;
      el.style.opacity = anim.previewTo.opacity ?? '1';
      el.style.transform = anim.previewTo.transform || 'none';
    });
    setPrevKey(itemKey);
  }, [itemKey, prevKey, anim]);

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
          transition: `opacity ${anim.overlay}`,
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
          background: 'transparent',
          borderBottom: '1px solid rgba(108,26,85,0.10)',
          boxShadow: '0 10px 30px rgba(61,15,49,0.07)',
          opacity: isOpen ? anim.panelOpen.opacity : anim.panel.opacity,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? anim.panelOpen.transform : anim.panel.transform,
          transition: anim.panel.transition,
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
              background: '#ffffff',
              borderRight: '1px solid rgba(108,26,85,0.08)',
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

            {/* Right panel — items list */}
            <div style={{
              width: itemsWidth > 0 ? `${itemsWidth}px` : '40%',
              flexShrink: 0,
              padding: '28px 48px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',
              background: '#ffffff',
            }}>
              {section.items.map((it, idx) => {
                const isItemActive = activeItem === idx;
                const staggerDelay = anim.itemStagger > 0 ? (80 + idx * anim.itemStagger) : 0;
                const shouldAnimate = itemsVisible && anim.itemStagger > 0;

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
                      background: isItemActive ? '#F8F3F6' : 'transparent',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: `background 0.15s, color 0.15s, opacity ${anim.itemDuration} ${anim.itemEasing}, transform ${anim.itemDuration} ${anim.itemEasing}`,
                      transitionDelay: shouldAnimate ? `0s, 0s, ${staggerDelay}ms, ${staggerDelay}ms` : '0s',
                      opacity: anim.itemStagger > 0 ? (itemsVisible ? anim.itemTo.opacity : anim.itemFrom.opacity) : 1,
                      transform: anim.itemStagger > 0 ? (itemsVisible ? (anim.itemTo.transform || 'none') : (anim.itemFrom.transform || 'none')) : 'none',
                    }}
                    onMouseLeave={() => {}}
                  >
                    <span style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: '0.75rem',
                      fontWeight: isItemActive ? 500 : 400,
                      color: isItemActive ? '#733A5C' : '#998B90',
                      minWidth: '20px',
                      transition: 'color 0.15s, font-weight 0.15s',
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontFamily: 'Lato, sans-serif',
                      fontSize: '0.925rem',
                      fontWeight: isItemActive ? 500 : 400,
                      color: isItemActive ? '#8C4670' : '#635558',
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

      {/* Animation style toggle — floating pill */}
      <div
        onClick={cycleAnim}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '8px 18px',
          borderRadius: '100px',
          background: 'rgba(45, 26, 36, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px',
          fontFamily: 'Lato, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background 0.2s, transform 0.15s',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(108, 26, 85, 0.9)';
          e.currentTarget.style.transform = 'scale(1.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(45, 26, 36, 0.85)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Press A to cycle"
      >
        Animation: {anim.name} ({animIdx + 1}/{ANIM_STYLES.length})
      </div>
    </>
  );
}
