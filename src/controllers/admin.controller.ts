import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';

const adminService = new AdminService();

export const globalSearch = catchAsync(async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = await adminService.globalSearch(query);
  res.status(200).json({ success: true, data: results });
});
