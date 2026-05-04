import pool from '../config/db';

export class PublicRepository {
  async getFeaturedHotels() {
    const query = `
      SELECT h.id, h.name, h.location, h.image_urls,
             (SELECT MIN(price) FROM room_types rt WHERE rt.hotel_id = h.id) as starting_price
      FROM hotels h
      ORDER BY h.created_at DESC
      LIMIT 5
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getTopLocations() {
    const query = `
      SELECT location, COUNT(*) as hotel_count
      FROM hotels
      GROUP BY location
      ORDER BY hotel_count DESC
      LIMIT 5
    `;
    const { rows } = await pool.query(query);
    return rows.map(r => r.location);
  }

  async searchHotels(location?: string, checkIn?: string, checkOut?: string) {
    let query = `
      SELECT h.id, h.name, h.location, h.image_urls,
             (SELECT MIN(price) FROM room_types rt WHERE rt.hotel_id = h.id) as starting_price
      FROM hotels h
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (location) {
      query += ` AND h.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    const { rows: hotels } = await pool.query(query, params);

    // If dates are provided, we check availability for each hotel
    if (checkIn && checkOut) {
      for (let hotel of hotels) {
        // A hotel is available if at least one of its room types has availability > 0 for ALL days between checkIn and checkOut
        const availQuery = `
          SELECT rt.id
          FROM room_types rt
          WHERE rt.hotel_id = $1
            AND NOT EXISTS (
              SELECT 1
              FROM generate_series($2::date, $3::date - interval '1 day', '1 day') as d(date)
              LEFT JOIN room_inventory ri ON ri.room_type_id = rt.id AND ri.date = d.date
              WHERE COALESCE(ri.available_count, 0) = 0
            )
          LIMIT 1
        `;
        const availResult = await pool.query(availQuery, [hotel.id, checkIn, checkOut]);
        hotel.isAvailable = availResult.rows.length > 0;
      }
    } else {
      // If no dates provided, assume available
      hotels.forEach(h => h.isAvailable = true);
    }

    return hotels;
  }
}
