import { Router } from 'express';
import { globalSearch } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/search', globalSearch);

export default router;
