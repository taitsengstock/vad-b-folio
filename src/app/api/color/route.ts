import { NextRequest, NextResponse } from "next/server";
import { getColorForUsername, countDistinctUsers } from "@/lib/db";
import COLORS from "@/lib/colors";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  // Return existing color if user has drawn before
  const existing = await getColorForUsername(username);
  if (existing) return NextResponse.json({ color: existing });

  // Assign next color in sequence
  const count = await countDistinctUsers();
  const color = COLORS[count % COLORS.length];
  return NextResponse.json({ color });
}
