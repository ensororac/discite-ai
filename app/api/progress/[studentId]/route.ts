// Cloudflare Pages Function — runs at edge, not in static export

export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

interface CloudflareEnv {
  DB?: D1Database;
}

interface StudentRow {
  id: string;
  display_name: string | null;
  xp: number;
  badges: string;
}

interface ProgressRow {
  module: string;
  year_band: string;
  activity: string;
  xp_earned: number;
  completed_at: number;
}

function getLevelName(xp: number): string {
  if (xp > 500) return "AI Champion";
  if (xp > 300) return "Innovator";
  if (xp > 150) return "Discoverer";
  if (xp > 50)  return "Explorer";
  return "Beginner";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  if (!studentId) {
    return Response.json({ error: "studentId required" }, { status: 400 });
  }

  const env = (process as { env: NodeJS.ProcessEnv & CloudflareEnv }).env;
  const db = env.DB;

  if (!db) {
    return Response.json({
      studentId,
      xp: 0,
      badges: [],
      level: "Beginner",
      recentActivity: [],
    });
  }

  try {
    const row = await db.prepare(
      `SELECT id, display_name, xp, badges FROM students WHERE id = ?`
    ).bind(studentId).first<StudentRow>();

    if (!row) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    let badges: string[] = [];
    try { badges = JSON.parse(row.badges) as string[]; } catch { badges = []; }

    const activityResult = await db.prepare(
      `SELECT module, year_band, activity, xp_earned, completed_at
       FROM progress WHERE student_id = ?
       ORDER BY completed_at DESC LIMIT 10`
    ).bind(studentId).all<ProgressRow>();

    return Response.json({
      studentId: row.id,
      displayName: row.display_name,
      xp: row.xp,
      badges,
      level: getLevelName(row.xp),
      recentActivity: activityResult.results,
    });
  } catch (err) {
    console.error("D1 error:", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
