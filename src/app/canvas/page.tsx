import { readSessions } from "@/lib/db";
import CanvasClient from "./CanvasClient";

type Props = {
  searchParams: Promise<{ username?: string; color?: string }>;
};

export default async function CanvasPage({ searchParams }: Props) {
  const { username, color } = await searchParams;

  if (!username || !color) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-black">
        Missing username. <a href="/" className="underline ml-2">Go back</a>
      </div>
    );
  }

  const pastSessions = await readSessions();

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-10 text-sm font-mono opacity-50" style={{ color }}>
        {username}
      </div>
      <div className="absolute top-4 right-4 z-10 text-xs font-mono text-white opacity-30">
        {pastSessions.length} session{pastSessions.length !== 1 ? "s" : ""} before you
      </div>
      <CanvasClient username={username} color={color} pastSessions={pastSessions} />
    </div>
  );
}
