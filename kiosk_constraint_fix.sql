-- ==========================================
-- FIX STATUS CONSTRAINT
-- Run this in Supabase SQL Editor
-- ==========================================

-- The code uses 'alpha' and 'permission', but the database might only have 'absent'.
-- We need to update the check constraint to allow all used statuses.

-- 1. Drop the old constraint
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;

-- 2. Add the correct constraint matching the App's logic
-- Allowed values: 'present', 'alpha', 'late', 'sick', 'permission'
ALTER TABLE attendance 
ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('present', 'alpha', 'late', 'sick', 'permission'));

-- 3. Optional: Update any existing 'absent' values to 'alpha' to be consistent
UPDATE attendance SET status = 'alpha' WHERE status = 'absent';
