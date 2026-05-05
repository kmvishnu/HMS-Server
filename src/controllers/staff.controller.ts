import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { catchAsync } from '../utils/catchAsync';

const staffService = new StaffService();

export const createStaff = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const hotelId = (req as any).user.hotelId;

  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'Owner must be linked to a hotel' });
  }

  const staff = await staffService.createStaff(name, email, password, hotelId);

  res.status(201).json({
    success: true,
    data: staff
  });
});

export const getStaffList = catchAsync(async (req: Request, res: Response) => {
  const hotelId = (req as any).user.hotelId;

  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'Owner must be linked to a hotel' });
  }

  const staff = await staffService.getStaffByHotelId(hotelId);

  res.status(200).json({
    success: true,
    data: staff
  });
});

export const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const hotelId = (req as any).user.hotelId;
  const { name, email, password } = req.body;

  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'Owner must be linked to a hotel' });
  }

  const staff = await staffService.updateStaff(parseInt(id as string), hotelId, { 
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
  const hotelId = (req as any).user.hotelId;

  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'Owner must be linked to a hotel' });
  }

  await staffService.deleteStaff(parseInt(id as string), hotelId);

  res.status(204).json({
    success: true,
    data: null
  });
});
