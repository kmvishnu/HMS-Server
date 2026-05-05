import pool from '../config/db';

export class UserRepository {
  async findByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async getUsers(role?: string, hotelId?: number | null) {
    let query = 'SELECT id, name, email, role, hotel_id as "hotelId", created_at FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (hotelId !== undefined) {
      if (hotelId === null) {
        query += ` AND hotel_id IS NULL`;
      } else {
        query += ` AND hotel_id = $${paramIndex}`;
        params.push(hotelId);
        paramIndex++;
      }
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
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

  async hasAdmin() {
    const query = "SELECT EXISTS(SELECT 1 FROM users WHERE role = 'ADMIN')";
    const { rows } = await pool.query(query);
    return rows[0].exists;
  }

  async updateUser(id: number, updates: { name?: string, email?: string, passwordHash?: string, role?: string, hotelId?: number | null }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(updates.email);
      paramIndex++;
    }

    if (updates.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramIndex}`);
      values.push(updates.passwordHash);
      paramIndex++;
    }

    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      values.push(updates.role);
      paramIndex++;
    }

    if (updates.hotelId !== undefined) {
      fields.push(`hotel_id = $${paramIndex}`);
      values.push(updates.hotelId);
      paramIndex++;
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, hotel_id, created_at
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findStaffByHotelId(hotelId: number) {
    const query = "SELECT id, name, email, role, hotel_id as \"hotelId\", created_at FROM users WHERE role = 'HOTEL_STAFF' AND hotel_id = $1";
    const { rows } = await pool.query(query, [hotelId]);
    return rows;
  }

  async updateStaff(id: number, updates: { name?: string, email?: string, passwordHash?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(updates.email);
      paramIndex++;
    }

    if (updates.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramIndex}`);
      values.push(updates.passwordHash);
      paramIndex++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, hotel_id as "hotelId"
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async deleteUser(id: number) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}
