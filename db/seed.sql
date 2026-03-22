-- Discite AI — D1 Seed Data (test group)

INSERT OR IGNORE INTO students (id, class_code, pin, display_name, xp, badges)
VALUES
  ('5B:1234', '5B', '1234', 'Alice',   45,  '["bytes-friend"]'),
  ('5B:5678', '5B', '5678', 'Bob',     120, '["bytes-friend","token-tamer"]'),
  ('6A:0001', '6A', '0001', 'Charlie', 0,   '[]');
