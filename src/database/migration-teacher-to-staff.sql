-- Migration: Change 'teacher' role to 'staff'
-- This script updates existing data and schema constraints

-- Step 1: Update existing users with 'teacher' role to 'staff'
UPDATE users SET role = 'staff' WHERE role = 'teacher';

-- Step 2: Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add new constraint with 'staff' instead of 'teacher'
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('staff', 'admin'));
