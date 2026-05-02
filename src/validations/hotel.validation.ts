import { z } from 'zod';

export const createHotelSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    location: z.string().min(2, 'Location must be at least 2 characters'),
  }),
});

export const createRoomTypeSchema = z.object({
  body: z.object({
    hotelId: z.number().int(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    totalRooms: z.number().int().positive(),
  }),
});

export const getHotelParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),
});
