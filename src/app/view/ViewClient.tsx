"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Session, Point } from "@/lib/db";

type Props = { sessions: Session[] };

function drawSessions(ctx: CanvasRenderingContext2D, sessions: Session[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const session of sessions) {
    if (session.points.length < 2) continue;
    ctx.save();
    ctx.strokeStyle = session.color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    let i = 0;
    while (i < session.points.length) {
      const pt: Point = session.points[i];

      if (pt.x < 0) { i++; continue; }

      if (pt.dwell > 200) {
        const radius = Math.min((pt.dwell / 1000) * 60, 120);
        const gradient = ctx.createRadialGradient(pt.x * w, pt.y * h, 0, pt.x * w, pt.y * h, radius);
        gradient.addColorStop(0, session.color.replace(")", ", 0.35)").replace("hsl", "hsla"));
        gradient.addColorStop(1, session.color.replace(")", ", 0)").replace("hsl", "hsla"));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2);
        ctx.fill();
        i++;
        continue;
      }

      ctx.beginPath();
      ctx.lineWidth = Math.max(1, pt.pressure * 6);
      ctx.globalAlpha = 0.6 + pt.pressure * 0.4;
      ctx.moveTo(pt.x * w, pt.y * h);

      let j = i + 1;
      while (j < session.points.length && session.points[j].x >= 0 && session.points[j].dwell <= 200) {
        ctx.lineTo(session.points[j].x * w, session.points[j].y * h);
        j++;
      }
      ctx.stroke();
      i = j;
    }
    ctx.restore();
  }
}

export default function ViewClient({ sessions: initialSessions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessions, setSessions] = useState(initialSessions);
  const sessionsRef = useRef(initialSessions);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSessions(ctx, sessionsRef.current, canvas.width, canvas.height);
  }, []);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  // Redraw when sessions update
  useEffect(() => {
    sessionsRef.current = sessions;
    redraw();
  }, [sessions, redraw]);

  // Poll every 10s, pause when tab is hidden
  useEffect(() => {
    const fetchSessions = async () => {
      if (document.hidden) return;
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data);
    };

    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
