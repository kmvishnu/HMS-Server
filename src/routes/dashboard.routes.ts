import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// unified dashboard endpoint
router.get('/', protect, getDashboard);

export default router;
