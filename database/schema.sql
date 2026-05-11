-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER, ADMIN, HOTEL_OWNER, STAFF
  hotel_id INTEGER,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE deleted_at IS NULL;

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  is_visible BOOLEAN DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for location search
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotels_owner ON hotels(owner_id) WHERE deleted_at IS NULL;

-- Add foreign key back to users for hotel_id (for staff/managers)
ALTER TABLE users ADD CONSTRAINT fk_user_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Room types table
CREATE TABLE IF NOT EXISTS room_types (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_rooms INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room type images
CREATE TABLE IF NOT EXISTS room_type_images (
  id SERIAL PRIMARY KEY,
  room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room inventory table (CRITICAL for availability logic)
CREATE TABLE IF NOT EXISTS room_inventory (
  room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_count INTEGER NOT NULL,
  PRIMARY KEY (room_type_id, date)
);

-- Index for fast availability lookups
CREATE INDEX IF NOT EXISTS idx_inventory_room_date ON room_inventory(room_type_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_dates ON bookings(room_type_id, check_in, check_out) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, FAILED
  payment_id VARCHAR(255),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking Guests (For multi-guest reservations)
CREATE TABLE IF NOT EXISTS booking_guests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
