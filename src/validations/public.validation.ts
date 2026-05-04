import { z } from 'zod';

export const searchHotelsSchema = z.object({
  query: z.object({
    location: z.string().optional(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  }).refine((data) => {
    if ((data.checkIn && !data.checkOut) || (!data.checkIn && data.checkOut)) {
      return false;
    }
    return true;
  }, {
    message: "Both checkIn and checkOut dates must be provided together",
    path: ["checkOut"],
  })
});

export const checkAvailabilitySchema = z.object({
  query: z.object({
    hotelId: z.string().regex(/^\d+$/, 'Hotel ID must be a number'),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  }).refine((data) => new Date(data.checkIn) < new Date(data.checkOut), {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  })
});
