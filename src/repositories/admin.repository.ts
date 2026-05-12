import pool from '../config/db';

export class AdminRepository {
  async getDashboardStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND role != 'SUPER_ADMIN') as total_users,
        (SELECT COUNT(*) FROM hotels WHERE deleted_at IS NULL) as total_hotels,
        (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE check_in = CURRENT_DATE AND deleted_at IS NULL) as active_bookings_today,
        (SELECT COUNT(*) FROM users WHERE role = 'HOTEL_OWNER' AND deleted_at IS NULL) as total_owners,
        (SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND deleted_at IS NULL) as total_customers
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  }

  async findUsers(filters: { role?: string, search?: string }, limit: number, offset: number) {
    let whereClause = "WHERE deleted_at IS NULL AND role != 'SUPER_ADMIN'";
    const params: any[] = [];
    let pIdx = 1;

    if (filters.role) {
      whereClause += ` AND role = $${pIdx++}`;
      params.push(filters.role);
    }

    if (filters.search) {
      whereClause += ` AND (name ILIKE $${pIdx} OR email ILIKE $${pIdx})`;
      params.push(`%${filters.search}%`);
      pIdx++;
    }

    const dataQuery = `
      SELECT id, name, email, role, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;
    
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    return {
      data: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10)
    };
  }

  async findHotels(filters: { location?: string, ownerId?: number }, limit: number, offset: number) {
    let whereClause = 'WHERE h.deleted_at IS NULL';
    const params: any[] = [];
    let pIdx = 1;

    if (filters.location) {
      whereClause += ` AND h.location ILIKE $${pIdx++}`;
      params.push(`%${filters.location}%`);
    }

    if (filters.ownerId) {
      whereClause += ` AND h.owner_id = $${pIdx++}`;
      params.push(filters.ownerId);
    }

    const dataQuery = `
      SELECT h.id, h.name, h.location, h.is_visible, h.created_at,
             u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM hotels h
      JOIN users u ON h.owner_id = u.id
      ${whereClause}
      ORDER BY h.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM hotels h ${whereClause}`;

    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    return {
      data: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10)
    };
  }

  async findBookings(filters: { hotelId?: number, status?: string, startDate?: string, endDate?: string }, limit: number, offset: number) {
    let whereClause = 'WHERE b.deleted_at IS NULL';
    const params: any[] = [];
    let pIdx = 1;

    if (filters.hotelId) {
      whereClause += ` AND rt.hotel_id = $${pIdx++}`;
      params.push(filters.hotelId);
    }

    if (filters.status) {
      whereClause += ` AND b.status = $${pIdx++}`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      whereClause += ` AND b.check_in >= $${pIdx++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND b.check_out <= $${pIdx++}`;
      params.push(filters.endDate);
    }

    const dataQuery = `
      SELECT b.id, b.check_in, b.check_out, b.status, b.total_amount, b.created_at,
             u.name as user_name, u.email as user_email, u.id as user_id,
             rt.name as room_type_name,
             h.name as hotel_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      ${whereClause}
    `;

    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    return {
      data: dataRes.rows,
      total: parseInt(countRes.rows[0].count, 10)
    };
  }

  async getHotelFullDetails(id: number, bLimit: number, bOffset: number) {
    const hotelQuery = `
      SELECT h.id, h.name, h.location, h.is_visible, h.features, h.image_urls,
             u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM hotels h
      JOIN users u ON h.owner_id = u.id
      WHERE h.id = $1 AND h.deleted_at IS NULL
    `;

    const roomTypesQuery = `
      SELECT rt.id, rt.name, rt.price, rt.total_rooms,
             COALESCE(json_agg(rti.image_url) FILTER (WHERE rti.image_url IS NOT NULL), '[]') as images
      FROM room_types rt
      LEFT JOIN room_type_images rti ON rt.id = rti.room_type_id
      WHERE rt.hotel_id = $1
      GROUP BY rt.id
    `;

    const bookingsQuery = `
      SELECT b.id, b.check_in, b.check_out, b.status, b.total_amount,
             u.name as user_name, u.email as user_email,
             rt.name as room_type_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 AND b.deleted_at IS NULL
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const bookingsCountQuery = `
      SELECT COUNT(*) FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 AND b.deleted_at IS NULL
    `;

    const [hotelRes, roomTypesRes, bookingsRes, countRes] = await Promise.all([
      pool.query(hotelQuery, [id]),
      pool.query(roomTypesQuery, [id]),
      pool.query(bookingsQuery, [id, bLimit, bOffset]),
      pool.query(bookingsCountQuery, [id])
    ]);

    if (hotelRes.rows.length === 0) return null;

    return {
      hotel: hotelRes.rows[0],
      roomTypes: roomTypesRes.rows,
      bookings: bookingsRes.rows,
      bookingPagination: {
        total: parseInt(countRes.rows[0].count, 10)
      }
    };
  }

  async getOwnerDetails(id: number) {
    const hotelsQuery = `
      SELECT id, name, location, is_visible
      FROM hotels
      WHERE owner_id = $1 AND deleted_at IS NULL
    `;

    const staffQuery = `
      SELECT id, name, email, hotel_id as "hotelId"
      FROM users
      WHERE role = 'STAFF' AND hotel_id IN (SELECT id FROM hotels WHERE owner_id = $1 AND deleted_at IS NULL)
      AND deleted_at IS NULL
    `;

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT h.id) as total_hotels,
        COUNT(b.id) as total_bookings,
        COUNT(CASE WHEN b.status = 'CONFIRMED' AND b.check_out >= CURRENT_DATE THEN 1 END) as active_bookings
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotel_id
      LEFT JOIN bookings b ON rt.id = b.room_type_id AND b.deleted_at IS NULL
      WHERE h.owner_id = $1 AND h.deleted_at IS NULL
    `;

    const [hotelsRes, staffRes, statsRes] = await Promise.all([
      pool.query(hotelsQuery, [id]),
      pool.query(staffQuery, [id]),
      pool.query(statsQuery, [id])
    ]);

    return {
      hotels: hotelsRes.rows,
      staff: staffRes.rows,
      stats: statsRes.rows[0]
    };
  }

  async getCustomerDetails(id: number) {
    const bookingsQuery = `
      SELECT b.id, b.check_in, b.check_out, b.status, b.total_amount,
             rt.name as room_type_name, rt.id as room_type_id,
             h.name as hotel_name, h.id as hotel_id
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE b.user_id = $1 AND b.deleted_at IS NULL
      ORDER BY b.created_at DESC
    `;

    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' AND check_in >= CURRENT_DATE THEN 1 END) as upcoming_bookings,
        COUNT(CASE WHEN status = 'CHECKED_OUT' OR (status = 'CONFIRMED' AND check_out < CURRENT_DATE) THEN 1 END) as completed_bookings
      FROM bookings
      WHERE user_id = $1 AND deleted_at IS NULL
    `;

    const [bookingsRes, statsRes] = await Promise.all([
      pool.query(bookingsQuery, [id]),
      pool.query(statsQuery, [id])
    ]);

    return {
      bookings: bookingsRes.rows.map(b => ({
        id: b.id,
        hotel: { id: b.hotel_id, name: b.hotel_name },
        roomType: { id: b.room_type_id, name: b.room_type_name },
        checkIn: b.check_in,
        checkOut: b.check_out,
        status: b.status,
        totalAmount: b.total_amount
      })),
      stats: statsRes.rows[0]
    };
  }

  async getStaffDetails(id: number) {
    const query = `
      SELECT h.id, h.name, h.location
      FROM users u
      JOIN hotels h ON u.hotel_id = h.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `;
    const { rows } = await pool.query(query, [id]);
    return { hotel: rows[0] || null };
  }

  async globalSearch(query: string) {
    const searchPattern = `%${query}%`;
    
    const usersQuery = `
      SELECT id, name, email, role 
      FROM users 
      WHERE (name ILIKE $1 OR email ILIKE $1) AND deleted_at IS NULL AND role != 'SUPER_ADMIN'
      LIMIT 10
    `;

    const hotelsQuery = `
      SELECT id, name, location 
      FROM hotels 
      WHERE (name ILIKE $1 OR location ILIKE $1) AND deleted_at IS NULL
      LIMIT 10
    `;

    const bookingsQuery = `
      SELECT b.id, b.status, u.name as user_name, h.name as hotel_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE (u.name ILIKE $1 OR h.name ILIKE $1) AND b.deleted_at IS NULL
      LIMIT 10
    `;

    const [usersRes, hotelsRes, bookingsRes] = await Promise.all([
      pool.query(usersQuery, [searchPattern]),
      pool.query(hotelsQuery, [searchPattern]),
      pool.query(bookingsQuery, [searchPattern])
    ]);

    return {
      users: usersRes.rows,
      hotels: hotelsRes.rows,
      bookings: bookingsRes.rows
    };
  }

  async softDeleteUser(id: number) {
    const query = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND role != 'SUPER_ADMIN' RETURNING id";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async softDeleteHotel(id: number) {
    const query = 'UPDATE hotels SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}
