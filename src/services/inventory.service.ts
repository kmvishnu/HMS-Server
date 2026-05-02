import { InventoryRepository } from '../repositories/inventory.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { AppError } from '../utils/AppError';

export class InventoryService {
  private inventoryRepository: InventoryRepository;
  private hotelRepository: HotelRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
    this.hotelRepository = new HotelRepository();
  }

  async initInventory(roomTypeId: number, startDate: string, endDate: string) {
    // 1. Get room type total rooms
    const query = 'SELECT total_rooms FROM room_types WHERE id = $1';
    const { rows } = await require('../config/db').default.query(query, [roomTypeId]);
    const roomType = rows[0];

    if (!roomType) {
      throw new AppError('Room type not found', 404);
    }

    return await this.inventoryRepository.initInventory(
      roomTypeId,
      startDate,
      endDate,
      roomType.total_rooms
    );
  }

  async getAvailability(hotelId: number, checkIn: string, checkOut: string) {
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new AppError('Check-in date must be before check-out date', 400);
    }
    return await this.inventoryRepository.getAvailability(hotelId, checkIn, checkOut);
  }
}
