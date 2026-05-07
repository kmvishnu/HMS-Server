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
  const { location, checkIn, checkOut, guests, minPrice, maxPrice, features, page, limit } = req.query;
  
  const hotels = await publicService.searchHotels({
    location: location as string,
    checkIn: checkIn as string,
    checkOut: checkOut as string,
    guests: guests ? parseInt(guests as string, 10) : undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    features: features ? (features as string).split(',') : undefined,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10
  });

  res.status(200).json({ success: true, data: hotels });
});

export const getLocations = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json({ success: true, data: [] });
  }
  const locations = await publicService.getLocations(q as string);
  res.status(200).json({ success: true, data: locations });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id as string, 10);
  const { checkIn, checkOut } = req.query;
  
  const hotel = await hotelService.getHotelDetails(
    hotelId, 
    checkIn as string | undefined, 
    checkOut as string | undefined
  );
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
