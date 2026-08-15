import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialRepository } from './social.repository';
import { MetaProvider } from './providers/meta/meta.provider';
import { InstagramProvider } from './providers/instagram/instagram.provider';
import { encryptToken, generateOAuthState, verifyOAuthState } from './utils/crypto.util';
import { SocialAccountResponseDto } from './dto/social-account-response.dto';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly socialRepository: SocialRepository,
    private readonly metaProvider: MetaProvider,
    private readonly instagramProvider: InstagramProvider,
  ) { }

  private getMetaRedirectUri(): string {
    return (
      this.configService.get<string>('META_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/meta/callback'
    );
  }

  private getInstagramRedirectUri(): string {
    return (
      this.configService.get<string>('INSTAGRAM_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/instagram/callback'
    );
  }

  private getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  getMetaAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getMetaRedirectUri();
    const url = this.metaProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  getInstagramAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getInstagramRedirectUri();
    const url = this.instagramProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  async handleMetaCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`Meta OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(errorDescription || error || 'Authorization was cancelled or denied');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('Meta OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent('Invalid or expired OAuth state parameter. Please try connecting again.');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getMetaRedirectUri();

    try {
      const profiles = await this.metaProvider.exchangeCodeAndGetAccounts(code, redirectUri);

      let savedCount = 0;
      for (const profile of profiles) {
        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during Meta OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect Meta account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async handleInstagramCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`Instagram OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(errorDescription || error || 'Authorization was cancelled or denied');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('Instagram OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent('Invalid or expired OAuth state parameter. Please try connecting again.');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getInstagramRedirectUri();

    try {
      const profiles = await this.instagramProvider.exchangeCodeAndGetAccounts(code, redirectUri);

      let savedCount = 0;
      for (const profile of profiles) {
        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during Instagram OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect Instagram account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async getUserAccounts(userId: string): Promise<SocialAccountResponseDto[]> {
    const accounts = await this.socialRepository.findByUserId(userId);
    return accounts.map((acc) => ({
      id: acc.id,
      userId: acc.userId,
      platform: acc.platform,
      platformUserId: acc.platformUserId,
      username: acc.username,
      handle: acc.handle,
      avatar: acc.avatar,
      followerCount: acc.followerCount,
      engagementRate: acc.engagementRate,
      profileUrl: acc.profileUrl,
      isVerified: acc.isVerified,
      expiresAt: acc.expiresAt,
      status: acc.status,
      connectedAt: acc.connectedAt,
      updatedAt: acc.updatedAt,
    }));
  }

  async disconnectAccount(userId: string, accountId: string): Promise<{ success: boolean; id: string }> {
    await this.socialRepository.disconnectAccount(accountId);
    return { success: true, id: accountId };
  }
}
