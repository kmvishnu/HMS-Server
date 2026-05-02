import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { catchAsync } from '../utils/catchAsync';

const hotelService = new HotelService();

export const getAllHotels = catchAsync(async (req: Request, res: Response) => {
  const hotels = await hotelService.getAllHotels();
  res.status(200).json({ success: true, data: hotels });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const hotel = await hotelService.getHotelDetails(Number(req.params.id));
  res.status(200).json({ success: true, data: hotel });
});

export const createHotel = catchAsync(async (req: Request, res: Response) => {
  const { name, location } = req.body;
  const hotel = await hotelService.createHotel(name, location);
  res.status(201).json({ success: true, data: hotel });
});

export const createRoomType = catchAsync(async (req: Request, res: Response) => {
  const { hotelId, name, totalRooms } = req.body;
  const roomType = await hotelService.createRoomType(hotelId, name, totalRooms);
  res.status(201).json({ success: true, data: roomType });
});
