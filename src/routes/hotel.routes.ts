import { Router } from 'express';
import { getAllHotels, getHotelDetails, createHotel, updateHotel } from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createHotelSchema, getHotelParamsSchema, updateHotelSchema } from '../validations/hotel.validation';
import { uploadHotelImages } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getAllHotels);
router.get('/:id', validate(getHotelParamsSchema), getHotelDetails);

// Protected routes
router.use(protect);
router.post(
  '/', 
  restrictTo(Role.ADMIN), 
  uploadHotelImages.array('images', 5),
  validate(createHotelSchema), 
  createHotel
);

router.put('/:id', restrictTo(Role.ADMIN), validate(updateHotelSchema), updateHotel);

export default router;
