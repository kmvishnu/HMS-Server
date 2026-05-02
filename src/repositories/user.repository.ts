import pool from '../config/db';

export class UserRepository {
  async findByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async create(name: string, email: string, passwordHash: string, role: string, hotelId: number | null = null) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, hotel_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, hotel_id, created_at
    `;
    const { rows } = await pool.query(query, [name, email, passwordHash, role, hotelId]);
    return rows[0];
  }

  async findById(id: number) {
    const query = 'SELECT id, name, email, role, hotel_id, created_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
