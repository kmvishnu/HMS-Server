import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(name: string, email: string, passwordPlain: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const user = await this.userRepository.create(name, email, passwordHash, Role.CUSTOMER);
    
    return user;
  }

  async setupFirstAdmin(name: string, email: string, passwordPlain: string) {
    // Check if any admin exists
    const hasAdmin = await this.userRepository.hasAdmin();
    if (hasAdmin) {
      throw new AppError('An Admin already exists', 400);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const user = await this.userRepository.create(name, email, passwordHash, Role.ADMIN);
    return user;
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user.id, user.role, user.hotel_id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hotelId: user.hotel_id
      },
      ...tokens
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey') as any;
      
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError('User no longer exists', 401);
      }

      const tokens = this.generateTokens(user.id, user.role, user.hotel_id);
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hotelId: user.hotel_id
        },
        ...tokens
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  private generateTokens(userId: number, role: string, hotelId: number | null) {
    const payload = { userId, role, hotelId };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}
