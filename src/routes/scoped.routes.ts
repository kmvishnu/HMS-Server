import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller';
import * as bookingController from '../controllers/booking.controller';
import * as inventoryController from '../controllers/inventory.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as analyticsController from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { uploadHotelImages, uploadRoomTypeImage, memoryUpload } from '../middleware/upload.middleware';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(restrictTo(Role.HOTEL_OWNER, Role.STAFF, Role.ADMIN));

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Hotel Settings
router.get('/settings', hotelController.getHotelSettings);

// Hotel Details & Completeness
router.get('/profile-completion', hotelController.getProfileCompleteness);

// Hotel Settings & Visibility
router.put('/features', hotelController.updateFeatures);
router.patch('/features', hotelController.updateFeatures);
router.put('/visibility', hotelController.updateVisibility);
router.patch('/visibility', hotelController.updateVisibility);

// Hotel Images
router.post('/images', uploadHotelImages.array('images', 5), hotelController.addHotelImage);
router.delete('/images', hotelController.deleteHotelImage);

// Bookings
router.get('/bookings', bookingController.getHotelBookings);
router.patch('/bookings/:id/notes', bookingController.updateBookingNotes);
router.put('/bookings/:id/checkin', bookingController.checkin);
router.put('/bookings/:id/checkout', bookingController.checkout);

// Room Types
router.post('/room-types', hotelController.addRoomType);
router.get('/room-types', hotelController.getRoomTypes);
router.put('/room-types/:id', hotelController.updateRoomType);
router.delete('/room-types/:id', hotelController.deleteRoomType);

// Room Type Images (Scoped)
router.post('/room-types/:id/images', memoryUpload.single('image'), hotelController.addRoomTypeImage);
router.delete('/room-types/images/:id', hotelController.deleteRoomTypeImage);

// Inventory
router.get('/inventory/calendar', inventoryController.getCalendar);
router.patch('/inventory', inventoryController.updateInventory);
router.post('/inventory/init', inventoryController.initInventory);

// Analytics
router.get('/analytics', analyticsController.getHotelAnalytics);

export default router;
