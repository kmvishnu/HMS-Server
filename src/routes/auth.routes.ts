import { Router } from 'express';
import { register, login, setupAdmin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/setup-admin', validate(registerSchema), setupAdmin); // Using same schema as register

export default router;
