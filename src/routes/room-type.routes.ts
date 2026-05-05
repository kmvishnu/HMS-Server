import { Router } from 'express';
import { createRoomType, updateRoomType, deleteRoomType, addRoomTypeImage, deleteRoomTypeImage } from '../controllers/room-type.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createRoomTypeSchema, updateRoomTypeSchema } from '../validations/room-type.validation';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(protect);

router.post('/', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(createRoomTypeSchema), createRoomType);
router.put('/:id', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(updateRoomTypeSchema), updateRoomType);
router.delete('/:id', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), deleteRoomType);

// Room Type Images
router.post('/:id/images', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), upload.single('image'), addRoomTypeImage);
router.delete('/images/:imageId', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), deleteRoomTypeImage);

export default router;
