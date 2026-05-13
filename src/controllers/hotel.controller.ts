import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const hotelService = new HotelService();

export const getAllHotels = catchAsync(async (req: Request, res: Response) => {
  const hotels = await hotelService.getAllHotels();
  res.status(200).json({ success: true, data: hotels });
});

export const getHotelDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.query;
  const hotel = await hotelService.getHotelDetails(
    parseInt(id as string), 
    checkIn as string, 
    checkOut as string
  );
  res.status(200).json({ success: true, data: hotel });
});

export const getOwnedHotels = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const ownerId = req.user.userId;
  const hotels = await hotelService.getOwnedHotels(ownerId);
  res.status(200).json({ success: true, data: hotels });
});

export const getProfileCompleteness = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const completeness = await hotelService.getProfileCompleteness(parseInt(hotelId as string, 10));
  res.status(200).json({ success: true, data: completeness });
});

export const createHotel = catchAsync(async (req: Request, res: Response) => {
  const { name, location, ownerId } = req.body;
  const imageUrls: string[] = [];
  
  const files = req.files as Express.Multer.File[];
  if (files && Array.isArray(files)) {
    files.forEach((file) => {
      imageUrls.push(`/public/uploads/${file.filename}`);
    });
  }

  if (!req.user) throw new AppError('Unauthorized', 401);

  // Use provided ownerId or current user if they are an owner
  const finalOwnerId = ownerId ? parseInt(ownerId as string) : req.user.userId;

  const hotel = await hotelService.createHotel(name, location, finalOwnerId, imageUrls);
  res.status(201).json({ success: true, data: hotel });
});

export const updateHotel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, location, ownerId } = req.body;
  const hotel = await hotelService.updateHotel(
    parseInt(id as string), 
    name, 
    location, 
    ownerId ? parseInt(ownerId as string) : undefined,
    req.body
  );
  res.status(200).json({ success: true, data: hotel });
});

export const addRoomType = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { name, totalRooms, price } = req.body;
  const roomType = await hotelService.createRoomType(
    parseInt(hotelId as string), 
    name, 
    parseInt(totalRooms as string), 
    parseFloat(price as string)
  );
  res.status(201).json({ success: true, data: roomType });
});

export const getRoomTypes = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const roomTypes = await hotelService.getRoomTypes(parseInt(hotelId as string));
  res.status(200).json({ success: true, data: roomTypes });
});

export const updateRoomType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, totalRooms, price } = req.body;
  const roomType = await hotelService.updateRoomType(
    parseInt(id as string), 
    name, 
    totalRooms ? parseInt(totalRooms as string) : undefined, 
    price ? parseFloat(price as string) : undefined
  );
  res.status(200).json({ success: true, data: roomType });
});

export const deleteRoomType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await hotelService.deleteRoomType(parseInt(id as string));
  res.status(204).json({ success: true, data: null });
});

export const addRoomTypeImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError('Image file is required', 400);

  // Convert to base64 with MIME prefix
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  
  const image = await hotelService.addRoomTypeImage(parseInt(id as string), base64Image);
  res.status(201).json({ success: true, data: image });
});

export const deleteRoomTypeImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await hotelService.deleteRoomTypeImage(parseInt(id as string));
  res.status(204).json({ success: true, data: null });
});

export const addHotelImage = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError('Image file is required', 400);
  const imageUrl = `/public/uploads/${file.filename}`;
  
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { userId, role } = req.user;
  
  const hotel = await hotelService.addHotelImage(parseInt(hotelId as string), userId, role, imageUrl);
  res.status(201).json({ success: true, data: hotel });
});

export const deleteHotelImage = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { url } = req.body;
  
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { userId, role } = req.user;
  
  const hotel = await hotelService.deleteHotelImage(parseInt(hotelId as string), userId, role, url);
  res.status(200).json({ success: true, data: hotel });
});

export const updateFeatures = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { features } = req.body;
  const hotel = await hotelService.updateFeatures(parseInt(hotelId as string), features);
  res.status(200).json({ success: true, data: hotel });
});

export const updateVisibility = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { isVisible } = req.body;
  const hotel = await hotelService.updateVisibility(parseInt(hotelId as string), isVisible);
  res.status(200).json({ success: true, data: hotel });
});

export const getHotelSettings = catchAsync(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const settings = await hotelService.getHotelSettings(parseInt(hotelId as string));
  res.status(200).json({ success: true, data: settings });
});
