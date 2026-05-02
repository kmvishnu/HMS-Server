import { Router } from 'express';
import { getAllHotels, getHotelDetails, createHotel } from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createHotelSchema, getHotelParamsSchema } from '../validations/hotel.validation';

const router = Router();

router.get('/', getAllHotels);
router.get('/:id', validate(getHotelParamsSchema), getHotelDetails);

// Protected routes
router.use(protect);
router.post('/', restrictTo(Role.ADMIN), validate(createHotelSchema), createHotel);

export default router;
