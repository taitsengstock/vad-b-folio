"use client";

import { useRef, useState, useCallback, useEffect, RefObject } from "react";
import { HeatmapCanvasHandle } from "./HeatmapCanvas";

// positions as percentage of viewport (0–1)
const SHAPES = [
  { shape: "circle", color: "#e74c3c", size: 64,  px: 0.10, py: 0.15 },
  { shape: "square", color: "#3498db", size: 56,  px: 0.30, py: 0.25 },
  { shape: "circle", color: "#f1c40f", size: 72,  px: 0.55, py: 0.12 },
  { shape: "square", color: "#2ecc71", size: 60,  px: 0.78, py: 0.30 },
  { shape: "circle", color: "#9b59b6", size: 52,  px: 0.18, py: 0.55 },
  { shape: "square", color: "#e67e22", size: 68,  px: 0.45, py: 0.60 },
  { shape: "circle", color: "#1abc9c", size: 58,  px: 0.70, py: 0.65 },
  { shape: "square", color: "#e91e8c", size: 64,  px: 0.88, py: 0.20 },
];

type ShapeState = { x: number; y: number };

type Props = {
  canvasRef: RefObject<HeatmapCanvasHandle | null>;
};

export default function DraggableObjects({ canvasRef }: Props) {
  const [positions, setPositions] = useState<ShapeState[]>(
    SHAPES.map((s) => ({ x: s.px * 800, y: s.py * 600 }))
  );

  useEffect(() => {
    setPositions(SHAPES.map((s) => ({
      x: s.px * window.innerWidth,
      y: s.py * window.innerHeight,
    })));
  }, []);

  const draggingRef = useRef<{
    index: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = positions[index];
    draggingRef.current = {
      index,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
    const pressure = e.pointerType === "mouse" ? 0.5 : (e.pressure || 0.5);
    canvasRef.current?.addPoint(e.clientX, e.clientY, pressure);
  }, [positions, canvasRef]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = draggingRef.current;
    if (!d) return;
    const newX = e.clientX - d.offsetX;
    const newY = e.clientY - d.offsetY;
    setPositions((prev) => {
      const next = [...prev];
      next[d.index] = { x: newX, y: newY };
      return next;
    });
    const pressure = e.pointerType === "mouse" ? 0.5 : (e.pressure || 0.5);
    canvasRef.current?.addPoint(e.clientX, e.clientY, pressure);
  }, [canvasRef]);

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    canvasRef.current?.pushBreak();
  }, [canvasRef]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {SHAPES.map((s, i) => {
        const pos = positions[i];
        return (
          <div
            key={i}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "absolute",
              left: pos.x - s.size / 2,
              top: pos.y - s.size / 2,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              borderRadius: s.shape === "circle" ? "50%" : "8px",
              cursor: "grab",
              touchAction: "none",
              userSelect: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          />
        );
      })}
    </div>
  );
}
