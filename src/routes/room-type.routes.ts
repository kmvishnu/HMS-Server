import { Router } from 'express';
import { createRoomType } from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createRoomTypeSchema } from '../validations/hotel.validation';

const router = Router();

router.use(protect);
router.post('/', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(createRoomTypeSchema), createRoomType);

export default router;
