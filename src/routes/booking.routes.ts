import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema } from '../validations/booking.validation';

const router = Router();

router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my', getMyBookings);

export default router;
