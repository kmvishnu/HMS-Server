import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createHotelSchema, getHotelParamsSchema, updateHotelSchema } from '../validations/hotel.validation';
import { uploadHotelImages, uploadRoomTypeImage } from '../middleware/upload.middleware';

const router = Router();

router.get('/', hotelController.getAllHotels);
router.get('/:id', validate(getHotelParamsSchema), hotelController.getHotelDetails);

// Protected routes
router.use(protect);

router.post(
  '/', 
  restrictTo(Role.ADMIN), 
  uploadHotelImages.array('images', 5),
  validate(createHotelSchema), 
  hotelController.createHotel
);

router.put('/:id', restrictTo(Role.ADMIN), validate(updateHotelSchema), hotelController.updateHotel);

// Hotel Image Management
router.post(
  '/:hotelId/images', 
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER), 
  uploadHotelImages.single('image'), 
  hotelController.addHotelImage
);

router.delete(
  '/:hotelId/images', 
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER), 
  hotelController.deleteHotelImage
);

// Room Type Image Management (Global context)
router.post(
  '/room-types/:id/images', 
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER), 
  uploadRoomTypeImage.single('image'), 
  hotelController.addRoomTypeImage
);

router.delete(
  '/room-types/images/:id', 
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER), 
  hotelController.deleteRoomTypeImage
);

export default router;
