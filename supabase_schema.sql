-- ============================================================
-- CricAI — Supabase Database Schema  v2.0
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run: uses IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- ============================================================

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name          TEXT,
  age           INTEGER,
  age_months    INTEGER DEFAULT 0,
  role          TEXT,
  level         TEXT,
  availability  INTEGER DEFAULT 5,
  fitness       TEXT,
  selected_coach TEXT DEFAULT 'virat',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);
-- Add new column if table already exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS selected_coach TEXT DEFAULT 'virat';

-- 2. TRAINING PLANS (stores full JSON plan + playerSummary)
CREATE TABLE IF NOT EXISTS training_plans (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan          JSONB NOT NULL,
  player_summary JSONB,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own plan" ON training_plans;
CREATE POLICY "Users can manage own plan" ON training_plans
  FOR ALL USING (auth.uid() = user_id);
-- Add new column if table already exists
ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS player_summary JSONB;

-- 3. PROGRESS
CREATE TABLE IF NOT EXISTS progress (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number    INTEGER NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  completed_at  DATE,
  UNIQUE(user_id, day_number)
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own progress" ON progress;
CREATE POLICY "Users can manage own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

-- 4. INJURY LOG (new in v2)
CREATE TABLE IF NOT EXISTS injury_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number    INTEGER,
  body_part     TEXT NOT NULL,
  severity      INTEGER CHECK (severity BETWEEN 1 AND 5),
  note          TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE injury_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own injury log" ON injury_log;
CREATE POLICY "Users can manage own injury log" ON injury_log
  FOR ALL USING (auth.uid() = user_id);

-- 5. MATCH SIM SCORES (new in v2)
CREATE TABLE IF NOT EXISTS match_sim_scores (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score         INTEGER NOT NULL,
  scenario_type TEXT,
  played_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE match_sim_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own scores" ON match_sim_scores;
CREATE POLICY "Users can manage own scores" ON match_sim_scores
  FOR ALL USING (auth.uid() = user_id);
