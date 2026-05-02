import { Router } from 'express';
import { initInventory } from '../controllers/inventory.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { initInventorySchema } from '../validations/inventory.validation';

const router = Router();

router.use(protect);
router.post('/init', restrictTo(Role.ADMIN, Role.HOTEL_OWNER), validate(initInventorySchema), initInventory);

export default router;
