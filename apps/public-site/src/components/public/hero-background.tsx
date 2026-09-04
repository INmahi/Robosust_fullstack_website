"use client";

import { useEffect, useRef } from "react";

type HeroBackgroundProps = {
  image: string;
};

export function HeroBackground({ image }: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -1000, y: -1000 };
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const spacing = 34;
      const radius = 170;
      const pointerX = pointer.x;
      const pointerY = pointer.y;

      for (let y = spacing / 2; y < height + spacing; y += spacing) {
        for (let x = spacing / 2; x < width + spacing; x += spacing) {
          const distance = Math.hypot(x - pointerX, y - pointerY);
          const influence = reduceMotion.matches ? 0 : Math.max(0, 1 - distance / radius);
          const pointSize = 1.25 + influence * 2.2;
          const crossSize = 2 + influence * 7;
          const red = Math.round(110 + influence * 145);
          const blue = Math.round(150 + influence * 105);

          context.globalAlpha = 0.28 + influence * 0.72;
          context.strokeStyle =
            influence > 0.08
              ? `rgb(${red}, ${Math.round(55 + influence * 35)}, ${blue})`
              : "rgba(190, 207, 232, 0.62)";
          context.lineWidth = influence > 0.08 ? 1 : 0;

          if (influence > 0.08) {
            context.beginPath();
            context.moveTo(x - crossSize, y);
            context.lineTo(x + crossSize, y);
            context.moveTo(x, y - crossSize);
            context.lineTo(x, y + crossSize);
            context.stroke();
          } else {
            context.beginPath();
            context.arc(x, y, pointSize, 0, Math.PI * 2);
            context.fillStyle = context.strokeStyle;
            context.fill();
          }
        }
      }
      context.globalAlpha = 1;
    };

    const render = () => {
      draw();
      animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (pointer.x < 0 || pointer.x > bounds.width || pointer.y < 0 || pointer.y > bounds.height) {
        pointer.x = -1000;
        pointer.y = -1000;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(2,4,9,.88) 0%, rgba(2,4,9,.48) 48%, rgba(2,4,9,.72) 100%), linear-gradient(0deg, rgba(5,7,12,1) 0%, transparent 38%), url('${image}')`,
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
