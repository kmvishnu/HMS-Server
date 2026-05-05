import { z } from 'zod';

export const createHotelSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    location: z.string().min(2, 'Location must be at least 2 characters'),
    ownerId: z.string().regex(/^\d+$/, 'Owner ID must be a number').optional(),
  }),
});

export const updateHotelSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    location: z.string().min(2, 'Location must be at least 2 characters').optional(),
    ownerId: z.number().int().optional().nullable(),
  }),
});

export const updateVisibilitySchema = z.object({
  body: z.object({
    isVisible: z.boolean(),
  }),
});

export const updateFeaturesSchema = z.object({
  body: z.object({
    features: z.array(z.string()),
  }),
});

export const createRoomTypeSchema = z.object({
  body: z.object({
    hotelId: z.number().int().positive('Hotel ID must be positive'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    totalRooms: z.number().int().positive('Total rooms must be positive'),
    price: z.number().positive('Price must be positive'),
  }),
});

export const getHotelParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),
});
