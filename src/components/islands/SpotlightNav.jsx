import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift, Shield,
  Star, Globe, BookHeart,
  ChevronDown,
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
    groups: [
      {
        name: 'The Science',
        items: [
          { title: 'What Is Cord Blood', href: '/learn/what-is-cord-blood', icon: 'Droplet' },
          { title: 'What Is Cord Tissue', href: '/learn/what-is-cord-tissue', icon: 'Dna' },
          { title: 'Public vs. Private Banking', href: '/learn/public-vs-private-banking', icon: 'Scale' },
        ],
      },
      {
        name: 'Getting Started',
        items: [
          { title: 'How Your Family Can Use It', href: '/learn/how-your-family-can-use-it', icon: 'Users' },
          { title: 'How Collection Works', href: '/learn/how-collection-works', icon: 'Clock' },
          { title: 'FAQ', href: '/learn/faq', icon: 'CircleHelp' },
        ],
      },
    ],
  },
  {
    label: 'Plans & Programs',
    href: '/pricing',
    groups: [
      {
        name: 'Choose Your Plan',
        items: [
          { title: 'Pricing', href: '/pricing', icon: 'Tag' },
          { title: 'Public Bank Access', href: '/public-bank-access', icon: 'Search' },
        ],
      },
      {
        name: 'Special Offers',
        items: [
          { title: 'Special Programs', href: '/special-programs', icon: 'Gift' },
          { title: 'LifeSaver Guarantee', href: '/lifesaver-guarantee', icon: 'Shield' },
        ],
      },
    ],
  },
  {
    label: 'Our Story',
    href: '/our-story/',
    groups: [
      {
        name: 'About',
        items: [
          { title: 'Why StemCyte', href: '/why-stemcyte', icon: 'Star' },
          { title: 'Our Impact', href: '#', icon: 'Globe' },
        ],
      },
      {
        name: 'Community',
        items: [
          { title: 'Patient Stories', href: '/patient-stories', icon: 'BookHeart' },
          { title: 'LifeSaver Guarantee', href: '/lifesaver-guarantee', icon: 'Shield' },
        ],
      },
    ],
  },
];

// ── Animation Styles ──────────────────────────────────────────
const ANIM_STYLES = [
  {
    name: 'Fade',
    panel: { closed: { opacity: 0, transform: 'none' }, open: { opacity: 1, transform: 'none' }, transition: 'opacity 0.3s ease' },
    itemStagger: 0, itemDuration: '0.3s', itemEasing: 'ease',
    itemFrom: { opacity: 0, transform: 'none' }, itemTo: { opacity: 1, transform: 'none' },
    overlay: '0.3s ease',
  },
  {
    name: 'Slide',
    panel: { closed: { opacity: 0, transform: 'translateY(-8px)' }, open: { opacity: 1, transform: 'translateY(0)' }, transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)' },
    itemStagger: 40, itemDuration: '0.3s', itemEasing: 'cubic-bezier(0.16,1,0.3,1)',
    itemFrom: { opacity: 0, transform: 'translateY(6px)' }, itemTo: { opacity: 1, transform: 'translateY(0)' },
    overlay: '0.35s ease',
  },
  {
    name: 'Scale',
    panel: { closed: { opacity: 0, transform: 'scale(0.97) translateY(-4px)' }, open: { opacity: 1, transform: 'scale(1) translateY(0)' }, transition: 'opacity 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' },
    itemStagger: 30, itemDuration: '0.28s', itemEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    itemFrom: { opacity: 0, transform: 'scale(0.95)' }, itemTo: { opacity: 1, transform: 'scale(1)' },
    overlay: '0.3s ease',
  },
  {
    name: 'Cascade',
    panel: { closed: { opacity: 0, transform: 'translateY(-6px)' }, open: { opacity: 1, transform: 'translateY(0)' }, transition: 'opacity 0.3s ease, transform 0.3s ease' },
    itemStagger: 60, itemDuration: '0.32s', itemEasing: 'cubic-bezier(0.16,1,0.3,1)',
    itemFrom: { opacity: 0, transform: 'translateX(12px)' }, itemTo: { opacity: 1, transform: 'translateX(0)' },
    overlay: '0.3s ease',
  },
  {
    name: 'Soft',
    panel: { closed: { opacity: 0, transform: 'translateY(-3px)' }, open: { opacity: 1, transform: 'translateY(0)' }, transition: 'opacity 0.5s ease, transform 0.5s ease' },
    itemStagger: 50, itemDuration: '0.4s', itemEasing: 'ease',
    itemFrom: { opacity: 0, transform: 'translateY(4px)' }, itemTo: { opacity: 1, transform: 'translateY(0)' },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [animIdx, setAnimIdx] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spotlightNavAnimStyle');
      return saved !== null ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [itemsVisible, setItemsVisible] = useState(false);
  const navRef = useRef(null);

  const anim = ANIM_STYLES[animIdx];

  const cycleAnim = useCallback(() => {
    setAnimIdx(prev => {
      const next = (prev + 1) % ANIM_STYLES.length;
      localStorage.setItem('spotlightNavAnimStyle', next);
      return next;
    });
  }, []);

  // Keyboard shortcut: A to cycle animation style
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'a' || e.key === 'A') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        cycleAnim();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cycleAnim]);

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

  const isOpen = openIdx >= 0;
  const section = isOpen ? SECTIONS[openIdx] : null;

  const close = useCallback(() => {
    setOpenIdx(-1);
    setHoveredItem(null);
    setItemsVisible(false);
  }, []);

  const toggle = useCallback((idx) => {
    if (openIdx === idx) {
      close();
    } else {
      setOpenIdx(idx);
      setHoveredItem(null);
      setItemsVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setItemsVisible(true);
        });
      });
    }
  }, [openIdx, close]);

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
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#ffffff',
          borderBottom: '1px solid rgba(108,26,85,0.10)',
          boxShadow: '0 10px 30px rgba(61,15,49,0.07)',
          opacity: isOpen ? anim.panel.open.opacity : anim.panel.closed.opacity,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? anim.panel.open.transform : anim.panel.closed.transform,
          transition: anim.panel.transition,
          boxSizing: 'border-box',
        }}
      >
        {section && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '32px 48px 36px',
            display: 'flex',
            gap: '56px',
          }}>
            {(() => {
              let globalIdx = 0;
              return section.groups.map((group) => (
                <div key={group.name} style={{ flex: 1, minWidth: 0 }}>
                  {/* Group label */}
                  <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.35)',
                    marginBottom: '16px',
                    fontFamily: 'Lato, sans-serif',
                    opacity: anim.itemStagger > 0 ? (itemsVisible ? 1 : 0) : 1,
                    transform: anim.itemStagger > 0 ? (itemsVisible ? 'none' : anim.itemFrom.transform || 'none') : 'none',
                    transition: `opacity ${anim.itemDuration} ${anim.itemEasing}, transform ${anim.itemDuration} ${anim.itemEasing}`,
                    transitionDelay: anim.itemStagger > 0 ? `${60 + globalIdx * anim.itemStagger}ms` : '0s',
                  }}>
                    {group.name}
                  </div>

                  {/* Items */}
                  {group.items.map((it) => {
                    const Icon = ICON_MAP[it.icon];
                    const itemId = `${group.name}-${it.title}`;
                    const isHovered = hoveredItem === itemId;
                    const staggerDelay = 80 + globalIdx * anim.itemStagger;
                    globalIdx++;

                    return (
                      <a
                        key={it.title}
                        href={resolveHref(it.href)}
                        onMouseEnter={() => setHoveredItem(itemId)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          background: isHovered ? 'rgba(0,0,0,0.03)' : 'transparent',
                          transition: `background 0.15s, opacity ${anim.itemDuration} ${anim.itemEasing}, transform ${anim.itemDuration} ${anim.itemEasing}`,
                          transitionDelay: anim.itemStagger > 0 ? `0s, ${staggerDelay}ms, ${staggerDelay}ms` : '0s',
                          opacity: anim.itemStagger > 0 ? (itemsVisible ? anim.itemTo.opacity : anim.itemFrom.opacity) : 1,
                          transform: anim.itemStagger > 0 ? (itemsVisible ? (anim.itemTo.transform || 'none') : (anim.itemFrom.transform || 'none')) : 'none',
                        }}
                      >
                        {Icon && (
                          <span style={{
                            width: '20px',
                            height: '20px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon
                              size={18}
                              strokeWidth={1.5}
                              color="rgba(0,0,0,0.4)"
                            />
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'Lato, sans-serif',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: '#1d1d1f',
                        }}>
                          {it.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Animation style toggle pill */}
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
