import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialPlatform, SocialAccountStatus } from '@prisma/client';
import { SocialService } from './social.service';
import { SocialRepository } from './social.repository';
import { MetaProvider } from './providers/meta.provider';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from './utils/crypto.util';

describe('SocialCryptoUtils', () => {
  it('should encrypt and decrypt tokens correctly', () => {
    const rawToken = 'EAABsbCS1iHgBA...meta_access_token_sample';
    const encrypted = encryptToken(rawToken);
    expect(encrypted).not.toEqual(rawToken);
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(rawToken);
  });

  it('should generate and verify OAuth state tokens', () => {
    const userId = 'user-uuid-12345';
    const state = generateOAuthState(userId);
    expect(state).toBeDefined();

    const { userId: verifiedId, isValid } = verifyOAuthState(state);
    expect(isValid).toBe(true);
    expect(verifiedId).toEqual(userId);
  });

  it('should invalidate corrupt state tokens', () => {
    const { userId, isValid } = verifyOAuthState('corrupted_state_string');
    expect(isValid).toBe(false);
    expect(userId).toEqual('');
  });
});

describe('SocialService', () => {
  let service: SocialService;
  let repository: jest.Mocked<Partial<SocialRepository>>;
  let metaProvider: jest.Mocked<Partial<MetaProvider>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockUserId = 'user-uuid-999';

  beforeEach(async () => {
    repository = {
      upsertAccount: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      deleteAccount: jest.fn(),
    };

    metaProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state) => {
        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=123&redirect_uri=${redirectUri}&state=${state}`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'META_REDIRECT_URI') return 'http://localhost:4000/api/v1/social/meta/callback';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: SocialRepository, useValue: repository },
        { provide: MetaProvider, useValue: metaProvider },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
  });

  it('should generate Meta OAuth auth URL with valid signed state', () => {
    const res = service.getMetaAuthUrl(mockUserId);
    expect(res.url).toContain('https://www.facebook.com/v19.0/dialog/oauth');
    expect(res.state).toBeDefined();

    const verified = verifyOAuthState(res.state);
    expect(verified.isValid).toBe(true);
    expect(verified.userId).toBe(mockUserId);
  });

  it('should handle OAuth callback error query by returning frontend error redirect', async () => {
    const redirectUrl = await service.handleMetaCallback(
      undefined,
      undefined,
      'access_denied',
      'User cancelled login',
    );

    expect(redirectUrl).toContain('http://localhost:3000/dashboard/connected-accounts?status=error');
    expect(redirectUrl).toContain('User%20cancelled%20login');
  });

  it('should handle invalid state in callback by returning error redirect', async () => {
    const redirectUrl = await service.handleMetaCallback('valid_code', 'invalid_state');
    expect(redirectUrl).toContain('http://localhost:3000/dashboard/connected-accounts?status=error');
    expect(redirectUrl).toContain('Invalid%20or%20expired%20OAuth%20state');
  });

  it('should handle successful Meta OAuth callback and encrypt access token', async () => {
    const validState = generateOAuthState(mockUserId);
    const mockAccounts = [
      {
        platform: SocialPlatform.INSTAGRAM,
        platformUserId: 'ig-101',
        username: 'zerify_creator',
        displayName: 'Zerify Creator',
        avatar: 'https://cdn.example.com/avatar.jpg',
        accessToken: 'raw-meta-token-xyz',
        expiresAt: new Date(Date.now() + 60 * 86400 * 1000),
      },
    ];

    (metaProvider.exchangeCodeAndGetAccounts as jest.Mock).mockResolvedValue(mockAccounts);
    (repository.upsertAccount as jest.Mock).mockResolvedValue({
      id: 'acc-1',
      userId: mockUserId,
      platform: SocialPlatform.INSTAGRAM,
      platformUserId: 'ig-101',
      username: 'zerify_creator',
      displayName: 'Zerify Creator',
      avatar: 'https://cdn.example.com/avatar.jpg',
      accessToken: 'encrypted-token',
      refreshToken: null,
      expiresAt: mockAccounts[0].expiresAt,
      status: SocialAccountStatus.CONNECTED,
      connectedAt: new Date(),
      updatedAt: new Date(),
    });

    const redirectUrl = await service.handleMetaCallback('sample_code', validState);

    expect(redirectUrl).toEqual('http://localhost:3000/dashboard/connected-accounts?status=success&count=1');
    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.INSTAGRAM,
        platformUserId: 'ig-101',
      }),
    );
  });

  it('should list user social accounts omitting raw tokens', async () => {
    const mockDbAccounts = [
      {
        id: 'acc-1',
        userId: mockUserId,
        platform: SocialPlatform.INSTAGRAM,
        platformUserId: 'ig-101',
        username: 'zerify_creator',
        displayName: 'Zerify Creator',
        avatar: 'https://cdn.example.com/avatar.jpg',
        accessToken: 'secret_encrypted_token',
        refreshToken: null,
        expiresAt: new Date(),
        status: SocialAccountStatus.CONNECTED,
        connectedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (repository.findByUserId as jest.Mock).mockResolvedValue(mockDbAccounts);

    const result = await service.getUserAccounts(mockUserId);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('acc-1');
    expect(result[0].username).toBe('zerify_creator');
    expect((result[0] as any).accessToken).toBeUndefined();
  });

  it('should disconnect social account', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      id: 'acc-1',
      userId: mockUserId,
    });
    (repository.deleteAccount as jest.Mock).mockResolvedValue({} as any);

    const res = await service.disconnectAccount(mockUserId, 'acc-1');
    expect(res).toEqual({ success: true, id: 'acc-1' });
    expect(repository.deleteAccount).toHaveBeenCalledWith('acc-1', mockUserId);
  });

  it('should throw NotFoundException when disconnecting non-existent account', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.disconnectAccount(mockUserId, 'non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
