import { useEffect, useRef, useState } from 'react';

export default function TextReveal({ text, tag = 'h1', className = '' }) {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const words = text.split(' ');
  const Tag = tag;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const span = entry.target;
            span.style.opacity = '1';
            span.style.filter = 'blur(0)';
            observer.unobserve(span);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-25% 0px -25% 0px' }
    );

    wordRefs.current.forEach((span) => {
      if (span) observer.observe(span);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => (wordRefs.current[i] = el)}
          style={{
            display: 'inline',
            opacity: reducedMotion ? 1 : 0.12,
            filter: reducedMotion ? 'none' : 'blur(4px)',
            transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)',
            transitionDelay: `${i * 20}ms`,
          }}
        >
          {word}{' '}
        </span>
      ))}
    </Tag>
  );
}
