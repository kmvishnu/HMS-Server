import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { catchAsync } from '../utils/catchAsync';

const bookingService = new BookingService();

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, checkIn, checkOut, guests } = req.body;
  
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const booking = await bookingService.createBooking(
    req.user.userId,
    roomTypeId,
    checkIn,
    checkOut,
    guests
  );

  res.status(201).json({ success: true, data: booking });
});

export const getHotelBookings = catchAsync(async (req: Request, res: Response) => {
  const { filter } = req.query;
  const hotelId = parseInt(req.params.hotelId as string, 10);

  if (isNaN(hotelId)) {
    return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
  }

  const bookings = await bookingService.getHotelBookings(hotelId, filter as string);
  res.status(200).json({ success: true, data: bookings });
});

export const checkin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await bookingService.checkin(parseInt(id as string));
  res.status(200).json({ success: true, data: booking });
});

export const checkout = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await bookingService.checkout(parseInt(id as string));
  res.status(200).json({ success: true, data: booking });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const bookings = await bookingService.getUserBookings(req.user.userId);
  res.status(200).json({ success: true, data: bookings });
});
