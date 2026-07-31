import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InfluencerRepository } from './influencer.repository';
import { UpdateInfluencerProfileDto } from './dto/update-profile.dto';

@Injectable()
export class InfluencerService {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async getProfile(userId?: string) {
    if (userId) {
      const profile = await this.influencerRepository.findByUserId(userId);
      if (profile) return profile;
    }
    // Fallback to first profile if demo/unauthenticated user
    const firstProfile = await this.influencerRepository.findFirstProfile();
    if (!firstProfile) {
      throw new NotFoundException('Influencer profile not found');
    }
    return firstProfile;
  }

  async updateProfile(userId: string | undefined, dto: UpdateInfluencerProfileDto) {
    let targetUserId = userId;

    if (!targetUserId) {
      const firstProfile = await this.influencerRepository.findFirstProfile();
      if (firstProfile) {
        targetUserId = firstProfile.userId;
      } else {
        throw new NotFoundException('No target influencer profile found to update');
      }
    }

    try {
      return await this.influencerRepository.updateProfile(targetUserId, dto);
    } catch (err: any) {
      console.error('Error updating influencer profile:', err);
      throw new BadRequestException(err.message || 'Could not update influencer profile in database.');
    }
  }
}
