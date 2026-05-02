import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    roomTypeId: z.number().int(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  }),
});
