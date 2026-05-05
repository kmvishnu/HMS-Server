import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const hotelService = new HotelService();

export const getAllHotels = catchAsync(async (req: Request, res: Response) => {
  const hotels = await hotelService.getAllHotels();
  res.status(200).json({ success: true, data: hotels });
});

export const updateVisibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isVisible } = req.body;
  const user = (req as any).user;

  // Validation: Owner can only update their own hotel
  if (user.role === 'HOTEL_OWNER' && user.hotelId !== parseInt(id as string)) {
    throw new AppError('Unauthorized access to this hotel', 403);
  }

  const hotel = await hotelService.updateVisibility(parseInt(id as string), isVisible);

  res.status(200).json({
    success: true,
    data: hotel
  });
});

export const updateFeatures = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { features } = req.body;
  const user = (req as any).user;

  if (user.role === 'HOTEL_OWNER' && user.hotelId !== parseInt(id as string)) {
    throw new AppError('Unauthorized access to this hotel', 403);
  }

  const hotel = await hotelService.updateFeatures(parseInt(id as string), features);

  res.status(200).json({
    success: true,
    data: hotel
  });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const hotel = await hotelService.getHotelDetails(Number(req.params.id));
  res.status(200).json({ success: true, data: hotel });
});

export const createHotel = catchAsync(async (req: Request, res: Response) => {
  const { name, location, ownerId } = req.body;
  const files = req.files as Express.Multer.File[];
  
  const imageUrls = files ? files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`) : [];

  const parsedOwnerId = ownerId ? parseInt(ownerId, 10) : null;
  const hotel = await hotelService.createHotel(name, location, parsedOwnerId as unknown as number, imageUrls);
  res.status(201).json({ success: true, data: hotel });
});

export const updateHotel = catchAsync(async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id as string, 10);
  const { name, location, ownerId } = req.body;
  const hotel = await hotelService.updateHotel(hotelId, name, location, ownerId);
  res.status(200).json({ success: true, data: hotel });
});

export const createRoomType = catchAsync(async (req: Request, res: Response) => {
  const { hotelId, name, totalRooms, price } = req.body;
  const roomType = await hotelService.createRoomType(hotelId, name, totalRooms, price);
  res.status(201).json({ success: true, data: roomType });
});

export const addImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw new AppError('Image file is required', 400);

  const newUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const hotelId = parseInt(req.params.id as string, 10);
  
  const hotel = await hotelService.addHotelImage(hotelId, req.user!.userId, req.user!.role, newUrl);
  res.status(200).json({ success: true, data: hotel });
});

export const replaceImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw new AppError('Image file is required', 400);

  const { oldImageUrl } = req.body;
  if (!oldImageUrl) throw new AppError('oldImageUrl is required', 400);

  const newUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const hotelId = parseInt(req.params.id as string, 10);

  const hotel = await hotelService.replaceHotelImage(hotelId, req.user!.userId, req.user!.role, oldImageUrl, newUrl);
  res.status(200).json({ success: true, data: hotel });
});

export const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { imageUrl } = req.body;
  if (!imageUrl) throw new AppError('imageUrl is required', 400);

  const hotelId = parseInt(req.params.id as string, 10);

  const hotel = await hotelService.deleteHotelImage(hotelId, req.user!.userId, req.user!.role, imageUrl);
  res.status(200).json({ success: true, data: hotel });
});
