import { useState, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════
   PRICING DATA
   ═══════════════════════════════════════════ */
const D = {
  cb: {
    plans: {
      annual: { total: 925, processing: 725, storage: 200, savings: 0 },
      '18year': { total: 3560, savings: 765 },
      lifetime: { total: 5625, savings: 2300 },
    },
  },
  cbt: {
    plans: {
      annual: { total: 1395, processing: 995, storage: 400, savings: 0 },
      '18year': { total: 6665, savings: 1530 },
      lifetime: { total: 10795, savings: 4600 },
    },
  },
};
const Ad = { pba: 299, pbaPlus: 699, hla: 295, hlaP: 195, nga: 399 };
const f = (n) => '$' + n.toLocaleString();

/* ═══════════════════════════════════════════
   CELLY SVGs — raw strings for animate compat
   ═══════════════════════════════════════════ */
const CELLY_BANNER_SVG = `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gp" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><circle cx="70" cy="78" r="44" fill="url(#gp)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="86" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><circle cx="50" cy="66" r="4" fill="#fff"/><circle cx="82" cy="66" r="4" fill="#fff"/><path d="M62 90 Q70 97, 78 90" fill="none" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g></svg>`;

const CELLY_IDLE_SVG = `<svg data-state="idle" viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gi" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><circle cx="70" cy="78" r="44" fill="url(#gi)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="86" cy="72" rx="9" ry="10.5" fill="#1E1420"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><circle cx="50" cy="66" r="4" fill="#fff"/><circle cx="82" cy="66" r="4" fill="#fff"/><path d="M62 90 Q70 97, 78 90" fill="none" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g></svg>`;

const CELLY_WRITING_SVG = `<svg data-state="writing" viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gw" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><circle cx="70" cy="78" r="44" fill="url(#gw)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><ellipse cx="54" cy="76" rx="8" ry="7" fill="#1E1420"/><ellipse cx="86" cy="76" rx="8" ry="7" fill="#1E1420"/><circle cx="52" cy="74" r="3" fill="#fff"/><circle cx="84" cy="74" r="3" fill="#fff"/><line x1="64" y1="92" x2="76" y2="92" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><ellipse cx="100" cy="86" rx="8" ry="5" fill="rgba(244,150,200,0.4)"/><g><animateTransform attributeName="transform" type="rotate" values="-2 117 92;2 117 92;-2 117 92" dur="0.4s" repeatCount="indefinite"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><line x1="112" y1="88" x2="122" y2="86" stroke="#D8D0C8" stroke-width="1"/><line x1="112" y1="92" x2="120" y2="90" stroke="#D8D0C8" stroke-width="1"/></g><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="82" x2="24" y2="72" stroke="#D8D0C8" stroke-width="2.5" stroke-linecap="round"><animate attributeName="y2" values="72;69;72" dur="0.3s" repeatCount="indefinite"/></line><circle cx="23" cy="70" r="2.5" fill="#FFD700"><animate attributeName="cy" values="70;67;70" dur="0.3s" repeatCount="indefinite"/></circle></svg>`;

const CELLY_HAPPY_SVG = `<svg data-state="happy" viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gh" cx="44%" cy="38%" r="56%"><stop offset="0%" stop-color="#FFF5FA"/><stop offset="35%" stop-color="#F6D4EC"/><stop offset="100%" stop-color="#DA90C2"/></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0;0,-5;0,0;0,-2;0,0" dur="1.2s" fill="freeze"/><circle cx="70" cy="78" r="44" fill="url(#gh)"/><ellipse cx="52" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.5)"/><path d="M40 36 Q70 20, 100 36 L96 44 Q70 32, 44 44Z" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><rect x="62" y="26" width="16" height="12" rx="2" fill="#fff" stroke="#E8A0D0" stroke-width="1.5"/><line x1="70" y1="28" x2="70" y2="36" stroke="#E8A0D0" stroke-width="2.5"/><line x1="66" y1="32" x2="74" y2="32" stroke="#E8A0D0" stroke-width="2.5"/><path d="M44 70 Q54 60, 64 70" fill="none" stroke="#1E1420" stroke-width="3" stroke-linecap="round"/><path d="M76 70 Q86 60, 96 70" fill="none" stroke="#1E1420" stroke-width="3" stroke-linecap="round"/><path d="M56 88 Q70 102, 84 88" fill="#C070A0" stroke="#1E1420" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="70" cy="93" rx="5" ry="3.5" fill="#D88AB8"/><ellipse cx="38" cy="84" rx="10" ry="6" fill="rgba(244,150,200,0.5)"/><ellipse cx="102" cy="84" rx="10" ry="6" fill="rgba(244,150,200,0.5)"/><rect x="108" y="80" width="18" height="24" rx="3" fill="#F5EDE6" stroke="#D8D0C8" stroke-width="1.5" transform="rotate(8 117 92)"/><path d="M112 78 Q118 76, 116 84" fill="none" stroke="#DA90C2" stroke-width="4" stroke-linecap="round"/></g><text x="22" y="48" font-size="12" fill="#E8A0D0"><animate attributeName="y" values="48;10" dur="1.8s" fill="freeze"/><animate attributeName="opacity" values="1;0" dur="1.8s" fill="freeze"/>&#x2665;</text><text x="106" y="40" font-size="9" fill="#D48EBE"><animate attributeName="y" values="40;6" dur="2s" fill="freeze"/><animate attributeName="opacity" values="0.8;0" dur="2s" fill="freeze"/>&#x2665;</text><text x="14" y="36" font-size="11" fill="#E8A0D0" opacity="0.7">\u2726</text><text x="118" y="30" font-size="8" fill="#D48EBE" opacity="0.5">\u2726</text></svg>`;

/* ═══════════════════════════════════════════
   CELLY QUIZ DATA
   ═══════════════════════════════════════════ */
const QS = [
  {
    bot: () => `Let's build your plan! 4 quick questions.<br><br><strong>Do you have other children?</strong>`,
    ch: [
      { id: 'siblings', val: 'first', t: 'This is our first' },
      { id: 'siblings', val: 'yes', t: 'Yes, we have other children' },
      { id: 'siblings', val: 'multiples', t: 'Expecting twins or multiples' },
    ],
  },
  {
    bot: (a) => `${a.siblings === 'first' ? 'Got it!' : 'Noted!'}<br><br><strong>Who do you want stem cell protection for?</strong>`,
    ch: [
      { id: 'who', val: 'baby', t: 'Just my baby' },
      { id: 'who', val: 'extra', t: 'My baby, with extra coverage for more conditions' },
      { id: 'who', val: 'parents', t: 'My baby and both parents' },
    ],
  },
  {
    bot: () => `<strong>What kinds of conditions do you want to be prepared for?</strong><span class="cc-edu">Cord blood treats blood and immune conditions. Cord tissue contains a different stem cell type (MSCs) being studied for neurological, orthopedic, and tissue repair therapies.</span>`,
    ch: [
      { id: 'conditions', val: 'blood', t: 'Blood and immune conditions' },
      { id: 'conditions', val: 'broad', t: 'Blood, immune, and neurological or tissue-related' },
      { id: 'conditions', val: 'unsure', t: "I\u2019m not sure \u2014 what do you recommend?" },
    ],
  },
  {
    bot: () => `<strong>Would you want to screen your baby for genetic health risks at birth?</strong><span class="cc-edu">Newborn genetic analysis can identify inherited conditions early \u2014 sometimes before symptoms appear.</span>`,
    ch: [
      { id: 'genetic', val: 'yes', t: "Yes, I'd want to know early" },
      { id: 'genetic', val: 'maybe', t: "Maybe \u2014 I'd like to learn more" },
      { id: 'genetic', val: 'no', t: 'No, not interested' },
    ],
  },
];

const LBL = {
  'siblings:first': 'First child', 'siblings:yes': 'Other children', 'siblings:multiples': 'Twins/multiples',
  'who:baby': 'Just my baby', 'who:extra': 'Extra coverage', 'who:parents': 'Baby + both parents',
  'conditions:blood': 'Blood & immune', 'conditions:broad': 'Broad coverage', 'conditions:unsure': 'Not sure',
  'genetic:yes': 'Screen early', 'genetic:maybe': 'Maybe', 'genetic:no': 'No',
};

/* ═══════════════════════════════════════════
   CSS (injected once)
   ═══════════════════════════════════════════ */
const CSS = `
html{overflow-x:hidden}
.pf-page,.pf-page *,.pf-page *::before,.pf-page *::after,.pf-bottom,.pf-bottom *{box-sizing:border-box}
.pf-page{max-width:640px;margin:0 auto;padding:48px 32px 140px;width:100%}
.pf-list,.pf-product,.pf-sec,.celly-banner,.celly-chat{max-width:100%}
.celly-banner{background:linear-gradient(145deg,#FBF5F9,#fff);border:1px solid rgba(232,160,208,0.2);border-radius:16px;padding:24px 28px;display:flex;align-items:center;gap:20px;cursor:pointer;transition:all 0.25s;box-shadow:0 3px 16px rgba(108,26,85,0.08);margin-bottom:28px}
.celly-banner:hover{border-color:#E8A0D0;box-shadow:0 6px 24px rgba(108,26,85,0.1)}
.celly-banner-av{width:72px;height:78px;flex-shrink:0;overflow:hidden}
.celly-banner-text{flex:1}
.celly-banner-title{font-size:16px;font-weight:700}
.celly-banner-sub{font-size:13px;color:#8A857A;margin-top:3px;line-height:1.4}
.celly-banner-arrow{padding:10px 22px;border-radius:100px;background:#6C1A55;color:#fff;font-size:13px;font-weight:700;white-space:nowrap;flex-shrink:0}
.celly-chat{display:none;background:#fff;border:1px solid #E8E2DC;border-radius:16px;padding:20px;margin-bottom:28px;box-shadow:0 2px 16px rgba(108,26,85,0.06)}
.celly-chat.open{display:block;animation:pf-fadeIn 0.3s ease}
@keyframes pf-fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.cc-row{display:flex;align-items:flex-start;gap:12px}
.cc-av{width:72px;height:78px;flex-shrink:0;position:relative}
.cc-av svg{position:absolute;inset:0;width:100%;height:100%;transition:opacity 0.3s}
.cc-av svg.off{opacity:0;pointer-events:none}
.cc-name{font-size:10px;font-weight:700;color:#6C1A55;letter-spacing:0.5px;margin-bottom:3px}
.cc-bubble{background:#F3F0F8;padding:12px 14px;border-radius:14px 14px 14px 4px;font-size:13px;line-height:1.55}
.cc-bubble.out{animation:pf-fadeOut 0.25s ease forwards}
@keyframes pf-fadeOut{from{opacity:1}to{opacity:0;transform:translateY(-6px)}}
.cc-edu{display:block;margin-top:6px;padding:6px 10px;background:rgba(108,26,85,0.04);border-radius:6px;font-size:11px;color:#6B6760;line-height:1.4}
.cc-user{display:flex;justify-content:flex-end;margin-top:8px}
.cc-user.out{animation:pf-fadeOut 0.25s ease forwards}
.cc-user-bub{background:#6C1A55;color:#fff;padding:8px 14px;border-radius:14px 14px 4px 14px;font-size:12px;font-weight:600}
.cc-choices{display:flex;flex-direction:column;gap:5px;margin-top:10px}
.cc-choice{padding:10px 14px;border:2px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:12px;font-weight:600;cursor:pointer;background:#fff;text-align:left;line-height:1.3;transition:all 0.2s}
.cc-choice:hover{border-color:#E8A0D0;color:#6C1A55;background:#F5E0EF}
.cc-typing{display:inline-flex;gap:4px;background:#F3F0F8;padding:10px 16px;border-radius:14px 14px 14px 4px}
.cc-dot{width:7px;height:7px;border-radius:50%;background:#C4BDD0;animation:pf-bounce 1.2s infinite}
.cc-dot:nth-child(2){animation-delay:.15s}.cc-dot:nth-child(3){animation-delay:.3s}
@keyframes pf-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
.cc-close{display:inline-block;margin-top:10px;padding:6px 16px;font-size:11px;color:#8A857A;background:none;border:1px solid #E8E2DC;border-radius:100px;cursor:pointer;font-family:'Lato',sans-serif}
.pf-sec{margin-bottom:30px}
.pf-sec-t{font-family:'Playfair Display',serif;font-size:20px;font-weight:400;margin-bottom:16px}
.pf-product{display:flex;gap:0;background:#fff;border:1px solid #E8E2DC;border-radius:16px;padding:4px}
.pf-po{flex:1;padding:18px 20px;text-align:center;border-radius:13px;cursor:pointer;transition:all 0.2s;font-size:15px;font-weight:700}
.pf-po:hover{background:#F3F0F8}
.pf-po.sel{background:#6C1A55;color:#fff}
.pf-po-p{font-family:'Source Serif 4',serif;font-weight:400;font-size:13px;margin-top:1px;opacity:0.6}
.pf-po.sel .pf-po-p{color:rgba(255,255,255,0.6)}
.pf-list{display:flex;flex-direction:column}
.pf-row{display:flex;align-items:center;justify-content:space-between;padding:20px 26px;background:#fff;border:1px solid #E8E2DC;cursor:pointer;transition:all 0.15s;margin-top:-1px;position:relative}
.pf-row:first-child{border-radius:14px 14px 0 0}.pf-row:last-child{border-radius:0 0 14px 14px}
.pf-row:hover{background:rgba(108,26,85,0.02)}
.pf-row.sel{background:rgba(108,26,85,0.05);border-color:#6C1A55;z-index:1}
.pf-row-l{display:flex;align-items:center;gap:14px;min-width:0;flex:1}
.pf-dot{width:20px;height:20px;border-radius:50%;border:2px solid #E8E2DC;flex-shrink:0;transition:all 0.15s}
.pf-row.sel .pf-dot{border-color:#6C1A55;border-width:6px}
.pf-row-name{font-size:15px;font-weight:700}
.pf-row-desc{font-size:12px;color:#8A857A}
.pf-row-r{display:flex;align-items:center;gap:8px;flex-shrink:0;max-width:50%}
.pf-row-price{font-family:'Source Serif 4',serif;font-size:17px;color:#6C1A55;white-space:nowrap}
.pf-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px;white-space:nowrap}
.pf-badge-pop{background:#6C1A55;color:#fff}
.pf-badge-save{background:rgba(61,139,106,0.08);color:#3D8B6A}
.pf-tog{display:flex;align-items:center;justify-content:space-between;padding:18px 26px;background:#fff;border:1px solid #E8E2DC;cursor:pointer;transition:all 0.15s;margin-top:-1px;position:relative}
.pf-tog:first-child{border-radius:14px 14px 0 0}.pf-tog:last-child{border-radius:0 0 14px 14px}
.pf-tog:hover{background:rgba(108,26,85,0.02)}
.pf-sw{width:38px;height:20px;border-radius:10px;background:#E8E2DC;position:relative;flex-shrink:0;transition:background 0.2s}
.pf-sw::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.1)}
.pf-tog.sel .pf-sw{background:#6C1A55}.pf-tog.sel .pf-sw::after{transform:translateX(18px)}
.celly-tag{display:none;font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:2px 8px;border-radius:100px;margin-left:8px;white-space:nowrap;position:relative;cursor:default}
.celly-tag.pick{display:inline-block;background:#F5E0EF;color:#6C1A55}
.celly-tag.suggest{display:inline-block;background:#F3F0F8;color:#8A857A}
.celly-tag .ct-q{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:rgba(108,26,85,0.1);color:#6C1A55;font-size:9px;font-weight:700;margin-left:4px;cursor:help;vertical-align:middle}
.celly-tag .ct-tip{display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#3D0F31;color:#fff;font-size:11px;font-weight:400;letter-spacing:0;text-transform:none;padding:8px 12px;border-radius:8px;white-space:normal;width:200px;line-height:1.4;z-index:60;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.celly-tag .ct-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#3D0F31}
.celly-tag:hover .ct-tip{display:block}
@keyframes pf-popBounce{0%{transform:scale(1)}30%{transform:scale(1.03)}60%{transform:scale(0.99)}100%{transform:scale(1)}}
.pf-pop-bounce{animation:pf-popBounce 0.4s ease}
.pf-btn-next{flex:1;padding:18px;border-radius:100px;border:none;background:#6C1A55;color:#fff;font-family:'Lato',sans-serif;font-size:15px;font-weight:700;cursor:pointer}
.pf-bottom{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E8E2DC;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;z-index:50;box-shadow:0 -4px 20px rgba(0,0,0,0.04);min-height:80px}
.pf-fb-label{font-size:10px;color:#8A857A;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.pf-fb-total{font-family:'Source Serif 4',serif;font-size:28px;color:#6C1A55}
.pf-fb-save{font-size:11px;color:#3D8B6A;font-weight:700}
.pf-seg{display:flex;background:#F3F0F8;border-radius:100px;padding:3px;gap:0}
.pf-seg-opt{padding:8px 18px;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer;color:#8A857A;transition:all 0.2s;white-space:nowrap}
.pf-seg-opt.sel{background:#6C1A55;color:#fff;box-shadow:0 1px 4px rgba(108,26,85,0.15)}
.pf-checkout{animation:pf-fadeIn 0.3s ease}
.pf-step-indicator{display:flex;gap:4px;margin-bottom:32px;padding:8px 0}
.pf-step-pip{flex:1;height:4px;border-radius:2px;background:#E8E2DC;transition:background 0.3s;cursor:pointer;padding:8px 0;background-clip:content-box}
.pf-step-pip.done{background-color:#E8A0D0;background-clip:content-box}.pf-step-pip.active{background-color:#6C1A55;background-clip:content-box}
.pf-form-label{font-size:11px;font-weight:700;color:#8A857A;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;display:block}
.pf-form-input{width:100%;padding:13px 16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;transition:border-color 0.2s;box-sizing:border-box}
.pf-form-input:focus{border-color:#6C1A55}
.pf-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.pf-form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
.pf-form-full{margin-bottom:12px}
.pf-form-select{width:100%;padding:13px 16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;cursor:pointer;box-sizing:border-box}
.pf-sec-sub{font-size:13px;color:#8A857A;margin-bottom:16px}
.pf-add-parent-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:100px;border:1px dashed #E8E2DC;background:transparent;color:#8A857A;font-family:'Lato',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:4px}
.pf-add-parent-btn:hover{border-color:#6C1A55;color:#6C1A55;background:#F5E0EF}
.pf-parent-block{background:#F3F0F8;border-radius:12px;padding:20px;margin-top:12px}
.pf-parent-block-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.pf-parent-block-title{font-size:13px;font-weight:700;color:#6C1A55}
.pf-remove-parent{font-size:12px;color:#8A857A;cursor:pointer;background:none;border:none;font-family:'Lato',sans-serif;text-decoration:underline}
.pf-divider{height:1px;background:#E8E2DC;margin:28px 0}
.pf-twins-row{display:flex;align-items:center;gap:12px;padding:14px 22px;background:#fff;border:1px solid #E8E2DC;border-radius:14px;cursor:pointer;transition:all 0.15s}
.pf-twins-row:hover{background:rgba(108,26,85,0.02)}
.pf-twins-check{width:20px;height:20px;border-radius:4px;border:2px solid #E8E2DC;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
.pf-twins-row.sel .pf-twins-check{background:#6C1A55;border-color:#6C1A55}
.pf-checkbox-row{display:flex;align-items:center;gap:10px;margin:16px 0;cursor:pointer}
.pf-checkbox-row input[type=checkbox]{width:18px;height:18px;accent-color:#6C1A55;cursor:pointer}
.pf-checkbox-row label{font-size:13px;color:#6B6760;cursor:pointer}
.pf-order-card{background:#fff;border-radius:14px;border:1px solid #E8E2DC;overflow:hidden;margin-bottom:24px}
.pf-order-head{background:linear-gradient(160deg,#6C1A55,#3D0F31);padding:20px;color:#fff}
.pf-order-head-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.5;margin-bottom:4px}
.pf-order-head-total{font-family:'Source Serif 4',serif;font-size:36px}
.pf-order-head-save{font-size:12px;opacity:0.6;margin-top:4px}
.pf-order-body{padding:20px}
.pf-order-line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F5EDE6;font-size:14px}
.pf-order-line:last-child{border:none}
.pf-order-line-label{color:#6B6760}
.pf-order-line-val{font-weight:700}
.pf-order-line-free{color:#3D8B6A;font-weight:700}
.pf-pay-methods{display:flex;gap:8px;margin-bottom:20px}
.pf-pay-tab{flex:1;padding:14px;text-align:center;border:2px solid #E8E2DC;border-radius:12px;cursor:pointer;font-size:13px;font-weight:700;color:#6B6760;background:#fff;transition:all 0.2s}
.pf-pay-tab.sel{border-color:#6C1A55;color:#6C1A55;background:rgba(108,26,85,0.05)}
.pf-wallet-msg{text-align:center;padding:32px 20px;background:#fff;border:1px solid #E8E2DC;border-radius:14px;margin-bottom:20px}
.pf-btn-row{display:flex;gap:12px;margin-top:30px}
.pf-btn-back{padding:16px 24px;border-radius:100px;border:1px solid #E8E2DC;background:transparent;color:#8A857A;font-family:'Lato',sans-serif;font-size:15px;font-weight:700;cursor:pointer;text-align:center;white-space:nowrap}
.pf-btn-back:hover{border-color:#6C1A55;color:#6C1A55}
@media(max-width:600px){
  .pf-page{padding:32px 16px 140px}
  .pf-bottom{padding:12px 16px}.pf-fb-total{font-size:24px}
  .pf-seg{flex-wrap:wrap;gap:4px}
  .pf-seg-opt{padding:6px 14px;font-size:11px}
  .celly-banner{flex-direction:column;text-align:center;padding:20px 16px;gap:12px}
  .celly-banner-av{width:56px;height:60px}
  .celly-banner-arrow{width:100%;text-align:center}
  .pf-product{border-radius:14px}
  .pf-po{padding:14px 10px;font-size:13px}
  .pf-row{padding:16px 14px}
  .pf-tog{padding:14px}
  .pf-row-name{font-size:14px}
  .pf-row-price{font-size:14px}
  .pf-row-r{gap:6px}
  .pf-badge{font-size:9px;padding:2px 8px}
  .pf-form-row,.pf-form-row-3{grid-template-columns:1fr}
  .pf-pay-methods{flex-direction:column}
  .pf-btn-row{flex-direction:column}
  .pf-btn-back,.pf-btn-next{width:100%}
}
`;

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function PricingForm() {
  // ── Core state ──
  const [product, setProduct] = useState('cbt');
  const [plan, setPlan] = useState('18year');
  const [addons, setAddons] = useState({ pba: false, pbaPlus: false, hla: false, nga: false });
  const [twins, setTwins] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [paySched, setPaySchedState] = useState('full');

  // ── View state ──
  const [view, setView] = useState('builder'); // 'builder' | 'checkout'
  const [ckStep, setCkStep] = useState(1);

  // ── Celly state ──
  const [cellyOpen, setCellyOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [cellyState, setCellyState] = useState('idle');
  const [cellyMsgHtml, setCellyMsgHtml] = useState('');
  const [cellyChoicesHtml, setCellyChoicesHtml] = useState('');
  const [cellyTags, setCellyTags] = useState({});

  // ── Checkout state ──
  const [role1, setRole1] = useState('');
  const [parents, setParents] = useState([]);
  const [payMethod, setPayMethod] = useState('card');
  const [billingSame, setBillingSame] = useState(true);

  // ── Refs ──
  const cellyAvRef = useRef(null);
  const cellyBannerRef = useRef(null);
  const cellyAnswers = useRef({});
  const cellyStepRef = useRef(0);
  const timerRefs = useRef([]);
  const cellyAvInjected = useRef(false);
  const cellyBannerInjected = useRef(false);

  // ── Inject CSS ──
  useEffect(() => {
    const id = 'pf-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }, []);

  // ── Inject Celly banner SVG once (prevents animation reset on re-render) ──
  useEffect(() => {
    if (!cellyBannerRef.current || cellyBannerInjected.current) return;
    cellyBannerRef.current.innerHTML = CELLY_BANNER_SVG;
    cellyBannerInjected.current = true;
  });

  // ── Inject Celly chat SVGs once, then only toggle .off class ──
  useEffect(() => {
    if (!cellyAvRef.current) return;
    // Inject all 3 SVGs once
    if (!cellyAvInjected.current) {
      const svgMap = { idle: CELLY_IDLE_SVG, writing: CELLY_WRITING_SVG, happy: CELLY_HAPPY_SVG };
      cellyAvRef.current.innerHTML = Object.entries(svgMap)
        .map(([state, svg]) => svg.replace(`data-state="${state}"`, `data-state="${state}" class="off"`))
        .join('');
      cellyAvInjected.current = true;
    }
    // Toggle visibility without replacing innerHTML
    cellyAvRef.current.querySelectorAll('svg').forEach((el) => {
      el.classList.toggle('off', el.dataset.state !== cellyState);
    });
  }, [cellyState]);

  // ── Calculations ──
  const isPrepaid = plan !== 'annual';
  const mult = twins ? 2 : 1;

  let total = D[product].plans[plan].total * mult;
  let savings = (D[product].plans[plan].savings || 0) * mult;

  Object.keys(addons).forEach((k) => {
    if (!addons[k]) return;
    if (k === 'pba' && product === 'cbt') {
      savings += 299 * mult;
    } else if (k === 'hla') {
      total += (isPrepaid ? Ad.hlaP : Ad.hla) * mult;
      if (isPrepaid) savings += 100 * mult;
    } else {
      total += Ad[k] * mult;
    }
  });

  const displayTotal = () => {
    if (!interacted) return '\u2013';
    if (paySched === 'full') return f(total);
    if (paySched === '6mo') return f(Math.ceil(total / 6)) + '/mo';
    return f(Math.ceil(total / 12)) + '/mo';
  };

  const priceTexts = {
    annual: f(D[product].plans.annual.processing || D[product].plans.annual.total) + ' + ' + f(D[product].plans.annual.storage) + '/yr',
    '18year': f(D[product].plans['18year'].total),
    lifetime: f(D[product].plans.lifetime.total),
    lifetimeSave: 'Saving ' + f(D[product].plans.lifetime.savings),
    pba: product === 'cbt' ? 'FREE' : '$299',
    hla: isPrepaid ? '$195' : '$295',
  };

  // ── Actions ──
  const doSetProd = (v) => { setProduct(v); setInteracted(true); };
  const doSetPlan = (v) => { setPlan(v); setInteracted(true); };
  const doTogAddon = (k) => { setAddons((prev) => ({ ...prev, [k]: !prev[k] })); setInteracted(true); };
  const doSetPaySched = (v) => { setPaySchedState(v); };
  const doTogTwins = () => { setTwins((prev) => !prev); setInteracted(true); };

  // ── Scroll helpers ──
  const scrollToForm = () => {
    const hero = document.getElementById('hero');
    if (hero) {
      const y = hero.getBoundingClientRect().bottom + window.pageYOffset - 200;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const glide = (el) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - window.innerHeight * 0.35;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // ── Checkout ──
  const goCheckout = () => { setView('checkout'); setCkStep(1); setTimeout(scrollToForm, 50); };
  const backToBuilder = () => { setView('builder'); setTimeout(scrollToForm, 50); };
  const goStep = (n) => { setCkStep(n); setTimeout(scrollToForm, 50); };

  // ── Parents ──
  const addParent = () => { if (parents.length >= 2) return; setParents((prev) => [...prev, { id: Date.now() }]); };
  const removeParent = (id) => { setParents((prev) => prev.filter((p) => p.id !== id)); };

  // ── Review lines ──
  const buildReviewLines = () => {
    const pl = product === 'cb' ? 'Cord Blood' : 'Cord Blood & Tissue';
    const pn = { annual: 'Pay year by year', '18year': '18-Year Prepaid', lifetime: 'Lifetime' }[plan];
    const lines = [{ label: pl + ' \u2014 ' + pn + (twins ? ' (\u00d72)' : ''), val: f(D[product].plans[plan].total * mult), free: false }];
    const names = { pba: 'Public Bank Access', pbaPlus: 'Public Bank Access+', hla: 'HLA Matching', nga: 'NGA' };
    Object.keys(addons).forEach((k) => {
      if (!addons[k]) return;
      const isFree = k === 'pba' && product === 'cbt';
      const price = isFree ? 0 : k === 'hla' && isPrepaid ? Ad.hlaP : Ad[k];
      lines.push({ label: names[k] + (twins ? ' (\u00d72)' : ''), val: isFree ? 'FREE' : f(price * mult), free: isFree });
    });
    return lines;
  };

  // ═══════════════════════════════════════
  // CELLY CHAT ENGINE
  // ═══════════════════════════════════════
  const clearTimers = () => { timerRefs.current.forEach(clearTimeout); timerRefs.current = []; };
  const timer = (fn, ms) => { const t = setTimeout(fn, ms); timerRefs.current.push(t); return t; };

  const showCQ = (s) => {
    const q = QS[s];
    const bot = q.bot(cellyAnswers.current);
    setCellyMsgHtml(`<div class="cc-bubble">${bot}</div>`);
    setCellyChoicesHtml(q.ch.map((c) => `<button class="cc-choice" data-id="${c.id}" data-val="${c.val}">${c.t}</button>`).join(''));
  };

  const startCelly = () => {
    setBannerVisible(false);
    setCellyOpen(true);
    setCellyState('idle');
    cellyStepRef.current = 0;
    cellyAnswers.current = {};
    showCQ(0);
  };

  const closeCelly = () => { setCellyOpen(false); setBannerVisible(true); clearTimers(); };

  const handleChoiceClick = (e) => {
    const btn = e.target.closest('.cc-choice');
    if (!btn) return;
    cPick(btn.dataset.id, btn.dataset.val);
  };

  const cPick = (k, v) => {
    cellyAnswers.current[k] = v;
    cellyStepRef.current++;
    setCellyMsgHtml((prev) => prev + `<div class="cc-user"><div class="cc-user-bub">${LBL[k + ':' + v] || v}</div></div>`);
    setCellyChoicesHtml('');
    setCellyState('idle');

    if (k === 'conditions' && v === 'unsure') {
      showCellyResponse("I'd go with <strong>cord blood & tissue</strong> \u2014 it gives you two types of stem cells instead of one, covering blood, immune, <em>and</em> neurological/tissue conditions. Plus, Public Bank Access is included free with it. I'll set that up for you!");
      return;
    }
    if (k === 'genetic' && v === 'maybe') {
      showCellyResponse("NGA screens your baby's cord blood for inherited genetic conditions at birth \u2014 things like metabolic disorders or immune deficiencies, sometimes before symptoms ever show up. It's $399 and totally optional. I'll flag it for you so you can decide!");
      return;
    }
    timer(() => advanceQ(), 400);
  };

  const showCellyResponse = (msg) => {
    timer(() => {
      setCellyMsgHtml((prev) => prev.replace(/class="cc-bubble"/g, 'class="cc-bubble out"').replace(/class="cc-user"/g, 'class="cc-user out"'));
      timer(() => {
        setCellyState('writing');
        setCellyMsgHtml('<div class="cc-typing"><div class="cc-dot"></div><div class="cc-dot"></div><div class="cc-dot"></div></div>');
        timer(() => {
          setCellyState('idle');
          setCellyMsgHtml(`<div class="cc-bubble">${msg}</div>`);
          timer(() => {
            setCellyState('writing');
            setCellyMsgHtml((prev) => prev + '<div class="cc-typing" style="margin-top:8px"><div class="cc-dot"></div><div class="cc-dot"></div><div class="cc-dot"></div></div>');
            timer(() => {
              setCellyMsgHtml((prev) => prev.replace(/<div class="cc-typing"[^]*?<\/div><\/div>/g, ''));
              setCellyState('idle');
              if (cellyStepRef.current < QS.length) {
                const q = QS[cellyStepRef.current];
                const bot = q.bot(cellyAnswers.current);
                setCellyMsgHtml((prev) => prev + `<div class="cc-bubble" style="margin-top:8px">${bot}</div>`);
                setCellyChoicesHtml(q.ch.map((c) => `<button class="cc-choice" data-id="${c.id}" data-val="${c.val}">${c.t}</button>`).join(''));
              } else {
                applyCelly();
              }
            }, 900 + Math.random() * 300);
          }, 2000);
        }, 600);
      }, 250);
    }, 400);
  };

  const advanceQ = () => {
    setCellyMsgHtml((prev) => prev.replace(/class="cc-bubble"/g, 'class="cc-bubble out"').replace(/class="cc-user"/g, 'class="cc-user out"'));
    timer(() => {
      setCellyState('writing');
      setCellyMsgHtml('<div class="cc-typing"><div class="cc-dot"></div><div class="cc-dot"></div><div class="cc-dot"></div></div>');
      timer(() => {
        setCellyState('idle');
        if (cellyStepRef.current < QS.length) showCQ(cellyStepRef.current);
        else applyCelly();
      }, 900 + Math.random() * 300);
    }, 250);
  };

  const applyCelly = () => {
    setCellyState('happy');
    setCellyMsgHtml('<div class="cc-bubble">All set! \ud83c\udf89 I\'ve configured your plan below. Adjust anything you like!</div>');
    setCellyChoicesHtml('<button class="cc-close" data-close="true">Close</button>');

    const cA = cellyAnswers.current;
    const newTags = {};
    const DELAY = 450;
    let step = 0;
    const prodKey = cA.conditions === 'broad' || cA.conditions === 'unsure' ? 'cbt' : 'cb';
    const newAddons = { pba: false, pbaPlus: false, hla: false, nga: false };

    // 1. Product
    timer(() => {
      const el = document.querySelector(`.pf-po[data-prod="${prodKey}"]`);
      glide(el);
      timer(() => {
        setProduct(prodKey);
        setInteracted(true);
        const reason = prodKey === 'cbt'
          ? "You wanted coverage for neurological and tissue conditions too \u2014 cord tissue adds a second type of stem cell."
          : "You chose to focus on blood and immune conditions \u2014 cord blood covers that.";
        newTags['ct-' + prodKey] = { cls: 'pick', label: "Celly's pick", reason };
        setCellyTags({ ...newTags });
        if (el) { el.classList.add('pf-pop-bounce'); setTimeout(() => el.classList.remove('pf-pop-bounce'), 500); }
      }, 150);
    }, DELAY * step++);

    // 2. Plan
    timer(() => {
      const el = document.querySelector('.pf-row[data-plan="18year"]');
      glide(el);
      timer(() => setPlan('18year'), 150);
    }, DELAY * step++);

    // 3. Addons
    if (cA.who === 'extra' || cA.who === 'parents') {
      timer(() => {
        const el = document.querySelector('.pf-tog[data-addon="pba"]');
        glide(el);
        timer(() => {
          newAddons.pba = true;
          newTags['ct-pba'] = { cls: 'pick', label: "Celly's pick", reason: "You wanted extra coverage for more conditions \u2014 PBA gives your child access to additional matching stem cells." };
          setAddons({ ...newAddons });
          setCellyTags({ ...newTags });
          if (el) { el.classList.add('pf-pop-bounce'); setTimeout(() => el.classList.remove('pf-pop-bounce'), 500); }
        }, 150);
      }, DELAY * step++);
    }

    if (cA.who === 'parents') {
      timer(() => {
        const el = document.querySelector('.pf-tog[data-addon="pbaPlus"]');
        glide(el);
        timer(() => {
          newAddons.pbaPlus = true;
          newTags['ct-pbaPlus'] = { cls: 'pick', label: "Celly's pick", reason: "You wanted coverage for both parents \u2014 PBA+ gives them access to cord blood treatments too." };
          setAddons({ ...newAddons });
          setCellyTags({ ...newTags });
          if (el) { el.classList.add('pf-pop-bounce'); setTimeout(() => el.classList.remove('pf-pop-bounce'), 500); }
        }, 150);
      }, DELAY * step++);
    }

    if (cA.siblings === 'yes' || cA.siblings === 'multiples') {
      timer(() => {
        const el = document.querySelector('.pf-tog[data-addon="hla"]');
        glide(el);
        timer(() => {
          newAddons.hla = true;
          newTags['ct-hla'] = { cls: 'pick', label: "Celly's pick", reason: "You have other children \u2014 HLA matching checks if your baby's cord blood is compatible with siblings." };
          setAddons({ ...newAddons });
          setCellyTags({ ...newTags });
          if (el) { el.classList.add('pf-pop-bounce'); setTimeout(() => el.classList.remove('pf-pop-bounce'), 500); }
        }, 150);
      }, DELAY * step++);
    }

    if (cA.genetic === 'yes') {
      timer(() => {
        const el = document.querySelector('.pf-tog[data-addon="nga"]');
        glide(el);
        timer(() => {
          newAddons.nga = true;
          newTags['ct-nga'] = { cls: 'pick', label: "Celly's pick", reason: "You said you'd want to know about genetic health risks as early as possible." };
          setAddons({ ...newAddons });
          setCellyTags({ ...newTags });
          if (el) { el.classList.add('pf-pop-bounce'); setTimeout(() => el.classList.remove('pf-pop-bounce'), 500); }
        }, 150);
      }, DELAY * step++);
    } else if (cA.genetic === 'maybe') {
      timer(() => {
        const el = document.querySelector('.pf-tog[data-addon="nga"]');
        glide(el);
        timer(() => {
          newTags['ct-nga'] = { cls: 'suggest', label: "Celly suggests", reason: "You were interested in learning more \u2014 NGA screens for inherited conditions at birth. Optional but worth considering." };
          setCellyTags({ ...newTags });
        }, 150);
      }, DELAY * step++);
    }

    timer(() => {
      setAddons({ ...newAddons });
      setCellyState('idle');
    }, DELAY * (step + 1));
  };

  // ── Tag renderer ──
  const renderTag = (id) => {
    const tag = cellyTags[id];
    if (!tag) return null;
    return (
      <span className={`celly-tag ${tag.cls}`}>
        {tag.label}
        <span className="ct-q">?</span>
        <span className="ct-tip">{tag.reason}</span>
      </span>
    );
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <>
      <div className="pf-page" id="pricing-form">
        <div style={view === 'builder' ? {} : { display: 'none' }}>
            <div className="celly-banner" onClick={startCelly} style={bannerVisible ? {} : { display: 'none' }}>
              <div className="celly-banner-av" ref={cellyBannerRef} style={{ width: 72, height: 78, overflow: 'hidden', flexShrink: 0 }} />
              <div className="celly-banner-text">
                <div className="celly-banner-title">Not sure where to start?</div>
                <div className="celly-banner-sub">Answer 4 quick questions and Celly will build a personalized plan for you.</div>
              </div>
              <div className="celly-banner-arrow">Help me choose →</div>
            </div>

            <div className={`celly-chat${cellyOpen ? ' open' : ''}`}>
              <div className="cc-row">
                <div className="cc-av" ref={cellyAvRef} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cc-name">Celly</div>
                  <div dangerouslySetInnerHTML={{ __html: cellyMsgHtml }} />
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: cellyChoicesHtml ? `<div class="cc-choices">${cellyChoicesHtml}</div>` : '' }}
                onClick={(e) => {
                  if (e.target.closest('[data-close]')) { closeCelly(); return; }
                  handleChoiceClick(e);
                }}
              />
            </div>

            <div className="pf-sec">
              <div className="pf-sec-t">Choose your plan</div>
              <div className="pf-product">
                <div className={`pf-po${product === 'cb' ? ' sel' : ''}`} data-prod="cb" onClick={() => doSetProd('cb')}>
                  Cord Blood {renderTag('ct-cb')}
                  <div className="pf-po-p">$725</div>
                </div>
                <div className={`pf-po${product === 'cbt' ? ' sel' : ''}`} data-prod="cbt" onClick={() => doSetProd('cbt')}>
                  Blood & Tissue {renderTag('ct-cbt')}
                  <div className="pf-po-p">$995</div>
                </div>
              </div>
            </div>

            <div className="pf-sec">
              <div className="pf-sec-t">Protection term</div>
              <div className="pf-list">
                {[
                  { key: 'annual', name: 'Pay year by year', desc: 'Most flexible — renew annually', badge: null, price: priceTexts.annual },
                  { key: '18year', name: '18-Year Prepaid', desc: 'One payment, done', badge: <span className="pf-badge pf-badge-pop">Most popular</span>, price: priceTexts['18year'] },
                  { key: 'lifetime', name: 'Lifetime', desc: 'Never pay for storage again', badge: <span className="pf-badge pf-badge-save">{priceTexts.lifetimeSave}</span>, price: priceTexts.lifetime },
                ].map((p) => (
                  <div key={p.key} className={`pf-row${plan === p.key ? ' sel' : ''}`} data-plan={p.key} onClick={() => doSetPlan(p.key)}>
                    <div className="pf-row-l">
                      <div className="pf-dot" />
                      <div>
                        <div className="pf-row-name">{p.name} {renderTag('ct-' + p.key)}</div>
                        <div className="pf-row-desc">{p.desc}</div>
                      </div>
                    </div>
                    <div className="pf-row-r">
                      {p.badge}
                      <div className="pf-row-price">{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pf-sec">
              <div className="pf-sec-t">Advanced protection</div>
              <div className="pf-list">
                {[
                  { key: 'pba', name: 'Public Bank Access', desc: 'Expanded cell access for your child', price: priceTexts.pba },
                  { key: 'pbaPlus', name: 'Public Bank Access+', desc: 'Cord blood access for both parents', price: '$699' },
                  { key: 'hla', name: 'HLA Matching', desc: 'Sibling compatibility testing', price: priceTexts.hla },
                  { key: 'nga', name: 'NGA', desc: 'Newborn genetic analysis', price: '$399' },
                ].map((a) => (
                  <div key={a.key} className={`pf-tog${addons[a.key] ? ' sel' : ''}`} data-addon={a.key} onClick={() => doTogAddon(a.key)}>
                    <div className="pf-row-l">
                      <div className="pf-sw" />
                      <div>
                        <div className="pf-row-name">{a.name} {renderTag('ct-' + a.key)}</div>
                        <div className="pf-row-desc">{a.desc}</div>
                      </div>
                    </div>
                    <div className="pf-row-price">{a.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pf-btn-row">
              <button className="pf-btn-next" onClick={goCheckout}>Continue →</button>
            </div>
          </div>

        <div style={view === 'checkout' ? {} : { display: 'none' }}>
            <div className="pf-step-indicator">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`pf-step-pip${ckStep > n ? ' done' : ''}${ckStep === n ? ' active' : ''}`} onClick={() => goStep(n)} />
              ))}
            </div>

            {ckStep === 1 && (
              <div className="pf-checkout">
                <div className="pf-sec-t">Your information</div>
                <div className="pf-sec-sub">Tell us about yourself so we can set up your account.</div>
                <div className="pf-form-row">
                  <div><label className="pf-form-label">First name</label><input className="pf-form-input" placeholder="Jane" /></div>
                  <div><label className="pf-form-label">Last name</label><input className="pf-form-input" placeholder="Smith" /></div>
                </div>
                <div className="pf-form-full">
                  <label className="pf-form-label">Relationship to baby</label>
                  <select className="pf-form-select" value={role1} onChange={(e) => setRole1(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="birth_mother">Birth mother</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="surrogate">Surrogate</option>
                    <option value="other">Other guardian</option>
                  </select>
                </div>
                {role1 === 'other' && (
                  <div className="pf-form-full"><label className="pf-form-label">Please specify</label><input className="pf-form-input" placeholder="e.g. Grandparent, Legal guardian" /></div>
                )}
                <div className="pf-form-row">
                  <div><label className="pf-form-label">Email address</label><input className="pf-form-input" type="email" placeholder="jane@email.com" /></div>
                  <div><label className="pf-form-label">Phone number</label><input className="pf-form-input" type="tel" placeholder="(555) 123-4567" /></div>
                </div>
                {role1 === 'birth_mother' && (
                  <div className="pf-form-row">
                    <div><label className="pf-form-label">Your birthday</label><input className="pf-form-input" type="date" /></div>
                    <div><label className="pf-form-label">Due date</label><input className="pf-form-input" type="date" /></div>
                  </div>
                )}
                {parents.map((p, i) => (
                  <div key={p.id} className="pf-parent-block">
                    <div className="pf-parent-block-header">
                      <span className="pf-parent-block-title">Additional parent/guardian {i + 1}</span>
                      <button className="pf-remove-parent" onClick={() => removeParent(p.id)}>Remove</button>
                    </div>
                    <div className="pf-form-row">
                      <div><label className="pf-form-label">First name</label><input className="pf-form-input" placeholder="First" /></div>
                      <div><label className="pf-form-label">Last name</label><input className="pf-form-input" placeholder="Last" /></div>
                    </div>
                    <div className="pf-form-full"><label className="pf-form-label">Phone number</label><input className="pf-form-input" type="tel" placeholder="(555) 123-4567" /></div>
                  </div>
                ))}
                {parents.length < 2 && <button className="pf-add-parent-btn" onClick={addParent}>+ Add another parent or guardian</button>}
                <div className="pf-divider" />
                <div className="pf-sec-t">Collection kit delivery</div>
                <div className="pf-sec-sub">We'll ship a temperature-controlled kit to this address before your due date.</div>
                <div className="pf-form-full"><label className="pf-form-label">Street address</label><input className="pf-form-input" placeholder="123 Main St, Apt 4B" /></div>
                <div className="pf-form-row-3">
                  <div><label className="pf-form-label">City</label><input className="pf-form-input" placeholder="Los Angeles" /></div>
                  <div><label className="pf-form-label">State</label><input className="pf-form-input" placeholder="CA" /></div>
                  <div><label className="pf-form-label">ZIP code</label><input className="pf-form-input" placeholder="90001" /></div>
                </div>
                <div className="pf-btn-row">
                  <button className="pf-btn-back" onClick={backToBuilder}>← Back</button>
                  <button className="pf-btn-next" onClick={() => goStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {ckStep === 2 && (
              <div className="pf-checkout">
                <div className="pf-sec-t">Birth information</div>
                <div className="pf-sec-sub">So we can coordinate with your birth team and prepare your kit.</div>
                <div className="pf-form-full"><label className="pf-form-label">Hospital or birth center</label><input className="pf-form-input" placeholder="Cedars-Sinai Medical Center" /></div>
                <div className="pf-form-full"><label className="pf-form-label">Doctor's name</label><input className="pf-form-input" placeholder="Dr. Sarah Johnson" /></div>
                <div className={`pf-twins-row${twins ? ' sel' : ''}`} onClick={doTogTwins} style={{ marginTop: 16 }}>
                  <div className="pf-twins-check">
                    {twins && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div>
                    <div className="pf-row-name">We're expecting twins</div>
                    <div className="pf-row-desc">Doubles processing and storage for both babies</div>
                  </div>
                </div>
                <div className="pf-btn-row">
                  <button className="pf-btn-back" onClick={() => goStep(1)}>← Back</button>
                  <button className="pf-btn-next" onClick={() => goStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {ckStep === 3 && (
              <div className="pf-checkout">
                <div className="pf-sec-t">Your order</div>
                <div className="pf-order-card">
                  <div className="pf-order-head">
                    <div className="pf-order-head-label">Total</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div className="pf-order-head-total">{displayTotal()}</div>
                      <div className="pf-seg" style={{ background: 'rgba(255,255,255,0.12)' }}>
                        {['full', '6mo', '12mo'].map((v) => (
                          <div key={v} className={`pf-seg-opt${paySched === v ? ' sel' : ''}`} onClick={() => doSetPaySched(v)} style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {v === 'full' ? 'Pay in full' : v === '6mo' ? '6 months' : '12 months'}
                          </div>
                        ))}
                      </div>
                    </div>
                    {savings > 0 && <div className="pf-order-head-save">Saving {f(savings)}</div>}
                  </div>
                  <div className="pf-order-body">
                    {buildReviewLines().map((line, i) => (
                      <div key={i} className="pf-order-line">
                        <span className="pf-order-line-label">{line.label}</span>
                        <span className={line.free ? 'pf-order-line-free' : 'pf-order-line-val'}>{line.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pf-sec-t">Payment method</div>
                <div className="pf-pay-methods">
                  {[['card', '💳 Card'], ['apple', '\uF8FF Apple Pay'], ['google', '🔵 Google Pay']].map(([m, label]) => (
                    <div key={m} className={`pf-pay-tab${payMethod === m ? ' sel' : ''}`} onClick={() => setPayMethod(m)}>{label}</div>
                  ))}
                </div>

                {payMethod === 'card' ? (
                  <div>
                    <div className="pf-form-full"><label className="pf-form-label">Card number</label><input className="pf-form-input" placeholder="4242 4242 4242 4242" /></div>
                    <div className="pf-form-row">
                      <div><label className="pf-form-label">Expiration</label><input className="pf-form-input" placeholder="MM / YY" /></div>
                      <div><label className="pf-form-label">CVC</label><input className="pf-form-input" placeholder="123" /></div>
                    </div>
                    <div className="pf-form-full"><label className="pf-form-label">Name on card</label><input className="pf-form-input" placeholder="Jane Smith" /></div>
                    <div className="pf-checkbox-row">
                      <input type="checkbox" id="pf-billing-same" checked={billingSame} onChange={() => setBillingSame(!billingSame)} />
                      <label htmlFor="pf-billing-same">Billing address same as shipping</label>
                    </div>
                    {!billingSame && (
                      <div>
                        <div className="pf-form-row">
                          <div><label className="pf-form-label">First name</label><input className="pf-form-input" placeholder="Jane" /></div>
                          <div><label className="pf-form-label">Last name</label><input className="pf-form-input" placeholder="Smith" /></div>
                        </div>
                        <div className="pf-form-full"><label className="pf-form-label">Billing street address</label><input className="pf-form-input" placeholder="456 Oak Ave" /></div>
                        <div className="pf-form-row-3">
                          <div><label className="pf-form-label">City</label><input className="pf-form-input" placeholder="Los Angeles" /></div>
                          <div><label className="pf-form-label">State</label><input className="pf-form-input" placeholder="CA" /></div>
                          <div><label className="pf-form-label">ZIP code</label><input className="pf-form-input" placeholder="90001" /></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pf-wallet-msg">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{payMethod === 'apple' ? '🍎' : '🔵'}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{payMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}</div>
                    <div style={{ fontSize: 13, color: '#8A857A' }}>You'll be prompted to confirm after clicking "Complete enrollment"</div>
                  </div>
                )}

                <div className="pf-btn-row">
                  <button className="pf-btn-back" onClick={() => goStep(2)}>← Back</button>
                  <button className="pf-btn-next" onClick={() => alert('Demo — no payment processed')}>Complete enrollment →</button>
                </div>
              </div>
            )}
          </div>
      </div>

      <div className="pf-bottom">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pf-fb-label">Your plan</div>
            <div className="pf-fb-total">{displayTotal()}</div>
            {interacted && savings > 0 && <div className="pf-fb-save">Saving {f(savings)}</div>}
          </div>
          <div className="pf-seg">
            {['full', '6mo', '12mo'].map((v) => (
              <div key={v} className={`pf-seg-opt${paySched === v ? ' sel' : ''}`} onClick={() => doSetPaySched(v)}>
                {v === 'full' ? 'Pay in full' : v === '6mo' ? '6 months' : '12 months'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
