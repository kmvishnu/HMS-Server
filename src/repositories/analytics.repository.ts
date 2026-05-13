import pool from '../config/db';

export class AnalyticsRepository {
  async getWeeklyOccupancy(hotelId: number) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
      WITH RECURSIVE last_7_days(d) AS (
        SELECT ($2::date - interval '6 days')::date
        UNION ALL
        SELECT (d + interval '1 day')::date
        FROM last_7_days
        WHERE d < $2::date
      ),
      DailyStats AS (
        SELECT 
          ls.d as date,
          (SELECT SUM(total_rooms) FROM room_types WHERE hotel_id = $1) as total_rooms,
          (SELECT COUNT(*) FROM bookings b 
           JOIN room_types rt ON b.room_type_id = rt.id 
           WHERE rt.hotel_id = $1 AND b.check_in <= ls.d AND b.check_out > ls.d AND b.deleted_at IS NULL) as booked_count
        FROM last_7_days ls
      )
      SELECT 
        date, 
        booked_count as count,
        CASE WHEN total_rooms > 0 THEN (booked_count::float / total_rooms::float) * 100 ELSE 0 END as occupancy_rate
      FROM DailyStats
      ORDER BY date ASC
    `;
    
    const { rows } = await pool.query(query, [hotelId, today]);
    return rows;
  }

  async getDailyBookings(hotelId: number) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
      WITH RECURSIVE last_7_days(d) AS (
        SELECT ($2::date - interval '6 days')::date
        UNION ALL
        SELECT (d + interval '1 day')::date
        FROM last_7_days
        WHERE d < $2::date
      )
      SELECT 
        ls.d as date,
        COUNT(b.id) as count
      FROM last_7_days ls
      LEFT JOIN room_types rt ON rt.hotel_id = $1
      LEFT JOIN bookings b ON b.room_type_id = rt.id AND b.check_in = ls.d AND b.deleted_at IS NULL
      GROUP BY ls.d
      ORDER BY ls.d ASC
    `;
    const { rows } = await pool.query(query, [hotelId, today]);
    return rows;
  }
}
