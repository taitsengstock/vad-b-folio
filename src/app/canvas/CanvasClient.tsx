"use client";

import dynamic from "next/dynamic";
import { Session } from "@/lib/db";

const HeatmapCanvas = dynamic(() => import("@/components/HeatmapCanvas"), { ssr: false });

type Props = {
  username: string;
  color: string;
  pastSessions: Session[];
};

export default function CanvasClient({ username, color, pastSessions }: Props) {
  return <HeatmapCanvas username={username} color={color} pastSessions={pastSessions} />;
}
