import { AdminRepository } from '../repositories/admin.repository';
import { UserRepository } from '../repositories/user.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepo: AdminRepository;
  private userRepo: UserRepository;
  private hotelRepo: HotelRepository;

  constructor() {
    this.adminRepo = new AdminRepository();
    this.userRepo = new UserRepository();
    this.hotelRepo = new HotelRepository();
  }

  async getDashboardStats() {
    return await this.adminRepo.getDashboardStats();
  }

  async getUsers(filters: any, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.adminRepo.findUsers(filters, limit, offset);
  }

  async createUser(userData: any) {
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);
    
    // Combine names if provided separately
    const fullName = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : (userData.name || 'User');

    return await this.userRepo.create(
      fullName,
      userData.email,
      passwordHash,
      userData.role || 'CUSTOMER',
      userData.hotelId || null
    );
  }

  async updateUser(id: number, updateData: any) {
    const user = await this.userRepo.findById(id);
    if (!user || user.role === 'SUPER_ADMIN') {
      throw new AppError('User not found or access denied', 404);
    }
    return await this.userRepo.updateUser(id, updateData);
  }

  async deleteUser(id: number) {
    return await this.adminRepo.softDeleteUser(id);
  }

  async getHotels(filters: any, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.adminRepo.findHotels(filters, limit, offset);
  }

  async getHotelDetails(id: number, bPage: number, bLimit: number) {
    const bOffset = (bPage - 1) * bLimit;
    const details = await this.adminRepo.getHotelFullDetails(id, bLimit, bOffset);
    if (!details) throw new AppError('Hotel not found', 404);
    
    return {
      ...details,
      bookingPagination: {
        ...details.bookingPagination,
        page: bPage,
        limit: bLimit
      }
    };
  }

  async updateHotel(id: number, hotelData: any) {
    const hotel = await this.hotelRepo.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }
    return await this.hotelRepo.updateHotel(id, hotelData.name, hotelData.location, hotelData.ownerId);
  }

  async updateHotelVisibility(id: number, isVisible: boolean) {
    return await this.hotelRepo.updateVisibility(id, isVisible);
  }

  async deleteHotel(id: number) {
    const hotel = await this.hotelRepo.findById(id);
    if (!hotel) throw new AppError('Hotel not found', 404);
    return await this.adminRepo.softDeleteHotel(id);
  }

  async getBookings(filters: any, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.adminRepo.findBookings(filters, limit, offset);
  }

  async getUserDetails(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user || user.role === 'SUPER_ADMIN') {
      throw new AppError('User not found', 404);
    }

    let details = {};

    switch (user.role) {
      case 'HOTEL_OWNER':
        details = await this.adminRepo.getOwnerDetails(id);
        break;
      case 'CUSTOMER':
        details = await this.adminRepo.getCustomerDetails(id);
        break;
      case 'STAFF':
        details = await this.adminRepo.getStaffDetails(id);
        break;
      case 'ADMIN':
        // Minimal info for other admins
        details = {};
        break;
      default:
        details = {};
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      details
    };
  }

  async globalSearch(query: string) {
    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }
    return await this.adminRepo.globalSearch(query);
  }
}
