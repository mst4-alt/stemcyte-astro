import { useEffect, useRef, useState } from 'react';

function OdometerColumn({ digit, digitHeight, delay, triggered, reducedMotion }) {
  const stripRef = useRef(null);

  useEffect(() => {
    if (!triggered || reducedMotion) return;
    const strip = stripRef.current;
    if (!strip) return;

    // Small delay for cascade effect
    const timer = setTimeout(() => {
      strip.style.transition = `transform 1s ${delay}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
      strip.style.transform = `translateY(-${digit * digitHeight}px)`;
    }, 50);

    return () => clearTimeout(timer);
  }, [triggered, digit, digitHeight, delay, reducedMotion]);

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <span
      style={{
        display: 'inline-block',
        height: digitHeight,
        overflow: 'hidden',
        verticalAlign: 'bottom',
        width: '0.62em',
      }}
    >
      <span
        ref={stripRef}
        style={{
          display: 'block',
          transform: reducedMotion ? `translateY(-${digit * digitHeight}px)` : 'translateY(0)',
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            style={{
              display: 'block',
              height: digitHeight,
              lineHeight: `${digitHeight}px`,
              textAlign: 'center',
            }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Odometer({
  value,
  suffix = '',
  label = '',
  color = '#4FA3B8',
  digitHeight = 48,
  className = '',
}) {
  const [triggered, setTriggered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wrapRef = useRef(null);

  const digitStr = String(value);
  const digits = digitStr.split('').map(Number);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTriggered(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <div
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: digitHeight,
          fontWeight: 400,
          color,
          display: 'inline-flex',
          alignItems: 'baseline',
          lineHeight: 1,
        }}
      >
        {digits.map((d, i) => (
          <OdometerColumn
            key={i}
            digit={d}
            digitHeight={digitHeight}
            delay={i * 120}
            triggered={triggered}
            reducedMotion={reducedMotion}
          />
        ))}
        {suffix && (
          <span style={{ fontSize: digitHeight * 0.7, opacity: 0.6 }}>{suffix}</span>
        )}
      </div>
      {label && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
