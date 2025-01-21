import React, { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
  peers: React.ReactNode[];
}

const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  peers,
}: RippleProps) {
  const circleSize = mainCircleSize;
  const radius = circleSize / 2;

  const numElements = peers.length;
  return (
    <div
      className={cn(
        "z-50 select-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)] pt-40 w-full h-screen overflow-hidden",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={`absolute animate-ripple z-0 rounded-full bg-foreground/25 shadow-xl border [--i:${i}]`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "1px",
                borderColor: `hsl(var(--foreground), ${borderOpacity / 100})`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}

      {peers.map((peer, i) => {
        const angle = (i / numElements) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              fontSize: "20px",
            }}
          >
            {peer}
          </div>
        );
      })}

      {/* {Array.from({ length: numElements }, (_, i) => {
        const angle = (i / numElements) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              fontSize: "20px",
            }}
          >
            <div className="text-sm p-2  px-4 z-10 bg-gray-200 rounded-xl border border-gray-400 shadow-lg hover:bg-slate-400">
              {i + 1}
            </div>
          </div>
        );
      })} */}
    </div>
  );
});

Ripple.displayName = "Ripple";

export default Ripple;
