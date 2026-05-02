import { z } from 'zod';

export const initInventorySchema = z.object({
  body: z.object({
    roomTypeId: z.number().int(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  }),
});

export const getAvailabilitySchema = z.object({
  query: z.object({
    hotelId: z.string().regex(/^\d+$/, 'Hotel ID must be a number'),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  }),
});
