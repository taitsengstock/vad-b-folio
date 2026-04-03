export const dynamic = "force-dynamic";

import { readSessions } from "@/lib/db";
import CanvasClient from "./CanvasClient";

export default async function CanvasPage() {
  const pastSessions = await readSessions();
  return <CanvasClient pastSessions={pastSessions} />;
}
