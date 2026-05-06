import { Router } from 'express';
import { getGlobalDashboard } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// unified dashboard endpoint for ADMIN and CUSTOMER
router.get('/', protect, getGlobalDashboard);

export default router;
