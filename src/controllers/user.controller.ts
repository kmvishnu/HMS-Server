import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

const userService = new UserService();

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { role } = req.query;
  const users = await userService.getUsers(req.user.role, req.user.hotelId, role as string | undefined);
  res.status(200).json({ success: true, data: users });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role, hotelId } = req.body;
  
  if (!req.user) throw new AppError('Unauthorized', 401);

  // Admin can create HOTEL_OWNER or STAFF.
  // HOTEL_OWNER can ONLY create STAFF for their own hotel.
  if (req.user.role === Role.HOTEL_OWNER) {
    if (role !== Role.STAFF) {
      throw new AppError('Hotel owners can only create staff accounts', 403);
    }
    // Override hotelId to ensure they can't assign staff to other hotels
    if (!req.user.hotelId) {
      throw new AppError('Hotel owner is not assigned to a hotel', 400);
    }
    const staffUser = await userService.createUser(name, email, password, role, req.user.hotelId);
    return res.status(201).json({ success: true, data: staffUser });
  }

  if (req.user.role === Role.ADMIN) {
    // Admin can create anyone (though creating STAFF would require passing a hotelId)
    const finalHotelId = role === Role.HOTEL_OWNER ? null : (hotelId || null);
    const newUser = await userService.createUser(name, email, password, role, finalHotelId);
    return res.status(201).json({ success: true, data: newUser });
  }

  throw new AppError('Forbidden', 403);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    throw new AppError('Only super admin can update user information', 403);
  }

  const id = parseInt(req.params.id as string, 10);
  const { name, email, password, role, hotelId } = req.body;

  const updatedUser = await userService.updateUser(id, {
    name,
    email,
    passwordPlain: password,
    role,
    hotelId
  });

  res.status(200).json({ success: true, data: updatedUser });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const id = parseInt(req.params.id as string, 10);
  
  await userService.deleteUser(id, req.user.role, req.user.hotelId);
  
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
