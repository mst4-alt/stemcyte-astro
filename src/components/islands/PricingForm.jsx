import { useState, useCallback } from 'react';

/* ── PRICING DATA ── */
const PRICING = {
  cb: {
    label: 'Cord Blood',
    processing: 725,
    plans: {
      annual: { storage: 200, total: 725, label: 'Annual', savings: 0 },
      '18year': { total: 3560, label: '18-Year Prepaid', savings: 765 },
      lifetime: { total: 5625, label: 'Lifetime', savings: 2300 },
    },
  },
  cbt: {
    label: 'Cord Blood & Tissue',
    processing: 995,
    plans: {
      annual: { storage: 400, total: 995, label: 'Annual', savings: 0 },
      '18year': { total: 6665, label: '18-Year Prepaid', savings: 1530 },
      lifetime: { total: 10795, label: 'Lifetime', savings: 4600 },
    },
  },
};

const ADDONS = {
  pba: { name: 'Public Bank Access', price: 299, prepaidPrice: 299, desc: 'If your child needs more stem cells, StemCyte searches our public bank and all global public banks for a match.' },
  pbaPlus: { name: 'Public Bank Access+', price: 699, prepaidPrice: 699, desc: 'Extends public bank access to both parents — access donor cord blood units for eligible conditions, even without their own banked cord blood.' },
  hla: { name: 'HLA Matching', price: 295, prepaidPrice: 195, desc: 'Determines compatibility for transplantation between family members. Important for sibling banking.' },
  nga: { name: 'NGA', price: 399, prepaidPrice: 399, desc: 'Next-generation analysis providing detailed cell quality and viability metrics for your stored sample.' },
};

const ADDON_DISPLAY = { pba: 'PBA', pbaPlus: 'PBA+', hla: 'HLA', nga: 'NGA' };

function fmt(n) {
  return '$' + n.toLocaleString();
}

/* ── STYLES ── */
const styles = {
  pageGrid: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '100px 48px 80px',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 48,
    alignItems: 'start',
  },
  main: { minWidth: 0 },
  pageHeader: { marginBottom: 40 },
  lbl: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#6C1A55',
    marginBottom: 10,
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 40,
    fontWeight: 400,
    marginBottom: 8,
    lineHeight: 1.15,
  },
  headerP: { fontSize: 16, color: '#8A857A', maxWidth: 520, lineHeight: 1.7 },
  progress: { display: 'flex', gap: 4, marginBottom: 40 },
  bar: { flex: 1, height: 4, borderRadius: 2, background: '#E8E2DC', transition: 'background 0.3s' },
  barActive: { background: '#6C1A55' },
  barDone: { background: '#C06AA5' },
  stepLabel: { fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#8A857A', marginBottom: 6 },
  stepTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, marginBottom: 20 },
  optGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  optGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 },
  optCard: {
    background: '#fff',
    border: '2px solid #E8E2DC',
    borderRadius: 12,
    padding: 24,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  optCardSelected: {
    borderColor: '#6C1A55',
    boxShadow: '0 0 0 3px rgba(108,26,85,0.12)',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    background: '#6C1A55',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 100,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    background: '#3D8B6A',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 100,
  },
  freeBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    background: '#3D8B6A',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 100,
  },
  optH3: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  optPrice: { fontFamily: "'Source Serif 4', serif", fontSize: 28, color: '#6C1A55', fontWeight: 400, marginBottom: 4 },
  optDet: { fontSize: 12, color: '#B0AB9E', marginBottom: 8 },
  optDesc: { fontSize: 13, color: '#8A857A', lineHeight: 1.5 },
  optSave: { fontSize: 12, color: '#3D8B6A', fontWeight: 700, marginTop: 6 },
  radio: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid #E8E2DC',
    transition: 'all 0.2s',
  },
  radioSelected: {
    borderColor: '#6C1A55',
    background: '#6C1A55',
    boxShadow: 'inset 0 0 0 3px #fff',
  },
  addonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  addonCard: {
    background: '#fff',
    border: '2px solid #E8E2DC',
    borderRadius: 12,
    padding: 20,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  addonCardSelected: {
    borderColor: '#6C1A55',
    boxShadow: '0 0 0 3px rgba(108,26,85,0.12)',
  },
  addonH4: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  addonPrice: { fontFamily: "'Source Serif 4', serif", fontSize: 22, color: '#6C1A55', fontWeight: 400 },
  addonPriceFree: { color: '#3D8B6A' },
  addonDet: { fontSize: 12, color: '#8A857A', lineHeight: 1.4, marginTop: 4 },
  checkBox: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 4,
    border: '2px solid #E8E2DC',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSelected: {
    borderColor: '#6C1A55',
    background: '#6C1A55',
  },
  payGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 },
  formSection: { marginBottom: 24 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formRowFull: { display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 12 },
  formLabel: { fontSize: 12, fontWeight: 700, color: '#6B665D', marginBottom: 4, display: 'block' },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E8E2DC',
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
    color: '#2C2A26',
    background: '#fff',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' },
  checkboxLabel: { fontSize: 13, color: '#6B665D', cursor: 'pointer' },
  payMethods: { display: 'flex', gap: 12, marginBottom: 20 },
  payMethod: {
    flex: 1,
    background: '#fff',
    border: '2px solid #E8E2DC',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 14,
    fontWeight: 700,
    color: '#8A857A',
  },
  payMethodSelected: { borderColor: '#6C1A55', color: '#6C1A55' },
  stepNav: { display: 'flex', gap: 12, marginTop: 32 },
  btnNext: {
    background: '#6C1A55',
    color: '#fff',
    padding: '16px 36px',
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    flex: 1,
    textAlign: 'center',
    transition: 'all 0.25s',
  },
  btnBack: {
    background: 'transparent',
    color: '#6C1A55',
    padding: '16px 24px',
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 700,
    border: '1px solid #E8E2DC',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    transition: 'all 0.25s',
  },
  summary: {
    position: 'sticky',
    top: 90,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  summaryHead: { background: 'linear-gradient(160deg,#6C1A55,#3D0F31)', padding: 24, color: '#fff' },
  summaryHeadH3: { fontSize: 14, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 },
  summaryTotal: { fontFamily: "'Source Serif 4', serif", fontSize: 48, fontWeight: 400, lineHeight: 1 },
  summaryDet: { fontSize: 13, opacity: 0.5, marginTop: 4 },
  summarySavings: { background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'inline-block', marginTop: 12 },
  summaryBody: { padding: 24 },
  summaryLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5EDE6', fontSize: 13 },
  summaryLineLast: { border: 'none' },
  slLabel: { color: '#8A857A' },
  slValue: { fontWeight: 700 },
  slEmpty: { color: '#B0AB9E', fontStyle: 'italic' },
  summaryFooter: { padding: '0 24px 24px' },
  enrollBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    background: '#6C1A55',
    color: '#fff',
    padding: 16,
    borderRadius: 100,
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    transition: 'all 0.2s',
  },
  phoneNote: { marginTop: 12, textAlign: 'center', fontSize: 13, color: '#8A857A' },
  phoneLink: { color: '#6C1A55', textDecoration: 'none', fontWeight: 700 },
};

export default function PricingForm() {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState(null);
  const [plan, setPlan] = useState(null);
  const [addons, setAddons] = useState({});
  const [payPlan, setPayPlan] = useState(null);
  const [payMethod, setPayMethod] = useState('card');

  const isPrepaid = plan && plan !== 'annual';

  const getAddonPrice = useCallback((key) => {
    if (key === 'pba' && product === 'cbt') return 0;
    return isPrepaid ? ADDONS[key].prepaidPrice : ADDONS[key].price;
  }, [product, isPrepaid]);

  const getTotal = useCallback(() => {
    if (!product || !plan) return 0;
    let total = PRICING[product].plans[plan].total;
    Object.keys(addons).forEach((k) => {
      if (addons[k]) total += getAddonPrice(k);
    });
    return total;
  }, [product, plan, addons, getAddonPrice]);

  const getTotalSavings = useCallback(() => {
    if (!product || !plan) return 0;
    let sav = PRICING[product].plans[plan].savings;
    if (addons.hla && isPrepaid) sav += 100;
    if (addons.pba && product === 'cbt') sav += 299;
    return sav;
  }, [product, plan, addons, isPrepaid]);

  const total = getTotal();
  const savings = getTotalSavings();

  const goStep = useCallback((n) => setStep(n), []);

  const selectProduct = useCallback((type) => setProduct(type), []);
  const selectPlan = useCallback((p) => setPlan(p), []);

  const toggleAddon = useCallback((key) => {
    setAddons((prev) => {
      const next = { ...prev };
      if (key === 'pba' && prev.pbaPlus) next.pbaPlus = false;
      if (key === 'pbaPlus' && prev.pba) next.pba = false;
      next[key] = !prev[key];
      return next;
    });
  }, []);

  const selectPayPlan = useCallback((p) => setPayPlan(p), []);

  /* Summary helpers */
  const summaryDet = (() => {
    if (plan === 'annual' && product) {
      return 'Processing + ' + fmt(PRICING[product].plans.annual.storage) + '/yr storage';
    }
    if (plan && product) {
      return PRICING[product].plans[plan].label;
    }
    return 'Select a product to start';
  })();

  const addonSummaryText = (() => {
    const list = [];
    Object.keys(addons).forEach((k) => {
      if (addons[k]) {
        const p = getAddonPrice(k);
        list.push(ADDON_DISPLAY[k] + (p === 0 ? ' (free)' : ' ' + fmt(p)));
      }
    });
    return list.length ? list.join(', ') : null;
  })();

  const paymentSummaryText = (() => {
    if (payPlan === 'full') return 'Pay in full';
    if (payPlan === '6mo') return '6 monthly × ' + fmt(Math.ceil(total / 6));
    if (payPlan === '12mo') return '12 monthly × ' + fmt(Math.ceil(total / 12));
    return null;
  })();

  const annualStorageLabel = product ? fmt(PRICING[product].plans.annual.storage) + '/yr' : '$200/yr';
  const get18YearPrice = product ? fmt(PRICING[product].plans['18year'].total) : '$3,560';
  const get18YearSavings = product ? PRICING[product].plans['18year'].savings : 765;
  const getLifetimePrice = product ? fmt(PRICING[product].plans.lifetime.total) : '$5,625';
  const getLifetimeSavings = product ? PRICING[product].plans.lifetime.savings : 2300;

  const cardStyle = (isSelected) => ({
    ...styles.optCard,
    ...(isSelected ? styles.optCardSelected : {}),
  });

  const radioStyle = (isSelected) => ({
    ...styles.radio,
    ...(isSelected ? styles.radioSelected : {}),
  });

  return (
    <div style={styles.pageGrid}>
      <div style={styles.main}>
        <div style={styles.pageHeader}>
          <div style={styles.lbl}>Pricing</div>
          <h1 style={styles.h1}>Build your plan</h1>
          <p style={styles.headerP}>Choose your product, plan, and protection options. See your total update in real time.</p>
        </div>

        {/* PROGRESS BAR */}
        <div style={styles.progress}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                ...styles.bar,
                ...(i < step ? styles.barDone : {}),
                ...(i === step ? styles.barActive : {}),
              }}
            />
          ))}
        </div>

        {/* STEP 1: PRODUCT */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 1 of 6</div>
          <div style={styles.stepTitle}>What would you like to preserve?</div>
          <div style={styles.optGrid}>
            <div style={cardStyle(product === 'cb')} onClick={() => selectProduct('cb')}>
              <div style={radioStyle(product === 'cb')} />
              <h3 style={styles.optH3}>Cord blood</h3>
              <div style={styles.optPrice}>$725</div>
              <div style={styles.optDet}>Processing + first year storage</div>
              <div style={styles.optDesc}>Hematopoietic stem cells (HSCs) that rebuild blood and immune systems. Treats 80+ diseases.</div>
            </div>
            <div style={cardStyle(product === 'cbt')} onClick={() => selectProduct('cbt')}>
              <div style={styles.badge}>Most comprehensive</div>
              <div style={radioStyle(product === 'cbt')} />
              <h3 style={styles.optH3}>Cord blood & tissue</h3>
              <div style={styles.optPrice}>$995</div>
              <div style={styles.optDet}>Processing + first year storage</div>
              <div style={styles.optDesc}>Both HSCs and mesenchymal stem cells (MSCs). Blood, immune, plus tissue and organ repair. PBA included free.</div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnNext} onClick={() => goStep(2)}>Continue →</button>
          </div>
        </div>

        {/* STEP 2: PLAN */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 2 of 6</div>
          <div style={styles.stepTitle}>Choose your storage plan</div>
          <div style={styles.optGrid3}>
            <div style={cardStyle(plan === 'annual')} onClick={() => selectPlan('annual')}>
              <div style={radioStyle(plan === 'annual')} />
              <h3 style={styles.optH3}>Annual</h3>
              <div style={styles.optPrice}>{annualStorageLabel}</div>
              <div style={styles.optDet}>Pay annually for storage</div>
              <div style={styles.optDesc}>Most flexible. Pay year by year.</div>
            </div>
            <div style={cardStyle(plan === '18year')} onClick={() => selectPlan('18year')}>
              <div style={styles.saveBadge}>Save {fmt(get18YearSavings)}</div>
              <div style={radioStyle(plan === '18year')} />
              <h3 style={styles.optH3}>18-year prepaid</h3>
              <div style={styles.optPrice}>{get18YearPrice}</div>
              <div style={styles.optDet}>Processing + 18 years storage</div>
              <div style={styles.optSave}>Save {fmt(get18YearSavings)} vs. annual</div>
            </div>
            <div style={cardStyle(plan === 'lifetime')} onClick={() => selectPlan('lifetime')}>
              <div style={styles.saveBadge}>Best long-term value</div>
              <div style={radioStyle(plan === 'lifetime')} />
              <h3 style={styles.optH3}>Lifetime</h3>
              <div style={styles.optPrice}>{getLifetimePrice}</div>
              <div style={styles.optDet}>Processing + lifetime storage. Never pay again.</div>
              <div style={styles.optSave}>Save {fmt(getLifetimeSavings)} vs. annual</div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnBack} onClick={() => goStep(1)}>← Back</button>
            <button style={styles.btnNext} onClick={() => goStep(3)}>Continue →</button>
          </div>
        </div>

        {/* STEP 3: ADD-ONS */}
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 3 of 6</div>
          <div style={styles.stepTitle}>Enhance your protection</div>
          <div style={styles.addonGrid}>
            {/* PBA */}
            <div
              style={{ ...styles.addonCard, ...(addons.pba ? styles.addonCardSelected : {}) }}
              onClick={() => toggleAddon('pba')}
            >
              <div style={{ ...styles.checkBox, ...(addons.pba ? styles.checkBoxSelected : {}) }}>{addons.pba && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              <h4 style={styles.addonH4}>Public Bank Access</h4>
              <div style={{ ...styles.addonPrice, ...(product === 'cbt' ? styles.addonPriceFree : {}) }}>
                {product === 'cbt' ? <><span style={{textDecoration:'line-through',color:'#B0AB9E',fontSize:16,marginRight:6}}>$299</span> FREE</> : '$299'}
              </div>
              {product === 'cbt' && <div style={styles.freeBadge}>Free with CB&T</div>}
              <div style={styles.addonDet}>{ADDONS.pba.desc}</div>
            </div>

            {/* PBA+ */}
            <div
              style={{ ...styles.addonCard, ...(addons.pbaPlus ? styles.addonCardSelected : {}) }}
              onClick={() => toggleAddon('pbaPlus')}
            >
              <div style={{ ...styles.checkBox, ...(addons.pbaPlus ? styles.checkBoxSelected : {}) }}>{addons.pbaPlus && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              <h4 style={styles.addonH4}>Public Bank Access+</h4>
              <div style={styles.addonPrice}>$699</div>
              <div style={styles.addonDet}>{ADDONS.pbaPlus.desc}</div>
            </div>

            {/* HLA */}
            <div
              style={{ ...styles.addonCard, ...(addons.hla ? styles.addonCardSelected : {}) }}
              onClick={() => toggleAddon('hla')}
            >
              <div style={{ ...styles.checkBox, ...(addons.hla ? styles.checkBoxSelected : {}) }}>{addons.hla && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              <h4 style={styles.addonH4}>HLA Matching</h4>
              <div style={styles.addonPrice}>{isPrepaid ? '$195' : '$295'}</div>
              {isPrepaid && <div style={styles.saveBadge}>Save $100 with prepaid</div>}
              <div style={styles.addonDet}>{ADDONS.hla.desc}</div>
            </div>

            {/* NGA */}
            <div
              style={{ ...styles.addonCard, ...(addons.nga ? styles.addonCardSelected : {}) }}
              onClick={() => toggleAddon('nga')}
            >
              <div style={{ ...styles.checkBox, ...(addons.nga ? styles.checkBoxSelected : {}) }}>{addons.nga && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              <h4 style={styles.addonH4}>NGA</h4>
              <div style={styles.addonPrice}>$399</div>
              <div style={styles.addonDet}>{ADDONS.nga.desc}</div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnBack} onClick={() => goStep(2)}>← Back</button>
            <button style={styles.btnNext} onClick={() => goStep(4)}>Continue →</button>
          </div>
        </div>

        {/* STEP 4: PAYMENT PLAN */}
        <div style={{ display: step === 4 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 4 of 6</div>
          <div style={styles.stepTitle}>How would you like to pay?</div>
          <div style={styles.payGrid}>
            <div style={cardStyle(payPlan === 'full')} onClick={() => selectPayPlan('full')}>
              <div style={radioStyle(payPlan === 'full')} />
              <h3 style={styles.optH3}>Pay in full</h3>
              <div style={styles.optPrice}>{fmt(total)}</div>
              <div style={styles.optDet}>One-time payment</div>
            </div>
            <div style={cardStyle(payPlan === '6mo')} onClick={() => selectPayPlan('6mo')}>
              <div style={radioStyle(payPlan === '6mo')} />
              <h3 style={styles.optH3}>6 monthly payments</h3>
              <div style={styles.optPrice}>{total > 0 ? fmt(Math.ceil(total / 6)) + '/mo' : '$0/mo'}</div>
              <div style={styles.optDet}>Split into 6 equal payments</div>
            </div>
            <div style={cardStyle(payPlan === '12mo')} onClick={() => selectPayPlan('12mo')}>
              <div style={radioStyle(payPlan === '12mo')} />
              <h3 style={styles.optH3}>12 monthly payments</h3>
              <div style={styles.optPrice}>{total > 0 ? fmt(Math.ceil(total / 12)) + '/mo' : '$0/mo'}</div>
              <div style={styles.optDet}>Split into 12 equal payments</div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnBack} onClick={() => goStep(3)}>← Back</button>
            <button style={styles.btnNext} onClick={() => goStep(5)}>Continue →</button>
          </div>
        </div>

        {/* STEP 5: INFO */}
        <div style={{ display: step === 5 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 5 of 6</div>
          <div style={styles.stepTitle}>Your information</div>
          <div style={styles.formSection}>
            <div style={styles.formRow}>
              <div><label style={styles.formLabel}>First name</label><input style={styles.formInput} type="text" placeholder="Jane" /></div>
              <div><label style={styles.formLabel}>Last name</label><input style={styles.formInput} type="text" placeholder="Smith" /></div>
            </div>
            <div style={styles.formRow}>
              <div><label style={styles.formLabel}>Email address</label><input style={styles.formInput} type="email" placeholder="jane@example.com" /></div>
              <div><label style={styles.formLabel}>Phone number</label><input style={styles.formInput} type="tel" placeholder="(555) 123-4567" /></div>
            </div>
            <div style={styles.formRow}>
              <div><label style={styles.formLabel}>Due date</label><input style={styles.formInput} type="date" /></div>
              <div>
                <label style={styles.formLabel}>Relationship to baby</label>
                <select style={styles.formInput}>
                  <option value="">Select...</option>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Grandparent</option>
                  <option>Other family member</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div style={styles.formRowFull}>
              <div><label style={styles.formLabel}>Shipping address</label><input style={styles.formInput} type="text" placeholder="123 Main St, Apt 4B" /></div>
            </div>
            <div style={styles.formRow}>
              <div><label style={styles.formLabel}>City</label><input style={styles.formInput} type="text" placeholder="Los Angeles" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={styles.formLabel}>State</label><input style={styles.formInput} type="text" placeholder="CA" /></div>
                <div><label style={styles.formLabel}>ZIP</label><input style={styles.formInput} type="text" placeholder="90001" /></div>
              </div>
            </div>
            <div style={styles.formRowFull}>
              <div><label style={styles.formLabel}>Hospital / birth center name</label><input style={styles.formInput} type="text" placeholder="Cedars-Sinai Medical Center" /></div>
            </div>
            <div style={styles.formRowFull}>
              <div><label style={styles.formLabel}>Hospital city & state</label><input style={styles.formInput} type="text" placeholder="Los Angeles, CA" /></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={styles.checkboxRow}>
                <input type="checkbox" id="add-parent" style={{ width: 18, height: 18, accentColor: '#6C1A55' }} />
                <label htmlFor="add-parent" style={styles.checkboxLabel}>Add an additional parent / guardian</label>
              </div>
              <div style={styles.checkboxRow}>
                <input type="checkbox" id="surrogate" style={{ width: 18, height: 18, accentColor: '#6C1A55' }} />
                <label htmlFor="surrogate" style={styles.checkboxLabel}>This is an adoption or surrogate birth</label>
              </div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnBack} onClick={() => goStep(4)}>← Back</button>
            <button style={styles.btnNext} onClick={() => goStep(6)}>Continue to payment →</button>
          </div>
        </div>

        {/* STEP 6: PAYMENT */}
        <div style={{ display: step === 6 ? 'block' : 'none' }}>
          <div style={styles.stepLabel}>Step 6 of 6</div>
          <div style={styles.stepTitle}>Payment details</div>
          <div style={styles.payMethods}>
            {[
              { key: 'card', label: 'Credit / Debit Card' },
              { key: 'apple', label: 'Apple Pay' },
              { key: 'google', label: 'Google Pay' },
            ].map((m) => (
              <div
                key={m.key}
                style={{ ...styles.payMethod, ...(payMethod === m.key ? styles.payMethodSelected : {}) }}
                onClick={() => setPayMethod(m.key)}
              >
                {m.label}
              </div>
            ))}
          </div>
          <div>
            <div style={styles.formRowFull}>
              <div><label style={styles.formLabel}>Card number</label><input style={styles.formInput} type="text" placeholder="4242 4242 4242 4242" /></div>
            </div>
            <div style={styles.formRow}>
              <div><label style={styles.formLabel}>Expiration</label><input style={styles.formInput} type="text" placeholder="MM / YY" /></div>
              <div><label style={styles.formLabel}>CVC</label><input style={styles.formInput} type="text" placeholder="123" /></div>
            </div>
            <div style={styles.formRowFull}>
              <div><label style={styles.formLabel}>Name on card</label><input style={styles.formInput} type="text" placeholder="Jane Smith" /></div>
            </div>
          </div>
          <div style={styles.stepNav}>
            <button style={styles.btnBack} onClick={() => goStep(5)}>← Back</button>
            <button style={styles.btnNext} onClick={() => alert('This is a demo — no payment will be processed.')}>Complete enrollment →</button>
          </div>
        </div>
      </div>

      {/* STICKY SUMMARY */}
      <div style={styles.summary}>
        <div style={styles.summaryHead}>
          <h3 style={styles.summaryHeadH3}>Your plan</h3>
          <div style={styles.summaryTotal}>{fmt(total)}</div>
          <div style={styles.summaryDet}>{summaryDet}</div>
          {savings > 0 && (
            <div style={styles.summarySavings}>You save {fmt(savings)}</div>
          )}
        </div>
        <div style={styles.summaryBody}>
          <div style={styles.summaryLine}>
            <span style={styles.slLabel}>Product</span>
            {product ? (
              <span style={styles.slValue}>{PRICING[product].label}</span>
            ) : (
              <span style={styles.slEmpty}>Not selected</span>
            )}
          </div>
          <div style={styles.summaryLine}>
            <span style={styles.slLabel}>Storage plan</span>
            {plan && product ? (
              <span style={styles.slValue}>
                {PRICING[product].plans[plan].label} — {fmt(PRICING[product].plans[plan].total)}
              </span>
            ) : (
              <span style={styles.slEmpty}>Not selected</span>
            )}
          </div>
          <div style={styles.summaryLine}>
            <span style={styles.slLabel}>Advanced Protection</span>
            {addonSummaryText ? (
              <span style={styles.slValue}>{addonSummaryText}</span>
            ) : (
              <span style={styles.slEmpty}>None</span>
            )}
          </div>
          <div style={{ ...styles.summaryLine, ...styles.summaryLineLast }}>
            <span style={styles.slLabel}>Payment</span>
            {paymentSummaryText ? (
              <span style={styles.slValue}>{paymentSummaryText}</span>
            ) : (
              <span style={styles.slEmpty}>Not selected</span>
            )}
          </div>
        </div>
        <div style={styles.summaryFooter}>
          <button style={styles.enrollBtn} onClick={() => goStep(6)}>Complete enrollment</button>
          <div style={styles.phoneNote}>Questions? <a href="tel:8663894659" style={styles.phoneLink}>(866) 389-4659</a></div>
        </div>
      </div>
    </div>
  );
}
