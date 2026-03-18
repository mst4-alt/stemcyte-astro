import { useEffect, useRef } from 'react';

/*
 * CellSphere — 3D canvas animation of floating molecular particles with connections.
 *
 * Props:
 *   width: number | string — canvas width (default: '100%')
 *   height: number | string — canvas height (default: 500)
 *   particleCount: number — number of particles (default: 120)
 *   connectionDist: number — max distance for drawing connections (default: 140)
 *   particleColor: string — rgba base for particles (default: 'rgba(232,160,208,')
 *   connectionColor: string — rgba base for connections (default: 'rgba(192,106,165,')
 *   parallax: boolean — enable scroll parallax offset (default: true)
 *   className: string — additional className for the canvas
 *   style: object — additional styles for the canvas
 */

export default function CellSphere({
  width = '100%',
  height = 500,
  particleCount = 120,
  connectionDist = 140,
  particleColor = 'rgba(232,160,208,',
  connectionColor = 'rgba(192,106,165,',
  parallax = true,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let particles = [];
    let W, H;
    const coverage = 1.0;
    let animId;

    function coverageBounds() {
      const cw = W * coverage;
      const ch = H * coverage;
      return { x: (W - cw) / 2, y: (H - ch) / 2, w: cw, h: ch };
    }

    function makeParticle() {
      const b = coverageBounds();
      return {
        x: b.x + Math.random() * b.w,
        y: b.y + Math.random() * b.h,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.05,
      };
    }

    function resize() {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
      const b = coverageBounds();
      for (let i = 0; i < particles.length; i++) {
        particles[i].x = b.x + Math.random() * b.w;
        particles[i].y = b.y + Math.random() * b.h;
      }
    }

    function init() {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(makeParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const offset = parallax ? (window.scrollY || 0) * 0.15 : 0;
      const b = coverageBounds();

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = (particles[i].y - offset) - (particles[j].y - offset);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.06;
            ctx.strokeStyle = connectionColor + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y - offset);
            ctx.lineTo(particles[j].x, particles[j].y - offset);
            ctx.stroke();
          }
        }
      }

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < b.x) { p.x = b.x; p.vx *= -1; }
        if (p.x > b.x + b.w) { p.x = b.x + b.w; p.vx *= -1; }
        if (p.y < b.y) { p.y = b.y; p.vy *= -1; }
        if (p.y > b.y + b.h) { p.y = b.y + b.h; p.vy *= -1; }

        const drawY = p.y - offset;
        if (drawY < -20 || drawY > H + 20) continue;

        ctx.beginPath();
        ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor + p.opacity + ')';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [particleCount, connectionDist, particleColor, connectionColor, parallax]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: typeof width === 'number' ? width + 'px' : width,
        height: typeof height === 'number' ? height + 'px' : height,
        ...style,
      }}
    />
  );
}
