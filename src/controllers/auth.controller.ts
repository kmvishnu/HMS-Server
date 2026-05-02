import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';

const authService = new AuthService();

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  const user = await authService.register(name, email, password);

  res.status(201).json({
    success: true,
    data: user
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const data = await authService.login(email, password);

  res.status(200).json({
    success: true,
    data
  });
});
