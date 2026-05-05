import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  body: z.object({
    hotelId: z.number().int(),
    name: z.string().min(1),
    totalRooms: z.number().int().min(1),
    price: z.number().min(0)
  }),
});

export const updateRoomTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    totalRooms: z.number().int().min(1).optional(),
    price: z.number().min(0).optional()
  }),
});
