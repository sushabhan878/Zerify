import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  let instagramProvider: jest.Mocked<Partial<any>>;
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
      upsertProfileMetadata: jest.fn(),
      updateAccountFollowerCount: jest.fn(),
      updateAccountProfile: jest.fn(),
      updateAccountCustomData: jest.fn(),
      recordAccountPerformance: jest.fn(),
      upsertAudienceDemographic: jest.fn(),
      upsertMediaWithPerformance: jest.fn(),
      updateSyncState: jest.fn(),
      updateTokenLifecycle: jest.fn(),
      findByPlatformAndPlatformUserId: jest.fn(),
      findByUserIdAndPlatform: jest.fn(),
      findPagesByUserId: jest.fn().mockResolvedValue([]),
      findIdentityByUserId: jest.fn(),
      findAccountByUserAndPlatform: jest.fn().mockResolvedValue(null),
      getAudienceDemographicsByAccountId: jest.fn().mockResolvedValue([]),
      getUserAudienceDemographics: jest.fn().mockResolvedValue([]),
      getAccountAnalytics: jest.fn(),
      pruneOldMediaContent: jest.fn(),
    };

    instagramProvider = {
      getAuthUrl: jest.fn(),
      exchangeCodeAndGetAccounts: jest.fn(),
      refreshLongLivedToken: jest.fn(),
    };

    metaProvider = {
      getAuthUrl: jest.fn().mockImplementation((redirectUri, state) => {
        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=123&redirect_uri=${redirectUri}&state=${state}`;
      }),
      exchangeCodeAndGetAccounts: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
      getUserProfile: jest.fn(),
      getManagedPages: jest.fn(),
      getPageProfile: jest.fn(),
      getPageInsights: jest.fn(),
      getPageDemographics: jest.fn(),
      getPagePosts: jest.fn(),
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
        { provide: require('./providers/instagram/instagram.provider').InstagramProvider, useValue: instagramProvider },
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

  it('should handle successful Meta OAuth callback, persist user identity and redirect to page selection', async () => {
    const validState = generateOAuthState(mockUserId);
    const mockExpiresAt = new Date(Date.now() + 60 * 86400 * 1000);

    metaProvider.exchangeCodeForTokens.mockResolvedValue({
      userAccessToken: 'raw-meta-token-xyz',
      expiresInSeconds: 5184000,
      expiresAt: mockExpiresAt,
    });
    metaProvider.getUserProfile.mockResolvedValue({
      id: 'fb-user-123',
      name: 'Zerify Founder',
      avatar: 'https://cdn.example.com/avatar.jpg',
      email: 'founder@zerify.io',
    });
    metaProvider.getManagedPages.mockResolvedValue([
      {
        id: 'page-101',
        name: 'Zerify Official',
        category: 'Tech Company',
        accessToken: 'page-token-101',
        followerCount: 15200,
        isVerified: true,
      },
    ]);

    (repository.upsertAccount as jest.Mock).mockResolvedValue({
      id: 'acc-user-fb-1',
      userId: mockUserId,
      platform: SocialPlatform.FACEBOOK,
      platformUserId: 'fb-user-123',
      accountType: 'PERSONAL',
      username: 'Zerify Founder',
      accessToken: 'encrypted-token',
      status: SocialAccountStatus.CONNECTED,
    });

    const redirectUrl = await service.handleMetaCallback('sample_code', validState);

    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.FACEBOOK,
        platformUserId: 'fb-user-123',
        accountType: 'PERSONAL',
      }),
    );
    expect(redirectUrl).toContain('http://localhost:3000/social/callback?status=success');
    expect(redirectUrl).toContain('platform=facebook');
    expect(redirectUrl).toMatch(/count=\d+/);
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
    repository.upsertProfileMetadata = jest.fn().mockResolvedValue({} as any);

    const redirectUrl = await service.handleYouTubeCallback('sample_yt_code', validState);
    expect(redirectUrl).toEqual('http://localhost:3000/social/callback?status=success&count=1');
    expect(repository.upsertAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        platform: SocialPlatform.YOUTUBE,
        platformUserId: 'UC_test_123',
      }),
    );
    expect(repository.upsertProfileMetadata).toHaveBeenCalledWith(
      'yt-acc-1',
      expect.objectContaining({
        displayName: 'Test Channel',
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
    expect(repository.upsertProfileMetadata).toHaveBeenCalledWith(
      'li-acc-999',
      expect.objectContaining({
        email: 'jane@example.com',
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
      (repository.upsertProfileMetadata as jest.Mock).mockResolvedValue({});

      const redirectUrl = await service.handleXCallback('auth_code_123', validState);
      expect(redirectUrl).toContain('status=success&count=1');
      expect(repository.upsertProfileMetadata).toHaveBeenCalledWith(
        'social-acc-tw-1',
        expect.objectContaining({
          username: 'ZerifyCreatorX',
          followerCount: 25000,
        }),
      );
    });
  });

  describe('X (Twitter) account deep sync', () => {
    const mockAccount = {
      id: 'acc-x-sync-1',
      userId: mockUserId,
      platform: SocialPlatform.TWITTER,
      platformUserId: 'tw_sync_user_1',
      username: 'ZerifyCreatorX',
      handle: '@ZerifyCreatorX',
      avatar: null,
      followerCount: 100,
      engagementRate: null,
      status: 'CONNECTED',
      accessToken: encryptToken('valid_x_token'),
      refreshToken: encryptToken('valid_x_refresh'),
      expiresAt: new Date(Date.now() + 3600 * 1000),
      accountType: 'PERSONAL',
    };

    beforeEach(() => {
      (repository.findById as jest.Mock).mockResolvedValue(mockAccount);
      (repository.updateAccountProfile as jest.Mock).mockResolvedValue(mockAccount);
      (repository.upsertProfileMetadata as jest.Mock).mockResolvedValue({});
      (repository.upsertMediaWithPerformance as jest.Mock).mockResolvedValue({});
      (repository.updateAccountFollowerCount as jest.Mock).mockResolvedValue(mockAccount);
      (repository.recordAccountPerformance as jest.Mock).mockResolvedValue({});
      (repository.updateSyncState as jest.Mock).mockResolvedValue({});
      (repository.getAccountAnalytics as jest.Mock).mockResolvedValue(mockAccount);
      (repository.updateTokenLifecycle as jest.Mock).mockResolvedValue(mockAccount);
    });

    it('should persist tweets as media content, engagement rate and performance snapshot', async () => {
      twitterProvider.fetchUserInfo.mockResolvedValue({
        id: 'tw_sync_user_1',
        name: 'Zerify Creator (X)',
        username: 'ZerifyCreatorX',
        description: 'bio',
        profile_image_url: 'https://pbs.twimg.com/avatar.jpg',
        public_metrics: { followers_count: 100, following_count: 10, tweet_count: 50 },
      });
      twitterProvider.fetchUserTweets.mockResolvedValue([
        {
          id: 'tweet-1',
          text: 'First tweet',
          created_at: '2026-09-10T10:00:00.000Z',
          public_metrics: { like_count: 10, retweet_count: 5, reply_count: 2, quote_count: 1, impression_count: 400 },
        },
        {
          id: 'tweet-2',
          text: 'Second tweet',
          created_at: '2026-09-11T11:00:00.000Z',
          public_metrics: { like_count: 30, retweet_count: 5, reply_count: 5, quote_count: 0, impression_count: 600 },
        },
      ]);

      await service.syncXAccountDetails('acc-x-sync-1');

      expect(repository.upsertMediaWithPerformance).toHaveBeenCalledTimes(2);
      expect(repository.upsertMediaWithPerformance).toHaveBeenCalledWith(
        'acc-x-sync-1',
        expect.objectContaining({ platformMediaId: 'tweet-1', caption: 'First tweet' }),
        expect.objectContaining({ likeCount: 10, commentCount: 2, shareCount: 5, impressions: 400 }),
      );

      // ER = avg(10+5+2+1, 30+5+5+0) / followers * 100 = avg(18, 40)/100*100 = 29
      expect(repository.updateAccountFollowerCount).toHaveBeenCalledWith('acc-x-sync-1', 100, 29);

      expect(repository.recordAccountPerformance).toHaveBeenCalledWith(
        'acc-x-sync-1',
        expect.objectContaining({
          source: 'X_API_V2',
          followerCount: 100,
          engagementRate: 29,
          totalInteractions: 58,
          likes: 40,
          comments: 7,
          shares: 10,
        }),
      );

      const mediaContentSync = (repository.updateSyncState as jest.Mock).mock.calls.find(
        (c) => c[1] === 'MEDIA_CONTENT' && c[2] === 'SUCCESS',
      );
      expect(mediaContentSync).toBeDefined();
      expect(mediaContentSync[3]).toEqual(expect.objectContaining({ recordsSynced: 2 }));
    });

    it('should mark sync REAUTHORIZATION_REQUIRED (not fake SUCCESS) when user info fetch fails with 401', async () => {
      twitterProvider.fetchUserInfo.mockRejectedValue(new Error('401 Unauthorized'));
      twitterProvider.fetchUserTweets.mockResolvedValue([]);

      await service.syncXAccountDetails('acc-x-sync-1');

      expect(repository.upsertMediaWithPerformance).not.toHaveBeenCalled();
      expect(repository.recordAccountPerformance).not.toHaveBeenCalled();

      const authFailedCalls = (repository.updateSyncState as jest.Mock).mock.calls.filter(
        (c) => c[2] === 'REAUTHORIZATION_REQUIRED',
      );
      expect(authFailedCalls.length).toBeGreaterThan(0);
      for (const call of authFailedCalls) {
        expect(call[3]).toEqual(expect.objectContaining({ lastErrorCode: 'AUTH_EXPIRED' }));
      }
      expect(repository.updateTokenLifecycle).toHaveBeenCalledWith(
        'acc-x-sync-1',
        expect.objectContaining({ tokenStatus: 'REAUTHORIZATION_REQUIRED' }),
      );
    });

    it('should mark sync FAILED when tweet fetch errors instead of silently saving nothing', async () => {
      twitterProvider.fetchUserInfo.mockResolvedValue({
        id: 'tw_sync_user_1',
        name: 'Zerify Creator (X)',
        username: 'ZerifyCreatorX',
        public_metrics: { followers_count: 100, tweet_count: 50 },
      });
      twitterProvider.fetchUserTweets.mockRejectedValue(
        new Error('Failed to fetch X user tweets (403): client-not-enrolled'),
      );

      await service.syncXAccountDetails('acc-x-sync-1');

      expect(repository.upsertMediaWithPerformance).not.toHaveBeenCalled();
      const failedCalls = (repository.updateSyncState as jest.Mock).mock.calls.filter(
        (c) => c[2] === 'FAILED',
      );
      expect(failedCalls.length).toBeGreaterThan(0);
      expect(failedCalls.some((c) => c[3]?.lastError?.includes('403'))).toBe(true);
    });

    it('should handle a genuinely empty timeline without marking the whole sync failed', async () => {
      twitterProvider.fetchUserInfo.mockResolvedValue({
        id: 'tw_sync_user_1',
        name: 'Zerify Creator (X)',
        username: 'ZerifyCreatorX',
        public_metrics: { followers_count: 100, tweet_count: 0 },
      });
      twitterProvider.fetchUserTweets.mockResolvedValue([]);

      await service.syncXAccountDetails('acc-x-sync-1');

      expect(repository.updateAccountFollowerCount).toHaveBeenCalledWith('acc-x-sync-1', 100, null);
      const mediaSuccess = (repository.updateSyncState as jest.Mock).mock.calls.find(
        (c) => c[1] === 'MEDIA_CONTENT' && c[2] === 'SUCCESS',
      );
      expect(mediaSuccess).toBeDefined();
      expect(mediaSuccess[3]).toEqual(expect.objectContaining({ recordsSynced: 0 }));
    });

    it('should require reauthorization when token refresh fails for an expired token', async () => {
      (repository.findById as jest.Mock).mockResolvedValue({
        ...mockAccount,
        expiresAt: new Date(Date.now() - 3600 * 1000),
      });
      twitterProvider.refreshAccessToken.mockRejectedValue(new Error('invalid_grant: revoked'));

      await service.syncXAccountDetails('acc-x-sync-1');

      expect(repository.updateSyncState).toHaveBeenCalledWith(
        'acc-x-sync-1',
        'PROFILE_METADATA',
        'REAUTHORIZATION_REQUIRED',
        expect.objectContaining({ lastErrorCode: 'AUTH_EXPIRED' }),
      );
      expect(repository.updateTokenLifecycle).toHaveBeenCalledWith(
        'acc-x-sync-1',
        expect.objectContaining({ tokenStatus: 'REAUTHORIZATION_REQUIRED' }),
      );
      expect(twitterProvider.fetchUserInfo).not.toHaveBeenCalled();
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
      (repository.upsertProfileMetadata as jest.Mock).mockResolvedValue({});

      const redirectUrl = await service.handleThreadsCallback('auth_code_threads_123', state);
      expect(redirectUrl).toContain('status=success&platform=threads&count=1');
      expect(repository.upsertAccount).toHaveBeenCalled();
      expect(repository.upsertProfileMetadata).toHaveBeenCalledWith(
        'social-acc-th-1',
        expect.objectContaining({
          username: 'ZerifyThreadsCreator',
          followerCount: 15400,
        }),
      );
    });
  });

  describe('Instagram Token Lifecycle & Spec Compliance', () => {
      it('should refresh Instagram long-lived token and update lifecycle fields', async () => {
        const mockExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        const encryptedExistingToken = encryptToken('old-raw-token');

        (repository.findById as jest.Mock).mockResolvedValue({
          id: 'acc-ig-123',
          platform: SocialPlatform.INSTAGRAM,
          accessToken: encryptedExistingToken,
          tokenStatus: 'ACTIVE',
        });

        instagramProvider.refreshLongLivedToken.mockResolvedValue({
          accessToken: 'new-refreshed-token',
          expiresAt: mockExpiresAt,
        });

        const result = await service.refreshInstagramToken('acc-ig-123');

        expect(result.success).toBe(true);
        expect(result.expiresAt).toEqual(mockExpiresAt);
        expect(instagramProvider.refreshLongLivedToken).toHaveBeenCalledWith('old-raw-token');
        expect(repository.updateTokenLifecycle).toHaveBeenCalledWith(
          'acc-ig-123',
          expect.objectContaining({
            tokenStatus: 'ACTIVE',
            expiresAt: mockExpiresAt,
            lastTokenError: null,
          }),
        );
      });

      it('should flag REAUTHORIZATION_REQUIRED when token refresh encounters code 190 / expired session', async () => {
        const encryptedExistingToken = encryptToken('expired-raw-token');

        (repository.findById as jest.Mock).mockResolvedValue({
          id: 'acc-ig-456',
          platform: SocialPlatform.INSTAGRAM,
          accessToken: encryptedExistingToken,
          tokenStatus: 'ACTIVE',
        });

        const oauthError: any = new Error('Error validating access token: Session has expired.');
        oauthError.code = 190;
        instagramProvider.refreshLongLivedToken.mockRejectedValue(oauthError);

        const result = await service.refreshInstagramToken('acc-ig-456');

        expect(result.success).toBe(false);
        expect(repository.updateTokenLifecycle).toHaveBeenCalledWith(
          'acc-ig-456',
          expect.objectContaining({
            tokenStatus: 'REAUTHORIZATION_REQUIRED',
          }),
        );
        expect(repository.updateSyncState).toHaveBeenCalledWith(
          'acc-ig-456',
          'PROFILE_METADATA',
          'REAUTHORIZATION_REQUIRED',
          expect.objectContaining({
            lastErrorCode: 'TOKEN_EXPIRED',
          }),
        );
      });

      it('should return empty demographics when no genuine API demographics exist without synthetic fabrication', async () => {
        (repository.findByUserId as jest.Mock).mockResolvedValue([
          { id: 'acc-ig-789', platform: SocialPlatform.INSTAGRAM, userId: mockUserId },
        ]);
        (repository.getAudienceDemographicsByAccountId as jest.Mock).mockResolvedValue([]);

        const demographics = await service.getUserAudienceDemographics(mockUserId);
        expect(demographics).toEqual([]);
        expect(repository.upsertAudienceDemographic).not.toHaveBeenCalled();
      });
    });

    describe('Facebook Multi-Page & Spec Compliance', () => {
      it('should reject unauthorized page IDs during selection with ForbiddenException (Section 44)', async () => {
        const encryptedUserToken = encryptToken('valid-user-fb-token');
        (repository.findIdentityByUserId as jest.Mock).mockResolvedValue({
          id: 'acc-fb-user-1',
          platform: SocialPlatform.FACEBOOK,
          accountType: 'PERSONAL',
          accessToken: encryptedUserToken,
        });

        // Meta only authorized page-1 and page-2
        metaProvider.getManagedPages.mockResolvedValue([
          { id: 'page-1', name: 'Authorized Page 1', accessToken: 'token-1' },
          { id: 'page-2', name: 'Authorized Page 2', accessToken: 'token-2' },
        ]);

        // Attacker or unauthorized request submits page-999
        await expect(
          service.selectFacebookPages(mockUserId, ['page-1', 'page-999']),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should connect multiple authorized Facebook pages as separate SocialAccount records with accountType PAGE', async () => {
        const encryptedUserToken = encryptToken('valid-user-fb-token');
        (repository.findIdentityByUserId as jest.Mock).mockResolvedValue({
          id: 'acc-fb-user-1',
          platform: SocialPlatform.FACEBOOK,
          accountType: 'PERSONAL',
          accessToken: encryptedUserToken,
        });

        metaProvider.getManagedPages.mockResolvedValue([
          {
            id: 'page-1',
            name: 'Zerify Official',
            category: 'Tech',
            accessToken: 'token-page-1',
            followerCount: 25000,
            isVerified: true,
            link: 'https://facebook.com/zerify',
            pictureUrl: 'https://zerify.io/pic1.jpg',
          },
          {
            id: 'page-2',
            name: 'Cheri Fashion',
            category: 'Retail',
            accessToken: 'token-page-2',
            followerCount: 4800,
            isVerified: null,
            link: 'https://facebook.com/cheri',
            pictureUrl: 'https://zerify.io/pic2.jpg',
          },
        ]);

        (repository.upsertAccount as jest.Mock).mockImplementation((data) => {
          return Promise.resolve({
            id: `acc-${data.platformUserId}`,
            userId: data.userId,
            platform: data.platform,
            platformUserId: data.platformUserId,
            accountType: data.accountType,
            username: data.username,
            avatar: data.avatar,
            accessToken: data.accessToken,
            status: SocialAccountStatus.CONNECTED,
          });
        });

        const res = await service.selectFacebookPages(mockUserId, ['page-1', 'page-2']);

        expect(res.success).toBe(true);
        expect(res.count).toBe(2);

        // Verify Page 1 upsert
        expect(repository.upsertAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
            platform: SocialPlatform.FACEBOOK,
            platformUserId: 'page-1',
            accountType: 'PAGE',
            isVerified: true,
            followerCount: 25000,
          }),
        );

        // Verify Page 2 upsert
        expect(repository.upsertAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
            platform: SocialPlatform.FACEBOOK,
            platformUserId: 'page-2',
            accountType: 'PAGE',
            isVerified: null,
            followerCount: 4800,
          }),
        );
      });

      it('should calculate safe engagement rate and enforce metric nullability during syncFacebookPage', async () => {
        const encryptedPageToken = encryptToken('raw-page-token');
        (repository.findById as jest.Mock).mockResolvedValue({
          id: 'acc-page-1',
          platform: SocialPlatform.FACEBOOK,
          platformUserId: 'page-1',
          accountType: 'PAGE',
          username: 'Zerify Official',
          accessToken: encryptedPageToken,
          followerCount: 25000,
        });

        metaProvider.getPageProfile.mockResolvedValue({
          name: 'Zerify Official',
          followers_count: 25000,
          is_verified: true,
          link: 'https://facebook.com/zerify',
        });

        metaProvider.getPageInsights.mockResolvedValue({
          reach: 10000,
          impressions: 15000,
          totalInteractions: 500,
          engagedUsers: 500,
          views: 3000,
          likes: 400,
          comments: 80,
          shares: 20,
          clicks: null,
          mediaViews: null,
          rawMetrics: {},
        });

        metaProvider.getPageDemographics.mockResolvedValue([]);
        metaProvider.getPagePosts.mockResolvedValue([]);

        await service.syncFacebookPage('acc-page-1');

        // Safe engagement rate: (500 / 10000) * 100 = 5.0
        expect(repository.recordAccountPerformance).toHaveBeenCalledWith(
          'acc-page-1',
          expect.objectContaining({
            reach: 10000,
            impressions: 15000,
            totalInteractions: 500,
            engagementRate: 5,
            source: 'FACEBOOK_GRAPH_API',
          }),
        );

        // Operational sync status updated to SUCCESS with 6h nextSyncAt
        expect(repository.updateSyncState).toHaveBeenCalledWith(
          'acc-page-1',
          'PROFILE_METADATA',
          'SUCCESS',
          expect.objectContaining({
            retryCount: 0,
            nextSyncAt: expect.any(Date),
          }),
        );
      });
    });

    describe('YouTube Integration & Spec Compliance', () => {
      it('should preserve existing refresh token when Google OAuth callback omits refresh token (Section 6 & 46)', async () => {
        const validState = generateOAuthState(mockUserId);
        const mockYtAccounts = [
          {
            platform: SocialPlatform.YOUTUBE,
            platformUserId: 'UC_test_reauth',
            username: 'Reauth Channel',
            displayName: 'Reauth Channel',
            accessToken: 'new-access-token',
            refreshToken: undefined, // Google did not return a new refresh token
            expiresAt: new Date(Date.now() + 3600 * 1000),
            rawData: {
              channelId: 'UC_test_reauth',
              channelTitle: 'Reauth Channel',
              subscriberCount: 85000,
            },
          },
        ];

        const youtubeProvider = (service as any).youtubeProvider;
        youtubeProvider.exchangeCodeAndGetAccounts = jest.fn().mockResolvedValue(mockYtAccounts);
        const existingRefreshToken = encryptToken('existing_valid_google_refresh_token');

        repository.findAccountByUserAndPlatform = jest.fn().mockResolvedValue({
          id: 'existing-yt-acc',
          userId: mockUserId,
          platform: SocialPlatform.YOUTUBE,
          platformUserId: 'UC_test_reauth',
          refreshToken: existingRefreshToken,
        } as any);

        (repository.upsertAccount as jest.Mock).mockResolvedValue({
          id: 'existing-yt-acc',
          userId: mockUserId,
          platform: SocialPlatform.YOUTUBE,
          platformUserId: 'UC_test_reauth',
          username: 'Reauth Channel',
          status: SocialAccountStatus.CONNECTED,
        });

        await service.handleYouTubeCallback('google_auth_code', validState);

        expect(repository.upsertAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
            platform: SocialPlatform.YOUTUBE,
            platformUserId: 'UC_test_reauth',
            accountType: 'CHANNEL',
            refreshToken: existingRefreshToken, // Preserved!
            tokenType: 'BEARER',
            refreshMethod: 'OAUTH_REFRESH_TOKEN',
          }),
        );
      });

      it('should calculate safe engagement rate and set reach/impressions to null during syncYouTubeChannelDetails (Section 18 & 21)', async () => {
        const youtubeProvider = (service as any).youtubeProvider;
        youtubeProvider.fetchChannelVideos = jest.fn().mockResolvedValue([
          {
            videoId: 'vid-yt-1',
            title: 'Sample Tech Review',
            description: 'Tech review caption',
            viewCount: BigInt(25000),
            likeCount: 1200,
            commentCount: 150,
            durationSeconds: 742,
          },
        ]);
        youtubeProvider.fetchChannelAnalytics = jest.fn().mockResolvedValue([
          {
            date: new Date('2026-09-08'),
            views: BigInt(10000),
            likes: 400,
            comments: 50,
            shares: 50,
            subscribersGained: 20,
            subscribersLost: 2,
            estimatedMinutesWatched: BigInt(45000),
            averageViewDuration: 4.5,
          },
        ]);
        youtubeProvider.fetchChannelDemographics = jest.fn().mockResolvedValue([]);

        repository.findById = jest.fn().mockResolvedValue({
          id: 'yt-acc-sync-1',
          userId: mockUserId,
          platform: SocialPlatform.YOUTUBE,
          platformUserId: 'UC_sync_1',
          accessToken: encryptToken('valid-yt-token'),
          expiresAt: new Date(Date.now() + 3600000),
          followerCount: 50000,
        } as any);

        repository.upsertMediaWithPerformance = jest.fn().mockResolvedValue({} as any);
        repository.recordAccountPerformance = jest.fn().mockResolvedValue({} as any);
        repository.updateAccountFollowerCount = jest.fn().mockResolvedValue({} as any);
        repository.updateSyncState = jest.fn().mockResolvedValue({} as any);
        repository.getAccountAnalytics = jest.fn().mockResolvedValue({} as any);

        await service.syncYouTubeChannelDetails('yt-acc-sync-1');

        // Verify video reach and impressions are null (not coerced from views)
        expect(repository.upsertMediaWithPerformance).toHaveBeenCalledWith(
          'yt-acc-sync-1',
          expect.objectContaining({
            platformMediaId: 'vid-yt-1',
            duration: 742,
          }),
          expect.objectContaining({
            playCount: 25000,
            reach: null,
            impressions: null,
          }),
        );

        // Verify daily snapshot engagement rate: (500 interactions / 10000 views) * 100 = 5.0%
        expect(repository.recordAccountPerformance).toHaveBeenCalledWith(
          'yt-acc-sync-1',
          expect.objectContaining({
            views: 10000,
            reach: null,
            impressions: null,
            totalInteractions: 500,
            engagementRate: 5,
            source: 'YOUTUBE_ANALYTICS_API',
          }),
        );

        // Verify operational sync state success with 6-hour window
        expect(repository.updateSyncState).toHaveBeenCalledWith(
          'yt-acc-sync-1',
          'MEDIA_CONTENT',
          'SUCCESS',
          expect.objectContaining({
            retryCount: 0,
            nextSyncAt: expect.any(Date),
          }),
          expect.any(Date),
        );
      });

      it('should proactively refresh YouTube token and mark REAUTHORIZATION_REQUIRED on invalid grant', async () => {
        const youtubeProvider = (service as any).youtubeProvider;
        youtubeProvider.refreshAccessToken = jest.fn().mockRejectedValue(new BadRequestException('invalid_grant: Token has been revoked'));

        repository.findById = jest.fn().mockResolvedValue({
          id: 'yt-acc-expired-1',
          userId: mockUserId,
          platform: SocialPlatform.YOUTUBE,
          platformUserId: 'UC_revoked_1',
          refreshToken: encryptToken('revoked-google-refresh-token'),
        } as any);

        repository.updateTokenLifecycle = jest.fn().mockResolvedValue({} as any);
        repository.updateSyncState = jest.fn().mockResolvedValue({} as any);

        await expect(service.refreshYouTubeToken('yt-acc-expired-1')).rejects.toThrow();

        expect(repository.updateTokenLifecycle).toHaveBeenCalledWith(
          'yt-acc-expired-1',
          expect.objectContaining({
            tokenStatus: 'REAUTHORIZATION_REQUIRED',
          }),
        );
      });
    });

    describe('Engagement Rate Calculation & Persistence', () => {
      it('should calculate normalized engagement rate from stored media content and update SocialAccount', async () => {
        repository.findById = jest.fn().mockResolvedValue({
          id: 'acc-er-test',
          followerCount: 1000,
          engagementRate: 0,
        } as any);

        repository.getMediaContentsByAccountId = jest.fn().mockResolvedValue([
          { likeCount: 40, commentCount: 5, shareCount: 3, saveCount: 2 },
          { likeCount: 25, commentCount: 3, shareCount: 1, saveCount: 1 },
        ] as any);

        repository.updateAccountFollowerCount = jest.fn().mockResolvedValue({} as any);

        const er = await service.recalculateAccountEngagementRate('acc-er-test');

        expect(er).toBe(4.0);
        expect(repository.updateAccountFollowerCount).toHaveBeenCalledWith('acc-er-test', 1000, 4.0);
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

  it('should generate Facebook auth URL with user scopes, rerequest and override_default_response_type', () => {
    const redirectUri = 'https://test.ngrok-free.app/api/v1/social/meta/callback';
    const state = 'test_signed_state';
    const authUrlString = metaProvider.getAuthUrl(redirectUri, state);

    const url = new URL(authUrlString);

    expect(url.origin + url.pathname).toBe('https://www.facebook.com/v23.0/dialog/oauth');
    expect(url.searchParams.get('client_id')).toBe('test-app-id-123');
    expect(url.searchParams.get('redirect_uri')).toBe(redirectUri);
    expect(url.searchParams.get('state')).toBe(state);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('override_default_response_type')).toBe('true');
    expect(url.searchParams.get('auth_type')).toBe('rerequest');

    // Scopes must include pages_show_list, pages_read_engagement and pages_read_user_content for Business App analytics
    const scope = url.searchParams.get('scope');
    expect(scope).toContain('pages_show_list');
    expect(scope).toContain('pages_read_engagement');
    expect(scope).toContain('pages_read_user_content');
  });

  it('should throw clear exception if META_APP_ID is missing', () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'META_APP_ID') return undefined;
      return null;
    });

    expect(() =>
      metaProvider.getAuthUrl('https://test.ngrok-free.app/api/v1/social/meta/callback', 'state'),
    ).toThrow('META_APP_ID environment variable is missing');
  });
});
