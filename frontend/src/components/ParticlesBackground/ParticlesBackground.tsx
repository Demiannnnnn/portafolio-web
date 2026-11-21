import { useEffect, useRef, useCallback } from 'react';

const ALL_COLORS = [
  'rgba(47, 107, 70, 0.06)',
  'rgba(47, 107, 70, 0.08)',
  'rgba(47, 107, 70, 0.10)',
  'rgba(47, 107, 70, 0.13)',
  'rgba(47, 107, 70, 0.16)',
];

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  /** Angle of travel in radians */
  angle: number;
  /** Speed in px per frame */
  speed: number;
  /** Slight angular drift to create gentle curves */
  drift: number;
  /** Phase for breathing animation */
  phase: number;
}

const PARTICLE_COUNT = 70;
const MIN_R = 2;
const MAX_R = 5.5;
const MIN_SPEED = 0.2;
const MAX_SPEED = 0.6;

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: MIN_R + Math.random() * (MAX_R - MIN_R),
    color: ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)],
    angle: Math.random() * Math.PI * 2,
    speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
    drift: (Math.random() - 0.5) * 0.008,
    phase: Math.random() * Math.PI * 2,
  };
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  /* Respect prefers-reduced-motion */
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Resize handler ── */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx?.scale(dpr, dpr);

    sizeRef.current = { w, h };

    /* Recalculate particle count */
    const existing = particlesRef.current;
    if (existing.length < PARTICLE_COUNT) {
      for (let i = existing.length; i < PARTICLE_COUNT; i++) {
        existing.push(createParticle(w, h));
      }
    } else if (existing.length > PARTICLE_COUNT) {
      existing.length = PARTICLE_COUNT;
    }
  }, []);

  /* ── Main lifecycle ── */
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    if (prefersReducedMotion) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const { w, h } = sizeRef.current;
        ctx.clearRect(0, 0, w, h);
        for (const p of particlesRef.current) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }
      return () => window.removeEventListener('resize', handleResize);
    }

    let t = 0;
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const { w, h } = sizeRef.current;
      t += 0.008;

      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        /* Curve the trajectory gently over time */
        p.angle += p.drift;

        /* Move */
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        /* Wrap around edges with buffer */
        const buf = p.radius + 2;
        if (p.x < -buf) p.x = w + buf;
        if (p.x > w + buf) p.x = -buf;
        if (p.y < -buf) p.y = h + buf;
        if (p.y > h + buf) p.y = -buf;

        /* Gentle breathing */
        const breath = 1 + Math.sin(t * 2 + p.phase) * 0.12;
        const drawR = p.radius * breath;

        ctx.globalAlpha = 0.85 + Math.sin(t * 1.2 + p.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleResize, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticlesBackground;
