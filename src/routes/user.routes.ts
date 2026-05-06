import { Router } from 'express';
import { createUser, deleteUser, updateUser, getAllUsers } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { Role } from '../types';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';

const router = Router();

router.use(protect);

router.get('/', restrictTo(Role.ADMIN), getAllUsers);
router.post('/', restrictTo(Role.ADMIN), validate(createUserSchema), createUser);
router.put('/:id', restrictTo(Role.ADMIN), validate(updateUserSchema), updateUser);
router.delete('/:id', restrictTo(Role.ADMIN), deleteUser);

export default router;
