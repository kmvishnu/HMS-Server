import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(name: string, email: string, passwordPlain: string, role: string, hotelId: number | null = null) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const user = await this.userRepository.create(name, email, passwordHash, role, hotelId);
    return user;
  }

  async getUsers(requestUserRole: string, requestUserHotelId: number | null, queryRole?: string) {
    if (requestUserRole === 'HOTEL_OWNER') {
      // Hotel owner can only view STAFF for their own hotel
      if (!requestUserHotelId) return [];
      return await this.userRepository.getUsers('STAFF', requestUserHotelId);
    }
    
    // Admin can view everyone, filter by role if provided
    return await this.userRepository.getUsers(queryRole, undefined);
  }

  async updateUser(id: number, updates: { name?: string, email?: string, passwordPlain?: string, role?: string, hotelId?: number | null }) {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new AppError('User not found', 404);
    }

    if (updates.email && updates.email !== userToUpdate.email) {
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

    const { passwordPlain, ...repoUpdates } = updates;
    
    return await this.userRepository.updateUser(id, {
      ...repoUpdates,
      ...(passwordHash && { passwordHash })
    });
  }

  async deleteUser(id: number, requestUserRole: string, requestUserHotelId: number | null) {
    const userToDelete = await this.userRepository.findById(id);
    if (!userToDelete) {
      throw new AppError('User not found', 404);
    }

    if (requestUserRole === Role.HOTEL_OWNER) {
      if (userToDelete.role !== Role.STAFF || userToDelete.hotel_id !== requestUserHotelId) {
        throw new AppError('You can only delete staff members from your own hotel', 403);
      }
    }

    await this.userRepository.deleteUser(id);
    return true;
  }
}
