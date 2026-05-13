import pool from '../config/db';

export class InventoryRepository {
  async initInventory(roomTypeId: number, startDate: string, endDate: string, totalRooms: number) {
    const query = `
      INSERT INTO room_inventory (room_type_id, date, available_count)
      SELECT $1, d::date, $4
      FROM generate_series($2::date, $3::date, '1 day'::interval) d
      ON CONFLICT (room_type_id, date) DO UPDATE 
      SET available_count = EXCLUDED.available_count
      RETURNING *
    `;
    const { rows } = await pool.query(query, [roomTypeId, startDate, endDate, totalRooms]);
    return rows;
  }

  async getAvailability(hotelId: number, checkIn: string, checkOut: string) {
    const query = `
      WITH DateRange AS (
        SELECT generate_series($2::date, ($3::date - interval '1 day')::date, '1 day'::interval)::date as d
      ),
      RequiredDays AS (
        SELECT COUNT(*) as days_needed FROM DateRange
      )
      SELECT rt.id as room_type_id, rt.name, MIN(ri.available_count) as min_available
      FROM room_types rt
      JOIN room_inventory ri ON rt.id = ri.room_type_id
      WHERE rt.hotel_id = $1
      AND ri.date >= $2 AND ri.date < $3
      GROUP BY rt.id, rt.name
      HAVING MIN(ri.available_count) > 0 
      AND COUNT(DISTINCT ri.date) = (SELECT days_needed FROM RequiredDays)
    `;
    const { rows } = await pool.query(query, [hotelId, checkIn, checkOut]);
    return rows;
  }

  async getInventoryCalendar(hotelId: number, startDate: string, endDate: string) {
    const query = `
      SELECT ri.date, ri.room_type_id as "roomTypeId", ri.available_count as "availableCount", rt.name as "roomTypeName"
      FROM room_inventory ri
      JOIN room_types rt ON ri.room_type_id = rt.id
      WHERE rt.hotel_id = $1
        AND ri.date >= $2::date
        AND ri.date <= $3::date
      ORDER BY ri.date ASC, rt.id ASC
    `;
    const { rows } = await pool.query(query, [hotelId, startDate, endDate]);
    return rows;
  }

  async updateInventory(roomTypeId: number, startDate: string, endDate: string, availableCount: number) {
    const query = `
      UPDATE room_inventory
      SET available_count = $4
      WHERE room_type_id = $1
      AND date >= $2::date
      AND date <= $3::date
      RETURNING *
    `;
    const { rows } = await pool.query(query, [roomTypeId, startDate, endDate, availableCount]);
    return rows;
  }
}
