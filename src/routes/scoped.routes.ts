import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { restrictToHotel } from '../middleware/hotel-access.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';

import { getDashboard } from '../controllers/dashboard.controller';
import { getHotelBookings, checkin, checkout, createBooking } from '../controllers/booking.controller';
import { updateVisibility, updateFeatures, addImage, deleteImage } from '../controllers/hotel.controller';
import { createRoomType, updateRoomType, deleteRoomType, addRoomTypeImage, deleteRoomTypeImage, getRoomTypes } from '../controllers/room-type.controller';
import { updateInventory, getAvailability } from '../controllers/inventory.controller';

const router = Router({ mergeParams: true }); // Merge params to access :hotelId

// Apply middleware to all routes in this router
router.use(protect);
router.use(restrictToHotel);

// Dashboard
router.get('/dashboard', getDashboard);

// Bookings
router.get('/bookings', getHotelBookings);
router.post('/bookings/:id/checkin', restrictTo(Role.HOTEL_OWNER, Role.STAFF), checkin);
router.post('/bookings/:id/checkout', restrictTo(Role.HOTEL_OWNER, Role.STAFF), checkout);
// We might also want to scope booking creation if it's done by staff, but usually customers create bookings.
// If it's a staff creating a booking, it goes here.

// Room Types
router.get('/room-types', getRoomTypes);
router.post('/room-types', restrictTo(Role.HOTEL_OWNER), createRoomType);
router.put('/room-types/:id', restrictTo(Role.HOTEL_OWNER), updateRoomType);
router.delete('/room-types/:id', restrictTo(Role.HOTEL_OWNER), deleteRoomType);

// Room Type Images
// Note: These use the room-type id, not the hotel id in the path for the specific resource,
// but they are scoped under /hotel/:hotelId/room-types/...
router.post('/room-types/:id/images', restrictTo(Role.HOTEL_OWNER), addRoomTypeImage);
router.delete('/room-types/images/:imageId', restrictTo(Role.HOTEL_OWNER), deleteRoomTypeImage);

// Hotel Settings
router.put('/visibility', restrictTo(Role.HOTEL_OWNER), updateVisibility);
router.put('/features', restrictTo(Role.HOTEL_OWNER), updateFeatures);
router.post('/images', restrictTo(Role.HOTEL_OWNER), addImage);
// Note: Delete hotel image uses body for imageUrl
router.delete('/images', restrictTo(Role.HOTEL_OWNER), deleteImage);

// Inventory
router.patch('/inventory', restrictTo(Role.HOTEL_OWNER, Role.ADMIN), updateInventory);
router.get('/inventory', getAvailability);

export default router;
