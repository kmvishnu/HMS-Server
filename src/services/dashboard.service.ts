import { DashboardRepository } from '../repositories/dashboard.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  async getCustomerDashboard(userId: number) {
    return await this.dashboardRepository.getCustomerBookings(userId);
  }

  async getAdminDashboard() {
    return await this.dashboardRepository.getAdminStats();
  }

  async getHotelDashboard(hotelId: number) {
    return await this.dashboardRepository.getHotelStats(hotelId);
  }

  async getOwnerDashboard(ownerId: number, hotelIdQuery?: number) {
    const ownedHotels = await this.dashboardRepository.getHotelsByOwner(ownerId);
    
    // If no specific hotel is requested, return the list of owned hotels
    if (!hotelIdQuery) {
      return {
        ownedHotels
      };
    }

    // Verify ownership if a specific hotel is requested
    const isOwner = ownedHotels.some(h => h.id === hotelIdQuery);
    if (!isOwner) {
      throw new AppError('You do not own this hotel', 403);
    }

    return await this.getHotelDashboard(hotelIdQuery);
  }
}
