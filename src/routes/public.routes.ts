import { Router } from 'express';
import { getHomeData, searchHotels, getHotelDetails, checkAvailability, getLocations } from '../controllers/public.controller';
import { validate } from '../middleware/validate.middleware';
import { searchHotelsSchema, checkAvailabilitySchema } from '../validations/public.validation';
import { getHotelParamsSchema } from '../validations/hotel.validation';

const router = Router();

router.get('/home', getHomeData);
router.get('/search', searchHotels); // New optimized search
router.get('/hotels', validate(searchHotelsSchema), searchHotels); // Keep for compatibility
router.get('/locations', getLocations);
router.get('/hotels/:id', validate(getHotelParamsSchema), getHotelDetails);
router.get('/availability', validate(checkAvailabilitySchema), checkAvailability);

export default router;
