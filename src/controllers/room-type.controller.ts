import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const hotelService = new HotelService();

export const createRoomType = catchAsync(async (req: Request, res: Response) => {
  const { hotelId, name, totalRooms, price } = req.body;
  const user = (req as any).user;

  // If role is HOTEL_OWNER, verify hotelId
  if (user.role === 'HOTEL_OWNER' && user.hotelId !== hotelId) {
    throw new AppError('Unauthorized access to this hotel', 403);
  }

  const roomType = await hotelService.createRoomType(hotelId, name, totalRooms, price);

  res.status(201).json({
    success: true,
    data: roomType
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
