import { useEffect, useRef, useState } from 'react';

export default function CellScrolly({ sectionId = 'scrollyCB' }) {
  const canvasRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, time = 0;
    let raf;

    const stepColors = [
      { main: '#3B6DC4', glow: 'rgba(59,109,196,0.08)', ring: 'rgba(59,109,196,0.2)' },
      { main: '#6C1A55', glow: 'rgba(108,26,85,0.08)', ring: 'rgba(108,26,85,0.2)' },
      { main: '#3D8B6A', glow: 'rgba(61,139,106,0.08)', ring: 'rgba(61,139,106,0.2)' },
      { main: '#C4943E', glow: 'rgba(196,148,62,0.08)', ring: 'rgba(196,148,62,0.2)' }
    ];

    let cells = [];

    function initCells() {
      cells = [];
      for (let i = 0; i < 60; i++) {
        cells.push({
          x: W / 2 + (Math.random() - 0.5) * 300,
          y: H / 2 + (Math.random() - 0.5) * 300,
          r: Math.random() * 4 + 2,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
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
      if (!cells.length) initCells();
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      time += 0.008;
      ctx.clearRect(0, 0, W, H);
      const currentStep = stepRef.current;
      const sc = stepColors[currentStep];

      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 200);
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
        ctx.arc(W / 2, H / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      cells.forEach(c => {
        c.x += c.vx + Math.sin(time + c.phase) * 0.3;
        c.y += c.vy + Math.cos(time * 0.8 + c.phase) * 0.3;
        const dx = W / 2 - c.x;
        const dy = H / 2 - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 180) {
          c.vx += dx * 0.0005;
          c.vy += dy * 0.0005;
        }
        c.vx *= 0.99;
        c.vy *= 0.99;

        ctx.globalAlpha = c.cat === currentStep ? 0.7 : 0.12;
        ctx.fillStyle = stepColors[c.cat].main;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.cat === currentStep ? c.r * 1.3 : c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.font = '600 48px "Source Serif 4",serif';
      ctx.fillStyle = sc.main;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.15;
      ctx.fillText(['01', '02', '03', '04'][currentStep], W / 2, H / 2 + 16);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    // Scroll observer for steps
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          stepRef.current = parseInt(e.target.dataset.step);
          document.querySelectorAll(`#${sectionId} .scrolly-step-inner`).forEach(el => el.classList.remove('active'));
          e.target.querySelector('.scrolly-step-inner').classList.add('active');
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(`#${sectionId} [data-step]`).forEach(el => obs.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      obs.disconnect();
    };
  }, [sectionId]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
