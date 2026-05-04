import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { catchAsync } from '../utils/catchAsync';
import { Role } from '../types';
import { AppError } from '../utils/AppError';

const dashboardService = new DashboardService();

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { role, userId, hotelId } = req.user;
  
  let data;

  switch (role) {
    case Role.CUSTOMER:
      data = await dashboardService.getCustomerDashboard(userId);
      break;

    case Role.ADMIN:
      data = await dashboardService.getAdminDashboard();
      break;

    case Role.STAFF:
      if (!hotelId) throw new AppError('Staff member is not assigned to any hotel', 400);
      data = await dashboardService.getHotelDashboard(hotelId);
      break;

    case Role.HOTEL_OWNER:
      // Check if a specific hotel is requested via query
      const requestedHotelId = req.query.hotelId ? parseInt(req.query.hotelId as string, 10) : undefined;
      data = await dashboardService.getOwnerDashboard(userId, requestedHotelId);
      break;

    default:
      throw new AppError('Invalid role', 400);
  }

  res.status(200).json({ success: true, data });
});
