import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export const restrictToAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  next();
};
