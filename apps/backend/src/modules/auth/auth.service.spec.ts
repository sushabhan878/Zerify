import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: Partial<AuthRepository>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    authRepository = {
      findByEmail: jest.fn(),
      createBrandUser: jest.fn(),
      createInfluencerUser: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ConflictException if brand email is already taken', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 'existing-id', email: 'brand@example.com' });

    await expect(
      service.registerBrand({
        email: 'brand@example.com',
        password: 'password123',
        name: 'Brand Owner',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully register a BRAND user via registerBrand', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createBrandUser as jest.Mock).mockResolvedValue({
      id: 'brand-user-uuid',
      email: 'agency@zerify.com',
      password: 'hashedpassword',
      role: UserRole.BRAND,
      brandProfile: {
        id: 'brand-profile-uuid',
        companyName: 'Zerify Agency',
      },
    });

    const result = await service.registerBrand({
      email: 'agency@zerify.com',
      password: 'password123',
      name: 'Agency Leader',
      companyName: 'Zerify Agency',
    });

    expect(result.accessToken).toBe('mocked-jwt-access-token');
    expect(result.user.email).toBe('agency@zerify.com');
    expect(result.user.password).toBeUndefined();
    expect(result.user.brandProfile.companyName).toBe('Zerify Agency');
  });

  it('should successfully register an INFLUENCER user via registerInfluencer with optional profile fields', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createInfluencerUser as jest.Mock).mockResolvedValue({
      id: 'creator-user-uuid',
      email: 'creator@zerify.com',
      password: 'hashedpassword',
      role: UserRole.INFLUENCER,
      influencer: {
        id: 'influencer-profile-uuid',
        handle: '@creator',
        platform: 'YouTube',
        gender: 'Female',
        category: 'Fashion & Beauty',
        openToAffiliate: true,
        openToUgc: true,
        pricingRange: '$200 - $500',
      },
    });

    const result = await service.registerInfluencer({
      email: 'creator@zerify.com',
      password: 'password123',
      name: 'Creator Star',
      handle: '@creator',
      platform: 'YouTube',
      gender: 'Female',
      category: 'Fashion & Beauty',
      openToAffiliate: true,
      openToUgc: true,
      pricingRange: '$200 - $500',
    });

    expect(result.accessToken).toBe('mocked-jwt-access-token');
    expect(result.user.email).toBe('creator@zerify.com');
    expect(result.user.password).toBeUndefined();
    expect(result.user.influencer.handle).toBe('@creator');
    expect(result.user.influencer.openToAffiliate).toBe(true);
    expect(result.user.influencer.openToUgc).toBe(true);
    expect(result.user.influencer.category).toBe('Fashion & Beauty');
  });
});
