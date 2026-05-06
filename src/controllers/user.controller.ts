import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

const userService = new UserService();

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.ADMIN) throw new AppError('Unauthorized', 403);
  const { role } = req.query;
  const users = await userService.getUsers(role as string | undefined);
  res.status(200).json({ success: true, data: users });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role, hotelId } = req.body;
  
  if (!req.user || req.user.role !== Role.ADMIN) throw new AppError('Unauthorized', 403);

  // Admin can create anyone (though creating STAFF would require passing a hotelId)
  const finalHotelId = role === Role.HOTEL_OWNER ? null : (hotelId || null);
  const newUser = await userService.createUser(name, email, password, role, finalHotelId);
  return res.status(201).json({ success: true, data: newUser });
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
  if (!req.user || req.user.role !== Role.ADMIN) throw new AppError('Unauthorized', 403);
  const id = parseInt(req.params.id as string, 10);
  
  await userService.deleteUser(id);
  
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
