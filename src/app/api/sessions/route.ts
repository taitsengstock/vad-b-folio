import { NextRequest, NextResponse } from "next/server";
import { readSessions, writeSession, appendPoints, Session, Point } from "@/lib/db";

export async function GET() {
  const sessions = await readSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body: Session = await req.json();
  await writeSession(body);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { id, points }: { id: string; points: Point[] } = await req.json();
  await appendPoints(id, points);
  return NextResponse.json({ ok: true });
}
