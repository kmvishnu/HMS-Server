import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { catchAsync } from '../utils/catchAsync';

const inventoryService = new InventoryService();

export const initInventory = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, startDate, endDate } = req.body;
  const result = await inventoryService.initInventory(roomTypeId, startDate, endDate);
  res.status(201).json({ success: true, message: 'Inventory initialized', count: result.length });
});

export const getAvailability = catchAsync(async (req: Request, res: Response) => {
  const { checkIn, checkOut } = req.query;
  const hotelId = req.params.hotelId || req.query.hotelId;

  const availability = await inventoryService.getAvailability(
    Number(hotelId as string),
    checkIn as string,
    checkOut as string
  );
  res.status(200).json({ success: true, data: availability });
});

export const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const { roomTypeId, startDate, endDate, availableCount } = req.body;
  const result = await inventoryService.updateInventory(roomTypeId, startDate, endDate, availableCount);
  res.status(200).json({ success: true, data: result });
});
