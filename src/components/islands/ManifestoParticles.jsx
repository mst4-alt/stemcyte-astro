import { useEffect, useRef } from 'react';

export default function ManifestoParticles({ sectionId = 'manifesto' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = document.getElementById(sectionId);
    if (!section) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = section.offsetWidth, H = section.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function onResize() {
      W = section.offsetWidth;
      H = section.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', onResize);

    // Build manifesto blocks dynamically
    const caps = [
      { title: 'Regenerative repair', desc: 'Rebuild damaged tissue — joints, cartilage, organs. Not just treating symptoms. Fixing the source.' },
      { title: 'Immune modulation', desc: 'Calm overactive immune systems. Autoimmune diseases, graft-vs-host, transplant rejection.' },
      { title: 'No matching required', desc: "Unlike cord blood, MSCs don't need HLA matching. Any family member could benefit." },
      { title: 'Anti-inflammatory', desc: 'MSCs are natural anti-inflammatory factories. Chronic inflammation drives dozens of diseases.' },
      { title: 'Tissue engineering', desc: 'Building blocks for lab-grown cartilage, bone, even organ scaffolds.' },
      { title: 'Drug delivery', desc: 'Engineered to carry therapeutics directly to tumors and damaged sites.' },
      { title: 'Neuroprotection', desc: "Slowing Alzheimer\u2019s, Parkinson\u2019s, ALS \u2014 medicine\u2019s biggest unsolved problems." },
      { title: 'Neonatal rescue', desc: "Protecting preterm babies\u2019 brains, lungs, and guts in the critical first days of life." },
      { title: 'Personalized medicine', desc: 'Your cord tissue as starting material for therapies tailored specifically to you.' },
      { title: 'Longevity science', desc: 'MSC secretome studied for cellular rejuvenation and anti-aging.' }
    ];

    const list = document.getElementById('manifestoList');
    if (!list) return;
    const dotEls = [];
    let hovIdx = -1;

    caps.forEach((cap, i) => {
      const isLeft = i % 2 === 0;
      const block = document.createElement('div');
      block.className = 'm-block ' + (isLeft ? 'left' : 'right');

      const dot = document.createElement('div');
      dot.className = 'm-dot';
      block.appendChild(dot);
      dotEls.push(dot);

      const content = document.createElement('div');
      content.innerHTML = `<div class="m-num">${String(i + 1).padStart(2, '0')}</div><div class="m-title">${cap.title}</div><div class="m-desc">${cap.desc}</div>`;
      block.appendChild(content);

      block.addEventListener('mouseenter', () => { hovIdx = i; });
      block.addEventListener('mouseleave', () => { hovIdx = -1; });

      list.appendChild(block);
    });

    // Particles
    const pts = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      pts.push({
        x, y, homeX: x, homeY: y,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0, raf;

    function getPos() {
      return dotEls.map(d => {
        const r = d.getBoundingClientRect();
        const pr = section.getBoundingClientRect();
        return { x: r.left - pr.left + r.width / 2, y: r.top - pr.top + r.height / 2 };
      });
    }

    function draw() {
      time += 0.005;
      ctx.clearRect(0, 0, W, H);
      const positions = getPos();

      pts.forEach(p => {
        p.x += Math.sin(time + p.phase) * 0.08;
        p.y += Math.cos(time * 0.7 + p.phase) * 0.08;

        if (hovIdx >= 0 && hovIdx < positions.length) {
          const target = positions[hovIdx];
          const dx = target.x - p.x, dy = target.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idealDist = 15 + Math.abs(Math.sin(p.phase)) * 25;
          if (dist > idealDist + 5) {
            p.vx += dx / dist * 0.006;
            p.vy += dy / dist * 0.006;
          } else if (dist < idealDist - 5) {
            p.vx -= dx / dist * 0.004;
            p.vy -= dy / dist * 0.004;
          }
        } else {
          p.vx += (p.homeX - p.x) * 0.0008;
          p.vy += (p.homeY - p.y) * 0.0008;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        let brightness = 0.12;
        if (hovIdx >= 0 && hovIdx < positions.length) {
          const d = Math.sqrt((positions[hovIdx].x - p.x) ** 2 + (positions[hovIdx].y - p.y) ** 2);
          if (d < 50) brightness = 0.12 + 0.25 * (1 - d / 50);
        }

        ctx.globalAlpha = brightness;
        ctx.fillStyle = '#5DB890';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (hovIdx >= 0 && hovIdx < positions.length) {
        const target = positions[hovIdx];
        const nearby = pts.filter(p => Math.sqrt((target.x - p.x) ** 2 + (target.y - p.y) ** 2) < 50);
        for (let i = 0; i < nearby.length; i++) {
          for (let j = i + 1; j < nearby.length; j++) {
            const dx = nearby[j].x - nearby[i].x;
            const dy = nearby[j].y - nearby[i].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 30) {
              ctx.strokeStyle = '#5DB890';
              ctx.lineWidth = 0.4;
              ctx.globalAlpha = 0.06 * (1 - d / 30);
              ctx.beginPath();
              ctx.moveTo(nearby[i].x, nearby[i].y);
              ctx.lineTo(nearby[j].x, nearby[j].y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    // 500+ stat glow
    const statEl = section.querySelector('.stat-500');
    let glowRaf;
    if (statEl) {
      function checkGlow() {
        const rect = statEl.getBoundingClientRect();
        const viewH = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewH / 2);
        const range = viewH * 0.7;
        const t = Math.max(0, 1 - dist / range);
        statEl.style.color = `rgba(93,184,144,${0.12 + t * 0.88})`;
        if (t > 0.5) {
          statEl.style.textShadow = `0 0 ${20 * t}px rgba(93,184,144,${t * 0.3}), 0 0 ${40 * t}px rgba(93,184,144,${t * 0.15})`;
        } else {
          statEl.style.textShadow = 'none';
        }
        glowRaf = requestAnimationFrame(checkGlow);
      }
      checkGlow();
    }

    return () => {
      cancelAnimationFrame(raf);
      if (glowRaf) cancelAnimationFrame(glowRaf);
      window.removeEventListener('resize', onResize);
      // Clean up dynamically created blocks
      const blocks = list.querySelectorAll('.m-block');
      blocks.forEach(b => b.remove());
    };
  }, [sectionId]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
