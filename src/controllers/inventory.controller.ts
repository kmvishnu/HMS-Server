import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const inventoryService = new InventoryService();

export const initInventory = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, startDate, endDate } = req.body;
  const result = await inventoryService.initInventory(roomTypeId, startDate, endDate);
  res.status(201).json({ success: true, message: 'Inventory initialized', count: result.length });
});

export const getAvailability = catchAsync(async (req: Request, res: Response) => {
  const { checkIn, checkOut } = req.query;
  const hotelId = req.params.hotelId || req.query.hotelId;

  if (!hotelId) throw new AppError('Hotel ID is required', 400);

  const availability = await inventoryService.getAvailability(
    Number(hotelId),
    checkIn as string,
    checkOut as string
  );
  res.status(200).json({ success: true, data: availability });
});

export const getCalendar = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;

  const calendar = await inventoryService.getInventoryCalendar(
    parseInt(hotelId as string, 10),
    startDate as string,
    endDate as string
  );
  res.status(200).json({ success: true, data: calendar });
});

export const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, startDate, endDate, availableCount } = req.body;
  const result = await inventoryService.updateInventory(roomTypeId, startDate, endDate, availableCount);
  res.status(200).json({ success: true, data: result });
});
