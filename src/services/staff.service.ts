import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class StaffService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createStaff(name: string, email: string, passwordPlain: string, hotelId: number) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    return await this.userRepository.create(name, email, passwordHash, 'HOTEL_STAFF', hotelId);
  }

  async getStaffByHotelId(hotelId: number) {
    return await this.userRepository.findStaffByHotelId(hotelId);
  }

  async updateStaff(id: number, hotelId: number, updates: { name?: string, email?: string, passwordPlain?: string }) {
    const staff = await this.userRepository.findById(id);
    if (!staff || staff.hotel_id !== hotelId || staff.role !== 'HOTEL_STAFF') {
      throw new AppError('Staff member not found or access denied', 404);
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
      passwordHash
    });
  }

  async deleteStaff(id: number, hotelId: number) {
    const staff = await this.userRepository.findById(id);
    if (!staff || staff.hotel_id !== hotelId || staff.role !== 'HOTEL_STAFF') {
      throw new AppError('Staff member not found or access denied', 404);
    }

    return await this.userRepository.deleteUser(id);
  }
}
