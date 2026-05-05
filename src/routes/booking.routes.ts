import { Router } from 'express';
import { createBooking, getMyBookings, getHotelBookings, checkin, checkout } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema } from '../validations/booking.validation';
import { Role } from '../types';

const router = Router();

router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my-bookings', getMyBookings);

// Hotel Management (Owner/Staff)
router.get('/hotel', restrictTo(Role.HOTEL_OWNER, Role.STAFF), getHotelBookings);
router.post('/:id/checkin', restrictTo(Role.HOTEL_OWNER, Role.STAFF), checkin);
router.post('/:id/checkout', restrictTo(Role.HOTEL_OWNER, Role.STAFF), checkout);

export default router;
