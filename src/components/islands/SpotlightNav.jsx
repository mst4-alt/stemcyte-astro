import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift, Shield,
  Star, Globe, BookHeart,
  Sparkles, UserPlus, FlaskConical, Baby,
  Heart, BabyIcon, ClipboardList, FileText, Stethoscope,
  ChevronDown,
} from 'lucide-react';

const ICON_MAP = {
  Droplet, Dna, Scale, Users, Clock, CircleHelp,
  Tag, Search, Gift, Shield,
  Star, Globe, BookHeart,
  Sparkles, UserPlus, FlaskConical, Baby,
  Heart, BabyIcon, ClipboardList, FileText, Stethoscope,
};

const SECTIONS = [
  {
    label: 'Your Pregnancy',
    href: '#',
    groups: [
      {
        name: 'Resources',
        items: [
          { title: 'Your Personal Guide to Pregnancy', href: '#', icon: 'Heart' },
          { title: 'Hospital Bag Checklist', href: '#', icon: 'ClipboardList' },
        ],
      },
      {
        name: 'Planning',
        items: [
          { title: 'Birth Plan Template', href: '#', icon: 'FileText' },
          { title: 'Understanding Your Screenings', href: '#', icon: 'Stethoscope' },
        ],
      },
    ],
  },
  {
    label: 'Cord Blood Basics',
    href: '/learn/',
    groups: [
      {
        name: 'The Science',
        items: [
          { title: 'Why Stem Cells Matter', href: '#', icon: 'Sparkles' },
          { title: 'What Is Cord Blood', href: '/learn/what-is-cord-blood', icon: 'Droplet' },
          { title: 'What Is Cord Tissue', href: '/learn/what-is-cord-tissue', icon: 'Dna' },
          { title: 'Public vs. Private Banking', href: '/learn/public-vs-private-banking', icon: 'Scale' },
        ],
      },
      {
        name: 'How It Works',
        items: [
          { title: 'Collection: Step by Step', href: '/learn/how-collection-works', icon: 'Clock' },
          { title: 'How Your Family Can Use It', href: '/learn/how-your-family-can-use-it', icon: 'Users' },
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
        name: 'Get Started',
        items: [
          { title: 'Plan Options', href: '/pricing', icon: 'Tag' },
        ],
      },
      {
        name: 'Advanced Protection',
        items: [
          { title: 'Public Bank Access', href: '/public-bank-access', icon: 'Search' },
          { title: 'HLA Matching', href: '#', icon: 'Dna' },
          { title: 'Newborn Genetic Analysis', href: '#', icon: 'FlaskConical' },
        ],
      },
      {
        name: 'Community Programs',
        items: [
          { title: 'Special Programs', href: '/special-programs', icon: 'Gift' },
          { title: 'LifeSaver Guarantee', href: '/lifesaver-guarantee', icon: 'Shield' },
          { title: 'Refer a Friend', href: '#', icon: 'UserPlus' },
        ],
      },
    ],
  },
  {
    label: 'Why StemCyte',
    href: '/our-story/',
    groups: [
      {
        name: 'About',
        items: [
          { title: 'Who We Are', href: '#', icon: 'Star' },
          { title: 'Our Impact', href: '#', icon: 'Globe' },
        ],
      },
      {
        name: 'Community',
        items: [
          { title: 'Patient Stories', href: '/patient-stories', icon: 'BookHeart' },
        ],
      },
    ],
  },
];

const EXISTING_PAGES = new Set([
  '/pricing', '/public-bank-access', '/special-programs',
  '/our-story/', '/why-stemcyte', '/patient-stories', '/lifesaver-guarantee',
]);

function resolveHref(href) {
  if (href === '#') return '#';
  return EXISTING_PAGES.has(href) ? href : '#';
}

// Cascade stagger: 60ms between items, slides in from right
const CASCADE_STAGGER = 50;
const CASCADE_DURATION = '0.35s';
const CASCADE_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function SpotlightNav() {
  const [openIdx, setOpenIdx] = useState(-1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cascadeVisible, setCascadeVisible] = useState(false);
  const navRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  const [navTheme, setNavTheme] = useState('light');

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
    setCascadeVisible(false);
  }, []);

  const toggle = useCallback((idx) => {
    if (openIdx === idx) {
      close();
    } else {
      setCascadeVisible(false);
      setOpenIdx(idx);
      setHoveredItem(null);
    }
  }, [openIdx, close]);

  // Trigger cascade after open
  useEffect(() => {
    if (isOpen) {
      setCascadeVisible(false);
      const t = setTimeout(() => setCascadeVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [openIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Allow scrolling while menu is open — close menu on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => close();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isOpen, close]);

  // Force nav to scrolled state when open
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    if (isOpen) {
      nav.classList.remove('at-top');
      nav.classList.add('scrolled');
      nav.style.background = '#ffffff';
      nav.style.borderBottom = 'none';
      nav.style.boxShadow = 'none';
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

  // Collect all animatable items in DOM order for cascade indexing
  let cascadeIdx = 0;

  return (
    <>
      {/* Nav buttons */}
      <div ref={navRef} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {SECTIONS.map((sec, i) => {
          const isActive = openIdx === i;
          const defaultColor = isScrolled ? '#6B5A63' : navTheme === 'dark' ? 'rgba(44,42,38,0.6)' : 'rgba(255,255,255,0.75)';
          const hoverColor = isScrolled ? '#2D1A24' : navTheme === 'dark' ? '#2C2A26' : '#fff';
          const hoverBg = isScrolled ? '#F5EDF2' : navTheme === 'dark' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)';
          const activeColor = isScrolled ? '#803366' : navTheme === 'dark' ? '#2C2A26' : '#fff';
          const activeBg = isScrolled ? '#F2E6EE' : navTheme === 'dark' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)';

          return (
            <button
              key={sec.label}
              onClick={() => toggle(i)}
              style={{
                display: 'inline-grid',
                gridTemplateColumns: '1fr auto',
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
                if (isOpen && !isActive) {
                  // Switch sections on hover when menu is already open
                  setOpenIdx(i);
                  setHoveredItem(null);
                } else if (!isActive) {
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
              {/* Label with bold-width reservation to prevent layout shift */}
              <span style={{
                display: 'grid',
                gridTemplateAreas: '"text"',
                justifyItems: 'start',
              }}>
                <span style={{ gridArea: 'text', visibility: 'hidden', fontWeight: 600, pointerEvents: 'none' }} aria-hidden="true">{sec.label}</span>
                <span style={{ gridArea: 'text' }}>{sec.label}</span>
              </span>
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
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 998,
          background: 'rgba(45, 26, 36, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Clip region — hides panel when slid up above nav */}
      <div style={{
        position: 'fixed',
        top: '72px',
        left: 0,
        right: 0,
        zIndex: 999,
        overflow: 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}>
        {/* Dropdown panel — slides down/up */}
        <div
          ref={panelRef}
          style={{
            background: '#ffffff',
            borderTop: '1px solid #E8E2DC',
            borderBottom: '1px solid rgba(108,26,85,0.10)',
            boxShadow: '0 10px 30px rgba(61,15,49,0.07)',
            transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
            transition: isOpen
              ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        >
        {section && (
          <div
            ref={contentRef}
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '28px 48px 32px',
              display: 'flex',
              gap: '48px',
            }}
          >
            {section.groups.map((group) => {
              // Group label gets its own cascade slot
              const labelIdx = cascadeIdx++;

              return (
                <div key={group.name} style={{ flex: 1, minWidth: 0 }}>
                  {/* Group label */}
                  <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    color: '#998B90',
                    marginBottom: '14px',
                    fontFamily: 'Lato, sans-serif',
                    opacity: cascadeVisible ? 1 : 0,
                    transform: cascadeVisible ? 'translateX(0)' : 'translateX(12px)',
                    transition: `opacity ${CASCADE_DURATION} ${CASCADE_EASING} ${labelIdx * CASCADE_STAGGER}ms, transform ${CASCADE_DURATION} ${CASCADE_EASING} ${labelIdx * CASCADE_STAGGER}ms`,
                  }}>
                    {group.name}
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {group.items.map((it) => {
                      const Icon = ICON_MAP[it.icon];
                      const itemId = `${group.name}-${it.title}`;
                      const isHovered = hoveredItem === itemId;
                      const idx = cascadeIdx++;

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
                            padding: '12px 16px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            background: isHovered ? '#F8F3F6' : 'transparent',
                            transition: `background 0.15s, opacity ${CASCADE_DURATION} ${CASCADE_EASING} ${idx * CASCADE_STAGGER}ms, transform ${CASCADE_DURATION} ${CASCADE_EASING} ${idx * CASCADE_STAGGER}ms`,
                            opacity: cascadeVisible ? 1 : 0,
                            transform: cascadeVisible ? 'translateX(0)' : 'translateX(12px)',
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
                                color={isHovered ? '#733A5C' : '#998B90'}
                                style={{ transition: 'color 0.15s' }}
                              />
                            </span>
                          )}
                          <span style={{
                            fontFamily: 'Lato, sans-serif',
                            fontSize: '0.925rem',
                            fontWeight: isHovered ? 500 : 400,
                            color: isHovered ? '#8C4670' : '#635558',
                            transition: 'color 0.15s',
                            whiteSpace: 'nowrap',
                          }}>
                            {it.title}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
