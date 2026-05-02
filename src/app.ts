import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/AppError';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import hotelRoutes from './routes/hotel.routes';
import roomTypeRoutes from './routes/room-type.routes';
import inventoryRoutes from './routes/inventory.routes';
import availabilityRoutes from './routes/availability.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';

// Routes
app.use('/auth', authRoutes);
app.use('/hotels', hotelRoutes);
app.use('/room-types', roomTypeRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
