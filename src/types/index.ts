export interface JwtPayload {
  userId: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  HOTEL_OWNER = 'HOTEL_OWNER',
  STAFF = 'STAFF'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}
