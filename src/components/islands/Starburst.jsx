import { useEffect, useRef } from 'react';

const CATS = [
  { name: 'Cancers', color: '#E8A0D0', r: 232, g: 160, b: 208, diseases: ['B-cell ALL','T-cell ALL','AML','APL','CML','JMML','CLL','Prolymphocytic','LGL leukemia','Hairy cell','Hodgkin','NLPHL','DLBCL','Follicular','Burkitt','Mantle cell','ALCL','Peripheral T-cell','Myeloma','Plasma cell','Waldenström\'s','MDS'] },
  { name: 'Blood disorders', color: '#6B9BED', r: 107, g: 155, b: 237, diseases: ['Sickle cell','Beta-thalassemia','Alpha-thalassemia','Hb E-beta thal.','Dyserythropoietic','Pyruvate kinase','Aplastic anemia','Fanconi anemia','Diamond-Blackfan','Red cell aplasia','Kostmann','Shwachman-Diamond','Dyskeratosis','Amegakaryocytic','PNH','Myelofibrosis','Osteopetrosis'] },
  { name: 'Immune deficiencies', color: '#5DB890', r: 93, g: 184, b: 144, diseases: ['ADA-SCID','X-linked SCID','JAK3 def.','Wiskott-Aldrich','XLP','CGD','Leukocyte adhesion','Chediak-Higashi','Omenn','Bare lymphocyte','IPEX','DiGeorge','CD45 def.','CD3δ def.','CD3ε def.','ZAP70 def.','Coronin-1A','DOCK2 def.','PNP def.','Artemis def.','DNA ligase IV','ADA2 def.','CD40L def.','CD40 def.','AICDA def.','UNG def.','NEMO def.','Reticular dysgen.','HLH','Griscelli'] },
  { name: 'Metabolic disorders', color: '#E8C06E', r: 232, g: 192, b: 110, diseases: ['Hurler','Maroteaux-Lamy','Sly syndrome','Krabbe','ALD','MLD','Wolman','Mannosidosis','Fucosidosis','Aspartylglucos.','Sialidosis','Farber','I-cell disease','Mannosidosis β','Gaucher','Gunther'] }
];

export default function Starburst() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = wrap.offsetWidth, H = wrap.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let mx = -999, my = -999, time = 0, hovCat = -1, raf;

    function onMouseMove(e) {
      const r = wrap.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }
    function onMouseLeave() { mx = -999; my = -999; }
    wrap.addEventListener('mousemove', onMouseMove);
    wrap.addEventListener('mouseleave', onMouseLeave);

    function onResize() {
      W = wrap.offsetWidth;
      H = wrap.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', onResize);

    // Build rays
    const rays = [];
    let idx = 0;
    const total = CATS.reduce((s, c) => s + c.diseases.length, 0);
    CATS.forEach((c, ci) => {
      c.diseases.forEach(d => {
        const angle = (idx / total) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.04;
        rays.push({
          name: d, cat: c.name, catIdx: ci, color: c.color,
          cr: c.r, cg: c.g, cb: c.b, angle,
          len: Math.min(W, H) * 0.2 + Math.random() * Math.min(W, H) * 0.25,
          dotPos: Math.random(),
          dotSpeed: 0.001 + Math.random() * 0.002,
          phase: Math.random() * Math.PI * 2
        });
        idx++;
      });
    });

    // Category card hover
    const catCards = document.querySelectorAll('[data-cat]');
    function catEnter(e) { hovCat = parseInt(e.currentTarget.dataset.cat); }
    function catLeave() { hovCat = -1; }
    catCards.forEach(el => {
      el.addEventListener('mouseenter', catEnter);
      el.addEventListener('mouseleave', catLeave);
    });

    function draw() {
      time++;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.42;

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
      cg.addColorStop(0, 'rgba(232,160,208,0.08)');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      rays.forEach(r => {
        // Breathing sway
        const breathAngle = r.angle + Math.sin(time * 0.008 + r.phase) * 0.02;
        const breathLen = r.len + Math.sin(time * 0.006 + r.phase * 2) * 5;

        const ex = cx + Math.cos(breathAngle) * breathLen;
        const ey = cy + Math.sin(breathAngle) * breathLen;
        const midX = (cx + ex) / 2, midY = (cy + ey) / 2;

        let bx = 0, by = 0;
        if (mx > -999) {
          const dx = mx - midX, dy = my - midY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            bx = dx / dist * (110 - dist) * 0.1;
            by = dy / dist * (110 - dist) * 0.1;
          }
        }

        const fex = ex + bx * 0.5, fey = ey + by * 0.5;
        let endDist = 999, nearEnd = false;
        if (mx > -999) {
          endDist = Math.sqrt((mx - fex) ** 2 + (my - fey) ** 2);
          nearEnd = endDist < 45;
        }

        const catHL = hovCat === r.catIdx;
        const dimmed = hovCat >= 0 && !catHL;

        // Ray line
        ctx.strokeStyle = r.color;
        ctx.lineWidth = nearEnd ? 1.4 : catHL ? 0.9 : 0.5;
        ctx.globalAlpha = dimmed ? 0.025 : nearEnd ? 0.45 : catHL ? 0.3 : 0.15;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(midX + bx, midY + by, fex, fey);
        ctx.stroke();

        // Traveling dot
        r.dotPos += r.dotSpeed * (catHL ? 2.5 : 1);
        if (r.dotPos > 1) r.dotPos = 0;
        const t = r.dotPos;
        const px = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * (midX + bx) + t * t * fex;
        const py = (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * (midY + by) + t * t * fey;
        ctx.globalAlpha = dimmed ? 0.025 : catHL ? 0.5 : 0.3;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(px, py, catHL ? 2 : 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Endpoint dot
        ctx.globalAlpha = dimmed ? 0.03 : nearEnd ? 0.85 : catHL ? 0.55 : 0.3;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(fex, fey, nearEnd ? 4.5 : catHL ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Hover label
        if (nearEnd && !dimmed) {
          const na = Math.min(1, (45 - endDist) / 20);
          ctx.globalAlpha = na * 0.15;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(fex, fey, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = na * 0.95;
          ctx.font = '700 12px Lato,sans-serif';
          ctx.fillStyle = '#fff';
          const pad = 14;
          const lx = fex + Math.cos(breathAngle) * pad;
          const ly = fey + Math.sin(breathAngle) * pad;
          ctx.textAlign = Math.cos(breathAngle) > 0.1 ? 'left' : Math.cos(breathAngle) < -0.1 ? 'right' : 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(r.name, lx, ly);

          ctx.globalAlpha = na * 0.45;
          ctx.font = '700 9px Lato,sans-serif';
          ctx.fillStyle = r.color;
          ctx.fillText(r.cat, lx, ly + (Math.sin(breathAngle) > 0 ? 16 : -16));
        }
      });

      // Center pulse
      const cp = Math.sin(time * 0.02) * 2;
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#E8A0D0';
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.42, 14 + cp, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.42, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('mousemove', onMouseMove);
      wrap.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      catCards.forEach(el => {
        el.removeEventListener('mouseenter', catEnter);
        el.removeEventListener('mouseleave', catLeave);
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className="starburst-wrap" style={{ width: '100%', maxWidth: 700, height: 500, margin: '0 auto', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
