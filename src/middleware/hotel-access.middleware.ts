import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export const restrictToHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('You are not logged in!', 401));
    }

    const hotelId = parseInt(req.params.hotelId as string, 10);
    if (isNaN(hotelId)) {
      return next(new AppError('Invalid hotel ID', 400));
    }

    // Admin has access to all hotels
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    if (req.user.role === Role.HOTEL_OWNER) {
      // Check if the owner owns this hotel
      const query = 'SELECT id FROM hotels WHERE id = $1 AND owner_id = $2';
      const { rows } = await pool.query(query, [hotelId, req.user.userId]);

      if (rows.length === 0) {
        return next(new AppError('You do not own this hotel or it does not exist', 403));
      }

      return next();
    }

    if (req.user.role === Role.STAFF) {
      // Check if the staff belongs to this hotel
      const query = 'SELECT hotel_id FROM users WHERE id = $1';
      const { rows } = await pool.query(query, [req.user.userId]);

      if (rows.length === 0 || rows[0].hotel_id !== hotelId) {
        return next(new AppError('You do not have access to this hotel', 403));
      }

      return next();
    }

    // Customers or any other role should not access scoped operational APIs
    return next(new AppError('You do not have permission to access this resource', 403));

  } catch (error) {
    return next(new AppError('Failed to authorize hotel access', 500));
  }
};
