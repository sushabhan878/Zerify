import { Test, TestingModule } from '@nestjs/testing';
import { InfluencerService } from './influencer.service';
import { InfluencerRepository } from './influencer.repository';
import { NotFoundException } from '@nestjs/common';

describe('InfluencerService', () => {
  let service: InfluencerService;
  let repository: Partial<InfluencerRepository>;

  const mockProfile = {
    id: 'prof-123',
    userId: 'user-123',
    handle: '@testcreator',
    bio: 'Tech Content Creator',
    location: 'San Francisco, CA',
    phoneCode: '+1',
    phoneNumber: '415-555-0192',
    dob: new Date('1996-08-14'),
    gender: 'Female',
    avatarUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    niches: ['Tech & Gadgets'],
    contentLanguages: ['English'],
    user: { id: 'user-123', email: 'test@zerify.io', name: 'Test User', role: 'INFLUENCER' },
  };

  beforeEach(async () => {
    repository = {
      findByUserId: jest.fn().mockResolvedValue(mockProfile),
      findFirstProfile: jest.fn().mockResolvedValue(mockProfile),
      updateProfile: jest.fn().mockImplementation((userId, dto) =>
        Promise.resolve({ ...mockProfile, ...dto }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfluencerService,
        { provide: InfluencerRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<InfluencerService>(InfluencerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return influencer profile by userId', async () => {
    const profile = await service.getProfile('user-123');
    expect(profile).toBeDefined();
    expect(profile.handle).toBe('@testcreator');
    expect(repository.findByUserId).toHaveBeenCalledWith('user-123');
  });

  it('should fallback to first profile if userId is not found', async () => {
    (repository.findByUserId as jest.Mock).mockResolvedValueOnce(null);
    const profile = await service.getProfile('non-existent');
    expect(profile).toBeDefined();
    expect(repository.findFirstProfile).toHaveBeenCalled();
  });

  it('should update influencer basic profile information', async () => {
    const updateDto = {
      name: 'Updated Creator',
      bio: 'New Tech Bio',
      location: 'New York, NY',
    };

    const updated = await service.updateProfile('user-123', updateDto);
    expect(updated).toBeDefined();
    expect(repository.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
  });
});
