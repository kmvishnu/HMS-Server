import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Skeleton for MVP payment integration
router.post('/create-order', protect, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Payment order created (mock)',
    orderId: `order_${Date.now()}`
  });
});

router.post('/verify', protect, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Payment verified successfully (mock)'
  });
});

export default router;
