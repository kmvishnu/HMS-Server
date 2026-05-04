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
    const query = 'SELECT * FROM room_types WHERE hotel_id = $1';
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
}
