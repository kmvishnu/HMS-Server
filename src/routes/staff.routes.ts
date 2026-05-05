import { Router } from 'express';
import { createStaff, getStaffList, updateStaff, deleteStaff } from '../controllers/staff.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createStaffSchema, updateStaffSchema } from '../validations/staff.validation';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.HOTEL_OWNER, Role.ADMIN));

router.post('/', validate(createStaffSchema), createStaff);
router.get('/', getStaffList);
router.put('/:id', validate(updateStaffSchema), updateStaff);
router.delete('/:id', deleteStaff);

export default router;
