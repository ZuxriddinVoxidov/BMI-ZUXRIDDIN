-- ============================================================
-- Leaderboard Migration: Add weekly & monthly points columns
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add weekly_points and monthly_points columns to student_points table
ALTER TABLE student_points
  ADD COLUMN IF NOT EXISTS weekly_points  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_points INTEGER NOT NULL DEFAULT 0;

-- 2. Function to reset weekly points every Monday at midnight
CREATE OR REPLACE FUNCTION reset_weekly_points()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE student_points SET weekly_points = 0;
END;
$$;

-- 3. Function to reset monthly points on 1st of each month at midnight
CREATE OR REPLACE FUNCTION reset_monthly_points()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE student_points SET monthly_points = 0;
END;
$$;

-- 4. Update add_student_points RPC to also update weekly & monthly points
CREATE OR REPLACE FUNCTION add_student_points(p_student_id UUID, p_points INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO student_points (student_id, total_points, weekly_points, monthly_points)
  VALUES (p_student_id, p_points, p_points, p_points)
  ON CONFLICT (student_id)
  DO UPDATE SET
    total_points   = student_points.total_points  + EXCLUDED.total_points,
    weekly_points  = student_points.weekly_points + EXCLUDED.weekly_points,
    monthly_points = student_points.monthly_points + EXCLUDED.monthly_points;
END;
$$;

-- 5. Enable Realtime for student_points (so LeaderboardSection updates live)
ALTER PUBLICATION supabase_realtime ADD TABLE student_points;

-- ============================================================
-- OPTIONAL: Schedule resets using pg_cron (if enabled)
-- ============================================================
-- Weekly reset (every Monday at 00:00 UTC):
-- SELECT cron.schedule('reset-weekly-points', '0 0 * * 1', 'SELECT reset_weekly_points()');
--
-- Monthly reset (1st of each month at 00:00 UTC):
-- SELECT cron.schedule('reset-monthly-points', '0 0 1 * *', 'SELECT reset_monthly_points()');
