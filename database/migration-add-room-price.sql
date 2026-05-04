-- Add price to room_types
ALTER TABLE room_types ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
