import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const staffService = new StaffService();

export const createStaff = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, hotelId } = req.body;
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { userId, role } = req.user;

  if (!hotelId) {
    throw new AppError('hotelId is required', 400);
  }

  const staff = await staffService.createStaff(name, email, password, hotelId, userId, role);

  res.status(201).json({
    success: true,
    data: staff
  });
});

export const getStaffList = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const ownerId = req.user.userId;

  const staff = await staffService.getStaffByOwnerId(ownerId);

  res.status(200).json({
    success: true,
    data: staff
  });
});

export const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { userId, role } = req.user;
  const { name, email, password, hotelId } = req.body;

  const staff = await staffService.updateStaff(parseInt(id as string), hotelId, userId, role, { 
    name, 
    email, 
    passwordPlain: password 
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

export const deleteStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { userId, role } = req.user;

  await staffService.deleteStaff(parseInt(id as string), userId, role);

  res.status(204).json({
    success: true,
    data: null
  });
});
