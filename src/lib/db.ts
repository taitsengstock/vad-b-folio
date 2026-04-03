import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type Point = {
  x: number;
  y: number;
  pressure: number;
  dwell: number;
};

export type Session = {
  id: string;
  username: string;
  color: string;
  points: Point[];
  createdAt: string;
};

export async function readSessions(): Promise<Session[]> {
  const rows = await sql`SELECT id, username, color, points, created_at FROM sessions ORDER BY created_at ASC`;
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    color: r.color,
    points: r.points as Point[],
    createdAt: r.created_at,
  }));
}

export async function writeSession(session: Session): Promise<void> {
  await sql`
    INSERT INTO sessions (id, username, color, points, created_at)
    VALUES (${session.id}, ${session.username}, ${session.color}, ${JSON.stringify(session.points)}, ${session.createdAt})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function getColorForUsername(username: string): Promise<string | null> {
  const rows = await sql`SELECT color FROM sessions WHERE username = ${username} LIMIT 1`;
  return rows[0]?.color ?? null;
}

export async function countDistinctUsers(): Promise<number> {
  const rows = await sql`SELECT COUNT(DISTINCT username)::int AS count FROM sessions`;
  return rows[0]?.count ?? 0;
}

export async function appendPoints(id: string, newPoints: Point[]): Promise<void> {
  await sql`
    UPDATE sessions SET points = points || ${JSON.stringify(newPoints)}::jsonb WHERE id = ${id}
  `;
}

export async function clearSessions(): Promise<void> {
  await sql`DELETE FROM sessions`;
}
