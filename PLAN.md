# Collective Heatmap Drawing App

## Concept
A session-based collective drawing canvas where each user adds to a shared artwork via mouse/touch movement. Sessions stack on top of each other over time. Used in a classroom context to demonstrate user tracking.

## User Flow
1. Land on username entry screen
2. Enter username → assigned a unique color derived from username
3. Canvas loads with all previous sessions rendered
4. User draws by moving mouse or touching screen
5. On session end (leave/close), their session is saved and persists for future users

## Views
- `/` — username entry screen
- `/canvas` — collective view: all sessions layered on top of each other
- `/admin` — password-protected page to clear all sessions (for starting a new class)

## Canvas Effects
- **Mouse movement**: draws a continuous path in the user's color
- **Mouse dwell**: if cursor stays still, a radial glow grows and bleeds outward over time — longer dwell = larger bleed radius
- **Touch/mobile**: uses Pointer Events API (`event.pressure`) to control stroke width — harder press = thicker line

## Admin / Clear
- `/admin` protected by `ADMIN_PASSWORD` env var
- Single button to wipe all sessions from the database
- Allows instructor to reset the canvas before each new class

## Data Model
```ts
type Point = {
  x: number;        // 0–1 normalized (scales to any screen size)
  y: number;        // 0–1 normalized
  pressure: number; // 0–1 (touch pressure or default 0.5 for mouse)
  dwell: number;    // ms cursor stayed still (drives bleed radius)
}

type Session = {
  id: string;
  username: string;
  color: string;    // auto-derived from username hash
  points: Point[];
  createdAt: string;
}
```

## File Structure
```
src/
  app/
    page.tsx                      # Username entry screen
    canvas/page.tsx               # Collective canvas (all sessions)
    canvas/CanvasClient.tsx       # Client wrapper (dynamic import)
    admin/page.tsx                # Password-protected clear page
    api/sessions/route.ts         # GET all sessions / POST new session
    api/sessions/clear/route.ts   # DELETE all sessions (admin)
  components/
    HeatmapCanvas.tsx             # Canvas rendering + event tracking
  lib/
    db.ts                         # Neon DB queries
    color.ts                      # Username → color hash util
```

## Storage
- **Database**: Neon (PostgreSQL) — `sessions` table with `points` as JSONB
- **Local dev**: Neon connection string in `.env.local`
- **Production**: same Neon DB, connection string in Vercel env vars

## Tech
- Canvas 2D API + `requestAnimationFrame` for rendering
- Pointer Events API for unified mouse + touch + pressure handling
- Next.js API routes for session persistence
- Neon serverless PostgreSQL (`@neondatabase/serverless`)
- Colors auto-assigned via username hash (no user choice needed)

## Setup Steps
1. Create Neon project at neon.tech
2. Add `DATABASE_URL` to `.env.local` and Vercel env vars
3. Run schema migration (create `sessions` table)
4. Set `ADMIN_PASSWORD` env var locally and on Vercel
