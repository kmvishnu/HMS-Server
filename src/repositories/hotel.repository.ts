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

  async createHotel(name: string, location: string) {
    const query = `
      INSERT INTO hotels (name, location)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, location]);
    return rows[0];
  }

  async createRoomType(hotelId: number, name: string, totalRooms: number) {
    const query = `
      INSERT INTO room_types (hotel_id, name, total_rooms)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [hotelId, name, totalRooms]);
    return rows[0];
  }

  async getRoomTypesByHotelId(hotelId: number) {
    const query = 'SELECT * FROM room_types WHERE hotel_id = $1';
    const { rows } = await pool.query(query, [hotelId]);
    return rows;
  }
}
