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
const fDec = (n) => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ═══════════════════════════════════════════
   CELLY SVGs — raw strings for animate compat
   ═══════════════════════════════════════════ */
const CELLY_BANNER_SVG = `<svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gp" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="rgba(255,245,250,0.6)"/><stop offset="100%" stop-color="rgba(218,144,194,0.15)"/></radialGradient><radialGradient id="gp2" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="rgba(246,212,236,0.35)"/><stop offset="100%" stop-color="rgba(218,144,194,0.08)"/></radialGradient><filter id="gfp"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter></defs><circle cx="80" cy="92" r="36" fill="#F0C8E0" filter="url(#gfp)" opacity="0.3"><animate attributeName="opacity" values="0.25;0.35;0.25" dur="5s" repeatCount="indefinite"/></circle><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><circle cx="80" cy="92" r="46" fill="url(#gp)" stroke="rgba(218,144,194,0.3)" stroke-width="1.5"/><circle cx="80" cy="92" r="38" fill="url(#gp2)"/><path d="M46 74 Q58 54, 80 52 Q102 54, 112 70" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="16" ry="10" fill="rgba(255,255,255,0.3)"/><path d="M50 50 Q80 34, 110 50 L106 58 Q80 46, 54 58Z" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><rect x="72" y="40" width="16" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><line x1="80" y1="42" x2="80" y2="50" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><line x1="76" y1="46" x2="84" y2="46" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="64" cy="86" rx="9" ry="10.5" fill="rgba(30,20,32,0.85)"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="96" cy="86" rx="9" ry="10.5" fill="rgba(30,20,32,0.85)"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><circle cx="60" cy="80" r="4" fill="rgba(255,255,255,0.8)"/><circle cx="92" cy="80" r="4" fill="rgba(255,255,255,0.8)"/><path d="M72 104 Q80 111, 88 104" fill="none" stroke="rgba(30,20,32,0.75)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="48" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><ellipse cx="112" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><rect x="120" y="94" width="18" height="24" rx="3" fill="rgba(255,255,255,0.75)" stroke="rgba(218,144,194,0.4)" stroke-width="1.5" transform="rotate(8 129 106)"/><path d="M124 92 Q130 90, 128 98" fill="none" stroke="rgba(218,144,194,0.6)" stroke-width="3.5" stroke-linecap="round"/><line x1="124" y1="103" x2="132" y2="101" stroke="rgba(218,144,194,0.3)" stroke-width="1"/><line x1="124" y1="107" x2="130" y2="105.5" stroke="rgba(218,144,194,0.3)" stroke-width="1"/></g></svg>`;

const CELLY_IDLE_SVG = `<svg data-state="idle" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gi" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="rgba(255,245,250,0.6)"/><stop offset="100%" stop-color="rgba(218,144,194,0.15)"/></radialGradient><radialGradient id="gi2" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="rgba(246,212,236,0.35)"/><stop offset="100%" stop-color="rgba(218,144,194,0.08)"/></radialGradient><filter id="gfi"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter></defs><circle cx="80" cy="92" r="36" fill="#F0C8E0" filter="url(#gfi)" opacity="0.3"><animate attributeName="opacity" values="0.25;0.35;0.25" dur="5s" repeatCount="indefinite"/></circle><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><circle cx="80" cy="92" r="46" fill="url(#gi)" stroke="rgba(218,144,194,0.3)" stroke-width="1.5"/><circle cx="80" cy="92" r="38" fill="url(#gi2)"/><path d="M46 74 Q58 54, 80 52 Q102 54, 112 70" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="16" ry="10" fill="rgba(255,255,255,0.3)"/><path d="M50 50 Q80 34, 110 50 L106 58 Q80 46, 54 58Z" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><rect x="72" y="40" width="16" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><line x1="80" y1="42" x2="80" y2="50" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><line x1="76" y1="46" x2="84" y2="46" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="64" cy="86" rx="9" ry="10.5" fill="rgba(30,20,32,0.85)"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="96" cy="86" rx="9" ry="10.5" fill="rgba(30,20,32,0.85)"><animate attributeName="ry" values="10.5;10.5;1;10.5;10.5" keyTimes="0;0.42;0.47;0.52;1" dur="5s" repeatCount="indefinite"/></ellipse><circle cx="60" cy="80" r="4" fill="rgba(255,255,255,0.8)"/><circle cx="92" cy="80" r="4" fill="rgba(255,255,255,0.8)"/><path d="M72 104 Q80 111, 88 104" fill="none" stroke="rgba(30,20,32,0.75)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="48" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><ellipse cx="112" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><rect x="120" y="94" width="18" height="24" rx="3" fill="rgba(255,255,255,0.75)" stroke="rgba(218,144,194,0.4)" stroke-width="1.5" transform="rotate(8 129 106)"/><path d="M124 92 Q130 90, 128 98" fill="none" stroke="rgba(218,144,194,0.6)" stroke-width="3.5" stroke-linecap="round"/><line x1="124" y1="103" x2="132" y2="101" stroke="rgba(218,144,194,0.3)" stroke-width="1"/><line x1="124" y1="107" x2="130" y2="105.5" stroke="rgba(218,144,194,0.3)" stroke-width="1"/></g></svg>`;

const CELLY_WRITING_SVG = `<svg data-state="writing" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gw" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="rgba(255,245,250,0.6)"/><stop offset="100%" stop-color="rgba(218,144,194,0.15)"/></radialGradient><radialGradient id="gw2" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="rgba(246,212,236,0.35)"/><stop offset="100%" stop-color="rgba(218,144,194,0.08)"/></radialGradient><filter id="gfw"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter></defs><circle cx="80" cy="92" r="36" fill="#F0C8E0" filter="url(#gfw)" opacity="0.3"/><circle cx="80" cy="92" r="46" fill="url(#gw)" stroke="rgba(218,144,194,0.3)" stroke-width="1.5"/><circle cx="80" cy="92" r="38" fill="url(#gw2)"/><path d="M46 74 Q58 54, 80 52 Q102 54, 112 70" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="16" ry="10" fill="rgba(255,255,255,0.3)"/><path d="M50 50 Q80 34, 110 50 L106 58 Q80 46, 54 58Z" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><rect x="72" y="40" width="16" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><line x1="80" y1="42" x2="80" y2="50" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><line x1="76" y1="46" x2="84" y2="46" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="64" cy="90" rx="8" ry="7" fill="rgba(30,20,32,0.85)"/><ellipse cx="96" cy="90" rx="8" ry="7" fill="rgba(30,20,32,0.85)"/><circle cx="62" cy="88" r="3" fill="rgba(255,255,255,0.7)"/><circle cx="94" cy="88" r="3" fill="rgba(255,255,255,0.7)"/><line x1="72" y1="106" x2="88" y2="106" stroke="rgba(30,20,32,0.6)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="48" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><ellipse cx="112" cy="100" rx="8" ry="4.5" fill="rgba(244,150,200,0.25)"/><g><animateTransform attributeName="transform" type="rotate" values="-2 129 106;2 129 106;-2 129 106" dur="0.4s" repeatCount="indefinite"/><rect x="120" y="94" width="18" height="24" rx="3" fill="rgba(255,255,255,0.75)" stroke="rgba(218,144,194,0.4)" stroke-width="1.5" transform="rotate(8 129 106)"/><line x1="124" y1="103" x2="132" y2="101" stroke="rgba(218,144,194,0.3)" stroke-width="1"/><line x1="124" y1="107" x2="130" y2="105.5" stroke="rgba(218,144,194,0.3)" stroke-width="1"/></g><path d="M124 92 Q130 90, 128 98" fill="none" stroke="rgba(218,144,194,0.6)" stroke-width="3.5" stroke-linecap="round"/><line x1="40" y1="96" x2="34" y2="86" stroke="rgba(218,144,194,0.4)" stroke-width="2.5" stroke-linecap="round"><animate attributeName="y2" values="86;83;86" dur="0.3s" repeatCount="indefinite"/></line><circle cx="33" cy="84" r="2.5" fill="#FFD700"><animate attributeName="cy" values="84;81;84" dur="0.3s" repeatCount="indefinite"/></circle></svg>`;

const CELLY_HAPPY_SVG = `<svg data-state="happy" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gh" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="rgba(255,245,250,0.6)"/><stop offset="100%" stop-color="rgba(218,144,194,0.15)"/></radialGradient><radialGradient id="gh2" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="rgba(246,212,236,0.35)"/><stop offset="100%" stop-color="rgba(218,144,194,0.08)"/></radialGradient><filter id="gfh"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter></defs><circle cx="80" cy="92" r="36" fill="#F0C8E0" filter="url(#gfh)" opacity="0.3"/><g><animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0;0,-5;0,0;0,-2;0,0" dur="1.2s" fill="freeze"/><circle cx="80" cy="92" r="46" fill="url(#gh)" stroke="rgba(218,144,194,0.3)" stroke-width="1.5"/><circle cx="80" cy="92" r="38" fill="url(#gh2)"/><path d="M46 74 Q58 54, 80 52 Q102 54, 112 70" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="16" ry="10" fill="rgba(255,255,255,0.3)"/><path d="M50 50 Q80 34, 110 50 L106 58 Q80 46, 54 58Z" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><rect x="72" y="40" width="16" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="rgba(232,160,208,0.6)" stroke-width="1.5"/><line x1="80" y1="42" x2="80" y2="50" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><line x1="76" y1="46" x2="84" y2="46" stroke="rgba(218,144,194,0.8)" stroke-width="2.5" stroke-linecap="round"/><path d="M54 84 Q64 74, 74 84" fill="none" stroke="rgba(30,20,32,0.85)" stroke-width="3" stroke-linecap="round"/><path d="M86 84 Q96 74, 106 84" fill="none" stroke="rgba(30,20,32,0.85)" stroke-width="3" stroke-linecap="round"/><path d="M66 102 Q80 116, 94 102" fill="rgba(180,100,150,0.25)" stroke="rgba(30,20,32,0.75)" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="80" cy="107" rx="5" ry="3.5" fill="rgba(200,120,170,0.4)"/><ellipse cx="46" cy="98" rx="10" ry="6" fill="rgba(244,150,200,0.35)"/><ellipse cx="114" cy="98" rx="10" ry="6" fill="rgba(244,150,200,0.35)"/><rect x="120" y="94" width="18" height="24" rx="3" fill="rgba(255,255,255,0.75)" stroke="rgba(218,144,194,0.4)" stroke-width="1.5" transform="rotate(8 129 106)"/><path d="M124 92 Q130 90, 128 98" fill="none" stroke="rgba(218,144,194,0.6)" stroke-width="3.5" stroke-linecap="round"/></g><text x="32" y="62" font-size="12" fill="rgba(232,160,208,0.8)"><animate attributeName="y" values="62;20" dur="1.8s" fill="freeze"/><animate attributeName="opacity" values="1;0" dur="1.8s" fill="freeze"/>&#x2665;</text><text x="116" y="54" font-size="9" fill="rgba(212,142,190,0.7)"><animate attributeName="y" values="54;16" dur="2s" fill="freeze"/><animate attributeName="opacity" values="0.8;0" dur="2s" fill="freeze"/>&#x2665;</text><text x="24" y="50" font-size="11" fill="rgba(232,160,208,0.6)">&#x2726;</text><text x="128" y="44" font-size="8" fill="rgba(212,142,190,0.4)">&#x2726;</text></svg>`;

/* ═══════════════════════════════════════════
   CELLY QUIZ
   ═══════════════════════════════════════════ */
const QS = [
  { bot: () => `Let\u2019s build your plan! 4 quick questions.<br><br><strong>Do you have other children?</strong>`, ch: [{ id: 'siblings', val: 'first', t: 'This is our first' }, { id: 'siblings', val: 'yes', t: 'Yes, we have other children' }, { id: 'siblings', val: 'multiples', t: 'Expecting twins or multiples' }] },
  { bot: (a) => `${a.siblings === 'first' ? 'Got it!' : 'Noted!'}<br><br><strong>Who do you want stem cell protection for?</strong>`, ch: [{ id: 'who', val: 'baby', t: 'Just my baby' }, { id: 'who', val: 'extra', t: 'My baby, with extra coverage for more conditions' }, { id: 'who', val: 'parents', t: 'My baby and both parents' }] },
  { bot: () => `<strong>What kinds of conditions do you want to be prepared for?</strong><span class="cc-edu">Cord blood treats blood and immune conditions. Cord tissue contains a different stem cell type (MSCs) being studied for neurological, orthopedic, and tissue repair therapies.</span>`, ch: [{ id: 'conditions', val: 'blood', t: 'Blood and immune conditions' }, { id: 'conditions', val: 'broad', t: 'Blood, immune, and neurological or tissue-related' }, { id: 'conditions', val: 'unsure', t: "I\u2019m not sure \u2014 what do you recommend?" }] },
  { bot: () => `<strong>Would you want to screen your baby for genetic health risks at birth?</strong><span class="cc-edu">Newborn genetic analysis can identify inherited conditions early \u2014 sometimes before symptoms appear.</span>`, ch: [{ id: 'genetic', val: 'yes', t: "Yes, I'd want to know early" }, { id: 'genetic', val: 'maybe', t: "Maybe \u2014 I'd like to learn more" }, { id: 'genetic', val: 'no', t: 'No, not interested' }] },
];
const LBL = { 'siblings:first': 'First child', 'siblings:yes': 'Other children', 'siblings:multiples': 'Twins/multiples', 'who:baby': 'Just my baby', 'who:extra': 'Extra coverage', 'who:parents': 'Baby + both parents', 'conditions:blood': 'Blood & immune', 'conditions:broad': 'Broad coverage', 'conditions:unsure': 'Not sure', 'genetic:yes': 'Screen early', 'genetic:maybe': 'Maybe', 'genetic:no': 'No' };

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */
const CSS = `
html{overflow-x:hidden}
.pf-page,.pf-page *,.pf-page *::before,.pf-page *::after,.pf-bottom,.pf-bottom *{box-sizing:border-box}
.pf-page{max-width:640px;margin:0 auto;padding:48px 32px 120px;width:100%}
.celly-banner{background:linear-gradient(145deg,#FBF5F9,#fff);border:1px solid rgba(232,160,208,0.2);border-radius:16px;padding:24px 28px;display:flex;align-items:center;gap:20px;cursor:pointer;transition:all 0.25s;box-shadow:0 3px 16px rgba(108,26,85,0.08);margin-bottom:28px}
.celly-banner:hover{border-color:#E8A0D0;box-shadow:0 6px 24px rgba(108,26,85,0.1)}
.celly-banner-av{width:80px;height:90px;flex-shrink:0;overflow:hidden}
.celly-banner-text{flex:1}
.celly-banner-title{font-size:16px;font-weight:700}
.celly-banner-sub{font-size:13px;color:#8A857A;margin-top:3px;line-height:1.4}
.celly-banner-arrow{padding:10px 22px;border-radius:100px;background:#6C1A55;color:#fff;font-size:13px;font-weight:700;white-space:nowrap;flex-shrink:0}
.celly-chat{display:none;background:#fff;border:1px solid #E8E2DC;border-radius:16px;padding:20px;margin-bottom:28px;box-shadow:0 2px 16px rgba(108,26,85,0.06)}
.celly-chat.open{display:block;animation:pf-fadeIn 0.3s ease}
@keyframes pf-fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.cc-row{display:flex;align-items:flex-start;gap:12px}
.cc-av{width:80px;height:90px;flex-shrink:0;position:relative}
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
.pf-sec-sub{font-size:13px;color:#8A857A;margin-bottom:16px}
.pf-step-bar{display:flex;gap:4px;margin-bottom:32px;padding:8px 0}
.pf-step-pip{flex:1;height:20px;border-radius:2px;cursor:pointer;position:relative}
.pf-step-pip::after{content:'';position:absolute;left:0;right:0;top:8px;height:4px;border-radius:2px;background:#E8E2DC;transition:background 0.3s}
.pf-step-pip.done::after{background:#E8A0D0}
.pf-step-pip.active::after{background:#6C1A55}
.pf-product{display:flex;gap:0;background:#fff;border:1px solid #E8E2DC;border-radius:16px;padding:4px}
.pf-po{flex:1;padding:18px 20px;text-align:center;border-radius:13px;cursor:pointer;transition:all 0.2s;font-size:18px;font-weight:600}
.pf-po:hover{background:#F3F0F8}
.pf-po.sel{background:#6C1A55;color:#fff}
.pf-po-p{font-family:'Source Serif 4',serif;font-weight:400;font-size:13px;margin-top:1px;opacity:0.6}
.pf-po.sel .pf-po-p{color:rgba(255,255,255,0.6)}
.pf-list{display:flex;flex-direction:column;transition:outline 0.3s}
.pf-row{display:flex;align-items:center;justify-content:space-between;padding:20px 26px;background:#fff;border:1px solid #E8E2DC;cursor:pointer;transition:all 0.15s;margin-top:-1px;position:relative}
.pf-row:first-child{border-radius:14px 14px 0 0}.pf-row:last-child{border-radius:0 0 14px 14px}
.pf-row:hover{background:rgba(108,26,85,0.02)}
.pf-row.sel{background:rgba(108,26,85,0.05);border-color:#6C1A55;z-index:1}
.pf-row-l{display:flex;align-items:center;gap:14px;min-width:0;flex:1}
.pf-dot{width:20px;height:20px;border-radius:50%;border:2px solid #E8E2DC;flex-shrink:0;transition:all 0.15s}
.pf-row.sel .pf-dot{border-color:#6C1A55;border-width:6px}
.pf-row-name{font-size:15px;font-weight:600}
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
@keyframes pf-popBounce{0%{transform:scale(1);box-shadow:0 0 0 rgba(108,26,85,0)}15%{transform:scale(1.06);box-shadow:0 4px 20px rgba(108,26,85,0.15)}35%{transform:scale(1.05);box-shadow:0 3px 16px rgba(108,26,85,0.12)}55%{transform:scale(0.97)}75%{transform:scale(1.02)}100%{transform:scale(1);box-shadow:0 0 0 rgba(108,26,85,0)}}
.pf-pop-bounce{animation:pf-popBounce 0.8s ease}
.pf-plan-nudge{outline:2px solid #E85D75;outline-offset:4px;border-radius:14px}
.pf-bottom{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E8E2DC;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;z-index:50;box-shadow:0 -4px 20px rgba(0,0,0,0.04);min-height:72px}
.pf-fb-label{font-size:10px;color:#8A857A;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.pf-fb-total{font-family:'Source Serif 4',serif;font-size:28px;color:#6C1A55}
.pf-fb-save{font-size:11px;color:#3D8B6A;font-weight:700}
.pf-fb-monthly{font-size:12px;color:#8A857A}
.pf-fb-btn-next{padding:12px 28px;border-radius:100px;border:none;background:#6C1A55;color:#fff;font-family:'Lato',sans-serif;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap}
.pf-fb-btn-back{width:40px;height:40px;border-radius:50%;border:1.5px solid #D8D0C8;background:#fff;color:#8A857A;font-family:'Lato',sans-serif;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.pf-fb-btn-back:hover{border-color:#6C1A55;color:#6C1A55}
.pf-form-label{display:none}
.pf-form-input{width:100%;padding:16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;outline:none;background:#fff;transition:border-color 0.2s;box-sizing:border-box}
.pf-form-input::placeholder{color:#8A857A;font-weight:400;font-size:14px}
.pf-form-input:focus::placeholder{opacity:0}
.pf-form-input:focus{border-color:#6C1A55}
.pf-form-select{width:100%;padding:16px;border:1px solid #E8E2DC;border-radius:10px;font-family:'Lato',sans-serif;font-size:14px;font-weight:400;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;color:#2C2A26}
.pf-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.pf-form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
.pf-form-full{margin-bottom:12px}
.pf-divider{height:1px;background:#F0EBE6;margin:24px 0 20px}
.pf-add-parent-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:100px;border:1px dashed #E8E2DC;background:transparent;color:#8A857A;font-family:'Lato',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:12px}
.pf-add-parent-btn:hover{border-color:#6C1A55;color:#6C1A55;background:#F5E0EF}
.pf-parent-block{background:#F5F2F8;border-radius:12px;padding:20px;margin-top:12px}
.pf-parent-block-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.pf-parent-block-title{font-size:13px;font-weight:700;color:#6C1A55}
.pf-remove-parent{font-size:12px;color:#8A857A;cursor:pointer;background:none;border:none;font-family:'Lato',sans-serif;text-decoration:underline}
.pf-twins-row{display:flex;align-items:center;gap:12px;padding:14px 22px;background:#fff;border:1px solid #E8E2DC;border-radius:14px;cursor:pointer;transition:all 0.15s;margin-top:16px}
.pf-twins-row:hover{background:rgba(108,26,85,0.02)}
.pf-twins-check{width:20px;height:20px;border-radius:4px;border:2px solid #E8E2DC;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
.pf-twins-row.sel .pf-twins-check{background:#6C1A55;border-color:#6C1A55}
.pf-twins-name{font-size:13px;font-weight:400;color:#2C2A26}
.pf-checkbox-row{display:flex;align-items:center;gap:10px;margin:16px 0;cursor:pointer}
.pf-checkbox-row input[type=checkbox]{width:18px;height:18px;accent-color:#6C1A55;cursor:pointer}
.pf-checkbox-row label{font-size:13px;color:#6B6760;cursor:pointer}
.pf-order-card{background:#fff;border-radius:14px;border:1px solid #E8E2DC;overflow:hidden;margin-bottom:24px}
.pf-order-head{background:linear-gradient(160deg,#6C1A55,#3D0F31);padding:20px;color:#fff}
.pf-order-head-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.5;margin-bottom:4px}
.pf-order-head-total{font-family:'Source Serif 4',serif;font-size:36px}
.pf-order-head-save{font-size:12px;opacity:0.6;margin-top:4px}
.pf-order-head-sched{font-size:12px;opacity:0.7;margin-top:6px}
.pf-order-body{padding:20px}
.pf-order-line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F5EDE6;font-size:14px}
.pf-order-line:last-child{border:none}
.pf-order-line-label{color:#6B6760}
.pf-order-line-val{font-weight:700}
.pf-order-line-free{color:#3D8B6A;font-weight:700}
.pf-ps-radios{display:flex;flex-direction:column;gap:0;margin-bottom:24px}
.pf-ps-radio{display:flex;align-items:center;gap:12px;padding:14px 18px;border:1px solid #E8E2DC;cursor:pointer;transition:all 0.15s;margin-top:-1px;background:#fff}
.pf-ps-radio:first-child{border-radius:10px 10px 0 0}.pf-ps-radio:last-child{border-radius:0 0 10px 10px}
.pf-ps-radio:hover{background:rgba(108,26,85,0.02)}
.pf-ps-radio.sel{background:rgba(108,26,85,0.04);border-color:#6C1A55;z-index:1}
.pf-ps-radio-dot{width:18px;height:18px;border-radius:50%;border:2px solid #E8E2DC;flex-shrink:0;transition:all 0.15s}
.pf-ps-radio.sel .pf-ps-radio-dot{border-color:#6C1A55;border-width:5px}
.pf-ps-radio-text{font-size:13px;color:#2C2A26}
.pf-ps-radio-sub{font-size:13px;color:#8A857A;margin-left:auto}
.pf-pay-methods{display:flex;gap:8px;margin-bottom:20px}
.pf-pay-tab{flex:1;padding:14px;text-align:center;border:2px solid #E8E2DC;border-radius:12px;cursor:pointer;font-size:13px;font-weight:700;color:#6B6760;background:#fff;transition:all 0.2s}
.pf-pay-tab.sel{border-color:#6C1A55;color:#6C1A55;background:rgba(108,26,85,0.05)}
.pf-wallet-msg{text-align:center;padding:32px 20px;background:#fff;border:1px solid #E8E2DC;border-radius:14px;margin-bottom:20px}
.pf-trust-infield{position:absolute;right:16px;top:50%;transform:translateY(20%);display:flex;align-items:center;gap:4px;pointer-events:none}
.pf-ts-infield{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#B0AAA0;white-space:nowrap}
.pf-ts-infield svg{color:#D8D0C8}
.pf-error{margin-top:20px;padding:12px 16px;background:rgba(232,93,117,0.08);border:1px solid rgba(232,93,117,0.25);border-radius:10px;font-size:13px;color:#E85D75;font-weight:600}
.pf-checkout{animation:pf-fadeIn 0.3s ease}
@media(max-width:600px){
  .pf-page{padding:32px 16px 120px}
  .pf-bottom{padding:12px 16px}.pf-fb-total{font-size:24px}
  .pf-product{border-radius:14px}.pf-po{padding:14px 10px;font-size:15px}
  .pf-row{padding:16px 14px}.pf-tog{padding:14px}
  .pf-row-name{font-size:14px}.pf-row-price{font-size:14px}.pf-row-r{gap:6px}
  .pf-badge{font-size:9px;padding:2px 8px}
  .pf-form-row,.pf-form-row-3{grid-template-columns:1fr}
  .pf-pay-methods{flex-direction:column}
  .celly-banner{flex-direction:column;text-align:center;padding:20px 16px;gap:12px}
  .celly-banner-av{width:60px;height:68px}
  .celly-banner-arrow{width:100%;text-align:center}
}
`;

const SSL_ICON = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:12px;height:12px"><path d="M8 1L2 4v4c0 3.5 2.6 6.4 6 7 3.4-.6 6-3.5 6-7V4L8 1z" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5.5 8.5L7 10l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function PricingForm() {
  const [product, setProduct] = useState('cb');
  const [plan, setPlan] = useState(null);
  const [addons, setAddons] = useState({ pba: false, pbaPlus: false, hla: false, nga: false });
  const [twins, setTwins] = useState(false);
  const [paySched, setPaySched] = useState('full');
  const [step, setStep] = useState(1);
  const [planNudge, setPlanNudge] = useState(false);
  const [cellyOpen, setCellyOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [cellyState, setCellyState] = useState('idle');
  const [cellyMsgHtml, setCellyMsgHtml] = useState('');
  const [cellyChoicesHtml, setCellyChoicesHtml] = useState('');
  const [cellyTags, setCellyTags] = useState({});
  const [bouncing, setBouncing] = useState(null);
  const cellyAnswers = useRef({});
  const cellyStepRef = useRef(0);
  const cellyTimers = useRef([]);
  const cellyBannerRef = useRef(null);
  const cellyAvRef = useRef(null);
  const cellyAvInjected = useRef(false);
  const [primaryRole, setPrimaryRole] = useState('');
  const [parents, setParents] = useState([]);
  const [payMethod, setPayMethod] = useState('card');
  const [billingSame, setBillingSame] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [formLayout, setFormLayout] = useState('new'); // 'new' = current (role after address), 'old' = original (role after name)
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isAmex, setIsAmex] = useState(false);
  const cellyBannerInjected = useRef(false);
  // Step 2 form fields
  const [form, setForm] = useState({ firstName: '', lastName: '', dueDate: '', birthday: '', email: '', phone: '', street: '', city: '', state: '', zip: '', hospital: '', doctor: '' });
  const uf = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  // Billing fields
  const [billing, setBilling] = useState({ street: '', city: '', state: '', zip: '' });
  const ub = (k) => (e) => setBilling(prev => ({ ...prev, [k]: e.target.value }));

  useEffect(() => { const id = 'pf-styles'; if (!document.getElementById(id)) { const s = document.createElement('style'); s.id = id; s.textContent = CSS; document.head.appendChild(s); } }, []);

  // Inject Celly banner SVG once (prevents animation reset on re-render)
  useEffect(() => {
    if (!cellyBannerRef.current || cellyBannerInjected.current) return;
    cellyBannerRef.current.innerHTML = CELLY_BANNER_SVG;
    cellyBannerInjected.current = true;
  });

  // Inject Celly chat SVGs once, then only toggle .off class
  useEffect(() => {
    if (!cellyAvRef.current) return;
    if (!cellyAvInjected.current) {
      const svgMap = { idle: CELLY_IDLE_SVG, writing: CELLY_WRITING_SVG, happy: CELLY_HAPPY_SVG };
      cellyAvRef.current.innerHTML = Object.entries(svgMap)
        .map(([state, svg]) => svg.replace(`data-state="${state}"`, `data-state="${state}" class="off"`))
        .join('');
      cellyAvInjected.current = true;
    }
    cellyAvRef.current.querySelectorAll('svg').forEach((el) => {
      el.classList.toggle('off', el.dataset.state !== cellyState);
    });
  }, [cellyState, step]);

  const mult = twins ? 2 : 1;
  const isPrepaid = plan && plan !== 'annual';
  let total, savings;
  if (!plan) { total = (product === 'cb' ? 725 : 995) * mult; savings = 0; }
  else { total = D[product].plans[plan].total * mult; savings = (D[product].plans[plan].savings || 0) * mult; }
  Object.keys(addons).forEach((k) => { if (!addons[k]) return; if (k === 'pba' && product === 'cbt') { savings += 299 * mult; } else if (k === 'hla') { total += (isPrepaid ? Ad.hlaP : Ad.hla) * mult; if (isPrepaid) savings += 100 * mult; } else { total += Ad[k] * mult; } });

  const chargeAmt = paySched === 'full' ? total : Math.ceil(total / (paySched === '6mo' ? 6 : 12));
  const monthlyNote = paySched === 'full' ? `or ${fDec(total / 12)}/mo` : `${f(total)} total`;
  const priceTexts = { annual: '+' + f(D[product].plans.annual.storage) + '/yr', '18year': f(D[product].plans['18year'].total), lifetime: f(D[product].plans.lifetime.total), lifetimeSave: 'Saving ' + f(D[product].plans.lifetime.savings), pba: product === 'cbt' ? 'FREE' : '$299', hla: isPrepaid ? '$195' : '$295' };

  const scrollToForm = () => { const hero = document.getElementById('hero'); if (hero) { const y = hero.getBoundingClientRect().bottom + window.pageYOffset - 80; window.scrollTo({ top: step === 1 ? 0 : y, behavior: 'smooth' }); } };
  const goStep = (n) => { if (n > 1 && !plan) { setPlanNudge(true); document.querySelector('.pf-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => setPlanNudge(false), 2000); return; } if (n === 1 && !cellyOpen) { setBannerVisible(true); cellyBannerInjected.current = false; } if (n === 1) { cellyAvInjected.current = false; } setStep(n); setTimeout(scrollToForm, 50); };
  const validateStep2 = () => { const allRoles = [primaryRole, ...parents.map(p => p.role)]; if (!allRoles.includes('birth_mother')) { setErrorMsg('A birth mother must be listed \u2014 either as the primary contact or as an additional parent.'); return; } if (primaryRole === 'birth_mother') { if (!form.dueDate || !form.birthday) { setErrorMsg('Please enter the birth mother\u2019s due date and birthday.'); return; } } const bmParent = parents.find(p => p.role === 'birth_mother'); if (bmParent && (!bmParent.dueDate || !bmParent.birthday)) { setErrorMsg('Please enter the birth mother\u2019s due date and birthday.'); return; } setErrorMsg(''); goStep(3); };

  const addParent = () => { if (parents.length >= 2) return; setParents(prev => [...prev, { id: Date.now(), role: '', firstName: '', lastName: '', phone: '', dueDate: '', birthday: '' }]); };
  const removeParent = (id) => setParents(prev => prev.filter(p => p.id !== id));
  const setParentField = (id, k, v) => setParents(prev => prev.map(p => p.id === id ? { ...p, [k]: v } : p));

  const handleCardNum = (e) => { let v = e.target.value.replace(/\D/g, ''); const amex = /^3[47]/.test(v); setIsAmex(amex); v = v.substring(0, amex ? 15 : 16); if (amex) { let p = []; if (v.length > 0) p.push(v.substring(0, 4)); if (v.length > 4) p.push(v.substring(4, 10)); if (v.length > 10) p.push(v.substring(10, 15)); setCardNum(p.join(' ')); } else { setCardNum(v.replace(/(\d{4})(?=\d)/g, '$1 ')); } };
  const handleCardExp = (e) => { let v = e.target.value.replace(/\D/g, '').substring(0, 4); if (v.length >= 1) { if (v.length === 1 && parseInt(v[0]) > 1) v = '0' + v[0]; else if (v.length >= 2) { let m = parseInt(v.substring(0, 2)); if (m === 0) v = '01' + v.substring(2); else if (m > 12) v = '12' + v.substring(2); } } if (v.length >= 3) setCardExp(v.substring(0, 2) + ' / ' + v.substring(2)); else if (v.length === 2) setCardExp(v + ' / '); else setCardExp(v); };
  const handleCardCvc = (e) => { setCardCvc(e.target.value.replace(/\D/g, '').substring(0, isAmex ? 4 : 3)); };

  const buildReviewLines = () => { if (!plan) return []; const pl = product === 'cb' ? 'Cord Blood' : 'Cord Blood & Tissue'; const pn = { annual: 'Pay by year', '18year': '18-Year Plan', lifetime: 'Lifetime Plan' }[plan]; const lines = [{ label: pl + ' \u2014 ' + pn + (twins ? ' (\u00d72)' : ''), val: f(D[product].plans[plan].total * mult), free: false }]; const names = { pba: 'Public Bank Access', pbaPlus: 'Public Bank Access+', hla: 'HLA Matching', nga: 'NGA' }; Object.keys(addons).forEach(k => { if (!addons[k]) return; const isFree = k === 'pba' && product === 'cbt'; const price = isFree ? 0 : k === 'hla' && isPrepaid ? Ad.hlaP : Ad[k]; lines.push({ label: names[k] + (twins ? ' (\u00d72)' : ''), val: isFree ? 'FREE' : f(price * mult), free: isFree }); }); return lines; };

  // ═══════════════════════════════════════
  // CELLY CHAT ENGINE
  // ═══════════════════════════════════════
  const clearTimers = () => { cellyTimers.current.forEach(clearTimeout); cellyTimers.current = []; };
  const timer = (fn, ms) => { const t = setTimeout(fn, ms); cellyTimers.current.push(t); return t; };
  const glide = (el) => { if (!el) return; const y = el.getBoundingClientRect().top + window.pageYOffset - window.innerHeight * 0.35; window.scrollTo({ top: y, behavior: 'smooth' }); };
  const doBounce = (key) => { setBouncing(key); setTimeout(() => setBouncing(null), 500); };

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
                applyCellyResults();
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
        else applyCellyResults();
      }, 900 + Math.random() * 300);
    }, 250);
  };

  const applyCellyResults = () => {
    setCellyState('happy');
    setCellyMsgHtml('<div class="cc-bubble">All set! \ud83c\udf89 I\u2019ve configured your plan below. Adjust anything you like!</div>');
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
        const reason = prodKey === 'cbt'
          ? "You wanted coverage for neurological and tissue conditions too \u2014 cord tissue adds a second type of stem cell."
          : "You chose to focus on blood and immune conditions \u2014 cord blood covers that.";
        newTags['ct-' + prodKey] = { cls: 'pick', label: "Celly's pick", reason };
        setCellyTags({ ...newTags });
        doBounce(prodKey);
      }, 150);
    }, DELAY * step++);

    // 2. Plan
    timer(() => {
      const el = document.querySelector('.pf-row[data-plan="18year"]');
      glide(el);
      timer(() => { setPlan('18year'); doBounce('18year'); }, 150);
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
          doBounce('pba');
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
          doBounce('pbaPlus');
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
          doBounce('hla');
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
          doBounce('nga');
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

  // Tag renderer
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

  const primaryIsBM = primaryRole === 'birth_mother';

  return (
    <>
      <div className="pf-page" id="pricing-form">
        {step > 1 && (<div className="pf-step-bar">{[2, 3].map(n => <div key={n} className={`pf-step-pip${step > n ? ' done' : ''}${step === n ? ' active' : ''}`} onClick={() => goStep(n)} />)}</div>)}

        {step === 1 && (<div>
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

          <div className="pf-sec"><div className="pf-sec-t">Choose your plan</div><div className="pf-product"><div className={`pf-po${product === 'cb' ? ' sel' : ''}${bouncing === 'cb' ? ' pf-pop-bounce' : ''}`} data-prod="cb" onClick={() => setProduct('cb')}>Cord Blood {renderTag('ct-cb')}<div className="pf-po-p">$725</div></div><div className={`pf-po${product === 'cbt' ? ' sel' : ''}${bouncing === 'cbt' ? ' pf-pop-bounce' : ''}`} data-prod="cbt" onClick={() => setProduct('cbt')}>Blood & Tissue {renderTag('ct-cbt')}<div className="pf-po-p">$995</div></div></div></div>

          <div className="pf-sec"><div className="pf-sec-t">Protection term</div><div className={`pf-list${planNudge ? ' pf-plan-nudge' : ''}`}>
            {[{ key: 'annual', name: 'Pay by year', desc: 'Most flexible \u2014 renew annually', badge: null, price: priceTexts.annual }, { key: '18year', name: '18-Year Plan', desc: 'One payment, done', badge: <span className="pf-badge pf-badge-pop">Most popular</span>, price: priceTexts['18year'] }, { key: 'lifetime', name: 'Lifetime Plan', desc: 'Never pay for storage again', badge: <span className="pf-badge pf-badge-save">{priceTexts.lifetimeSave}</span>, price: priceTexts.lifetime }].map(p => (
              <div key={p.key} className={`pf-row${plan === p.key ? ' sel' : ''}${bouncing === p.key ? ' pf-pop-bounce' : ''}`} data-plan={p.key} onClick={() => { setPlan(p.key); setPlanNudge(false); }}><div className="pf-row-l"><div className="pf-dot" /><div><div className="pf-row-name">{p.name} {renderTag('ct-' + p.key)}</div><div className="pf-row-desc">{p.desc}</div></div></div><div className="pf-row-r">{p.badge}<div className="pf-row-price">{p.price}</div></div></div>
            ))}
          </div></div>

          <div className="pf-sec"><div className="pf-sec-t">Advanced protection</div><div className="pf-list">
            {[{ key: 'pba', name: 'Public Bank Access', desc: 'Expanded cell access for your child', price: priceTexts.pba }, { key: 'pbaPlus', name: 'Public Bank Access+', desc: 'Cord blood access for both parents', price: '$699' }, { key: 'hla', name: 'HLA Matching', desc: 'Sibling compatibility testing', price: priceTexts.hla }, { key: 'nga', name: 'NGA', desc: 'Newborn genetic analysis', price: '$399' }].map(a => (
              <div key={a.key} className={`pf-tog${addons[a.key] ? ' sel' : ''}${bouncing === a.key ? ' pf-pop-bounce' : ''}`} data-addon={a.key} onClick={() => setAddons(prev => ({ ...prev, [a.key]: !prev[a.key] }))}><div className="pf-row-l"><div className="pf-sw" /><div><div className="pf-row-name">{a.name} {renderTag('ct-' + a.key)}</div><div className="pf-row-desc">{a.desc}</div></div></div><div className="pf-row-price">{a.price}</div></div>
            ))}
          </div></div>
        </div>)}

        {step === 2 && (<form className="pf-checkout" autoComplete="on" onSubmit={e => e.preventDefault()} name="enrollment">
          <div className="pf-sec-t">Your information</div>
          <div className="pf-sec-sub">Tell us about yourself so we can set up your account.</div>
          <div className="pf-form-row"><div><input className="pf-form-input" name="firstname" autoComplete="given-name" placeholder="First name" value={form.firstName} onChange={uf('firstName')} /></div><div><input className="pf-form-input" name="lastname" autoComplete="family-name" placeholder="Last name" value={form.lastName} onChange={uf('lastName')} /></div></div>
          <div className="pf-form-full"><select className="pf-form-select" value={primaryRole} onChange={e => setPrimaryRole(e.target.value)} autoComplete="off"><option value="">Relationship to baby</option><option value="birth_mother" disabled={parents.some(p => p.role === 'birth_mother')}>Birth mother{parents.some(p => p.role === 'birth_mother') ? ' (already selected)' : ''}</option><option value="mother">Mother</option><option value="father">Father</option><option value="surrogate">Surrogate</option><option value="other">Other guardian</option></select></div>
          {primaryIsBM && <div className="pf-form-row"><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, border: '1px solid #E8E2DC', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }} onClick={(e) => e.currentTarget.querySelector('input').showPicker()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#B0AAA0', flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span style={{ fontSize: 14, color: form.dueDate ? '#2C2A26' : '#8A857A', flex: 1 }}>{form.dueDate ? new Date(form.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Due date'}</span><input type="date" value={form.dueDate} onChange={uf('dueDate')} style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }} /></div></div><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, border: '1px solid #E8E2DC', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }} onClick={(e) => e.currentTarget.querySelector('input').showPicker()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#B0AAA0', flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span style={{ fontSize: 14, color: form.birthday ? '#2C2A26' : '#8A857A', flex: 1 }}>{form.birthday ? new Date(form.birthday + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Your birthday'}</span><input type="date" value={form.birthday} onChange={uf('birthday')} style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }} /></div></div></div>}
          <div className="pf-form-row"><div><input className="pf-form-input" type="email" name="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={uf('email')} /></div><div><input className="pf-form-input" type="tel" name="phone" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={uf('phone')} /></div></div>
          <div className="pf-form-full"><input className="pf-form-input" name="address" autoComplete="street-address" placeholder="Street address (kit delivery)" value={form.street} onChange={uf('street')} /></div>
          <div className="pf-form-row-3"><div><input className="pf-form-input" name="city" autoComplete="address-level2" placeholder="City" value={form.city} onChange={uf('city')} /></div><div><input className="pf-form-input" name="state" autoComplete="address-level1" placeholder="State" value={form.state} onChange={uf('state')} /></div><div><input className="pf-form-input" name="zip" autoComplete="postal-code" placeholder="ZIP code" value={form.zip} onChange={uf('zip')} /></div></div>
          {parents.map((p) => (<div key={p.id} className="pf-parent-block"><div className="pf-parent-block-header"><span className="pf-parent-block-title">Additional parent/guardian</span><button className="pf-remove-parent" onClick={() => removeParent(p.id)}>Remove</button></div><div className="pf-form-row"><div><input className="pf-form-input" placeholder="First name" value={p.firstName} onChange={e => setParentField(p.id, 'firstName', e.target.value)} /></div><div><input className="pf-form-input" placeholder="Last name" value={p.lastName} onChange={e => setParentField(p.id, 'lastName', e.target.value)} /></div></div><div className="pf-form-full"><select className="pf-form-select" value={p.role} onChange={e => setParentField(p.id, 'role', e.target.value)}><option value="">Relationship to baby</option><option value="birth_mother" disabled={primaryRole === 'birth_mother' || parents.some(o => o.id !== p.id && o.role === 'birth_mother')}>Birth mother{(primaryRole === 'birth_mother' || parents.some(o => o.id !== p.id && o.role === 'birth_mother')) ? ' (already selected)' : ''}</option><option value="mother">Mother</option><option value="father">Father</option><option value="surrogate">Surrogate</option><option value="other">Other guardian</option></select></div>{p.role === 'birth_mother' && <div className="pf-form-row"><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, border: '1px solid #E8E2DC', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }} onClick={(e) => e.currentTarget.querySelector('input').showPicker()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#B0AAA0', flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span style={{ fontSize: 14, color: p.dueDate ? '#2C2A26' : '#8A857A', flex: 1 }}>{p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Due date'}</span><input type="date" value={p.dueDate} onChange={e => setParentField(p.id, 'dueDate', e.target.value)} style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }} /></div></div><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, border: '1px solid #E8E2DC', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }} onClick={(e) => e.currentTarget.querySelector('input').showPicker()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: '#B0AAA0', flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span style={{ fontSize: 14, color: p.birthday ? '#2C2A26' : '#8A857A', flex: 1 }}>{p.birthday ? new Date(p.birthday + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Your birthday'}</span><input type="date" value={p.birthday} onChange={e => setParentField(p.id, 'birthday', e.target.value)} style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }} /></div></div></div>}<div className="pf-form-full"><input className="pf-form-input" type="tel" placeholder="Phone number" value={p.phone} onChange={e => setParentField(p.id, 'phone', e.target.value)} /></div></div>))}
          {parents.length < 2 && <button type="button" className="pf-add-parent-btn" onClick={addParent}>+ Add another parent or guardian</button>}
          <div className="pf-divider" />
          <div className="pf-sec-t">Birth information</div>
          <div className="pf-form-full"><input className="pf-form-input" placeholder="Hospital or birth center" value={form.hospital} onChange={uf('hospital')} /></div>
          <div className="pf-form-full"><input className="pf-form-input" placeholder="Doctor's name" value={form.doctor} onChange={uf('doctor')} /></div>
          <div className={`pf-twins-row${twins ? ' sel' : ''}`} onClick={() => setTwins(!twins)}><div className="pf-twins-check">{twins && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}</div><div><div className="pf-twins-name">We're expecting twins</div><div className="pf-row-desc">Doubles processing and storage for both babies</div></div></div>
          {errorMsg && <div className="pf-error">{errorMsg}</div>}
        </form>)}

        {step === 3 && (<form className="pf-checkout" autoComplete="on" onSubmit={e => e.preventDefault()}>
          <div className="pf-sec-t">Your order</div>
          <div className="pf-order-card"><div className="pf-order-head"><div className="pf-order-head-label">{paySched === 'full' ? 'Total' : 'Due today'}</div><div className="pf-order-head-total">{f(chargeAmt)}</div>{paySched !== 'full' && <div className="pf-order-head-sched">{f(chargeAmt)}/mo × {paySched === '6mo' ? '6' : '12'} months · {f(total)} total</div>}{savings > 0 && <div className="pf-order-head-save">Saving {f(savings)}</div>}</div><div className="pf-order-body">{buildReviewLines().map((line, i) => <div key={i} className="pf-order-line"><span className="pf-order-line-label">{line.label}</span><span className={line.free ? 'pf-order-line-free' : 'pf-order-line-val'}>{line.val}</span></div>)}</div></div>
          <div className="pf-sec-t">Payment terms</div>
          <div className="pf-ps-radios">{[{ key: 'full', label: 'Pay in full', sub: f(total) }, { key: '6mo', label: '6 monthly payments', sub: f(Math.ceil(total / 6)) + '/mo' }, { key: '12mo', label: '12 monthly payments', sub: f(Math.ceil(total / 12)) + '/mo' }].map(o => <div key={o.key} className={`pf-ps-radio${paySched === o.key ? ' sel' : ''}`} onClick={() => setPaySched(o.key)}><div className="pf-ps-radio-dot" /><div className="pf-ps-radio-text">{o.label}</div><div className="pf-ps-radio-sub">{o.sub}</div></div>)}</div>
          <div className="pf-sec-t">Payment method</div>
          <div className="pf-pay-methods">{['card', 'apple', 'google'].map(m => <div key={m} className={`pf-pay-tab${payMethod === m ? ' sel' : ''}`} onClick={() => setPayMethod(m)}>{m === 'card' ? 'Card' : m === 'apple' ? 'Apple Pay' : 'Google Pay'}</div>)}</div>
          {payMethod === 'card' ? (<div><div className="pf-form-full" style={{ position: 'relative' }}><input className="pf-form-input" name="cardnumber" autoComplete="cc-number" placeholder="Card number" style={{ paddingRight: 120 }} value={cardNum} onChange={handleCardNum} /><div className="pf-trust-infield"><span className="pf-ts-infield" dangerouslySetInnerHTML={{ __html: SSL_ICON + ' 256-bit SSL' }} /></div></div><div className="pf-form-row"><div><input className="pf-form-input" name="cc-exp" autoComplete="cc-exp" placeholder="Expiration" value={cardExp} onChange={handleCardExp} /></div><div><input className="pf-form-input" name="cc-csc" autoComplete="cc-csc" placeholder={isAmex ? 'CID (4 digits)' : 'CVC'} value={cardCvc} onChange={handleCardCvc} /></div></div><div className="pf-form-full"><input className="pf-form-input" name="ccname" autoComplete="cc-name" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} /></div><div className="pf-checkbox-row"><input type="checkbox" id="pf-billing-same" checked={billingSame} onChange={() => setBillingSame(!billingSame)} /><label htmlFor="pf-billing-same">Billing address same as shipping</label></div>{!billingSame && <div><div className="pf-form-full"><input className="pf-form-input" autoComplete="billing street-address" placeholder="Billing street address" value={billing.street} onChange={ub('street')} /></div><div className="pf-form-row-3"><div><input className="pf-form-input" autoComplete="billing address-level2" placeholder="City" value={billing.city} onChange={ub('city')} /></div><div><input className="pf-form-input" autoComplete="billing address-level1" placeholder="State" value={billing.state} onChange={ub('state')} /></div><div><input className="pf-form-input" autoComplete="billing postal-code" placeholder="ZIP code" value={billing.zip} onChange={ub('zip')} /></div></div></div>}</div>) : (<div className="pf-wallet-msg"><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{payMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}</div><div style={{ fontSize: 13, color: '#8A857A' }}>You'll be prompted to confirm after clicking "Complete enrollment"</div></div>)}
        </form>)}
      </div>

      <div className="pf-bottom"><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div className="pf-fb-label">Your plan</div><div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}><div className="pf-fb-total">{paySched === 'full' ? f(total) : f(chargeAmt) + '/mo'}</div><div className="pf-fb-monthly">{monthlyNote}</div></div>{savings > 0 && <div className="pf-fb-save">Saving {f(savings)}</div>}</div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{step > 1 && <button className="pf-fb-btn-back" onClick={() => goStep(step - 1)}>←</button>}<button className="pf-fb-btn-next" onClick={() => { if (step === 1) goStep(2); else if (step === 2) validateStep2(); else alert('Demo \u2014 no payment processed'); }}>{step === 3 ? 'Complete enrollment →' : 'Continue →'}</button></div></div></div>
    </>
  );
}
