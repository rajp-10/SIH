/**
 * 21st.dev Component: Background Paths
 * @author @dorianbaffier (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/background-paths
 * @adapted For FDR Guardian brand design tokens and editorial landing hero
 */

import React, { useEffect, useRef } from "react";

export interface BackgroundPathsProps {
  className?: string;
  children?: React.ReactNode;
  count?: number;
  spread?: number;
  angle?: number;
  speed?: number;
  interactive?: boolean;
}

const SAMPLES = 48;
const OVERSCAN = 0.08;
const DRAW_MS = 1400;
const DRAW_STAGGER_MS = 35;
const PART_RADIUS = 160;
const PART_PUSH = 50;

interface Layer {
  width: number;
  opacity: number;
  phase: number;
  pace: number;
  part: number;
  color: string;
}

const LAYERS: Layer[] = [
  { width: 1.0, opacity: 0.18, phase: 0.0, pace: 0.7, part: 0.35, color: '#123B3A' },
  { width: 1.4, opacity: 0.28, phase: 0.35, pace: 1.0, part: 0.7, color: '#123B3A' },
  { width: 2.0, opacity: 0.35, phase: 0.7, pace: 1.35, part: 1.0, color: '#C69A55' }
];

export function BackgroundPaths({
  className = "",
  children,
  count = 14,
  spread = 0.55,
  angle = 18,
  speed = 0.6,
  interactive = true
}: BackgroundPathsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTimestamp: number | null = null;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const onPointerLeave = () => {
      cursorRef.current.active = false;
    };

    if (interactive) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
    }

    const render = (time: number) => {
      if (!startTimestamp) startTimestamp = time;
      const elapsed = time - startTimestamp;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      for (let i = 0; i < count; i++) {
        const lineFraction = i / (count - 1 || 1);
        const layer = LAYERS[i % LAYERS.length];
        const lineDelay = i * DRAW_STAGGER_MS;
        const lineDraw = Math.min(1, Math.max(0, (elapsed - lineDelay) / DRAW_MS));

        if (lineDraw <= 0) continue;

        const flowOffset = (elapsed * 0.0006 * speed * layer.pace) % 1;
        const baseY = h * 0.5 + (lineFraction - 0.5) * h * spread;

        ctx.beginPath();
        ctx.lineWidth = layer.width;
        ctx.strokeStyle = layer.color;
        ctx.globalAlpha = layer.opacity * lineDraw;

        for (let s = 0; s <= SAMPLES; s++) {
          const sampleFrac = s / SAMPLES;
          if (sampleFrac > lineDraw) break;

          const baseX = -w * OVERSCAN + sampleFrac * w * (1 + 2 * OVERSCAN);
          const wave =
            Math.sin(sampleFrac * Math.PI * 3 + flowOffset * Math.PI * 2 + layer.phase) * 18 +
            Math.cos(sampleFrac * Math.PI * 1.5 + flowOffset * Math.PI) * 12;

          let px = baseX * cos - (baseY + wave - h * 0.5) * sin;
          let py = baseX * sin + (baseY + wave - h * 0.5) * cos + h * 0.5;

          if (interactive && cursorRef.current.active) {
            const dx = px - cursorRef.current.x;
            const dy = py - cursorRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < PART_RADIUS && dist > 0) {
              const push = (1 - dist / PART_RADIUS) * PART_PUSH * layer.part;
              px += (dx / dist) * push;
              py += (dy / dist) * push;
            }
          }

          if (s === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      if (interactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [count, spread, angle, speed, interactive]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ minHeight: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
export default BackgroundPaths;
