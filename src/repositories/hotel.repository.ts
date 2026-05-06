import pool from '../config/db';

export class HotelRepository {
  async findAll() {
    const query = 'SELECT * FROM hotels';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id: number) {
    const query = 'SELECT * FROM hotels WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async getHotelsByOwner(ownerId: number) {
    const query = 'SELECT * FROM hotels WHERE owner_id = $1';
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
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

  async createRoomType(hotelId: number, name: string, totalRooms: number, price: number) {
    const query = `
      INSERT INTO room_types (hotel_id, name, total_rooms, price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [hotelId, name, totalRooms, price]);
    return rows[0];
  }

  async getRoomTypesByHotelId(hotelId: number) {
    const query = `
      SELECT rt.*, 
             COALESCE(json_agg(rti.image_url) FILTER (WHERE rti.image_url IS NOT NULL), '[]') as images
      FROM room_types rt
      LEFT JOIN room_type_images rti ON rt.id = rti.room_type_id
      WHERE rt.hotel_id = $1
      GROUP BY rt.id
    `;
    const { rows } = await pool.query(query, [hotelId]);
    return rows;
  }

  async updateImages(hotelId: number, imageUrls: string[]) {
    const query = `
      UPDATE hotels 
      SET image_urls = $2 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [hotelId, imageUrls]);
    return rows[0];
  }

  async updateHotel(id: number, name?: string, location?: string, ownerId?: number | null) {
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
}
