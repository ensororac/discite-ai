-- Discite AI — D1 Schema
-- Database: discite-progress
-- Binding: DB

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,           -- class_code + ':' + pin (e.g. "5B:1234")
  class_code TEXT NOT NULL,
  pin TEXT NOT NULL,
  display_name TEXT,
  xp INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]',      -- JSON array of badge ids
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  module TEXT NOT NULL,          -- 'm1', 'm2', etc.
  year_band TEXT NOT NULL,       -- 'yr3-4', 'yr5-6', 'yr7-8', 'yr9-10'
  activity TEXT NOT NULL,        -- activity identifier
  xp_earned INTEGER DEFAULT 0,
  completed_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON progress(student_id, module);
