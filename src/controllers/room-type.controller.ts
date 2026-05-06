import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const hotelService = new HotelService();

export const createRoomType = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.hotelId as string, 10);
  const { name, totalRooms, price } = req.body;

  const roomType = await hotelService.createRoomType(hotelId, name, totalRooms, price);

  res.status(201).json({
    success: true,
    data: roomType
  });
});

export const getRoomTypes = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.hotelId as string, 10);
  const roomTypes = await hotelService.getRoomTypes(hotelId);

  res.status(200).json({
    success: true,
    data: roomTypes
  });
});

export const updateRoomType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, totalRooms, price } = req.body;
  
  // Basic update (Owner validation would ideally check if roomType belongs to their hotel)
  const roomType = await hotelService.updateRoomType(parseInt(id as string), name, totalRooms, price);

  res.status(200).json({
    success: true,
    data: roomType
  });
});

export const deleteRoomType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await hotelService.deleteRoomType(parseInt(id as string));

  res.status(204).json({
    success: true,
    data: null
  });
});

export const addRoomTypeImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;
  debugger

  if (!file) {
    throw new AppError('Please upload an image', 400);
  }

  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const image = await hotelService.addRoomTypeImage(parseInt(id as string), base64Image);

  res.status(201).json({
    success: true,
    data: image
  });
});

export const deleteRoomTypeImage = catchAsync(async (req: Request, res: Response) => {
  const { imageId } = req.params;
  await hotelService.deleteRoomTypeImage(parseInt(imageId as string));

  res.status(204).json({
    success: true,
    data: null
  });
});
