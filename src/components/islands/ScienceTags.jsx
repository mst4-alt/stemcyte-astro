import { useEffect, useRef, useState } from 'react';

/*
 * ScienceTags — Interactive disease tag clusters with mouse physics.
 *
 * Props:
 *   categories: array of { title, count, color, bgColor, borderColor, tags: [{ name, tip }] }
 *
 * If no categories prop is provided, default disease data is used.
 */

const DEFAULT_CATEGORIES = [
  {
    title: 'Cancers & malignancies',
    count: '22+',
    color: '#6C1A55',
    bgColor: '#FBF5F9',
    borderColor: '#F0E0EB',
    tags: [
      { name: 'B-cell ALL', tip: 'The most common childhood leukemia. Cord blood transplant replaces cancerous bone marrow with healthy stem cells that rebuild the immune system.' },
      { name: 'T-cell ALL', tip: 'An aggressive form of acute lymphoblastic leukemia affecting T-cells. Transplant offers a curative option when chemotherapy alone is insufficient.' },
      { name: 'Acute myeloid leukemia', tip: 'Fast-growing cancer of blood-forming cells in the bone marrow. Cord blood transplant is often the best option when chemotherapy fails or disease relapses.' },
      { name: 'Chronic myeloid leukemia', tip: 'Slower-growing blood cancer caused by an abnormal chromosome. Transplant can cure when targeted therapies like imatinib stop working.' },
      { name: 'JMML', tip: 'Juvenile myelomonocytic leukemia — a rare childhood leukemia. Stem cell transplant is currently the only known cure for this disease.' },
      { name: 'Hodgkin lymphoma', tip: 'Cancer of the lymphatic system characterized by Reed-Sternberg cells. Transplant used for relapsed or treatment-resistant cases.' },
      { name: 'DLBCL', tip: 'Diffuse large B-cell lymphoma — the most common type of non-Hodgkin lymphoma. Transplant rebuilds the immune system after intensive treatment.' },
      { name: 'Burkitt lymphoma', tip: 'A very fast-growing form of non-Hodgkin lymphoma, most common in children. Transplant provides a curative pathway for aggressive cases.' },
      { name: 'Multiple myeloma', tip: 'Cancer of plasma cells in the bone marrow. Transplant follows high-dose chemotherapy to restore healthy blood cell production.' },
      { name: 'Mantle cell lymphoma', tip: 'A rare B-cell lymphoma that tends to recur. Transplant can extend remission and improve long-term outcomes.' },
      { name: 'Follicular lymphoma', tip: 'A slow-growing but often recurring non-Hodgkin lymphoma. Transplant considered for cases that transform or stop responding to treatment.' },
      { name: 'Waldenström\'s', tip: 'Waldenström\'s macroglobulinemia — a rare lymphoma producing excess antibody protein. Transplant for aggressive or treatment-resistant disease.' },
    ],
  },
  {
    title: 'Blood & marrow disorders',
    count: '17+',
    color: '#3B6DC4',
    bgColor: '#EDF5FF',
    borderColor: '#D4E4FF',
    tags: [
      { name: 'Sickle cell disease', tip: 'Red blood cells become rigid and sickle-shaped, blocking blood flow and causing pain crises. Transplant can cure the disease by replacing faulty marrow.' },
      { name: 'Beta-thalassemia major', tip: 'Severely abnormal hemoglobin production requiring lifelong transfusions. Transplant is the only potential cure for the most severe form.' },
      { name: 'Severe aplastic anemia', tip: 'Bone marrow stops making enough blood cells, causing dangerous drops in all blood counts. Transplant replaces the damaged marrow entirely.' },
      { name: 'Fanconi anemia', tip: 'Rare inherited condition causing progressive bone marrow failure and cancer predisposition. Transplant is the primary life-saving treatment.' },
      { name: 'Diamond-Blackfan anemia', tip: 'The body cannot make enough red blood cells from birth. Transplant can cure the underlying genetic defect in the bone marrow.' },
      { name: 'MDS', tip: 'Myelodysplastic syndromes — bone marrow fails to produce healthy blood cells properly. Transplant replaces faulty marrow with healthy stem cells.' },
      { name: 'Myelofibrosis', tip: 'Scar tissue replaces healthy bone marrow, disrupting normal blood cell production. Transplant is the only curative treatment available.' },
      { name: 'Dyskeratosis congenita', tip: 'Rare genetic disorder causing bone marrow failure, abnormal skin, and nail changes. Transplant addresses the life-threatening marrow failure.' },
      { name: 'Shwachman-Diamond', tip: 'Inherited condition affecting bone marrow, the pancreas, and skeletal development. Transplant treats the marrow failure component.' },
      { name: 'PNH', tip: 'Paroxysmal nocturnal hemoglobinuria — red blood cells break down prematurely due to a missing surface protein. Transplant is the only curative treatment.' },
    ],
  },
  {
    title: 'Immune deficiencies',
    count: '30+',
    color: '#2A6B4F',
    bgColor: '#F0F7F4',
    borderColor: '#D4E8DC',
    tags: [
      { name: 'SCID', tip: 'Severe combined immunodeficiency — "bubble boy disease." Without transplant, infants cannot survive normal infections. Early transplant is life-saving.' },
      { name: 'Wiskott-Aldrich', tip: 'Causes eczema, dangerously low platelets, and progressive immune deficiency. Transplant is the only known cure for this X-linked condition.' },
      { name: 'CGD', tip: 'Chronic granulomatous disease — white blood cells cannot kill certain bacteria and fungi, leading to severe recurrent infections. Transplant restores immune function.' },
      { name: 'Complete DiGeorge', tip: 'The most severe form of DiGeorge syndrome with absent thymus function and no T-cells. Transplant can reconstitute the immune system.' },
      { name: 'Omenn syndrome', tip: 'A severe form of SCID with widespread skin inflammation, enlarged organs, and elevated IgE. Transplant is urgently life-saving.' },
      { name: 'Bare lymphocyte syndrome', tip: 'Immune cells lack critical MHC surface molecules needed to coordinate immune responses. Transplant provides cells with normal surface proteins.' },
      { name: 'Leukocyte adhesion deficiency', tip: 'White blood cells cannot migrate to infection sites in the body. Even minor infections become life-threatening without transplant.' },
      { name: 'IPEX syndrome', tip: 'Immune dysregulation, polyendocrinopathy, enteropathy, X-linked — the immune system attacks the body\'s own organs. Transplant can reset the immune system.' },
      { name: 'HLH', tip: 'Hemophagocytic lymphohistiocytosis — immune cells become overactivated and attack the body\'s own tissues. Transplant is curative for the familial form.' },
      { name: 'Hyper IgM syndromes', tip: 'B-cells cannot switch from making IgM to other antibody types, leaving patients vulnerable to infections. Transplant restores normal antibody production.' },
      { name: '+ 20 more SCIDs', tip: 'Over 20 molecularly defined forms of SCID — including CD45, CD3, ZAP70, Artemis, PNP, and DOCK2 deficiencies — are treatable with cord blood transplant.' },
    ],
  },
  {
    title: 'Metabolic disorders',
    count: '16+',
    color: '#C4943E',
    bgColor: '#FDF5EB',
    borderColor: '#F5E6CC',
    tags: [
      { name: 'Hurler syndrome', tip: 'Cannot break down complex sugar molecules, causing progressive damage to the brain, heart, and organs. Early transplant prevents irreversible decline.' },
      { name: 'Krabbe disease', tip: 'Destroys the protective myelin coating of nerves in the brain and body. Early transplant before symptom onset can slow or halt progression.' },
      { name: 'ALD', tip: 'Adrenoleukodystrophy — damages the myelin sheath protecting brain nerves. Transplant in early stages can halt disease progression and preserve function.' },
      { name: 'MLD', tip: 'Metachromatic leukodystrophy — progressive loss of myelin in the nervous system. Early transplant can stabilize the disease before major symptoms appear.' },
      { name: 'Gaucher disease', tip: 'Fat deposits accumulate in the spleen, liver, and bone marrow. Transplant addresses severe forms that don\'t respond to enzyme replacement therapy.' },
      { name: 'Wolman disease', tip: 'A severe lipid storage disorder causing organ damage in infancy. Transplant can provide the missing enzyme and prevent fatal organ failure.' },
      { name: 'Alpha-mannosidosis', tip: 'A rare lysosomal storage disorder causing progressive intellectual disability and skeletal abnormalities. Transplant can slow disease progression.' },
      { name: 'Maroteaux-Lamy', tip: 'MPS VI — the body cannot break down certain complex sugars, leading to skeletal deformities and organ damage. Transplant provides the missing enzyme.' },
      { name: 'Osteopetrosis', tip: 'Bones become abnormally dense and brittle due to faulty osteoclasts. Transplant provides healthy cells capable of proper bone remodeling.' },
    ],
  },
];

const baseStyles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    maxWidth: 1100,
  },
  block: {
    borderRadius: 16,
    padding: 28,
    overflow: 'visible',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerH4: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  count: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 20,
    fontWeight: 400,
    opacity: 0.6,
  },
  tagWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'default',
    position: 'relative',
    transition: 'transform 0.15s ease-out, box-shadow 0.2s',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  tip: {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2C2A26',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.5,
    width: 280,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.2s',
    zIndex: 20,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  tipVisible: {
    opacity: 1,
  },
};

function Tag({ name, tip, color, tagKey, openTip, setOpenTip }) {
  const isHovered = useRef(false);
  const isOpen = openTip === tagKey;

  const showTip = isOpen || isHovered.current;

  return (
    <div
      className="science-tag"
      style={{
        ...baseStyles.tag,
        color,
      }}
      onMouseEnter={() => { isHovered.current = true; setOpenTip(tagKey); }}
      onMouseLeave={() => { isHovered.current = false; if (openTip === tagKey) setOpenTip(null); }}
      onClick={() => setOpenTip(isOpen ? null : tagKey)}
    >
      {name}
      <div style={{ ...baseStyles.tip, ...(isOpen ? baseStyles.tipVisible : {}) }}>
        {tip}
      </div>
    </div>
  );
}

export default function ScienceTags({ categories = DEFAULT_CATEGORIES }) {
  const containerRef = useRef(null);
  const [openTip, setOpenTip] = useState(null);

  /* Mouse physics: scatter-nudge on disease tags */
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 900) return;
    const container = containerRef.current;
    if (!container) return;

    const blocks = container.querySelectorAll('[data-disease-block]');
    const cleanups = [];

    blocks.forEach((block) => {
      const tags = block.querySelectorAll('.science-tag');
      let rafId = null;

      const onMouseMove = (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const mx = e.clientX;
          const my = e.clientY;
          tags.forEach((tag) => {
            if (tag.matches(':hover')) {
              tag.style.transform = '';
              return;
            }
            const tr = tag.getBoundingClientRect();
            const cx = tr.left + tr.width / 2;
            const cy = tr.top + tr.height / 2;
            const dx = cx - mx;
            const dy = cy - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 0) {
              const strength = (1 - dist / 150) * 3.5;
              const nx = (dx / dist) * strength;
              const ny = (dy / dist) * strength;
              tag.style.transform = `translate(${nx.toFixed(1)}px,${ny.toFixed(1)}px)`;
            } else {
              tag.style.transform = '';
            }
          });
        });
      };

      const onMouseLeave = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        tags.forEach((tag) => {
          tag.style.transform = '';
        });
      };

      block.addEventListener('mousemove', onMouseMove);
      block.addEventListener('mouseleave', onMouseLeave);
      cleanups.push(() => {
        block.removeEventListener('mousemove', onMouseMove);
        block.removeEventListener('mouseleave', onMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div ref={containerRef} style={baseStyles.grid}>
      {categories.map((cat, i) => (
        <div
          key={i}
          data-disease-block
          style={{
            ...baseStyles.block,
            background: cat.bgColor,
            border: `1px solid ${cat.borderColor}`,
          }}
        >
          <div style={baseStyles.header}>
            <h4 style={{ ...baseStyles.headerH4, color: cat.color }}>{cat.title}</h4>
            <div style={{ ...baseStyles.count, color: cat.color }}>{cat.count}</div>
          </div>
          <div style={baseStyles.tagWrap}>
            {cat.tags.map((tag, j) => (
              <Tag
                key={j}
                name={tag.name}
                tip={tag.tip}
                color={cat.color}
                tagKey={`${i}-${j}`}
                openTip={openTip}
                setOpenTip={setOpenTip}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
