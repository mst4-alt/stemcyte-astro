import { useEffect, useRef, useState } from 'react';

/*
 * NumberCounter — Animated count-up number with last-few-ticks variable speed.
 *
 * Props:
 *   target: number — the final value to count to
 *   suffix: string — text appended after the number (e.g., '+', '%', ' mo')
 *   prefix: string — text prepended before the number (e.g., '$')
 *   label: string — descriptive text below the number
 *   text: string — if provided, displays this static text instead of counting (e.g., '1 in 26')
 *   noFormat: boolean — if true, skip toLocaleString formatting
 *   from: number — starting value (defaults to target - 10 or 0)
 *   tickInterval: number — ms between ticks (default 100)
 *   startDelay: number — ms delay before animation starts (default 0)
 *   threshold: number — IntersectionObserver threshold (default 0.5)
 *   numberStyle: object — additional styles for the number element
 *   labelStyle: object — additional styles for the label element
 */

const baseStyles = {
  wrapper: {
    textAlign: 'center',
  },
  number: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 36,
    color: '#6C1A55',
    fontWeight: 400,
    lineHeight: 1,
  },
  label: {
    fontSize: 12,
    color: '#8A857A',
    marginTop: 4,
    lineHeight: 1.4,
  },
};

export default function NumberCounter({
  target,
  suffix = '',
  prefix = '',
  label = '',
  text = null,
  noFormat = false,
  from,
  tickInterval = 100,
  startDelay = 0,
  threshold = 0.5,
  numberStyle = {},
  labelStyle = {},
  style = {},
}) {
  const elRef = useRef(null);
  const [display, setDisplay] = useState(() => {
    if (text) return text;
    const val = noFormat ? String(target) : target.toLocaleString();
    return prefix + val + suffix;
  });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (text) return; // static text, no animation needed
    const el = elRef.current;
    if (!el) return;

    const startFrom = from !== undefined ? from : Math.max(0, target - 10);
    const format = (n) => prefix + (noFormat ? String(n) : n.toLocaleString()) + suffix;

    // Set initial display
    setDisplay(format(target));

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          let current = startFrom;
          setDisplay(format(current));

          function tick() {
            if (current < target) {
              current++;
              setDisplay(format(current));

              // Variable speed: slower on last few ticks for dramatic effect
              const remaining = target - current;
              let interval = tickInterval;
              if (remaining <= 3) interval = tickInterval * 2.5;
              else if (remaining <= 6) interval = tickInterval * 1.5;

              setTimeout(tick, interval);
            }
          }

          setTimeout(tick, startDelay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, prefix, text, noFormat, from, tickInterval, startDelay, threshold]);

  return (
    <div ref={elRef} style={{ ...baseStyles.wrapper, ...style }}>
      <div style={{ ...baseStyles.number, ...numberStyle }}>
        {display}
      </div>
      {label && <div style={{ ...baseStyles.label, ...labelStyle }}>{label}</div>}
    </div>
  );
}
