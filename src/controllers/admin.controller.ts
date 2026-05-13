import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const adminService = new AdminService();

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const filters = {
    role: req.query.role as string,
    search: req.query.search as string
  };

  const result = await adminService.getUsers(filters, page, limit);
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: { page, limit, total: result.total }
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  const user = await adminService.updateUser(id, req.body);
  res.status(200).json({ success: true, data: user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  await adminService.deleteUser(id);
  res.status(204).send();
});

export const getHotels = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const filters = {
    location: req.query.location as string,
    ownerId: req.query.ownerId ? parseInt(req.query.ownerId as string, 10) : undefined
  };

  const result = await adminService.getHotels(filters, page, limit);
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: { page, limit, total: result.total }
  });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  const bPage = parseInt(req.query.bPage as string || '1', 10);
  const bLimit = parseInt(req.query.bLimit as string || '5', 10);

  const result = await adminService.getHotelDetails(id, bPage, bLimit);
  res.status(200).json({ success: true, data: result });
});

export const updateHotelVisibility = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  const hotel = await adminService.updateHotelVisibility(id, req.body.isVisible);
  res.status(200).json({ success: true, data: hotel });
});

export const deleteHotel = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  await adminService.deleteHotel(id);
  res.status(204).send();
});

export const getBookings = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const filters = {
    hotelId: req.query.hotelId ? parseInt(req.query.hotelId as string, 10) : undefined,
    status: req.query.status as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };

  const result = await adminService.getBookings(filters, page, limit);
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: { page, limit, total: result.total }
  });
});

export const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new AppError('Invalid ID', 400);
  const user = await adminService.getUserDetails(id);
  res.status(200).json({ success: true, data: user });
});

export const globalSearch = catchAsync(async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = await adminService.globalSearch(query);
  res.status(200).json({ success: true, data: results });
});
