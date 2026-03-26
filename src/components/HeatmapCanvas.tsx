"use client";

import { useEffect, useRef, useCallback } from "react";
import { Session, Point } from "@/lib/db";

type Props = {
  username: string;
  color: string;
  pastSessions: Session[];
};

export default function HeatmapCanvas({ username, color, pastSessions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dwellRef = useRef(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const flushedUpToRef = useRef(0);

  // Draw all past sessions onto canvas
  const drawPastSessions = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (const session of pastSessions) {
      if (session.points.length < 2) continue;
      ctx.save();
      ctx.strokeStyle = session.color;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      let i = 0;
      while (i < session.points.length) {
        const pt = session.points[i];

        // Dwell bleed: draw radial glow
        if (pt.dwell > 200) {
          const radius = Math.min((pt.dwell / 1000) * 60, 120);
          const gradient = ctx.createRadialGradient(
            pt.x * w, pt.y * h, 0,
            pt.x * w, pt.y * h, radius
          );
          gradient.addColorStop(0, session.color.replace(")", ", 0.35)").replace("hsl", "hsla"));
          gradient.addColorStop(1, session.color.replace(")", ", 0)").replace("hsl", "hsla"));
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2);
          ctx.fill();
          i++;
          continue;
        }

        // Stroke segment
        ctx.beginPath();
        ctx.lineWidth = Math.max(1, pt.pressure * 6);
        ctx.globalAlpha = 0.6 + pt.pressure * 0.4;
        ctx.moveTo(pt.x * w, pt.y * h);

        // Continue path until next dwell point or end
        let j = i + 1;
        while (j < session.points.length && session.points[j].dwell <= 200) {
          const next = session.points[j];
          ctx.lineTo(next.x * w, next.y * h);
          j++;
        }
        ctx.stroke();
        i = j;
      }
      ctx.restore();
    }
  }, [pastSessions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPastSessions(ctx, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawPastSessions]);

  // Draw a single new point live
  const drawLivePoint = useCallback((pt: Point, prev: Point | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    if (pt.dwell > 200) {
      const radius = Math.min((pt.dwell / 1000) * 60, 120);
      const gradient = ctx.createRadialGradient(
        pt.x * w, pt.y * h, 0,
        pt.x * w, pt.y * h, radius
      );
      gradient.addColorStop(0, color.replace(")", ", 0.35)").replace("hsl", "hsla"));
      gradient.addColorStop(1, color.replace(")", ", 0)").replace("hsl", "hsla"));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (!prev || prev.dwell > 200) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, pt.pressure * 6);
    ctx.globalAlpha = 0.6 + pt.pressure * 0.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x * w, prev.y * h);
    ctx.lineTo(pt.x * w, pt.y * h);
    ctx.stroke();
    ctx.restore();
  }, [color]);

  const addPoint = useCallback((x: number, y: number, pressure: number, dwell = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt: Point = {
      x: x / canvas.width,
      y: y / canvas.height,
      pressure,
      dwell,
    };
    const prev = pointsRef.current[pointsRef.current.length - 1] ?? null;
    pointsRef.current.push(pt);
    drawLivePoint(pt, prev);
  }, [drawLivePoint]);

  const startDwellTimer = useCallback((x: number, y: number) => {
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
    dwellRef.current = 0;
    dwellTimerRef.current = setInterval(() => {
      dwellRef.current += 100;
      addPoint(x, y, 0.5, dwellRef.current);
    }, 100);
  }, [addPoint]);

  const stopDwellTimer = useCallback(() => {
    if (dwellTimerRef.current) {
      clearInterval(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    dwellRef.current = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e: PointerEvent) => {
      const pressure = e.pointerType === "mouse" ? 0.5 : (e.pressure || 0.5);
      addPoint(e.clientX, e.clientY, pressure, 0);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      stopDwellTimer();
      startDwellTimer(e.clientX, e.clientY);
    };

    const onPointerLeave = () => stopDwellTimer();

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [addPoint, startDwellTimer, stopDwellTimer]);

  // Create session record upfront, then flush points in chunks
  useEffect(() => {
    const session: Session = {
      id: sessionIdRef.current,
      username,
      color,
      points: [],
      createdAt: new Date().toISOString(),
    };
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
  }, [username, color]);

  const flush = useCallback(() => {
    const unflushed = pointsRef.current.slice(flushedUpToRef.current);
    if (unflushed.length === 0) return;
    flushedUpToRef.current = pointsRef.current.length;
    fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionIdRef.current, points: unflushed }),
      keepalive: true,
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(flush, 5000);
    window.addEventListener("beforeunload", flush);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [flush]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-crosshair touch-none"
    />
  );
}
