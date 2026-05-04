-- Add owner_id to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_id INTEGER;
ALTER TABLE hotels ADD CONSTRAINT fk_hotel_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add image_urls array to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
