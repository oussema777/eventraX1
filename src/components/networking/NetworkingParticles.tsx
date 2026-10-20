import { useEffect, useRef } from 'react';

type Dot = { anchorX: number; anchorY: number; x: number; y: number; phase: number };

/** Decorative only. The DOM content and controls remain fully usable without canvas. */
export default function NetworkingParticles({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const clockRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    let width = 0, height = 0, frame = 0, lastTime = 0;
    let visible = true;
    let pointer: { x: number; y: number } | null = null;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const paint = (advance: number) => {
      clockRef.current += advance;
      const time = clockRef.current;
      context.clearRect(0, 0, width, height);
      const dots = dotsRef.current;
      for (const dot of dots) {
        if (advance) {
          let targetX = dot.anchorX * width + Math.sin(time * .00018 + dot.phase) * 15;
          let targetY = dot.anchorY * height + Math.cos(time * .00014 + dot.phase) * 12;
          if (pointer) {
            const dx = targetX - pointer.x, dy = targetY - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 170) {
              const force = (1 - distance / 170) * 46;
              targetX += dx / Math.max(distance, 1) * force;
              targetY += dy / Math.max(distance, 1) * force;
            }
          }
          const easing = 1 - Math.exp(-advance / 140);
          dot.x += (targetX - dot.x) * easing;
          dot.y += (targetY - dot.y) * easing;
        }
      }
      const linkDistance = width < 700 ? 125 : 190;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > linkDistance) continue;
          context.strokeStyle = `rgba(133,213,207,${(1 - distance / linkDistance) * .36})`;
          context.lineWidth = .8;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
        const dot = dots[i];
        const highlighted = pointer && Math.hypot(dot.x - pointer.x, dot.y - pointer.y) < 190;
        context.fillStyle = highlighted ? '#c5ffe6' : 'rgba(171,231,216,.7)';
        context.beginPath();
        context.arc(dot.x, dot.y, i % 7 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
        context.fill();
      }
    };
    const tick = (time: number) => {
      frame = 0;
      if (paused || !visible || document.hidden) return;
      // Keep motion consistent on high-refresh screens and avoid jumps after tab switches.
      const delta = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;
      paint(delta);
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const columns = width < 700 ? 6 : Math.min(16, Math.ceil(width / 105));
      const rows = 6;
      const newGrid = dotsRef.current.length !== columns * rows;
      if (newGrid) {
        dotsRef.current = Array.from({ length: columns * rows }, (_, i) => ({
          anchorX: ((i % columns) + .5 + Math.sin(i * 7.31) * .36) / columns,
          anchorY: (Math.floor(i / columns) + .5 + Math.cos(i * 3.73) * .35) / rows,
          x: 0, y: 0, phase: i * 2.4,
        }));
      }
      if (newGrid || sizeRef.current.width !== width || sizeRef.current.height !== height) {
        for (const dot of dotsRef.current) {
          dot.x = dot.anchorX * width;
          dot.y = dot.anchorY * height;
        }
      }
      sizeRef.current = { width, height };
      paint(0);
    };
    const move = (event: PointerEvent) => {
      if (paused || !finePointer.matches || event.pointerType === 'touch') return;
      const bounds = host.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const leave = () => { pointer = null; };
    const observer = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    resize();
    observer.observe(host);
    visibility.observe(host);
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="event-network-banner__particles" aria-hidden="true" />;
}
