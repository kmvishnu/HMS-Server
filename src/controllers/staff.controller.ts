import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { catchAsync } from '../utils/catchAsync';

const staffService = new StaffService();

export const createStaff = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, hotelId } = req.body;
  const ownerId = (req as any).user.userId;

  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'hotelId is required' });
  }

  const staff = await staffService.createStaff(name, email, password, hotelId, ownerId);

  res.status(201).json({
    success: true,
    data: staff
  });
});

export const getStaffList = catchAsync(async (req: Request, res: Response) => {
  const ownerId = (req as any).user.userId;

  const staff = await staffService.getStaffByOwnerId(ownerId);

  res.status(200).json({
    success: true,
    data: staff
  });
});

export const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = (req as any).user.userId;
  const { name, email, password, hotelId } = req.body;

  const staff = await staffService.updateStaff(parseInt(id as string), hotelId, ownerId, { 
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
  const ownerId = (req as any).user.userId;

  await staffService.deleteStaff(parseInt(id as string), ownerId);

  res.status(204).json({
    success: true,
    data: null
  });
});
