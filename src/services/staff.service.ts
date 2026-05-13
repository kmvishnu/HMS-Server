import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class StaffService {
  private userRepository: UserRepository;
  private hotelRepository: HotelRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.hotelRepository = new HotelRepository();
  }

  private async verifyOwner(hotelId: number, ownerId: number, role: string) {
    // Admin bypasses ownership verification
    if (role === Role.ADMIN) return;

    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel || hotel.owner_id !== ownerId) {
      throw new AppError('You do not own this hotel or it does not exist', 403);
    }
    return hotel;
  }

  async createStaff(name: string, email: string, passwordPlain: string, hotelId: number, ownerId: number, role: string) {
    await this.verifyOwner(hotelId, ownerId, role);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    return await this.userRepository.create(name, email, passwordHash, Role.STAFF, hotelId);
  }

  async getStaffByOwnerId(ownerId: number) {
    return await this.userRepository.findStaffByOwnerId(ownerId);
  }

  async getStaffByHotelId(hotelId: number) {
    return await this.userRepository.findStaffByHotelId(hotelId);
  }

  async updateStaff(id: number, hotelId: number | undefined, userId: number, role: string, updates: { name?: string, email?: string, passwordPlain?: string }) {
    const staff = await this.userRepository.findById(id);
    if (!staff || (staff.role !== 'HOTEL_STAFF' && staff.role !== 'STAFF')) {
      throw new AppError('Staff member not found', 404);
    }

    // Verify owner owns the staff's CURRENT hotel (Admins bypass)
    await this.verifyOwner(staff.hotel_id, userId, role);

    // If changing hotel, verify owner owns the NEW hotel too (Admins bypass)
    if (hotelId !== undefined && hotelId !== staff.hotel_id) {
      await this.verifyOwner(hotelId, userId, role);
    }

    if (updates.email && updates.email !== staff.email) {
      const existingUser = await this.userRepository.findByEmail(updates.email);
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    let passwordHash: string | undefined = undefined;
    if (updates.passwordPlain) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(updates.passwordPlain, salt);
    }

    return await this.userRepository.updateStaff(id, {
      name: updates.name,
      email: updates.email,
      passwordHash,
      hotelId: hotelId // Pass hotelId if reassigned
    });
  }

  async deleteStaff(id: number, userId: number, role: string) {
    const staff = await this.userRepository.findById(id);
    if (!staff || (staff.role !== 'HOTEL_STAFF' && staff.role !== 'STAFF')) {
      throw new AppError('Staff member not found', 404);
    }

    // Verify owner owns the staff's hotel (Admins bypass)
    await this.verifyOwner(staff.hotel_id, userId, role);

    return await this.userRepository.deleteUser(id);
  }
}
