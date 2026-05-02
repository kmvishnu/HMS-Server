import pool from '../config/db';
import { AppError } from '../utils/AppError';
import { BookingStatus } from '../types';

export class BookingRepository {
  async createBooking(userId: number, roomTypeId: number, checkIn: string, checkOut: string) {
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
        INSERT INTO bookings (user_id, room_type_id, check_in, check_out, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const bookingResult = await client.query(insertQuery, [
        userId, 
        roomTypeId, 
        checkIn, 
        checkOut, 
        BookingStatus.CONFIRMED // Assuming CONFIRMED for MVP without real payment
      ]);

      await client.query('COMMIT');
      return bookingResult.rows[0];

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
}
