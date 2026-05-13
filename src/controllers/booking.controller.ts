import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { catchAsync } from '../utils/catchAsync';
import { validateDateRange } from '../utils/dateValidation';
import { AppError } from '../utils/AppError';

const bookingService = new BookingService();

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, checkIn, checkOut, guests, notes } = req.body;
  
  validateDateRange(checkIn, checkOut);
  
  if (!req.user) throw new AppError('Unauthorized', 401);

  const booking = await bookingService.createBooking(
    req.user.userId,
    roomTypeId,
    checkIn,
    checkOut,
    guests,
    notes
  );

  res.status(201).json({ success: true, data: booking });
});

export const updateBookingNotes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const booking = await bookingService.updateBookingNotes(parseInt(id as string), notes);
  res.status(200).json({ success: true, data: booking });
});

export const getBookingPreview = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, checkIn, checkOut } = req.body;
  validateDateRange(checkIn, checkOut);
  const preview = await bookingService.getBookingPreview(roomTypeId, checkIn, checkOut);
  res.status(200).json({ success: true, data: preview });
});

export const getHotelBookings = catchAsync(async (req: Request, res: Response) => {
  const { filter, startDate, endDate, status } = req.query;
  const hotelId = parseInt(req.params.hotelId as string, 10);

  if (isNaN(hotelId)) {
    throw new AppError('Invalid hotel ID', 400);
  }

  const bookings = await bookingService.getHotelBookings(hotelId, {
    filter: filter as string,
    startDate: startDate as string,
    endDate: endDate as string,
    status: status as string
  });
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
  if (!req.user) throw new AppError('Unauthorized', 401);

  const bookings = await bookingService.getUserBookings(req.user.userId);
  res.status(200).json({ success: true, data: bookings });
});
