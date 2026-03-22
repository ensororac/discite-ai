// Cloudflare Pages Function — runs at edge, not in static export
// Access D1 via env.DB binding defined in wrangler.toml

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

interface InitRequestBody {
  classCode: string;
  pin: string;
  displayName?: string;
}

interface StudentRow {
  id: string;
  xp: number;
  badges: string;
  display_name: string | null;
}

function getLevelName(xp: number): string {
  if (xp > 500) return "AI Champion";
  if (xp > 300) return "Innovator";
  if (xp > 150) return "Discoverer";
  if (xp > 50)  return "Explorer";
  return "Beginner";
}

export async function POST(req: NextRequest) {
  let body: InitRequestBody;
  try {
    body = await req.json() as InitRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { classCode, pin, displayName } = body;
  if (!classCode || !pin) {
    return Response.json({ error: "classCode and pin required" }, { status: 400 });
  }

  const studentId = `${classCode.toUpperCase()}:${pin}`;

  // Try D1 binding — gracefully fall back to mock if unavailable
  const env = (process as { env: NodeJS.ProcessEnv & CloudflareEnv }).env;
  const db = env.DB;

  if (!db) {
    // Local dev / static fallback
    return Response.json({
      studentId,
      xp: 0,
      badges: [],
      level: "Beginner",
      displayName: displayName ?? null,
    });
  }

  try {
    // Create student if not exists
    await db.prepare(
      `INSERT OR IGNORE INTO students (id, class_code, pin, display_name, xp, badges) VALUES (?, ?, ?, ?, 0, '[]')`
    ).bind(studentId, classCode.toUpperCase(), pin, displayName ?? null).run();

    // Fetch current state
    const row = await db.prepare(
      `SELECT id, xp, badges, display_name FROM students WHERE id = ?`
    ).bind(studentId).first<StudentRow>();

    if (!row) {
      return Response.json({ error: "Student not found" }, { status: 500 });
    }

    let badges: string[] = [];
    try { badges = JSON.parse(row.badges) as string[]; } catch { badges = []; }

    return Response.json({
      studentId: row.id,
      xp: row.xp,
      badges,
      level: getLevelName(row.xp),
      displayName: row.display_name,
    });
  } catch (err) {
    console.error("D1 error:", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
