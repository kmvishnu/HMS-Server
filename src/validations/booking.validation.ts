import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    roomTypeId: z.number().int(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    guests: z.array(z.object({
      name: z.string().min(1),
      age: z.number().int().min(0)
    })).min(1, 'At least one guest is required')
  }),
});
