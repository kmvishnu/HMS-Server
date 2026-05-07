import pool from '../config/db';
import { AppError } from '../utils/AppError';
import { BookingStatus } from '../types';

export class BookingRepository {
  async createBooking(userId: number, roomTypeId: number, checkIn: string, checkOut: string, guests: { name: string, age: number }[] = [], totalAmount: number) {
    return this.createBookingWithGuests(userId, roomTypeId, checkIn, checkOut, guests, totalAmount);
  }

  async createBookingWithGuests(userId: number, roomTypeId: number, checkIn: string, checkOut: string, guests: { name: string, age: number }[], totalAmount: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Calculate how many days we need
      const daysQuery = `SELECT ( $2::date - $1::date ) AS days_needed`;
      const daysResult = await client.query(daysQuery, [checkIn, checkOut]);
      const daysNeeded = parseInt(daysResult.rows[0].days_needed, 10);
      
      if (daysNeeded <= 0) {
        throw new AppError('Check-out must be after check-in', 400);
      }

      // 2. Lock the rows for the specific date range
      const lockQuery = `
        SELECT date, available_count 
        FROM room_inventory
        WHERE room_type_id = $1 
          AND date >= $2::date 
          AND date < $3::date
        FOR UPDATE
      `;
      const lockResult = await client.query(lockQuery, [roomTypeId, checkIn, checkOut]);
      
      // 3. Validate availability
      if (lockResult.rows.length !== daysNeeded) {
        throw new AppError('Inventory not available for the selected dates', 400);
      }

      for (const row of lockResult.rows) {
        if (row.available_count <= 0) {
          throw new AppError('Room not available for the selected dates', 400);
        }
      }

      // 4. Update inventory
      const updateQuery = `
        UPDATE room_inventory
        SET available_count = available_count - 1
        WHERE room_type_id = $1 
          AND date >= $2::date 
          AND date < $3::date
      `;
      await client.query(updateQuery, [roomTypeId, checkIn, checkOut]);

      // 5. Insert booking
      const insertQuery = `
        INSERT INTO bookings (user_id, room_type_id, check_in, check_out, total_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const bookingResult = await client.query(insertQuery, [
        userId, 
        roomTypeId, 
        checkIn, 
        checkOut, 
        totalAmount,
        BookingStatus.CONFIRMED
      ]);

      const booking = bookingResult.rows[0];

      // 6. Insert guests
      for (const guest of guests) {
        await client.query(
          'INSERT INTO booking_guests (booking_id, name, age) VALUES ($1, $2, $3)',
          [booking.id, guest.name, guest.age]
        );
      }

      await client.query('COMMIT');
      return booking;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserBookings(userId: number) {
    const query = `
      SELECT b.*, rt.name as room_type_name, h.name as hotel_name 
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  async getHotelBookings(hotelId: number, filter?: string) {
    let query = `
      SELECT b.*, rt.name as room_type_name, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN users u ON b.user_id = u.id
      WHERE rt.hotel_id = $1
    `;
    const params: any[] = [hotelId];

    if (filter === 'today') {
      query += ' AND (b.check_in = CURRENT_DATE OR b.check_out = CURRENT_DATE)';
    } else if (filter === 'upcoming') {
      query += ' AND b.check_in > CURRENT_DATE';
    } else if (filter === 'checked-in') {
      query += " AND b.status = 'CHECKED_IN'";
    }

    query += ' ORDER BY b.check_in ASC';
    const { rows } = await pool.query(query, params);
    
    // Add guests to each booking
    for (const booking of rows) {
      booking.guests = await this.getBookingGuests(booking.id);
    }
    
    return rows;
  }

  async getBookingGuests(bookingId: number) {
    const { rows } = await pool.query('SELECT * FROM booking_guests WHERE booking_id = $1', [bookingId]);
    return rows;
  }

  async updateBookingStatus(id: number, status: string) {
    const query = 'UPDATE bookings SET status = $2 WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id, status]);
    return rows[0];
  }

  async findById(id: number) {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
