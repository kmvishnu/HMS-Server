import { BookingRepository } from '../repositories/booking.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { AppError } from '../utils/AppError';

export class BookingService {
  private bookingRepository: BookingRepository;
  private hotelRepository: HotelRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.hotelRepository = new HotelRepository();
  }

  async createBooking(userId: number, roomTypeId: number, checkIn: string, checkOut: string, guests: { name: string, age: number }[]) {
    const preview = await this.getBookingPreview(roomTypeId, checkIn, checkOut);
    
    if (!guests || guests.length === 0) {
      throw new AppError('Guest list is required', 400);
    }
    
    return await this.bookingRepository.createBookingWithGuests(
      userId, 
      roomTypeId, 
      checkIn, 
      checkOut, 
      guests,
      preview.totalAmount
    );
  }

  async getBookingPreview(roomTypeId: number, checkIn: string, checkOut: string) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (start >= end) {
      throw new AppError('Check-out must be after check-in', 400);
    }

    const roomType = await this.hotelRepository.getRoomTypeById(roomTypeId);
    if (!roomType) {
      throw new AppError('Room type not found', 404);
    }

    const totalNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = parseFloat(roomType.price);
    const totalAmount = totalNights * pricePerNight;

    return {
      totalNights,
      pricePerNight,
      totalAmount
    };
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
