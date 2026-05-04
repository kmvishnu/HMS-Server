import pool from '../config/db';

export class AdminRepository {
  async searchHotels(query: string) {
    const sql = `
      SELECT id, name, location, owner_id as "ownerId", created_at
      FROM hotels
      WHERE name ILIKE $1 OR location ILIKE $1
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(sql, [`%${query}%`]);
    return rows;
  }

  async searchOwners(query: string) {
    const sql = `
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'HOTEL_OWNER' AND (name ILIKE $1 OR email ILIKE $1)
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(sql, [`%${query}%`]);
    return rows;
  }
}
