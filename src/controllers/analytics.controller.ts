import { Request, Response } from 'express';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const analyticsRepo = new AnalyticsRepository();

export const getHotelAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const id = parseInt(hotelId as string, 10);

  if (isNaN(id)) {
    throw new AppError('Invalid hotel ID', 400);
  }

  const [occupancy, bookings] = await Promise.all([
    analyticsRepo.getWeeklyOccupancy(id),
    analyticsRepo.getDailyBookings(id)
  ]);

  // Calculate average occupancy rate over the last 7 days
  const avgOccupancy = occupancy.length > 0 
    ? occupancy.reduce((acc: number, curr: any) => acc + (curr.occupancy_rate || 0), 0) / occupancy.length 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      occupancyRate: Math.round(avgOccupancy * 100) / 100,
      bookingsPerDay: bookings,
      dailyTrends: occupancy // Detailed daily occupancy for charts
    }
  });
});
