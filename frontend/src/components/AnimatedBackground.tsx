import React, { useRef, useEffect } from 'react';

export function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let w = (c.width = c.offsetWidth);
    let h = (c.height = c.offsetHeight);

    const HUES = [210, 258, 188, 230] as const;
    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.4,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      t: Math.random() * Math.PI * 2,
    }));

    // Random electric arc flash
    let flashTimer = 0;
    let flash: { x1: number; y1: number; x2: number; y2: number; life: number } | null = null;

    let id: number;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Arc flash
      flashTimer++;
      if (flashTimer > 120 && Math.random() < 0.015) {
        flashTimer = 0;
        const a = pts[Math.floor(Math.random() * pts.length)];
        const b = pts[Math.floor(Math.random() * pts.length)];
        flash = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, life: 12 };
      }
      if (flash) {
        flash.life--;
        if (flash.life > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${flash.life / 12 * 0.8})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 12;
          ctx.moveTo(flash.x1, flash.y1);
          // jagged line
          const mx = (flash.x1 + flash.x2) / 2 + (Math.random() - 0.5) * 60;
          const my = (flash.y1 + flash.y2) / 2 + (Math.random() - 0.5) * 60;
          ctx.quadraticCurveTo(mx, my, flash.x2, flash.y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else flash = null;
      }

      pts.forEach((p, i) => {
        p.t += 0.018;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const a = 0.25 + 0.2 * Math.sin(p.t);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,65%,${a})`;
        ctx.fill();

        for (let j = i + 1; j < pts.length && j < i + 6; j++) {
          const q = pts[j];
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d < 140) {
            ctx.beginPath();
            const la = (1 - d / 140) * a * 0.45;
            ctx.strokeStyle = `hsla(${p.hue},80%,60%,${la})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      });
      id = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      w = c.width = c.offsetWidth;
      h = c.height = c.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

export function AuroraBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden' }}>
      <div className="signin-blob blob-1" />
      <div className="signin-blob blob-2" />
      <div className="signin-blob blob-3" />
      <div className="signin-blob blob-4" />
    </div>
  );
}

export default function AnimatedBackground() {
  return (
    <>
      <ParticleCanvas />
      <AuroraBlobs />
    </>
  );
}
