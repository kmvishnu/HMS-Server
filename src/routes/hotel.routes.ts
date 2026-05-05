import { Router } from 'express';
import { getAllHotels, getHotelDetails, createHotel, addImage, replaceImage, deleteImage, updateHotel, updateVisibility, updateFeatures } from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createHotelSchema, getHotelParamsSchema, updateHotelSchema, updateVisibilitySchema, updateFeaturesSchema } from '../validations/hotel.validation';
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

// Owner/Admin Management
router.put('/:id/visibility', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(updateVisibilitySchema), updateVisibility);
router.put('/:id/features', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(updateFeaturesSchema), updateFeatures);

// Images management
router.post(
  '/:id/images',
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER),
  uploadHotelImages.single('image'),
  addImage
);

router.put(
  '/:id/images/replace',
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER),
  uploadHotelImages.single('image'),
  replaceImage
);

router.delete(
  '/:id/images',
  restrictTo(Role.ADMIN, Role.HOTEL_OWNER),
  deleteImage
);

export default router;
