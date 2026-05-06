import { Router } from 'express';
import { getOwnedHotels } from '../controllers/hotel.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';

const router = Router();

router.use(protect);

router.get('/hotels', restrictTo(Role.HOTEL_OWNER), getOwnedHotels);

export default router;
