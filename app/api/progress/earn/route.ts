// Cloudflare Pages Function — runs at edge, not in static export

export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
}

interface CloudflareEnv {
  DB?: D1Database;
}

interface EarnRequestBody {
  studentId: string;
  module: string;
  yearBand: string;
  activity: string;
  xp: number;
}

interface StudentBadgeRow {
  xp: number;
  badges: string;
}

function getLevelName(xp: number): string {
  if (xp > 500) return "AI Champion";
  if (xp > 300) return "Innovator";
  if (xp > 150) return "Discoverer";
  if (xp > 50)  return "Explorer";
  return "Beginner";
}

function checkBadges(
  studentId: string,
  module: string,
  yearBand: string,
  existingBadges: string[],
  totalXp: number
): string[] {
  const newBadges: string[] = [];
  const earned = new Set(existingBadges);

  // First activity badge
  if (!earned.has("bytes-friend")) {
    newBadges.push("bytes-friend");
  }

  // Module + year band badges
  if (module === "m1" && yearBand === "yr3-4" && !earned.has("token-tamer")) {
    newBadges.push("token-tamer");
  }
  if (module === "m1" && yearBand === "yr5-6" && !earned.has("token-master")) {
    newBadges.push("token-master");
  }
  if (module === "m2" && yearBand === "yr3-4" && !earned.has("word-connector")) {
    newBadges.push("word-connector");
  }
  if (module === "m2" && yearBand === "yr5-6" && !earned.has("meaning-mapper")) {
    newBadges.push("meaning-mapper");
  }

  // XP milestone
  if (totalXp >= 100 && !earned.has("century")) {
    newBadges.push("century");
  }

  // Avoid unused variable warning
  void studentId;

  return newBadges;
}

export async function POST(req: NextRequest) {
  let body: EarnRequestBody;
  try {
    body = await req.json() as EarnRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { studentId, module, yearBand, activity, xp } = body;
  if (!studentId || !module || !yearBand || !activity || xp == null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const env = (process as { env: NodeJS.ProcessEnv & CloudflareEnv }).env;
  const db = env.DB;

  if (!db) {
    // Fallback
    return Response.json({
      totalXp: xp,
      newBadges: [],
      level: getLevelName(xp),
    });
  }

  try {
    // Get current state
    const row = await db.prepare(
      `SELECT xp, badges FROM students WHERE id = ?`
    ).bind(studentId).first<StudentBadgeRow>();

    if (!row) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    let badges: string[] = [];
    try { badges = JSON.parse(row.badges) as string[]; } catch { badges = []; }

    const newTotalXp = row.xp + xp;
    const newBadges = checkBadges(studentId, module, yearBand, badges, newTotalXp);
    const allBadges = [...new Set([...badges, ...newBadges])];

    // Update student
    await db.prepare(
      `UPDATE students SET xp = ?, badges = ?, updated_at = unixepoch() WHERE id = ?`
    ).bind(newTotalXp, JSON.stringify(allBadges), studentId).run();

    // Record activity
    await db.prepare(
      `INSERT INTO progress (student_id, module, year_band, activity, xp_earned) VALUES (?, ?, ?, ?, ?)`
    ).bind(studentId, module, yearBand, activity, xp).run();

    return Response.json({
      totalXp: newTotalXp,
      newBadges,
      level: getLevelName(newTotalXp),
    });
  } catch (err) {
    console.error("D1 error:", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
