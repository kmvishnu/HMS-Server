import { AdminRepository } from '../repositories/admin.repository';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async globalSearch(query: string) {
    const [hotels, owners] = await Promise.all([
      this.adminRepository.searchHotels(query),
      this.adminRepository.searchOwners(query)
    ]);

    return {
      hotels,
      owners
    };
  }
}
