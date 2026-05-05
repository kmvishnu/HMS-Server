import { BookingRepository } from '../repositories/booking.repository';
import { AppError } from '../utils/AppError';

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(userId: number, roomTypeId: number, checkIn: string, checkOut: string, guests: { name: string, age: number }[]) {
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new AppError('Check-out must be after check-in', 400);
    }
    if (!guests || guests.length === 0) {
      throw new AppError('Guest list is required', 400);
    }
    return await this.bookingRepository.createBooking(userId, roomTypeId, checkIn, checkOut, guests);
  }

  async getHotelBookings(hotelId: number, filter?: string) {
    return await this.bookingRepository.getHotelBookings(hotelId, filter);
  }

  async checkin(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    return await this.bookingRepository.updateBookingStatus(bookingId, 'CHECKED_IN');
  }

  async checkout(bookingId: number) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    return await this.bookingRepository.updateBookingStatus(bookingId, 'CHECKED_OUT');
  }

  async getUserBookings(userId: number) {
    return await this.bookingRepository.getUserBookings(userId);
  }
}
