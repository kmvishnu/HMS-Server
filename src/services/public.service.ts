import { PublicRepository } from '../repositories/public.repository';

export class PublicService {
  private publicRepository: PublicRepository;

  constructor() {
    this.publicRepository = new PublicRepository();
  }

  async getHomeData() {
    const [featuredHotels, topLocations] = await Promise.all([
      this.publicRepository.getFeaturedHotels(),
      this.publicRepository.getTopLocations()
    ]);

    return {
      featuredHotels,
      topLocations
    };
  }

  async searchHotels(params: any) {
    return await this.publicRepository.searchHotels(params);
  }

  async getLocations(q: string) {
    return await this.publicRepository.getLocations(q);
  }
}
