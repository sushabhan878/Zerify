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
      createUserWithRoleProfile: jest.fn(),
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

  it('should throw ConflictException if email is already taken', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

    await expect(
      service.register({
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.BRAND,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully register a BRAND user and return JWT + sanitized user', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createUserWithRoleProfile as jest.Mock).mockResolvedValue({
      id: 'user-uuid-1',
      email: 'brand@company.com',
      password: 'hashedpassword',
      role: UserRole.BRAND,
      brandProfile: {
        id: 'brand-uuid-1',
        companyName: 'Acme Corp',
      },
    });

    const result = await service.register({
      email: 'brand@company.com',
      password: 'password123',
      name: 'Acme Owner',
      role: UserRole.BRAND,
      companyName: 'Acme Corp',
    });

    expect(result.accessToken).toBe('mocked-jwt-access-token');
    expect(result.user.email).toBe('brand@company.com');
    expect(result.user.password).toBeUndefined();
    expect(result.user.brandProfile.companyName).toBe('Acme Corp');
  });

  it('should successfully register an INFLUENCER user and return JWT + sanitized user', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createUserWithRoleProfile as jest.Mock).mockResolvedValue({
      id: 'user-uuid-2',
      email: 'creator@instagram.com',
      password: 'hashedpassword',
      role: UserRole.INFLUENCER,
      influencer: {
        id: 'influencer-uuid-1',
        handle: '@creator',
        platform: 'Instagram',
      },
    });

    const result = await service.register({
      email: 'creator@instagram.com',
      password: 'password123',
      name: 'Alex Creator',
      role: UserRole.INFLUENCER,
      handle: '@creator',
    });

    expect(result.accessToken).toBe('mocked-jwt-access-token');
    expect(result.user.email).toBe('creator@instagram.com');
    expect(result.user.password).toBeUndefined();
    expect(result.user.influencer.handle).toBe('@creator');
  });
});
