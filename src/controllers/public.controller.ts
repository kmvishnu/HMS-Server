import { Request, Response } from 'express';
import { PublicService } from '../services/public.service';
import { HotelService } from '../services/hotel.service';
import { InventoryService } from '../services/inventory.service';
import { catchAsync } from '../utils/catchAsync';

const publicService = new PublicService();
const hotelService = new HotelService();
const inventoryService = new InventoryService();

export const getHomeData = catchAsync(async (req: Request, res: Response) => {
  const data = await publicService.getHomeData();
  res.status(200).json({ success: true, data });
});

export const searchHotels = catchAsync(async (req: Request, res: Response) => {
  const { location, checkIn, checkOut } = req.query;
  const hotels = await publicService.searchHotels(
    location as string | undefined, 
    checkIn as string | undefined, 
    checkOut as string | undefined
  );
  res.status(200).json({ success: true, data: hotels });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id as string, 10);
  const hotel = await hotelService.getHotelDetails(hotelId);
  res.status(200).json({ success: true, data: hotel });
});

export const checkAvailability = catchAsync(async (req: Request, res: Response) => {
  const { hotelId, checkIn, checkOut } = req.query;
  const data = await inventoryService.getAvailability(
    parseInt(hotelId as string, 10),
    checkIn as string,
    checkOut as string
  );
  res.status(200).json({ success: true, data });
});
