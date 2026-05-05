import pool from '../config/db';

export class DashboardRepository {
  async getCustomerBookings(userId: number) {
    const upcomingQuery = `
      SELECT b.*, rt.name as room_type_name, h.name as hotel_name 
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE b.user_id = $1 AND b.check_in >= CURRENT_DATE
      ORDER BY b.check_in ASC
    `;
    const pastQuery = `
      SELECT b.*, rt.name as room_type_name, h.name as hotel_name 
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE b.user_id = $1 AND b.check_in < CURRENT_DATE
      ORDER BY b.check_in DESC
    `;
    
    const [upcoming, past] = await Promise.all([
      pool.query(upcomingQuery, [userId]),
      pool.query(pastQuery, [userId])
    ]);
    
    return {
      upcomingBookings: upcoming.rows,
      pastBookings: past.rows
    };
  }

  async getAdminStats() {
    const usersQuery = 'SELECT COUNT(*) FROM users';
    const hotelsQuery = 'SELECT COUNT(*) FROM hotels';
    const bookingsQuery = 'SELECT COUNT(*) FROM bookings';
    
    const [users, hotels, bookings] = await Promise.all([
      pool.query(usersQuery),
      pool.query(hotelsQuery),
      pool.query(bookingsQuery)
    ]);
    
    return {
      totalUsers: parseInt(users.rows[0].count, 10),
      totalHotels: parseInt(hotels.rows[0].count, 10),
      totalBookings: parseInt(bookings.rows[0].count, 10)
    };
  }

  async getHotelStats(hotelId: number) {
    const todayQuery = `
      SELECT b.*, u.name as customer_name, rt.name as room_type_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 
        AND b.check_in <= CURRENT_DATE 
        AND b.check_out > CURRENT_DATE
    `;
    
    const upcomingQuery = `
      SELECT b.*, u.name as customer_name, rt.name as room_type_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 
        AND b.check_in > CURRENT_DATE
      ORDER BY b.check_in ASC
      LIMIT 10
    `;

    const totalRoomsQuery = `
      SELECT SUM(total_rooms) as total FROM room_types WHERE hotel_id = $1
    `;

    const [today, upcoming, totalRoomsResult] = await Promise.all([
      pool.query(todayQuery, [hotelId]),
      pool.query(upcomingQuery, [hotelId]),
      pool.query(totalRoomsQuery, [hotelId])
    ]);

    const totalRooms = parseInt(totalRoomsResult.rows[0].total || 0, 10);
    const bookedRoomsToday = today.rows.length;

    return {
      todayBookings: today.rows,
      upcomingBookings: upcoming.rows,
      occupancy: {
        totalRooms,
        bookedToday: bookedRoomsToday
      }
    };
  }

  async getHotelsByOwner(ownerId: number) {
    const query = 'SELECT * FROM hotels WHERE owner_id = $1';
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }
}
