import { HotelRepository } from '../repositories/hotel.repository';
import { AppError } from '../utils/AppError';

export class HotelService {
  private hotelRepository: HotelRepository;

  constructor() {
    this.hotelRepository = new HotelRepository();
  }

  async getAllHotels() {
    return await this.hotelRepository.findAll();
  }

  async getHotelDetails(id: number) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    const roomTypes = await this.hotelRepository.getRoomTypesByHotelId(id);
    return { ...hotel, roomTypes };
  }

  async createHotel(name: string, location: string) {
    return await this.hotelRepository.createHotel(name, location);
  }

  async createRoomType(hotelId: number, name: string, totalRooms: number) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    return await this.hotelRepository.createRoomType(hotelId, name, totalRooms);
  }
}
