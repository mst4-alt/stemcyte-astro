import { useEffect, useRef } from 'react';

export default function ArcScrolly({ sectionId = 'scrollyCT' }) {
  const canvasRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, time = 0;
    let raf;

    const stepColors = [
      { main: '#2A6B4F', glow: 'rgba(42,107,79,0.08)', ring: 'rgba(42,107,79,0.2)' },
      { main: '#3D8B6A', glow: 'rgba(61,139,106,0.08)', ring: 'rgba(61,139,106,0.2)' },
      { main: '#5DB890', glow: 'rgba(93,184,144,0.08)', ring: 'rgba(93,184,144,0.2)' },
      { main: '#2A6B4F', glow: 'rgba(42,107,79,0.1)', ring: 'rgba(42,107,79,0.25)' }
    ];

    const arcs = [];

    function initArcs() {
      arcs.length = 0;
      for (let i = 0; i < 60; i++) {
        const size = 0.5 + Math.random() * 1.0;
        const orbitR = 30 + Math.random() * 120;
        arcs.push({
          orbitR,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
          tilt: Math.random() * Math.PI,
          planeRot: Math.random() * Math.PI,
          size,
          arcSpan: (0.25 + size * 0.12) * 0.6,
          phase: Math.random() * Math.PI * 2,
          cat: Math.floor(Math.random() * 4)
        });
      }
    }

    function resize() {
      const p = canvas.closest('.scrolly-visual') || canvas.parentElement;
      W = p.offsetWidth || 550;
      H = p.offsetHeight || 800;
      canvas.width = W * 2;
      canvas.height = H * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      if (!arcs.length) initArcs();
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      time += 0.008;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const currentStep = stepRef.current;
      const sc = stepColors[currentStep];

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      grad.addColorStop(0, sc.glow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      for (let r = 0; r < 3; r++) {
        const radius = 80 + r * 50 + Math.sin(time + r) * 8;
        ctx.strokeStyle = sc.ring;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3 - r * 0.08;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // NO z-sorting — stable render order
      arcs.forEach(a => {
        a.orbitAngle += a.orbitSpeed;
        const lx = a.orbitR * Math.cos(a.orbitAngle);
        const ly = a.orbitR * Math.sin(a.orbitAngle);
        const ty = ly * Math.cos(a.tilt);
        const tz = ly * Math.sin(a.tilt);
        const fx = lx * Math.cos(a.planeRot) - tz * Math.sin(a.planeRot);
        const fy = ty;
        const fz = lx * Math.sin(a.planeRot) + tz * Math.cos(a.planeRot);
        const depth = 0.4 + (fz / a.orbitR + 1) * 0.3;

        const active = a.cat === currentStep;
        const halfSpan = a.arcSpan / 2;
        const steps = 10;

        ctx.strokeStyle = stepColors[a.cat].main;
        ctx.lineWidth = 3 * a.size * depth * (active ? 1.3 : 0.6);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = (active ? 0.7 : 0.1) * Math.max(0.4, depth);

        ctx.beginPath();
        for (let s = -steps; s <= steps; s++) {
          const t = a.orbitAngle + (s / steps) * halfSpan;
          const tlx = a.orbitR * Math.cos(t);
          const tly = a.orbitR * Math.sin(t);
          const tty = tly * Math.cos(a.tilt);
          const ttz = tly * Math.sin(a.tilt);
          const tfx = tlx * Math.cos(a.planeRot) - ttz * Math.sin(a.planeRot);
          const tfy = tty;
          if (s === -steps) ctx.moveTo(cx + tfx, cy + tfy);
          else ctx.lineTo(cx + tfx, cy + tfy);
        }
        ctx.stroke();
      });

      // Center step number
      ctx.globalAlpha = 0.35;
      ctx.font = '600 56px "Source Serif 4",serif';
      ctx.fillStyle = sc.main;
      ctx.textAlign = 'center';
      ctx.fillText(['05', '06', '07', '08'][currentStep], cx, cy + 18);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }
    draw();

    // Scroll observer for steps
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          stepRef.current = parseInt(e.target.dataset.tstep);
          document.querySelectorAll(`#${sectionId} .scrolly-step-inner`).forEach(el => el.classList.remove('active'));
          e.target.querySelector('.scrolly-step-inner').classList.add('active');
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(`#${sectionId} [data-tstep]`).forEach(el => obs.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      obs.disconnect();
    };
  }, [sectionId]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
