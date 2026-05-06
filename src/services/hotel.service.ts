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

  async getOwnedHotels(ownerId: number) {
    return await this.hotelRepository.getHotelsByOwner(ownerId);
  }

  async getRoomTypes(hotelId: number) {
    return await this.hotelRepository.getRoomTypesByHotelId(hotelId);
  }

  async getHotelDetails(id: number) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    const roomTypes = await this.hotelRepository.getRoomTypesByHotelId(id);
    return { ...hotel, roomTypes };
  }

  async createHotel(name: string, location: string, ownerId: number, imageUrls: string[]) {
    return await this.hotelRepository.createHotel(name, location, ownerId, imageUrls);
  }

  async updateHotel(id: number, name?: string, location?: string, ownerId?: number | null) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    return await this.hotelRepository.updateHotel(id, name, location, ownerId);
  }

  async createRoomType(hotelId: number, name: string, totalRooms: number, price: number) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    return await this.hotelRepository.createRoomType(hotelId, name, totalRooms, price);
  }

  async updateVisibility(id: number, isVisible: boolean) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) throw new AppError('Hotel not found', 404);
    return await this.hotelRepository.updateVisibility(id, isVisible);
  }

  async updateFeatures(id: number, features: string[]) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) throw new AppError('Hotel not found', 404);
    return await this.hotelRepository.updateFeatures(id, features);
  }

  async updateRoomType(id: number, name?: string, totalRooms?: number, price?: number) {
    return await this.hotelRepository.updateRoomType(id, name, totalRooms, price);
  }

  async deleteRoomType(id: number) {
    return await this.hotelRepository.deleteRoomType(id);
  }

  async addRoomTypeImage(roomTypeId: number, imageUrl: string) {
    const images = await this.hotelRepository.getRoomTypeImages(roomTypeId);
    if (images.length >= 3) {
      throw new AppError('Maximum 3 images allowed per room type', 400);
    }
    return await this.hotelRepository.addRoomTypeImage(roomTypeId, imageUrl);
  }

  async deleteRoomTypeImage(id: number) {
    return await this.hotelRepository.deleteRoomTypeImage(id);
  }

  async addHotelImage(hotelId: number, userId: number, role: string, fileUrl: string) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) throw new AppError('Hotel not found', 404);

    if (role === 'HOTEL_OWNER' && hotel.owner_id !== userId) {
      throw new AppError('You do not have permission to edit this hotel', 403);
    }

    const currentImages = hotel.image_urls || [];
    if (currentImages.length >= 5) {
      throw new AppError('Maximum of 5 images allowed', 400);
    }

    currentImages.push(fileUrl);
    return await this.hotelRepository.updateImages(hotelId, currentImages);
  }

  async replaceHotelImage(hotelId: number, userId: number, role: string, oldUrl: string, newUrl: string) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) throw new AppError('Hotel not found', 404);

    if (role === 'HOTEL_OWNER' && hotel.owner_id !== userId) {
      throw new AppError('You do not have permission to edit this hotel', 403);
    }

    let currentImages = hotel.image_urls || [];
    const index = currentImages.indexOf(oldUrl);
    if (index === -1) {
      throw new AppError('Old image URL not found', 404);
    }

    currentImages[index] = newUrl;
    return await this.hotelRepository.updateImages(hotelId, currentImages);
  }

  async deleteHotelImage(hotelId: number, userId: number, role: string, url: string) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) throw new AppError('Hotel not found', 404);

    if (role === 'HOTEL_OWNER' && hotel.owner_id !== userId) {
      throw new AppError('You do not have permission to edit this hotel', 403);
    }

    let currentImages = hotel.image_urls || [];
    const index = currentImages.indexOf(url);
    if (index === -1) {
      throw new AppError('Image URL not found', 404);
    }

    currentImages.splice(index, 1);
    return await this.hotelRepository.updateImages(hotelId, currentImages);
  }
}
