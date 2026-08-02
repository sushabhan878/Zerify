import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from './social-provider.interface';
import { SocialAccountProfileDto } from '../dto/social-account-profile.dto';

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
    return SocialPlatform.INSTAGRAM;
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
    const graphUrl = this.configService.get<string>('META_GRAPH_URL') || 'https://graph.facebook.com/v23.0';
    return graphUrl.replace(/\/+$/, '');
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const appId = this.getAppId();
    const customScopes = this.configService.get<string>('META_OAUTH_SCOPES');
    const scopes = customScopes || 'public_profile,email';

    const dialogUrl =
      this.configService.get<string>('META_OAUTH_DIALOG_URL') ||
      'https://www.facebook.com/v23.0/dialog/oauth';

    const url = new URL(dialogUrl);
    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', scopes);
    url.searchParams.append('response_type', 'code');

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

    // 3. Fetch connected Facebook Pages and Instagram Business accounts
    const accountsUrl = `${graphUrl}/me/accounts?fields=id,name,access_token,picture{url},instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${userAccessToken}`;

    const accountsRes = await fetch(accountsUrl);
    const accountsData = (await accountsRes.json()) as MetaAccountsResponse;

    if (!accountsRes.ok || accountsData.error) {
      this.logger.error('Failed to fetch Meta pages and Instagram accounts', accountsData.error);
      throw new BadRequestException(
        accountsData.error?.message || 'Failed to retrieve Meta accounts for user',
      );
    }

    const pages = accountsData.data || [];
    const profiles: SocialAccountProfileDto[] = [];

    if (pages.length === 0) {
      // Fallback: Fetch primary Facebook user profile if no Facebook Pages are connected or permitted
      const userMeUrl = `${graphUrl}/me?fields=id,name,picture{url}&access_token=${userAccessToken}`;
      const userMeRes = await fetch(userMeUrl);

      if (userMeRes.ok) {
        const userData = (await userMeRes.json()) as { id: string; name: string; picture?: { data?: { url?: string } } };
        profiles.push({
          platform: SocialPlatform.FACEBOOK,
          platformUserId: userData.id,
          username: userData.name,
          displayName: userData.name,
          avatar: userData.picture?.data?.url,
          accessToken: userAccessToken,
          expiresAt,
        });
      } else {
        throw new BadRequestException('No Facebook Pages or Instagram Business accounts found for this Meta user.');
      }
    } else {
      for (const page of pages) {
        // Add Facebook Page
        profiles.push({
          platform: SocialPlatform.FACEBOOK,
          platformUserId: page.id,
          username: page.name,
          displayName: page.name,
          avatar: page.picture?.data?.url,
          accessToken: page.access_token || userAccessToken,
          expiresAt,
        });

        // Add linked Instagram Business Account if present
        if (page.instagram_business_account) {
          const ig = page.instagram_business_account;
          profiles.push({
            platform: SocialPlatform.INSTAGRAM,
            platformUserId: ig.id,
            username: ig.username || ig.name || `ig_${ig.id}`,
            displayName: ig.name || ig.username || 'Instagram Account',
            avatar: ig.profile_picture_url,
            followerCount: ig.followers_count,
            accessToken: userAccessToken,
            expiresAt,
          });
        }
      }
    }

    return profiles;
  }
}
