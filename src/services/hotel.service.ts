import { HotelRepository } from '../repositories/hotel.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { AppError } from '../utils/AppError';

export class HotelService {
  private hotelRepository: HotelRepository;
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.hotelRepository = new HotelRepository();
    this.inventoryRepository = new InventoryRepository();
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

  async getHotelDetails(id: number, checkIn?: string, checkOut?: string) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel || !hotel.is_visible) {
      throw new AppError('Hotel not found', 404);
    }
    const roomTypes = await this.hotelRepository.getRoomTypesByHotelId(id, checkIn, checkOut);
    return { ...hotel, roomTypes };
  }

  async createHotel(name: string, location: string, ownerId: number, imageUrls: string[]) {
    return await this.hotelRepository.createHotel(name, location, ownerId, imageUrls);
  }

  async updateHotel(id: number, name?: string, location?: string, ownerId?: number | null, reqBody: any = {}) {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    return await this.hotelRepository.updateHotel(id, name, location, ownerId, reqBody);
  }

  async createRoomType(hotelId: number, name: string, totalRooms: number, price: number) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    
    // 1. Create the room type
    const roomType = await this.hotelRepository.createRoomType(hotelId, name, totalRooms, price);

    // 2. Automatically initialize 90 days of inventory
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 90);

    await this.inventoryRepository.initInventory(
      roomType.id, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0], 
      totalRooms
    );

    return roomType;
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

  async getProfileCompleteness(hotelId: number) {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) throw new AppError('Hotel not found', 404);

    const roomTypes = await this.hotelRepository.getRoomTypesByHotelId(hotelId);
    
    const missingFields: string[] = [];
    let score = 0;
    const totalPoints = 3;

    if (hotel.image_urls && hotel.image_urls.length > 0) {
      score++;
    } else {
      missingFields.push('images');
    }

    if (hotel.features && hotel.features.length > 0) {
      score++;
    } else {
      missingFields.push('features');
    }

    if (roomTypes.length > 0) {
      score++;
    } else {
      missingFields.push('roomTypes');
    }

    return {
      completionPercentage: Math.round((score / totalPoints) * 100),
      missingFields
    };
  }

  async updateRoomType(id: number, name?: string, totalRooms?: number, price?: number) {
    return await this.hotelRepository.updateRoomType(id, name, totalRooms, price);
  }

  async deleteRoomType(id: number) {
    return await this.hotelRepository.deleteRoomType(id);
  }

  async addRoomTypeImage(roomTypeId: number, base64Image: string) {
    const images = await this.hotelRepository.getRoomTypeImages(roomTypeId);
    if (images.length >= 3) {
      throw new AppError('Maximum 3 images allowed per room type', 400);
    }
    return await this.hotelRepository.addRoomTypeImage(roomTypeId, base64Image);
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

  async getHotelSettings(hotelId: number) {
    const hotel = await this.hotelRepository.getHotelSettings(hotelId);
    if (!hotel) throw new AppError('Hotel not found', 404);

    // Map to camelCase
    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        contactEmail: hotel.contact_email,
        address: hotel.address,
        isVisible: hotel.is_visible,
        features: hotel.features || [],
        images: hotel.image_urls || []
      },
      roomTypes: (hotel.room_types || []).map((rt: any) => ({
        id: rt.id,
        name: rt.name,
        price: rt.price,
        totalRooms: rt.total_rooms,
        images: rt.images || []
      }))
    };
  }
}
