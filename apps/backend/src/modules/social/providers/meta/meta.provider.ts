import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

interface MetaShortTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaLongTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaPageAccount {
  id: string;
  name: string;
  access_token?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
    followers_count?: number;
  };
}

interface MetaAccountsResponse {
  data?: MetaPageAccount[];
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

@Injectable()
export class MetaProvider implements ISocialProvider {
  private readonly logger = new Logger(MetaProvider.name);

  constructor(private readonly configService: ConfigService) { }

  getPlatform(): SocialPlatform {
    return SocialPlatform.META;
  }

  private getAppId(): string {
    const appId = this.configService.get<string>('META_APP_ID');
    if (!appId) {
      throw new InternalServerErrorException('META_APP_ID environment variable is missing');
    }
    return appId;
  }

  private getAppSecret(): string {
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    if (!appSecret) {
      throw new InternalServerErrorException('META_APP_SECRET environment variable is missing');
    }
    return appSecret;
  }

  private getGraphApiUrl(): string {
    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v26.0';
    const graphUrl =
      this.configService.get<string>('META_GRAPH_URL') || `https://graph.facebook.com/${apiVersion}`;
    return graphUrl.replace(/\/+$/, '');
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const appId = this.getAppId();

    const configId = this.configService.get<string>('META_CONFIG_ID');
    if (!configId) {
      throw new InternalServerErrorException(
        'META_CONFIG_ID environment variable is missing',
      );
    }

    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v26.0';
    const dialogUrl =
      this.configService.get<string>('META_OAUTH_DIALOG_URL') ||
      `https://www.facebook.com/${apiVersion}/dialog/oauth`;

    const url = new URL(dialogUrl);


    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('override_default_response_type', 'true');
    if (configId) {
      url.searchParams.append('config_id', configId);
    }

    // Modern valid Meta permissions (deprecated permissions like read_insights,
    // pages_read_user_content, and pages_manage_posts are removed)
    const defaultScopes =
      'public_profile,email,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,business_management';
    const customScopes = this.configService.get<string>('META_SCOPES');

    // For Meta Business Login with config_id, permissions are configured directly
    // within the Meta App Dashboard Configuration. Passing an explicit scope parameter
    // can conflict or trigger 'Invalid Scopes' if deprecated/unconfigured permissions are present.
    if (customScopes) {
      url.searchParams.append('scope', customScopes);
    } else if (!configId) {
      url.searchParams.append('scope', defaultScopes);
    }

    return url.toString();
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const graphUrl = this.getGraphApiUrl();

    // 1. Exchange short-lived token
    const shortTokenUrl = `${graphUrl}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`;

    const shortRes = await fetch(shortTokenUrl);
    const shortData = (await shortRes.json()) as MetaShortTokenResponse & { error?: any };

    if (!shortRes.ok || shortData.error) {
      this.logger.error('Meta OAuth short-lived token exchange failed', shortData.error);
      throw new BadRequestException(
        shortData.error?.message || 'Failed to exchange Meta authorization code',
      );
    }

    // 2. Exchange for long-lived access token (valid ~60 days)
    const longTokenUrl = `${graphUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortData.access_token}`;

    const longRes = await fetch(longTokenUrl);
    const longData = (await longRes.json()) as MetaLongTokenResponse & { error?: any };

    const userAccessToken = longRes.ok && longData.access_token ? longData.access_token : shortData.access_token;
    const expiresInSeconds = longData.expires_in || 60 * 24 * 60 * 60; // Default 60 days
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const profiles: SocialAccountProfileDto[] = [];

    // 1. Fetch Primary Facebook User Profile
    try {
      const userMeUrl = `${graphUrl}/me?fields=id,name,email,picture{url}&access_token=${userAccessToken}`;
      const userMeRes = await fetch(userMeUrl);

      if (userMeRes.ok) {
        const userData = (await userMeRes.json()) as { id: string; name: string; email?: string; picture?: { data?: { url?: string } } };
        profiles.push({
          platform: SocialPlatform.FACEBOOK,
          platformUserId: userData.id,
          username: userData.name,
          displayName: userData.name,
          avatar: userData.picture?.data?.url,
          accessToken: userAccessToken,
          expiresAt,
        });
      }
    } catch (err) {
      this.logger.warn('Could not fetch primary Meta user profile:', err);
    }

    // 2. Fetch all managed Facebook Pages, Instagram Business, and Threads assets
    try {
      const accountsUrl = `${graphUrl}/me/accounts?fields=id,name,category,access_token,picture{url},instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography}&access_token=${userAccessToken}`;
      const accountsRes = await fetch(accountsUrl);

      if (accountsRes.ok) {
        const accountsData = (await accountsRes.json()) as MetaAccountsResponse;
        this.logger.log(
          `Meta accounts response: ${JSON.stringify(accountsData, null, 2)}`,
        );
        const pages = accountsData.data || [];

        for (const page of pages) {
          if (!profiles.some((p) => p.platformUserId === page.id)) {
            profiles.push({
              platform: SocialPlatform.FACEBOOK,
              platformUserId: page.id,
              username: page.name,
              displayName: page.name,
              avatar: page.picture?.data?.url,
              accessToken: page.access_token || userAccessToken,
              expiresAt,
            });
          }

          let ig = page.instagram_business_account;

          if (!ig && page.access_token) {
            try {
              const pageIgUrl = `${graphUrl}/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography}&access_token=${page.access_token}`;
              const pageIgRes = await fetch(pageIgUrl);
              if (pageIgRes.ok) {
                const pageIgData = (await pageIgRes.json()) as {
                  instagram_business_account?: MetaPageAccount['instagram_business_account'];
                };
                this.logger.log(
                  `Page ${page.name} (${page.id}) IG check result: ${JSON.stringify(pageIgData, null, 2)}`,
                );
                if (pageIgData.instagram_business_account) {
                  ig = pageIgData.instagram_business_account;
                }
              }
            } catch (pageIgErr) {
              this.logger.warn(`Could not check Instagram account for page ${page.id}:`, pageIgErr);
            }
          }

          if (ig) {
            if (!profiles.some((p) => p.platformUserId === ig.id)) {
              profiles.push({
                platform: SocialPlatform.INSTAGRAM,
                platformUserId: ig.id,
                username: ig.username || ig.name || `ig_${ig.id}`,
                displayName: ig.name || ig.username || 'Instagram Account',
                avatar: ig.profile_picture_url,
                followerCount: ig.followers_count,
                accessToken: page.access_token || userAccessToken,
                expiresAt,
              });
            }
          }
        }
      }
    } catch (err) {
      this.logger.warn('Could not fetch managed Facebook Pages or Instagram accounts:', err);
    }

    if (profiles.length === 0) {
      throw new BadRequestException('Failed to discover any Meta assets for this user.');
    }

    return profiles;
  }
}
