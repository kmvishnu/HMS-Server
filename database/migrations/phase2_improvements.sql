-- Phase 2 Improvements Migration

-- 1. Add notes column to bookings
ALTER TABLE bookings ADD COLUMN notes TEXT NULL;

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_date_room ON room_inventory(date, room_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates_rt ON bookings(room_type_id, check_in, check_out);

-- 3. Confirmation
DO $$ 
BEGIN 
    RAISE NOTICE 'Phase 2 Database migration completed successfully'; 
END $$;
