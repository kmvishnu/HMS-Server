import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';

const authService = new AuthService();

export const register = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const fullName = `${firstName} ${lastName}`.trim();
  
  const user = await authService.register(fullName, email, password);

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

export const setupAdmin = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const fullName = `${firstName} ${lastName}`.trim();
  const user = await authService.setupFirstAdmin(fullName, email, password);

  res.status(201).json({
    success: true,
    message: 'Super Admin created successfully',
    data: user
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  const data = await authService.refreshTokens(refreshToken);

  res.status(200).json({
    success: true,
    data
  });
});
