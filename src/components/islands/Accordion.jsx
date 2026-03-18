import { useState, useRef, useCallback } from 'react';

/*
 * Accordion — Reusable FAQ/accordion component.
 *
 * Props:
 *   items: array of { question: string, answer: string }
 *     — OR, for grouped mode —
 *   groups: array of { category: string, items: [{ question, answer }] }
 *
 *   categorySpacing: number (default 64) — spacing between category groups
 */

const styles = {
  category: {
    marginBottom: 64,
  },
  categoryLast: {
    marginBottom: 0,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#6C1A55',
    marginBottom: 20,
  },
  faqItem: {
    borderBottom: '1px solid #E8E2DC',
    overflow: 'hidden',
  },
  faqItemLast: {
    borderBottom: 'none',
  },
  faqQ: {
    padding: '20px 0',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#2C2A26',
    userSelect: 'none',
    fontFamily: "'Lato', sans-serif",
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  },
  icon: {
    width: 24,
    height: 24,
    position: 'relative',
    flexShrink: 0,
    marginLeft: 16,
  },
  iconBar: {
    position: 'absolute',
    background: '#C06AA5',
    borderRadius: 1,
  },
  iconHorizontal: {
    width: 14,
    height: 2,
    top: 11,
    left: 5,
  },
  iconVertical: {
    width: 2,
    height: 14,
    top: 5,
    left: 11,
    transition: 'transform 0.3s ease',
  },
  iconVerticalOpen: {
    transform: 'rotate(90deg)',
  },
  faqA: {
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.35s ease, opacity 0.3s ease',
    opacity: 0,
  },
  faqAOpen: {
    opacity: 1,
  },
  faqAInner: {
    padding: '0 0 20px',
    fontSize: 15,
    color: '#8A857A',
    lineHeight: 1.7,
    maxWidth: 720,
    fontFamily: "'Lato', sans-serif",
  },
};

function AccordionItem({ question, answer, isOpen, onToggle, isLast }) {
  const answerRef = useRef(null);

  return (
    <div style={{ ...styles.faqItem, ...(isLast ? styles.faqItemLast : {}) }}>
      <button style={styles.faqQ} onClick={onToggle} aria-expanded={isOpen}>
        <span>{question}</span>
        <div style={styles.icon}>
          <div style={{ ...styles.iconBar, ...styles.iconHorizontal }} />
          <div style={{ ...styles.iconBar, ...styles.iconVertical, ...(isOpen ? styles.iconVerticalOpen : {}) }} />
        </div>
      </button>
      <div
        ref={answerRef}
        style={{
          ...styles.faqA,
          ...(isOpen ? styles.faqAOpen : {}),
          maxHeight: isOpen ? (answerRef.current?.scrollHeight || 0) + 'px' : '0',
        }}
      >
        <div style={styles.faqAInner}>{answer}</div>
      </div>
    </div>
  );
}

export default function Accordion({ items, groups, categorySpacing = 64 }) {
  const [openKey, setOpenKey] = useState(null);

  const toggle = useCallback((key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);

  // Grouped mode (FAQ page style)
  if (groups && groups.length > 0) {
    return (
      <div>
        {groups.map((group, gi) => (
          <div
            key={gi}
            style={{
              ...styles.category,
              marginBottom: gi === groups.length - 1 ? 0 : categorySpacing,
            }}
          >
            <div style={styles.catLabel}>{group.category}</div>
            {group.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              return (
                <AccordionItem
                  key={key}
                  question={item.question || item.q}
                  answer={item.answer || item.a}
                  isOpen={openKey === key}
                  onToggle={() => toggle(key)}
                  isLast={ii === group.items.length - 1}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Flat mode (single list)
  if (items && items.length > 0) {
    return (
      <div>
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            question={item.question || item.q}
            answer={item.answer || item.a}
            isOpen={openKey === i}
            onToggle={() => toggle(i)}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    );
  }

  return null;
}
