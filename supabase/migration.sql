-- City One — Supabase Database Migration
-- Run this in your Supabase SQL editor to set up all tables

-- ========================================
-- COMPLAINTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS complaints (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage', 'waterlogging', 'streetlight', 'signal failure', 'road accident', 'crowd issue')),
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'reviewing', 'in progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- EV STATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS ev_stations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  available_slots INTEGER NOT NULL DEFAULT 0,
  total_slots INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CITY EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS city_events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  crowd_level TEXT NOT NULL DEFAULT 'low' CHECK (crowd_level IN ('low', 'medium', 'high'))
);

-- ========================================
-- TRAFFIC HOTSPOTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS traffic_hotspots (
  id BIGSERIAL PRIMARY KEY,
  area_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  congestion_level TEXT NOT NULL DEFAULT 'low' CHECK (congestion_level IN ('low', 'moderate', 'heavy', 'severe')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- RISK ZONES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS risk_zones (
  id BIGSERIAL PRIMARY KEY,
  zone_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ENABLE REALTIME
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE ev_stations;
ALTER PUBLICATION supabase_realtime ADD TABLE city_events;
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_hotspots;
ALTER PUBLICATION supabase_realtime ADD TABLE risk_zones;

-- ========================================
-- ROW LEVEL SECURITY (permissive for now)
-- ========================================
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_zones ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to all tables
CREATE POLICY "Allow public read" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ev_stations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON city_events FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON traffic_hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON risk_zones FOR SELECT USING (true);

-- Allow anonymous insert (for n8n workflows)
CREATE POLICY "Allow public insert" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON ev_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON city_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON traffic_hotspots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON risk_zones FOR INSERT WITH CHECK (true);

-- Allow anonymous update (for n8n workflows)
CREATE POLICY "Allow public update" ON complaints FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON ev_stations FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON city_events FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON traffic_hotspots FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON risk_zones FOR UPDATE USING (true);
