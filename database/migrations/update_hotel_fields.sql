-- Migration: Add contact information to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS address TEXT;
