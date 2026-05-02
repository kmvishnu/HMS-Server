import { BookingRepository } from '../repositories/booking.repository';
import { AppError } from '../utils/AppError';

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(userId: number, roomTypeId: number, checkIn: string, checkOut: string) {
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new AppError('Check-out must be after check-in', 400);
    }
    return await this.bookingRepository.createBooking(userId, roomTypeId, checkIn, checkOut);
  }

  async getUserBookings(userId: number) {
    return await this.bookingRepository.getUserBookings(userId);
  }
}
