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
    const roomType = await this.hotelRepository.getRoomTypeById(roomTypeId);
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

  async getInventoryCalendar(hotelId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      throw new AppError('Calendar range cannot exceed 30 days', 400);
    }

    return await this.inventoryRepository.getInventoryCalendar(hotelId, startDate, endDate);
  }

  async updateInventory(roomTypeId: number, startDate: string, endDate: string, availableCount: number) {
    if (availableCount < 0) {
      throw new AppError('Available count cannot be negative', 400);
    }

    // Wrap in a simple check to ensure room type exists
    const roomType = await this.hotelRepository.getRoomTypeById(roomTypeId);
    if (!roomType) throw new AppError('Room type not found', 404);

    return await this.inventoryRepository.updateInventory(roomTypeId, startDate, endDate, availableCount);
  }
}
