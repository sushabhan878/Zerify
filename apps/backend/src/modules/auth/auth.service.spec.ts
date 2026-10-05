import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: Partial<AuthRepository>;
  let jwtService: Partial<JwtService>;
  let mailService: Partial<MailService>;

  beforeEach(async () => {
    authRepository = {
      findByEmail: jest.fn(),
      createBrandUser: jest.fn(),
      createInfluencerUser: jest.fn(),
      findEmailVerification: jest.fn().mockResolvedValue({
        email: 'agency@zerify.com',
        code: '123456',
        isVerified: true,
        expiresAt: new Date(Date.now() + 600000),
      }),
      deleteEmailVerification: jest.fn().mockResolvedValue(null),
      upsertEmailVerification: jest.fn().mockResolvedValue(null),
      markEmailVerified: jest.fn().mockResolvedValue(null),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-access-token'),
    };

    mailService = {
      sendVerificationOtp: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject brand registration if public email domain (@gmail.com) is used', async () => {
    await expect(
      service.registerBrand({
        email: 'mybrand@gmail.com',
        password: 'password123',
        name: 'Brand Owner',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject brand registration if public email domain (@yahoo.com) is used', async () => {
    await expect(
      service.registerBrand({
        email: 'mybrand@yahoo.com',
        password: 'password123',
        name: 'Brand Owner',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if brand email is already taken', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 'existing-id', email: 'brand@corporate.com' });

    await expect(
      service.registerBrand({
        email: 'brand@corporate.com',
        password: 'password123',
        name: 'Brand Owner',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully register a BRAND user via registerBrand with verified business email', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createBrandUser as jest.Mock).mockResolvedValue({
      id: 'brand-user-uuid',
      email: 'agency@zerify.com',
      password: 'hashedpassword',
      role: UserRole.BRAND,
      isEmailVerified: true,
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

  it('should successfully register an INFLUENCER user via registerInfluencer with verified email', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.findEmailVerification as jest.Mock).mockResolvedValue({
      email: 'creator@zerify.com',
      code: '123456',
      isVerified: true,
      expiresAt: new Date(Date.now() + 600000),
    });
    (authRepository.createInfluencerUser as jest.Mock).mockResolvedValue({
      id: 'creator-user-uuid',
      email: 'creator@zerify.com',
      password: 'hashedpassword',
      role: UserRole.INFLUENCER,
      isEmailVerified: true,
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
  });

  it('should send OTP verification code via sendVerificationOtp', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const result = await service.sendVerificationOtp({
      email: 'founder@mycompany.com',
      role: 'BRAND',
    });

    expect(result.success).toBe(true);
    expect(authRepository.upsertEmailVerification).toHaveBeenCalled();
    expect(mailService.sendVerificationOtp).toHaveBeenCalled();
  });

  it('should reject sendVerificationOtp for BRAND with @gmail.com', async () => {
    await expect(
      service.sendVerificationOtp({
        email: 'founder@gmail.com',
        role: 'BRAND',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
