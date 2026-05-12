import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { restrictToAdmin } from '../middleware/admin.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Protect all routes
router.use(protect);
router.use(restrictToAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/search', adminController.globalSearch);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Hotel Management
router.get('/hotels', adminController.getHotels);
router.get('/hotels/:id', adminController.getHotelDetails);
router.put('/hotels/:id/visibility', adminController.updateHotelVisibility);
router.delete('/hotels/:id', adminController.deleteHotel);

// Global Bookings
router.get('/bookings', adminController.getBookings);

export default router;
