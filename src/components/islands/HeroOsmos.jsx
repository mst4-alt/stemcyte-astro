import { useEffect, useRef } from 'react';

export default function HeroOsmos() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, time = 0, mx = 0, my = 0;
    const colors = ['#E8A0D0', '#6C1A55', '#A04080', '#6B9BED', '#C06090', '#8B5CA0'];
    const particles = [];
    let raf;

    function resize() {
      const p = canvas.closest('.hero') || canvas.parentElement;
      W = p.offsetWidth || window.innerWidth;
      H = p.offsetHeight || window.innerHeight;
      canvas.width = W * 2;
      canvas.height = H * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }

    function onMouseMove(e) {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }
    canvas.addEventListener('mousemove', onMouseMove);

    function draw() {
      time += 0.003;
      ctx.clearRect(0, 0, W, H);

      // Silk gradient waves
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.globalAlpha = 0.03 + i * 0.005;
        const yOff = H * 0.3 + i * 30;
        ctx.moveTo(0, yOff);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(x, yOff + Math.sin(x * 0.003 + time * 2 + i * 0.8) * 60 + Math.sin(x * 0.007 + time * 1.5 + i) * 30);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#6C1A55');
        g.addColorStop(0.3, '#A04080');
        g.addColorStop(0.6, '#E8A0D0');
        g.addColorStop(1, '#6B9BED');
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Particles
      particles.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const f = (160 - dist) / 160 * 0.025;
          p.vx -= dx * f;
          p.vy -= dy * f;
        }
        p.x += p.vx + Math.sin(time + p.phase) * 0.15;
        p.y += p.vy + Math.cos(time * 0.7 + p.phase) * 0.1;
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%', display: 'block' }} />;
}
