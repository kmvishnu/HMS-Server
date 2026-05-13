import pool from '../config/db';

export class HotelRepository {
  async findAll() {
    const query = 'SELECT * FROM hotels WHERE deleted_at IS NULL ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id: number) {
    const query = 'SELECT * FROM hotels WHERE id = $1 AND deleted_at IS NULL';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async getHotelsByOwner(ownerId: number) {
    const query = 'SELECT * FROM hotels WHERE owner_id = $1 AND deleted_at IS NULL';
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }

  async getRoomTypesByHotelId(hotelId: number, checkIn?: string, checkOut?: string) {
    let query = 'SELECT * FROM room_types WHERE hotel_id = $1';
    const params: any[] = [hotelId];

    if (checkIn && checkOut) {
      query = `
        SELECT rt.*, ri.available_count
        FROM room_types rt
        JOIN room_inventory ri ON rt.id = ri.room_type_id
        WHERE rt.hotel_id = $1 
        AND ri.date >= $2 AND ri.date < $3
      `;
      params.push(checkIn, checkOut);
    }

    const { rows } = await pool.query(query, params);
    
    // For each room type, get its images
    for (const rt of rows) {
      rt.images = await this.getRoomTypeImages(rt.id);
    }
    
    return rows;
  }

  async getRoomTypeById(id: number) {
    const query = 'SELECT * FROM room_types WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async createHotel(name: string, location: string, ownerId: number, imageUrls: string[]) {
    const query = `
      INSERT INTO hotels (name, location, owner_id, image_urls) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, location, ownerId, imageUrls]);
    return rows[0];
  }

  async updateHotel(id: number, name?: string, location?: string, ownerId?: number | null, reqBody: any = {}) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (location !== undefined) {
      fields.push(`location = $${paramIndex}`);
      values.push(location);
      paramIndex++;
    }

    if (ownerId !== undefined) {
      fields.push(`owner_id = $${paramIndex}`);
      values.push(ownerId);
      paramIndex++;
    }

    if (reqBody.contactEmail !== undefined) {
      fields.push(`contact_email = $${paramIndex}`);
      values.push(reqBody.contactEmail ? reqBody.contactEmail.toLowerCase() : null);
      paramIndex++;
    }

    if (reqBody.address !== undefined) {
      fields.push(`address = $${paramIndex}`);
      values.push(reqBody.address ? reqBody.address.trim() : null);
      paramIndex++;
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE hotels 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateVisibility(id: number, isVisible: boolean) {
    const query = 'UPDATE hotels SET is_visible = $2 WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id, isVisible]);
    return rows[0];
  }

  async updateFeatures(id: number, features: string[]) {
    const query = 'UPDATE hotels SET features = $2 WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id, features]);
    return rows[0];
  }

  async updateImages(id: number, imageUrls: string[]) {
    const query = 'UPDATE hotels SET image_urls = $2 WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id, imageUrls]);
    return rows[0];
  }

  async createRoomType(hotelId: number, name: string, totalRooms: number, price: number) {
    const query = `
      INSERT INTO room_types (hotel_id, name, total_rooms, price) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [hotelId, name, totalRooms, price]);
    return rows[0];
  }

  async addRoomTypeImage(roomTypeId: number, imageUrl: string) {
    const query = 'INSERT INTO room_type_images (room_type_id, image_url) VALUES ($1, $2) RETURNING *';
    const { rows } = await pool.query(query, [roomTypeId, imageUrl]);
    return rows[0];
  }

  async getRoomTypeImages(roomTypeId: number) {
    const query = 'SELECT * FROM room_type_images WHERE room_type_id = $1';
    const { rows } = await pool.query(query, [roomTypeId]);
    return rows;
  }

  async deleteRoomTypeImage(id: number) {
    const query = 'DELETE FROM room_type_images WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async updateRoomType(id: number, name?: string, totalRooms?: number, price?: number) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (totalRooms !== undefined) {
      fields.push(`total_rooms = $${paramIndex}`);
      values.push(totalRooms);
      paramIndex++;
    }

    if (price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE room_types 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async deleteRoomType(id: number) {
    const query = 'DELETE FROM room_types WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async deleteHotel(id: number) {
    const query = 'UPDATE hotels SET deleted_at = NOW() WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async getHotelSettings(hotelId: number) {
    const query = `
      SELECT 
        h.id, h.name, h.location, h.owner_id, h.image_urls, h.is_visible, h.features, h.contact_email, h.address,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', rt.id,
              'name', rt.name,
              'total_rooms', rt.total_rooms,
              'price', rt.price,
              'images', (
                SELECT COALESCE(JSON_AGG(rti.image_url), '[]'::json)
                FROM room_type_images rti
                WHERE rti.room_type_id = rt.id
              )
            )
          ) FILTER (WHERE rt.id IS NOT NULL),
          '[]'::json
        ) as room_types
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotel_id
      WHERE h.id = $1 AND h.deleted_at IS NULL
      GROUP BY h.id
    `;
    const { rows } = await pool.query(query, [hotelId]);
    return rows[0] || null;
  }
}
