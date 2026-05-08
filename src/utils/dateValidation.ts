import { AppError } from './AppError';

export const validateDateRange = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) {
    throw new AppError('Check-in and check-out dates are required', 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  if (checkInDate < today) {
    throw new AppError('Check-in date cannot be in the past', 400);
  }

  if (checkInDate >= checkOutDate) {
    throw new AppError('Check-out date must be after check-in date', 400);
  }

  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    throw new AppError('Maximum booking window is 30 days', 400);
  }

  if (diffDays < 1) {
    throw new AppError('Minimum stay is 1 night', 400);
  }

  return { checkInDate, checkOutDate, nights: diffDays };
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
