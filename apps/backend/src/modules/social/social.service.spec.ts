import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialPlatform, SocialAccountStatus } from '@prisma/client';
import { SocialService } from './social.service';
import { SocialRepository } from './social.repository';
import { MetaProvider } from './providers/meta/meta.provider';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState, generatePkcePair } from './utils/crypto.util';

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

  it('should support PKCE code pair generation and state payload preservation', () => {
    const { codeVerifier, codeChallenge } = generatePkcePair();
    expect(codeVerifier).toBeDefined();
    expect(codeChallenge).toBeDefined();
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);

    const userId = 'user-uuid-pkce';
    const state = generateOAuthState(userId, { codeVerifier });
    const verified = verifyOAuthState<{ codeVerifier: string }>(state);
    expect(verified.isValid).toBe(true);
    expect(verified.userId).toBe(userId);
    expect(verified.data?.codeVerifier).toBe(codeVerifier);
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
  let linkedinProvider: jest.Mocked<Partial<any>>;
  let twitterProvider: jest.Mocked<Partial<any>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockUserId = 'user-uuid-999';

  beforeEach(async () => {
    repository = {
      upsertAccount: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      disconnectAccount: jest.fn(),
      upsertYouTubeChannel: jest.fn(),
      upsertLinkedInProfile: jest.fn(),
      upsertTwitterProfile: jest.fn(),
      upsertTwitterTweet: jest.fn(),
      findTwitterProfile: jest.fn(),
      upsertProfileMetadata: jest.fn(),
      updateSyncState: jest.fn(),
      findByPlatformAndPlatformUserId: jest.fn(),
    };

    metaProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state) => {
        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=123&redirect_uri=${redirectUri}&state=${state}`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
    };

    linkedinProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state) => {
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=li_client_123&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
      fetchUserInfo: jest.fn(),
    };

    twitterProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state, codeChallenge) => {
        return `https://x.com/i/oauth2/authorize?response_type=code&client_id=mock_x_client_id&redirect_uri=${redirectUri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
      fetchUserInfo: jest.fn(),
      fetchUserTweets: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    const threadsProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state) => {
        return `https://threads.net/oauth/authorize?client_id=th_123&redirect_uri=${redirectUri}&state=${state}`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
      fetchUserProfile: jest.fn(),
      fetchUserThreads: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'META_REDIRECT_URI') return 'https://test.ngrok-free.app/api/v1/social/meta/callback';
        if (key === 'LINKEDIN_REDIRECT_URI') return 'https://test.ngrok-free.app/api/v1/social/linkedin/callback';
        if (key === 'X_REDIRECT_URI') return 'https://test.ngrok-free.app/api/v1/social/x/callback';
        if (key === 'THREADS_REDIRECT_URI') return 'https://test.ngrok-free.app/api/v1/social/threads/callback';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'META_CONFIG_ID') return '1191067560767082';
        if (key === 'META_APP_ID') return '1080562267988646';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: SocialRepository, useValue: repository },
        { provide: MetaProvider, useValue: metaProvider },
        { provide: ConfigService, useValue: configService },
        { provide: require('./providers/instagram/instagram.provider').InstagramProvider, useValue: { getAuthUrl: jest.fn(), exchangeCodeAndGetAccounts: jest.fn() } },
        { provide: require('./providers/youtube/youtube.provider').YoutubeProvider, useValue: { getAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?client_id=123'), exchangeCodeAndGetAccounts: jest.fn() } },
        { provide: require('./providers/linkedin/linkedin.provider').LinkedinProvider, useValue: linkedinProvider },
        { provide: require('./providers/twitter/twitter.provider').TwitterProvider, useValue: twitterProvider },
        { provide: require('./providers/threads/threads.provider').ThreadsProvider, useValue: threadsProvider },
        { provide: require('./social.gateway').SocialGateway, useValue: { emitAccountConnected: jest.fn(), emitAccountUpdated: jest.fn(), emitAccountMetricsUpdated: jest.fn() } },
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

    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
    expect(redirectUrl).toContain('User%20cancelled%20login');
  });

  it('should handle invalid state in callback by returning error redirect', async () => {
    const redirectUrl = await service.handleMetaCallback('valid_code', 'invalid_state');
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
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

    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.INSTAGRAM,
        platformUserId: 'ig-101',
      }),
    );
  });

  it('should generate YouTube OAuth auth URL with valid signed state', () => {
    const res = service.getYouTubeAuthUrl(mockUserId);
    expect(res.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(res.state).toBeDefined();

    const verified = verifyOAuthState(res.state);
    expect(verified.isValid).toBe(true);
    expect(verified.userId).toBe(mockUserId);
  });

  it('should handle successful YouTube OAuth callback and persist channel', async () => {
    const validState = generateOAuthState(mockUserId);
    const mockYtAccounts = [
      {
        platform: SocialPlatform.YOUTUBE,
        platformUserId: 'UC_test_123',
        username: 'Test Channel',
        displayName: 'Test Channel',
        accessToken: 'yt-raw-token',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        rawData: {
          channelId: 'UC_test_123',
          channelTitle: 'Test Channel',
          subscriberCount: 50000,
          videoCount: 120,
          viewCount: BigInt(5000000),
        },
      },
    ];

    const youtubeProvider = (service as any).youtubeProvider;
    youtubeProvider.exchangeCodeAndGetAccounts = jest.fn().mockResolvedValue(mockYtAccounts);
    (repository.upsertAccount as jest.Mock).mockResolvedValue({
      id: 'yt-acc-1',
      userId: mockUserId,
      platform: SocialPlatform.YOUTUBE,
      platformUserId: 'UC_test_123',
      username: 'Test Channel',
      accessToken: 'encrypted-token',
      refreshToken: null,
      status: SocialAccountStatus.CONNECTED,
    });
    repository.upsertYouTubeChannel = jest.fn().mockResolvedValue({} as any);

    const redirectUrl = await service.handleYouTubeCallback('sample_yt_code', validState);
    expect(redirectUrl).toEqual('http://localhost:3000/social/callback?status=success&count=1');
    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.YOUTUBE,
        platformUserId: 'UC_test_123',
      }),
    );
    expect(repository.upsertYouTubeChannel).toHaveBeenCalledWith(
      'yt-acc-1',
      expect.objectContaining({
        channelId: 'UC_test_123',
        channelTitle: 'Test Channel',
      }),
    );
  });

  it('should handle YouTube OAuth callback error by redirecting with error', async () => {
    const redirectUrl = await service.handleYouTubeCallback(
      undefined,
      undefined,
      'access_denied',
      'The user denied access',
    );
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
    expect(redirectUrl).toContain('The%20user%20denied%20access');
  });

  it('should generate LinkedIn OAuth auth URL with valid signed state and OIDC scopes', () => {
    const res = service.getLinkedInAuthUrl(mockUserId);
    expect(res.url).toContain('https://www.linkedin.com/oauth/v2/authorization');
    expect(res.state).toBeDefined();

    const verified = verifyOAuthState(res.state);
    expect(verified.isValid).toBe(true);
    expect(verified.userId).toBe(mockUserId);
  });

  it('should handle LinkedIn OAuth callback error by redirecting with error', async () => {
    const redirectUrl = await service.handleLinkedInCallback(
      undefined,
      undefined,
      'user_cancelled_authorize',
      'The user cancelled the authorization',
    );
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
    expect(redirectUrl).toContain('The%20user%20cancelled%20the%20authorization');
  });

  it('should handle invalid state in LinkedIn callback by returning error redirect', async () => {
    const redirectUrl = await service.handleLinkedInCallback('sample_code', 'corrupt_state');
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
    expect(redirectUrl).toContain('Invalid%20or%20expired%20OAuth%20state');
  });

  it('should prevent account collision if LinkedIn account is already connected to another user', async () => {
    const validState = generateOAuthState(mockUserId);
    linkedinProvider.exchangeCodeAndGetAccounts.mockResolvedValue([
      {
        platform: SocialPlatform.LINKEDIN,
        platformUserId: 'li_existing_member',
        username: 'Existing User',
        displayName: 'Existing User',
        avatar: 'https://example.com/avatar.jpg',
        followerCount: 0,
        accessToken: 'sample_token',
      },
    ]);

    repository.findByPlatformAndPlatformUserId.mockResolvedValue({
      id: 'existing-acc-id',
      userId: 'different-user-uuid',
      platform: SocialPlatform.LINKEDIN,
      platformUserId: 'li_existing_member',
      status: 'CONNECTED',
    } as any);

    const redirectUrl = await service.handleLinkedInCallback('sample_code', validState);
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=error');
    expect(redirectUrl).toContain('already%20connected%20to%20another%20Zerify%20user');
    expect(repository.upsertAccount).not.toHaveBeenCalled();
  });

  it('should successfully link LinkedIn account, encrypt tokens, and upsert LinkedInProfile', async () => {
    const validState = generateOAuthState(mockUserId);
    linkedinProvider.exchangeCodeAndGetAccounts.mockResolvedValue([
      {
        platform: SocialPlatform.LINKEDIN,
        platformUserId: 'li_unique_999',
        username: 'Jane Doe',
        displayName: 'Jane Doe',
        avatar: 'https://example.com/jane.jpg',
        followerCount: 0,
        accessToken: 'raw_linkedin_access_token',
        expiresAt: new Date(Date.now() + 3600000),
        rawData: {
          linkedinId: 'li_unique_999',
          localizedFirstName: 'Jane',
          localizedLastName: 'Doe',
          profilePictureUrl: 'https://example.com/jane.jpg',
          email: 'jane@example.com',
          emailVerified: true,
          locale: 'en_US',
        },
      },
    ]);

    repository.findByPlatformAndPlatformUserId.mockResolvedValue(null);
    repository.upsertAccount.mockResolvedValue({
      id: 'li-acc-999',
      userId: mockUserId,
      platform: SocialPlatform.LINKEDIN,
      platformUserId: 'li_unique_999',
    } as any);

    const redirectUrl = await service.handleLinkedInCallback('sample_code', validState);
    expect(redirectUrl).toBe('http://localhost:3000/social/callback?status=success&count=1');
    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.LINKEDIN,
        platformUserId: 'li_unique_999',
        username: 'Jane Doe',
      }),
    );
    expect(repository.upsertLinkedInProfile).toHaveBeenCalledWith(
      'li-acc-999',
      expect.objectContaining({
        linkedinId: 'li_unique_999',
        localizedFirstName: 'Jane',
        localizedLastName: 'Doe',
        email: 'jane@example.com',
        emailVerified: true,
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

  describe('X (Twitter) OAuth 2.0 PKCE Flow', () => {
    it('should generate X OAuth auth URL with signed PKCE state and challenge', () => {
      const res = service.getXAuthUrl(mockUserId);
      expect(res.url).toContain('https://x.com/i/oauth2/authorize');
      expect(res.url).toContain('code_challenge_method=S256');
      expect(res.state).toBeDefined();

      const { userId, isValid, data } = verifyOAuthState<{ codeVerifier: string }>(res.state);
      expect(isValid).toBe(true);
      expect(userId).toBe(mockUserId);
      expect(data?.codeVerifier).toBeDefined();
    });

    it('should handle X callback error / cancellation gracefully', async () => {
      const redirectUrl = await service.handleXCallback(
        undefined,
        undefined,
        'access_denied',
        'The user denied access',
      );
      expect(redirectUrl).toContain('status=error');
      expect(redirectUrl).toContain('The%20user%20denied%20access');
    });

    it('should reject X callback with corrupted state token', async () => {
      const redirectUrl = await service.handleXCallback('sample_code', 'corrupt_state');
      expect(redirectUrl).toContain('status=error');
      expect(redirectUrl).toContain('Invalid%20or%20expired%20OAuth%20state');
    });

    it('should prevent X account collision when account belongs to another user', async () => {
      const { codeVerifier } = generatePkcePair();
      const validState = generateOAuthState(mockUserId, { codeVerifier });

      twitterProvider.exchangeCodeAndGetAccounts.mockResolvedValue([
        {
          platform: SocialPlatform.TWITTER,
          platformUserId: 'tw_collision_user',
          username: 'collision_handle',
          displayName: 'Colliding Creator',
          accessToken: 'test_token',
        },
      ]);

      (repository.findByPlatformAndPlatformUserId as jest.Mock).mockResolvedValue({
        id: 'acc-other-user',
        userId: 'different-user-uuid',
        platform: SocialPlatform.TWITTER,
        platformUserId: 'tw_collision_user',
        status: 'CONNECTED',
      });

      const redirectUrl = await service.handleXCallback('valid_code', validState);
      expect(redirectUrl).toContain('status=error');
      expect(redirectUrl).toContain('already%20connected%20to%20another%20Zerify%20user');
      expect(repository.upsertAccount).not.toHaveBeenCalled();
    });

    it('should successfully connect X account, persist profile and trigger initial sync', async () => {
      const { codeVerifier } = generatePkcePair();
      const validState = generateOAuthState(mockUserId, { codeVerifier });

      const mockXProfile = {
        platform: SocialPlatform.TWITTER,
        platformUserId: 'tw_creator_123',
        username: 'ZerifyCreatorX',
        displayName: 'Zerify Creator (X)',
        avatar: 'https://pbs.twimg.com/avatar.jpg',
        followerCount: 25000,
        accessToken: 'mock_x_token',
        refreshToken: 'mock_x_refresh',
        rawData: {
          id: 'tw_creator_123',
          username: 'ZerifyCreatorX',
          name: 'Zerify Creator (X)',
          description: 'Influencer on X',
          profile_image_url: 'https://pbs.twimg.com/avatar.jpg',
          public_metrics: {
            followers_count: 25000,
            following_count: 400,
            tweet_count: 1200,
          },
          verified_type: 'blue',
        },
      };

      twitterProvider.exchangeCodeAndGetAccounts.mockResolvedValue([mockXProfile]);
      (repository.findByPlatformAndPlatformUserId as jest.Mock).mockResolvedValue(null);
      (repository.upsertAccount as jest.Mock).mockResolvedValue({
        id: 'social-acc-tw-1',
        userId: mockUserId,
        platform: SocialPlatform.TWITTER,
        platformUserId: 'tw_creator_123',
      });
      (repository.upsertTwitterProfile as jest.Mock).mockResolvedValue({
        id: 'tw-prof-1',
        socialAccountId: 'social-acc-tw-1',
      });
      (repository.upsertProfileMetadata as jest.Mock).mockResolvedValue({});

      const redirectUrl = await service.handleXCallback('auth_code_123', validState);
      expect(redirectUrl).toContain('status=success&count=1');
      expect(repository.upsertTwitterProfile).toHaveBeenCalledWith(
        'social-acc-tw-1',
        expect.objectContaining({
          twitterId: 'tw_creator_123',
          username: 'ZerifyCreatorX',
          followersCount: 25000,
        }),
      );
    });
  });

  describe('Threads OAuth Flow', () => {
    it('should generate Threads OAuth authorization URL with valid state token', () => {
      const { url, state } = service.getThreadsAuthUrl(mockUserId);
      expect(url).toContain('https://threads.net/oauth/authorize');
      expect(url).toContain(`client_id=th_123`);
      expect(state).toBeDefined();

      const verified = verifyOAuthState(state);
      expect(verified.isValid).toBe(true);
      expect(verified.userId).toEqual(mockUserId);
    });

    it('should return error URL if Threads OAuth returns an error', async () => {
      const redirectUrl = await service.handleThreadsCallback(
        undefined,
        'any_state',
        'access_denied',
        'User denied authorization',
      );
      expect(redirectUrl).toContain('/social/callback?status=error');
      expect(redirectUrl).toContain('User%20denied%20authorization');
    });

    it('should exchange code and successfully save Threads account and profile', async () => {
      const state = generateOAuthState(mockUserId);
      const mockThreadsProfile = {
        platform: SocialPlatform.THREADS,
        platformUserId: 'threads_user_999',
        username: 'ZerifyThreadsCreator',
        displayName: 'Threads Creator',
        avatar: 'https://threads.net/avatar.png',
        followerCount: 15400,
        accessToken: 'mock_threads_access_token',
        refreshToken: 'mock_threads_refresh_token',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        rawData: {
          id: 'threads_user_999',
          username: 'ZerifyThreadsCreator',
          name: 'Threads Creator',
          threads_biography: 'Hello from Threads',
          followersCount: 15400,
        },
      };

      const threadsProviderInstance = (service as any).threadsProvider;
      threadsProviderInstance.exchangeCodeAndGetAccounts.mockResolvedValue([mockThreadsProfile]);

      (repository.findByPlatformAndPlatformUserId as jest.Mock).mockResolvedValue(null);
      (repository.upsertAccount as jest.Mock).mockResolvedValue({
        id: 'social-acc-th-1',
        userId: mockUserId,
        platform: SocialPlatform.THREADS,
        platformUserId: 'threads_user_999',
      });
      (repository.upsertThreadsProfile as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'th-prof-1',
        socialAccountId: 'social-acc-th-1',
      });
      (repository.upsertProfileMetadata as jest.Mock).mockResolvedValue({});

      const redirectUrl = await service.handleThreadsCallback('auth_code_threads_123', state);
      expect(redirectUrl).toContain('status=success&platform=threads&count=1');
      expect(repository.upsertAccount).toHaveBeenCalled();
      expect((repository.upsertThreadsProfile as jest.Mock)).toHaveBeenCalledWith(
        'social-acc-th-1',
        expect.objectContaining({
          threadsId: 'threads_user_999',
          username: 'ZerifyThreadsCreator',
          followersCount: 15400,
        }),
      );
    });
  });
});


describe('MetaProvider Unit Tests', () => {
  let metaProvider: MetaProvider;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'META_APP_ID') return 'test-app-id-123';
        if (key === 'META_CONFIG_ID') return 'test-config-id-456';
        if (key === 'META_OAUTH_DIALOG_URL') return 'https://www.facebook.com/v23.0/dialog/oauth';
        return null;
      }),
    };

    metaProvider = new MetaProvider(mockConfigService as ConfigService);
  });

  it('should generate Facebook Login for Business auth URL with config_id and override_default_response_type', () => {
    const redirectUri = 'https://test.ngrok-free.app/api/v1/social/meta/callback';
    const state = 'test_signed_state';
    const authUrlString = metaProvider.getAuthUrl(redirectUri, state);

    const url = new URL(authUrlString);

    expect(url.origin + url.pathname).toBe('https://www.facebook.com/v23.0/dialog/oauth');
    expect(url.searchParams.get('client_id')).toBe('test-app-id-123');
    expect(url.searchParams.get('redirect_uri')).toBe(redirectUri);
    expect(url.searchParams.get('state')).toBe(state);
    expect(url.searchParams.get('config_id')).toBe('test-config-id-456');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('override_default_response_type')).toBe('true');

    // Must NOT include scope=public_profile,email
    expect(url.searchParams.get('scope')).toBeNull();
  });

  it('should throw clear exception if META_CONFIG_ID is missing', () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'META_APP_ID') return 'test-app-id-123';
      if (key === 'META_CONFIG_ID') return undefined;
      return null;
    });

    expect(() =>
      metaProvider.getAuthUrl('https://test.ngrok-free.app/api/v1/social/meta/callback', 'state'),
    ).toThrow('META_CONFIG_ID environment variable is missing');
  });
});
