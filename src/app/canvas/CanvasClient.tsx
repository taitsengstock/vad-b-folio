"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Session } from "@/lib/db";
import { HeatmapCanvasHandle } from "@/components/HeatmapCanvas";
import DraggableObjects from "@/components/DraggableObjects";

const HeatmapCanvas = dynamic(() => import("@/components/HeatmapCanvas"), { ssr: false });

type Props = { pastSessions: Session[] };

export default function CanvasClient({ pastSessions }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HeatmapCanvasHandle>(null);
  const [identity, setIdentity] = useState<{ username: string; color: string } | null>(null);

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const color = sessionStorage.getItem("color");
    if (!username || !color) {
      router.replace("/");
      return;
    }
    setIdentity({ username, color });
  }, [router]);

  if (!identity) return null;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-10 text-sm font-mono opacity-50" style={{ color: identity.color }}>
        {identity.username}
      </div>
      <div className="absolute top-4 right-4 z-10 text-xs font-mono text-white opacity-30">
        {pastSessions.length} session{pastSessions.length !== 1 ? "s" : ""} before you
      </div>
      <HeatmapCanvas ref={canvasRef} username={identity.username} color={identity.color} pastSessions={pastSessions} />
      <DraggableObjects canvasRef={canvasRef} />
    </div>
  );
}
