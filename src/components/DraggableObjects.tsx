"use client";

import { useRef, useState, useCallback, useEffect, RefObject } from "react";
import { HeatmapCanvasHandle } from "./HeatmapCanvas";

const OBJECTS = [
  { image: "/images/image 60.png", size: 160, px: 0.1, py: 0.15 },
  { image: "/images/image 61.png", size: 80, px: 0.3, py: 0.25 },
  { image: "/images/image 63.png", size: 200, px: 0.55, py: 0.12 },
  { image: "/images/image 65.png", size: 100, px: 0.78, py: 0.3 },
  { image: "/images/image 66.png", size: 140, px: 0.18, py: 0.55 },
  { image: "/images/image 68.png", size: 200, px: 0.45, py: 0.6 },
  { image: "/images/image 69.png", size: 180, px: 0.7, py: 0.65 },
  { image: "/images/image 70.png", size: 110, px: 0.88, py: 0.2 },
];

type ObjState = { x: number; y: number };

type Props = {
  canvasRef: RefObject<HeatmapCanvasHandle | null>;
};

export default function DraggableObjects({ canvasRef }: Props) {
  const [positions, setPositions] = useState<ObjState[]>(
    OBJECTS.map((o) => ({ x: o.px * 800, y: o.py * 600 })),
  );

  useEffect(() => {
    setPositions(
      OBJECTS.map((o) => ({
        x: o.px * window.innerWidth,
        y: o.py * window.innerHeight,
      })),
    );
  }, []);

  const draggingRef = useRef<{
    index: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const pos = positions[index];
      draggingRef.current = {
        index,
        offsetX: e.clientX - pos.x,
        offsetY: e.clientY - pos.y,
      };
      const pressure = e.pointerType === "mouse" ? 0.5 : e.pressure || 0.5;
      canvasRef.current?.addPoint(e.clientX, e.clientY, pressure);
    },
    [positions, canvasRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = draggingRef.current;
      if (!d) return;
      const newX = e.clientX - d.offsetX;
      const newY = e.clientY - d.offsetY;
      setPositions((prev) => {
        const next = [...prev];
        next[d.index] = { x: newX, y: newY };
        return next;
      });
      const pressure = e.pointerType === "mouse" ? 0.5 : e.pressure || 0.5;
      canvasRef.current?.addPoint(e.clientX, e.clientY, pressure);
    },
    [canvasRef],
  );

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    canvasRef.current?.pushBreak();
  }, [canvasRef]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {OBJECTS.map((o, i) => {
        const pos = positions[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={o.image}
            alt=""
            draggable={false}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "absolute",
              left: pos.x - o.size / 2,
              top: pos.y - o.size / 2,
              width: o.size,
              height: "auto",
              cursor: "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          />
        );
      })}
    </div>
  );
}
