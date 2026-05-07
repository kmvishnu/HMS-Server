import pool from '../config/db';

export class PublicRepository {
  async getFeaturedHotels() {
    const query = `
      SELECT h.id, h.name, h.location, h.image_urls,
             (SELECT MIN(price) FROM room_types rt WHERE rt.hotel_id = h.id) as starting_price
      FROM hotels h
      WHERE h.is_visible = TRUE
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
      WHERE is_visible = TRUE
      GROUP BY location
      ORDER BY hotel_count DESC
      LIMIT 5
    `;
    const { rows } = await pool.query(query);
    return rows.map(r => r.location);
  }

  async searchHotels(params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    features?: string[];
    page?: number;
    limit?: number;
  }) {
    const { 
      location, checkIn, checkOut, minPrice, maxPrice, features, 
      page = 1, limit = 10 
    } = params;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.id, h.name, h.location, 
             (SELECT MIN(price) FROM room_types rt WHERE rt.hotel_id = h.id) as starting_price,
             h.image_urls[1] as thumbnail
      FROM hotels h
      WHERE h.is_visible = TRUE
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (location) {
      query += ` AND h.location ILIKE $${paramIndex}`;
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (features && features.length > 0) {
      query += ` AND h.features @> $${paramIndex}`;
      queryParams.push(features);
      paramIndex++;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query += ` AND EXISTS (
        SELECT 1 FROM room_types rt 
        WHERE rt.hotel_id = h.id 
      `;
      if (minPrice !== undefined) {
        query += ` AND rt.price >= $${paramIndex}`;
        queryParams.push(minPrice);
        paramIndex++;
      }
      if (maxPrice !== undefined) {
        query += ` AND rt.price <= $${paramIndex}`;
        queryParams.push(maxPrice);
        paramIndex++;
      }
      query += `)`;
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const { rows: hotels } = await pool.query(query, queryParams);

    // Availability check
    if (checkIn && checkOut) {
      for (let hotel of hotels) {
        const availQuery = `
          SELECT 1 FROM room_types rt
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
        hotel.available = availResult.rows.length > 0;
      }
    } else {
      hotels.forEach(h => h.available = true);
    }

    return hotels.map(h => ({
      hotelId: h.id,
      name: h.name,
      location: h.location,
      minPrice: parseFloat(h.starting_price) || 0,
      available: h.available,
      thumbnail: h.thumbnail || null
    }));
  }

  async getLocations(q: string) {
    const query = `
      SELECT DISTINCT location 
      FROM hotels 
      WHERE is_visible = TRUE AND location ILIKE $1
      LIMIT 10
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    return rows.map(r => r.location);
  }
}
