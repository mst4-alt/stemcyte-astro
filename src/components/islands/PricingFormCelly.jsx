import { useState, useCallback, useRef, useEffect } from 'react';

/* ── PRICING DATA ── */
const PRICING = {
  cb: { label: 'Cord Blood', processing: 725, plans: { annual: { storage: 200, total: 725, label: 'Annual', savings: 0 }, '18year': { total: 3560, label: '18-Year Prepaid', savings: 765 }, lifetime: { total: 5625, label: 'Lifetime', savings: 2300 } } },
  cbt: { label: 'Cord Blood & Tissue', processing: 995, plans: { annual: { storage: 400, total: 995, label: 'Annual', savings: 0 }, '18year': { total: 6665, label: '18-Year Prepaid', savings: 1530 }, lifetime: { total: 10795, label: 'Lifetime', savings: 4600 } } },
};
const ADDONS = {
  pba: { name: 'Public Bank Access', price: 299, desc: 'Global donor search for your child' },
  pbaPlus: { name: 'Public Bank Access+', price: 699, desc: 'Extends to both parents' },
  hla: { name: 'HLA Matching', price: 295, prepaid: 195, desc: 'Sibling compatibility' },
  nga: { name: 'NGA', price: 399, desc: 'Cell quality analysis' },
};
function fmt(n) { return '$' + n.toLocaleString(); }

/* ── CELLY SVGs ── */
const CELLY_IDLE = `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gi" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><circle cx="70" cy="78" r="44" fill="url(#gi)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="86" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><circle cx="50" cy="66" r="4" fill="#fff"/><circle cx="82" cy="66" r="4" fill="#fff"/><path d="M62 90 Q70 97, 78 90" fill="none" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g></svg>`;
const CELLY_NOD = `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gn" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,4;0,0" dur="0.6s" keyTimes="0;0.3;0.6;1" fill="freeze"/><circle cx="70" cy="78" r="44" fill="url(#gn)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="72" rx="9" fill="#1E1420"><animate attributeName="ry" values="10.5;1;1;10.5" keyTimes="0;0.25;0.65;1" dur="0.6s" fill="freeze"/></ellipse><ellipse cx="86" cy="72" rx="9" fill="#1E1420"><animate attributeName="ry" values="10.5;1;1;10.5" keyTimes="0;0.25;0.65;1" dur="0.6s" fill="freeze"/></ellipse><circle cx="50" cy="66" r="4" fill="#fff"><animate attributeName="opacity" values="1;0;0;1" keyTimes="0;0.25;0.65;1" dur="0.6s" fill="freeze"/></circle><circle cx="82" cy="66" r="4" fill="#fff"><animate attributeName="opacity" values="1;0;0;1" keyTimes="0;0.25;0.65;1" dur="0.6s" fill="freeze"/></circle><path d="M62 90 Q70 97, 78 90" fill="none" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g></svg>`;
const CELLY_WRITING = `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gw" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><circle cx="70" cy="78" r="44" fill="url(#gw)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="76" rx="8" ry="7" fill="#1E1420"/><ellipse cx="86" cy="76" rx="8" ry="7" fill="#1E1420"/><circle cx="52" cy="74" r="3" fill="#fff"/><circle cx="84" cy="74" r="3" fill="#fff"/><line x1="64" y1="92" x2="76" y2="92" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><g><animateTransform attributeName="transform" type="rotate" values="-2 117 92;2 117 92;-2 117 92" dur="0.4s" repeatCount="indefinite"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><line x1="112" y1="88" x2="122" y2="86" stroke="#D8D0C8" stroke-width="1"/><line x1="112" y1="92" x2="120" y2="90" stroke="#D8D0C8" stroke-width="1"/></g><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="82" x2="24" y2="72" stroke="#D8D0C8" stroke-width="2.5" stroke-linecap="round"><animate attributeName="y2" values="72;69;72" dur="0.3s" repeatCount="indefinite"/></line><circle cx="23" cy="70" r="2.5" fill="#FFD700"><animate attributeName="cy" values="70;67;70" dur="0.3s" repeatCount="indefinite"/></circle></svg>`;
const CELLY_HAPPY = `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gh" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0;0,-3;0,0" dur="0.8s" fill="freeze"/><circle cx="70" cy="78" r="44" fill="url(#gh)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><path d="M44 70 Q54 60, 64 70" fill="none" stroke="#1E1420" stroke-width="3" stroke-linecap="round"/><path d="M76 70 Q86 60, 96 70" fill="none" stroke="#1E1420" stroke-width="3" stroke-linecap="round"/><path d="M56 88 Q70 100, 84 88" fill="#C070A0" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="70" cy="93" rx="5" ry="3.5" fill="#D88AB8"/><ellipse cx="38" cy="84" rx="10" ry="6" fill="rgba(244,150,200,0.5)"/><ellipse cx="102" cy="84" rx="10" ry="6" fill="rgba(244,150,200,0.5)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g><text x="18" y="44" font-size="10" fill="#E8A0D0"><animate attributeName="y" values="44;12" dur="1.5s" fill="freeze"/><animate attributeName="opacity" values="1;0" dur="1.5s" fill="freeze">&#x2665;</animate>&#x2665;</text><text x="112" y="36" font-size="7" fill="#D48EBE"><animate attributeName="y" values="36;8" dur="1.8s" fill="freeze"/><animate attributeName="opacity" values="0.8;0" dur="1.8s" fill="freeze">&#x2665;</animate>&#x2665;</text></svg>`;

const CELLY_SVGS = { idle: CELLY_IDLE, nod: CELLY_NOD, writing: CELLY_WRITING, happy: CELLY_HAPPY };

/* ── CELLY QUESTIONS ── */
const QUESTIONS = [
  { bot: "Let's do this! 3 quick questions.<br/><br/><strong>Do you have other children?</strong>", choices: [{ id: 'siblings', val: 'first', t: 'First child' }, { id: 'siblings', val: 'yes', t: 'Other children' }, { id: 'siblings', val: 'multiples', t: 'Twins/multiples' }] },
  { bot: (a) => `${a.siblings === 'first' ? 'Got it!' : 'Noted!'}<br/><br/><strong>Any family history of blood or immune conditions?</strong><span style="display:block;margin-top:6px;padding:6px 10px;background:rgba(108,26,85,0.04);border-radius:6px;font-size:11px;color:#6B6760;line-height:1.4">Leukemia, sickle cell, immune deficiencies, etc.</span>`, choices: [{ id: 'history', val: 'none', t: 'No history' }, { id: 'history', val: 'yes', t: 'Yes / concerns' }, { id: 'history', val: 'unsure', t: 'Not sure — be safe' }] },
  { bot: '<strong>Who should have access to stem cells?</strong><span style="display:block;margin-top:6px;padding:6px 10px;background:rgba(108,26,85,0.04);border-radius:6px;font-size:11px;color:#6B6760;line-height:1.4">Your baby\'s are always theirs. Coverage can extend further.</span>', choices: [{ id: 'who', val: 'baby', t: 'Just my baby' }, { id: 'who', val: 'baby_siblings', t: 'Baby + siblings' }, { id: 'who', val: 'baby_parents', t: 'Baby + both parents' }, { id: 'who', val: 'everyone', t: 'Everyone' }] },
];
const LABELS = { 'siblings:first': 'First child', 'siblings:yes': 'Other children', 'siblings:multiples': 'Twins/multiples', 'history:none': 'No history', 'history:yes': 'Yes / concerns', 'history:unsure': 'Not sure', 'who:baby': 'Just baby', 'who:baby_siblings': 'Baby + siblings', 'who:baby_parents': 'Baby + parents', 'who:everyone': 'Everyone' };

/* ── STYLES ── */
const S = {
  layout: { maxWidth: 1060, margin: '0 auto', padding: '32px 32px 120px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' },
  calcCol: { minWidth: 0 },
  cellyCol: { position: 'sticky', top: 32 },
  cellyCard: { background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(108,26,85,0.06)' },
  cellyHead: { background: 'linear-gradient(145deg,#FBF5F9,#fff)', padding: 20, textAlign: 'center', borderBottom: '1px solid #E8E2DC', cursor: 'pointer', transition: 'background 0.2s' },
  cellyAvatar: { width: 72, height: 78, margin: '0 auto 10px' },
  cellyTitle: { fontSize: 15, fontWeight: 700, marginBottom: 2 },
  cellySub: { fontSize: 12, color: '#8A857A', lineHeight: 1.4 },
  cellyBtn: { display: 'inline-block', marginTop: 12, padding: '10px 24px', borderRadius: 100, background: '#6C1A55', color: '#fff', fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' },
  cellyChat: { padding: 20, borderTop: '1px solid #E8E2DC' },
  ccRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  ccAvatar: { width: 44, height: 48, flexShrink: 0 },
  ccName: { fontSize: 10, fontWeight: 700, color: '#6C1A55', letterSpacing: 0.5, marginBottom: 3 },
  ccBubble: { background: '#F3F0F8', padding: '12px 14px', borderRadius: '14px 14px 14px 4px', fontSize: 13, lineHeight: 1.55 },
  ccUser: { display: 'flex', justifyContent: 'flex-end', marginTop: 8 },
  ccUserBub: { background: '#6C1A55', color: '#fff', padding: '8px 14px', borderRadius: '14px 14px 4px 14px', fontSize: 12, fontWeight: 600 },
  ccChoices: { display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 },
  ccChoice: { padding: '10px 14px', border: '2px solid #E8E2DC', borderRadius: 10, fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#fff', textAlign: 'left', lineHeight: 1.3, transition: 'all 0.2s' },
  ccTyping: { display: 'inline-flex', gap: 4, background: '#F3F0F8', padding: '10px 16px', borderRadius: '14px 14px 14px 4px' },
  ccDot: { width: 7, height: 7, borderRadius: '50%', background: '#C4BDD0' },
  ccClose: { display: 'block', width: '100%', marginTop: 10, padding: 8, fontSize: 11, color: '#8A857A', background: 'none', border: '1px solid #E8E2DC', borderRadius: 100, cursor: 'pointer', fontFamily: "'Lato',sans-serif", textAlign: 'center' },
  // Calculator
  product: { display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40, background: '#fff', border: '1px solid #E8E2DC', borderRadius: 100, padding: 4, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' },
  po: { flex: 1, padding: '14px 20px', textAlign: 'center', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s', fontSize: 15, fontWeight: 700 },
  poSel: { background: '#6C1A55', color: '#fff' },
  secT: { fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 400, marginBottom: 12 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: '#fff', border: '1px solid #E8E2DC', cursor: 'pointer', transition: 'all 0.15s', marginTop: -1, position: 'relative' },
  rowSel: { background: 'rgba(108,26,85,0.05)', borderColor: '#6C1A55', zIndex: 1 },
  dot: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #E8E2DC', flexShrink: 0, transition: 'all 0.15s' },
  dotSel: { borderColor: '#6C1A55', borderWidth: 6 },
  rowName: { fontSize: 15, fontWeight: 700 },
  rowDesc: { fontSize: 12, color: '#8A857A' },
  rowPrice: { fontFamily: "'Source Serif 4',serif", fontSize: 17, color: '#6C1A55' },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' },
  badgePop: { background: '#6C1A55', color: '#fff' },
  badgeSave: { background: 'rgba(61,139,106,0.08)', color: '#3D8B6A' },
  tog: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: '#fff', border: '1px solid #E8E2DC', cursor: 'pointer', transition: 'all 0.15s', marginTop: -1 },
  sw: { width: 38, height: 20, borderRadius: 10, background: '#E8E2DC', position: 'relative', flexShrink: 0, transition: 'background 0.2s' },
  swOn: { background: '#6C1A55' },
  cellyTag: { display: 'none', fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: '#F5E0EF', color: '#6C1A55', marginLeft: 8, whiteSpace: 'nowrap' },
  cellyTagShow: { display: 'inline-block' },
  bottom: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8E2DC', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' },
  fbLabel: { fontSize: 11, color: '#8A857A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  fbTotal: { fontFamily: "'Source Serif 4',serif", fontSize: 30, color: '#6C1A55' },
  fbSave: { fontSize: 12, color: '#3D8B6A', fontWeight: 700 },
  enroll: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 28px', borderRadius: 100, fontFamily: "'Lato',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#6C1A55', color: '#fff', transition: 'all 0.25s' },
};

export default function PricingFormCelly() {
  const [product, setProduct] = useState('cb');
  const [plan, setPlan] = useState('18year');
  const [addons, setAddons] = useState({});
  const [cellyOpen, setCellyOpen] = useState(false);
  const [cellyStep, setCellyStep] = useState(0);
  const [cellyState, setCellyState] = useState('idle');
  const [cellyMsg, setCellyMsg] = useState('');
  const [cellyChoicesVisible, setCellyChoicesVisible] = useState(true);
  const [cellyDone, setCellyDone] = useState(false);
  const [cellyTags, setCellyTags] = useState({});
  const [cellyPhase, setCellyPhase] = useState('choices'); // choices | user | typing | done
  const [userBubble, setUserBubble] = useState('');
  const cellyAnswers = useRef({});
  const calcRef = useRef(null);

  const isPrepaid = plan !== 'annual';

  const getAddonPrice = useCallback((key) => {
    if (key === 'pba' && product === 'cbt') return 0;
    return (isPrepaid && key === 'hla') ? 195 : ADDONS[key].price;
  }, [product, isPrepaid]);

  const getTotal = useCallback(() => {
    let t = PRICING[product].plans[plan].total;
    Object.keys(addons).forEach(k => { if (addons[k]) t += getAddonPrice(k); });
    return t;
  }, [product, plan, addons, getAddonPrice]);

  const getSavings = useCallback(() => {
    let s = PRICING[product].plans[plan].savings;
    if (addons.hla && isPrepaid) s += 100;
    if (addons.pba && product === 'cbt') s += 299;
    return s;
  }, [product, plan, addons, isPrepaid]);

  const toggleAddon = useCallback((key) => {
    setAddons(prev => {
      const next = { ...prev };
      if (key === 'pba' && prev.pbaPlus) next.pbaPlus = false;
      if (key === 'pbaPlus' && prev.pba) next.pba = false;
      next[key] = !prev[key];
      return next;
    });
  }, []);

  // Celly logic
  const startCelly = () => { setCellyOpen(true); setCellyStep(0); showCellyQ(0); };

  const showCellyQ = (step) => {
    const q = QUESTIONS[step];
    const botText = typeof q.bot === 'function' ? q.bot(cellyAnswers.current) : q.bot;
    setCellyMsg(botText);
    setCellyPhase('choices');
    setCellyState('idle');
    setCellyChoicesVisible(true);
  };

  const cellyPick = (key, val) => {
    cellyAnswers.current[key] = val;
    const label = LABELS[key + ':' + val] || val;
    setUserBubble(label);
    setCellyChoicesVisible(false);
    setCellyPhase('user');
    setCellyState('nod');

    setTimeout(() => {
      setCellyPhase('typing');
      setCellyState('writing');
      setTimeout(() => {
        const nextStep = cellyStep + 1;
        setCellyStep(nextStep);
        if (nextStep < QUESTIONS.length) {
          showCellyQ(nextStep);
        } else {
          applyCellyRecommendation();
        }
      }, 400 + Math.random() * 300);
    }, 500);
  };

  const applyCellyRecommendation = () => {
    const a = cellyAnswers.current;
    setCellyState('happy');
    setCellyMsg("All set! 🎉 I've configured your plan. Adjust anything you like!");
    setCellyPhase('done');
    setCellyDone(true);

    let newProduct = 'cb';
    if (a.who === 'baby_parents' || a.who === 'everyone' || a.history === 'yes') newProduct = 'cbt';

    let newAddons = {};
    let tags = { '18year': true };
    let pba = 0, pbaP = 0, hla = 0;
    if (a.history === 'yes') { pba += 3; pbaP += 1; }
    if (a.history === 'unsure') pba += 1;
    if (a.who === 'baby_siblings') pba += 2;
    if (a.who === 'everyone') { pba += 2; pbaP += 3; }
    if (a.who === 'baby_parents') pbaP += 3;
    if (a.siblings === 'yes' || a.siblings === 'multiples') hla += 3;
    if (a.who === 'baby_siblings') hla += 2;

    if (pbaP >= 3) { newAddons.pbaPlus = true; tags.pbaPlus = true; }
    else if (pba >= 2) { newAddons.pba = true; tags.pba = true; }
    if (hla >= 2) { newAddons.hla = true; tags.hla = true; }

    setTimeout(() => {
      setCellyState('idle');
      setProduct(newProduct);
      setPlan('18year');
      setAddons(newAddons);
      setCellyTags(tags);
      if (calcRef.current) calcRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  const total = getTotal();
  const savings = getSavings();
  const plans = PRICING[product].plans;

  return (
    <>
      <div style={S.layout}>
        {/* Calculator */}
        <div style={S.calcCol} ref={calcRef}>
          <div style={S.product}>
            {['cb', 'cbt'].map(v => (
              <div key={v} style={{ ...S.po, ...(product === v ? S.poSel : {}) }} onClick={() => setProduct(v)}>
                {v === 'cb' ? 'Cord Blood' : 'Blood & Tissue'}
                <div style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 400, fontSize: 13, marginTop: 1, opacity: 0.6, ...(product === v ? { color: 'rgba(255,255,255,0.6)' } : {}) }}>
                  {v === 'cb' ? '$725' : '$995'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={S.secT}>Storage plan</div>
            <div>
              {['annual', '18year', 'lifetime'].map((p, i) => (
                <div key={p} style={{ ...S.row, ...(plan === p ? S.rowSel : {}), borderRadius: i === 0 ? '14px 14px 0 0' : i === 2 ? '0 0 14px 14px' : 0 }} onClick={() => setPlan(p)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...S.dot, ...(plan === p ? S.dotSel : {}) }} />
                    <div>
                      <div style={S.rowName}>
                        {p === 'annual' ? 'Annual' : p === '18year' ? '18-Year Prepaid' : 'Lifetime'}
                        {cellyTags[p] && <span style={{ ...S.cellyTag, ...S.cellyTagShow }}>Celly's pick</span>}
                      </div>
                      <div style={S.rowDesc}>{p === 'annual' ? 'Pay year by year — most flexible' : p === '18year' ? 'One payment, done' : 'Never pay for storage again'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {p === '18year' && <span style={{ ...S.badge, ...S.badgePop }}>Most popular</span>}
                    {p === 'lifetime' && <span style={{ ...S.badge, ...S.badgeSave }}>Save {fmt(plans.lifetime.savings)}</span>}
                    <div style={S.rowPrice}>
                      {p === 'annual' ? fmt(plans.annual.storage) + '/yr' : fmt(plans[p].total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={S.secT}>Protection</div>
            <div>
              {['pba', 'pbaPlus', 'hla', 'nga'].map((k, i, arr) => (
                <div key={k} style={{ ...S.tog, borderRadius: i === 0 ? '14px 14px 0 0' : i === arr.length - 1 ? '0 0 14px 14px' : 0 }} onClick={() => toggleAddon(k)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...S.sw, ...(addons[k] ? S.swOn : {}) }}>
                      <div style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transform: addons[k] ? 'translateX(18px)' : 'translateX(0)' }} />
                    </div>
                    <div>
                      <div style={S.rowName}>
                        {ADDONS[k].name}
                        {cellyTags[k] && <span style={{ ...S.cellyTag, ...S.cellyTagShow }}>Celly's pick</span>}
                      </div>
                      <div style={S.rowDesc}>{ADDONS[k].desc}</div>
                    </div>
                  </div>
                  <div style={S.rowPrice}>
                    {k === 'pba' && product === 'cbt' ? 'FREE' : k === 'hla' && isPrepaid ? '$195' : fmt(ADDONS[k].price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Celly Sidebar */}
        <div style={S.cellyCol}>
          <div style={S.cellyCard}>
            {!cellyOpen && (
              <div style={S.cellyHead} onClick={startCelly}>
                <div style={S.cellyAvatar} dangerouslySetInnerHTML={{ __html: CELLY_IDLE }} />
                <div style={S.cellyTitle}>Not sure where to start?</div>
                <div style={S.cellySub}>Let Celly build your plan<br />in 30 seconds</div>
                <button style={S.cellyBtn}>Help me choose →</button>
              </div>
            )}
            {cellyOpen && (
              <div style={S.cellyChat}>
                <div style={S.ccRow}>
                  <div style={S.ccAvatar} dangerouslySetInnerHTML={{ __html: CELLY_SVGS[cellyState] }} key={cellyState + '-' + Date.now()} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.ccName}>Celly</div>
                    {cellyPhase === 'typing' ? (
                      <div style={S.ccTyping}>
                        <div style={{ ...S.ccDot, animation: 'ccBounce 1.2s infinite' }} />
                        <div style={{ ...S.ccDot, animation: 'ccBounce 1.2s infinite 0.15s' }} />
                        <div style={{ ...S.ccDot, animation: 'ccBounce 1.2s infinite 0.3s' }} />
                      </div>
                    ) : (
                      <>
                        <div style={S.ccBubble} dangerouslySetInnerHTML={{ __html: cellyMsg }} />
                        {cellyPhase === 'user' && (
                          <div style={S.ccUser}><div style={S.ccUserBub}>{userBubble}</div></div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {cellyPhase === 'choices' && cellyStep < QUESTIONS.length && (
                  <div style={S.ccChoices}>
                    {QUESTIONS[cellyStep].choices.map(c => (
                      <button key={c.val} style={S.ccChoice} onClick={() => cellyPick(c.id, c.val)}
                        onMouseEnter={e => { e.target.style.borderColor = '#E8A0D0'; e.target.style.color = '#6C1A55'; e.target.style.background = '#F5E0EF'; }}
                        onMouseLeave={e => { e.target.style.borderColor = '#E8E2DC'; e.target.style.color = '#2C2A26'; e.target.style.background = '#fff'; }}>
                        {c.t}
                      </button>
                    ))}
                  </div>
                )}
                {cellyPhase === 'done' && (
                  <button style={S.ccClose} onClick={() => { setCellyOpen(false); setCellyDone(false); }}>Close</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={S.bottom}>
        <div>
          <div style={S.fbLabel}>Your plan</div>
          <div style={S.fbTotal}>{fmt(total)}</div>
          {savings > 0 && <div style={S.fbSave}>Save {fmt(savings)}</div>}
        </div>
        <button style={S.enroll}>Enroll now →</button>
      </div>

      <style>{`
        @keyframes ccBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
      `}</style>
    </>
  );
}
