import { Router } from 'express';
import { getAvailability } from '../controllers/inventory.controller';
import { validate } from '../middleware/validate.middleware';
import { getAvailabilitySchema } from '../validations/inventory.validation';

const router = Router();

router.get('/', validate(getAvailabilitySchema), getAvailability);

export default router;
