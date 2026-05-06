import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { catchAsync } from '../utils/catchAsync';
import { Role } from '../types';
import { AppError } from '../utils/AppError';

const dashboardService = new DashboardService();

export const getGlobalDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { role, userId } = req.user;
  
  let data;

  if (role === Role.CUSTOMER) {
    data = await dashboardService.getCustomerDashboard(userId);
  } else if (role === Role.ADMIN) {
    data = await dashboardService.getAdminDashboard();
  } else {
    throw new AppError('This endpoint is not for your role. Use the scoped dashboard instead.', 400);
  }

  res.status(200).json({ success: true, data });
});

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.hotelId as string, 10);
  if (isNaN(hotelId)) {
    throw new AppError('Invalid hotel ID', 400);
  }

  const data = await dashboardService.getHotelDashboard(hotelId);
  res.status(200).json({ success: true, data });
});
