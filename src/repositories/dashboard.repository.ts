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
    const usersQuery = "SELECT COUNT(*) FROM users WHERE role != 'SUPER_ADMIN'";
    const hotelsQuery = 'SELECT COUNT(*) FROM hotels WHERE deleted_at IS NULL';
    const bookingsQuery = 'SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL';
    
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
    const today = new Date().toISOString().split('T')[0];

    const todayCheckInsQuery = `
      SELECT COUNT(*) FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 AND b.check_in = $2 AND b.deleted_at IS NULL
    `;

    const todayCheckOutsQuery = `
      SELECT COUNT(*) FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 AND b.check_out = $2 AND b.deleted_at IS NULL
    `;

    const occupancyQuery = `
      SELECT 
        (SELECT SUM(total_rooms) FROM room_types WHERE hotel_id = $1) as total_rooms,
        (SELECT COUNT(*) FROM bookings b 
         JOIN room_types rt ON b.room_type_id = rt.id 
         WHERE rt.hotel_id = $1 AND b.check_in <= $2 AND b.check_out > $2 AND b.deleted_at IS NULL) as booked_today
    `;

    const upcomingBookingsQuery = `
      SELECT b.id, u.name as "guestName", rt.name as "roomType", b.check_in as "checkIn", b.check_out as "checkOut"
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE rt.hotel_id = $1 
        AND b.check_in > $2 
        AND b.check_in <= ($2::date + interval '5 days')::date
        AND b.deleted_at IS NULL
      ORDER BY b.check_in ASC
      LIMIT 5
    `;

    const inventoryAlertsQuery = `
      SELECT rt.id, rt.name, ri.date, ri.available_count, rt.total_rooms
      FROM room_types rt
      JOIN room_inventory ri ON rt.id = ri.room_type_id
      WHERE rt.hotel_id = $1 
        AND ri.date >= $2 
        AND ri.date <= ($2::date + interval '7 days')::date
        AND (ri.available_count < 0 OR (ri.available_count::float / rt.total_rooms::float) < 0.1)
      ORDER BY ri.date ASC
    `;

    const [checkIns, checkOuts, occupancy, upcoming, alerts] = await Promise.all([
      pool.query(todayCheckInsQuery, [hotelId, today]),
      pool.query(todayCheckOutsQuery, [hotelId, today]),
      pool.query(occupancyQuery, [hotelId, today]),
      pool.query(upcomingBookingsQuery, [hotelId, today]),
      pool.query(inventoryAlertsQuery, [hotelId, today])
    ]);

    const totalRooms = parseInt(occupancy.rows[0].total_rooms || 0, 10);
    const bookedToday = parseInt(occupancy.rows[0].booked_today || 0, 10);
    const occupancyRate = totalRooms > 0 ? (bookedToday / totalRooms) * 100 : 0;

    // Process alerts to avoid duplicates per room type in the message
    const processedAlerts = alerts.rows.reduce((acc: any[], curr: any) => {
      const type = curr.available_count < 0 ? 'OVERBOOKED' : 'LOW_AVAILABILITY';
      const message = type === 'OVERBOOKED' 
        ? `Overbooked: ${curr.name} on ${curr.date.toISOString().split('T')[0]}`
        : `Low Availability: ${curr.name} on ${curr.date.toISOString().split('T')[0]} (${curr.available_count} left)`;
      
      // Only keep one alert per room type for brevity in dashboard, or specific per date?
      // Requirement says "Alerts", let's keep it specific but limited.
      if (acc.length < 3) {
        acc.push({ type, message });
      }
      return acc;
    }, []);

    return {
      todayCheckIns: parseInt(checkIns.rows[0].count, 10),
      todayCheckOuts: parseInt(checkOuts.rows[0].count, 10),
      occupancy: {
        totalRooms,
        bookedToday,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      },
      upcomingBookings: upcoming.rows,
      alerts: processedAlerts
    };
  }

  async getHotelsByOwner(ownerId: number) {
    const query = 'SELECT * FROM hotels WHERE owner_id = $1 AND deleted_at IS NULL';
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }
}
