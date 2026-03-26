import { readSessions } from "@/lib/db";
import ViewClient from "./ViewClient";

export default async function ViewPage() {
  const sessions = await readSessions();

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-10 text-xs font-mono text-white opacity-30">
        {sessions.length} session{sessions.length !== 1 ? "s" : ""}
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-3 text-xs font-mono text-white opacity-30">
        {sessions.map((s) => (
          <span key={s.id} style={{ color: s.color }}>{s.username}</span>
        ))}
      </div>
      <ViewClient sessions={sessions} />
    </div>
  );
}
