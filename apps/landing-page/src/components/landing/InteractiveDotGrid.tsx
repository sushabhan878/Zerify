'use client';

import React, { useRef, useEffect } from 'react';

export default function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 265, // Expanded cursor radius
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const spacing = 16; // Dense dot grid
    let time = 0;

    const render = () => {
      // Smooth lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      time += 0.0025; // Slow gentle wave speed

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      const totalDiagonal = width + height;
      const wavePeriod = totalDiagonal / 2; // Exactly 2 wide waves

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Distance along bottom-left to top-right diagonal
          const diagonalDist = x + (height - y);
          const normDist = diagonalDist / totalDiagonal;

          // Smooth edge fade-in (start bottom-left) and fade-out (end top-right)
          const startFade = Math.min(1, normDist / 0.18);
          const endFade = Math.min(1, (1 - normDist) / 0.18);
          const edgeOpacityMask = Math.max(0, startFade * endFade);

          // Add multi-harmonic organic noise variations for soft, natural wave edges
          const noise1 = Math.sin(x * 0.008 + y * 0.012 + time * 1.5) * 120;
          const noise2 = Math.cos(x * 0.015 - y * 0.009 + time * 2.2) * 80;
          const organicDist = diagonalDist + noise1 + noise2;

          // Calculate 2 wide wave bands with soft organic edges
          const wavePhase = (organicDist / wavePeriod - time * 2) * Math.PI * 2;
          const rawWave = (Math.sin(wavePhase) + 1) / 2;
          const waveIntensity = Math.pow(rawWave, 1.4); // Softer exponential falloff for smoother edges

          // Base luminous light-blue/indigo dot color (matching reference image)
          const baseColor = '165, 180, 252'; // Luminous periwinkle/indigo accent

          // Smooth vertical bottom fade out (so dots fade out gracefully in bottom 20% of hero section)
          const bottomFade = Math.min(1, Math.max(0, (height - y) / (height * 0.2)));

          // Base dot size and opacity defaults
          let size = 1.0;
          let alpha = (0.12 + waveIntensity * 0.48) * Math.max(0.18, edgeOpacityMask) * bottomFade;

          // Wave highlight effect - expands dot size & luminosity with soft transition
          if (waveIntensity > 0.1) {
            size = 1.0 + waveIntensity * 1.8;
          }

          // Cursor hover highlight effect (Expanded radius & moderate brightness)
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const cursorFactor = 1 - dist / mouse.radius;
            // Smoothly boost size & opacity across wider cursor radius
            size = Math.max(size, 1.0 + cursorFactor * 1.35);
            alpha = Math.max(alpha, (alpha + cursorFactor * 0.32) * Math.max(0.4, edgeOpacityMask) * bottomFade);
          }

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-85 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
    />
  );
}
