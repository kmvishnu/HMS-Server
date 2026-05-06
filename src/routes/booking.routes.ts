import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema } from '../validations/booking.validation';
import { Role } from '../types';

const router = Router();

router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my-bookings', getMyBookings);

export default router;
