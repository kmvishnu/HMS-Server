import { Router } from 'express';
import { getHomeData, searchHotels, getHotelDetails, checkAvailability } from '../controllers/public.controller';
import { validate } from '../middleware/validate.middleware';
import { searchHotelsSchema, checkAvailabilitySchema } from '../validations/public.validation';
import { getHotelParamsSchema } from '../validations/hotel.validation';

const router = Router();

router.get('/home', getHomeData);
router.get('/hotels', validate(searchHotelsSchema), searchHotels);
router.get('/hotels/:id', validate(getHotelParamsSchema), getHotelDetails);
router.get('/availability', validate(checkAvailabilitySchema), checkAvailability);

export default router;
