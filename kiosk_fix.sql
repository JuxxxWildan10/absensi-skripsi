-- ==========================================
-- KIOSK MODE FIX (RLS POLICIES)
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Enable RLS on relevant tables (Good practice, but likely already on)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 2. Allow PUBLIC (Anon) to READ Students and Classes
DROP POLICY IF EXISTS "Public Read Classes" ON classes;
CREATE POLICY "Public Read Classes" 
ON classes FOR SELECT 
TO anon 
USING (true);

DROP POLICY IF EXISTS "Public Read Students" ON students;
CREATE POLICY "Public Read Students" 
ON students FOR SELECT 
TO anon 
USING (true);

-- 3. Allow PUBLIC (Anon) to INSERT Attendance
DROP POLICY IF EXISTS "Public Insert Attendance" ON attendance;
CREATE POLICY "Public Insert Attendance" 
ON attendance FOR INSERT 
TO anon 
WITH CHECK (true);

-- 4. Verify/Fix Users Policy (Optional, mainly for Login)
DROP POLICY IF EXISTS "Public Read Users" ON users;
CREATE POLICY "Public Read Users" 
ON users FOR SELECT 
TO anon 
USING (true);

-- Clean up any conflicting "Public Access" policies from previous setup if they exist and are restrictive
-- (If previous generic "Public Access" existed, it might be fine, but specific roles are safer/clearer)
