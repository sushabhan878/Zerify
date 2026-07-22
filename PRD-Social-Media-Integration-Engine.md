# Product Requirements Document
## Influencer-Brand Collaboration Platform
### Social Media Integration Engine

**Version:** 1.0.0  
**Status:** Production-Ready Specification  
**Last Updated:** July 2026  
**Classification:** Confidential - Internal Use Only

---

## Table of Contents

1. [Executive Summary & Core Value Proposition](#1-executive-summary--core-value-proposition)
2. [Architecture Overview](#2-architecture-overview)
3. [Phase Rollout Strategy](#3-phase-rollout-strategy)
4. [Detailed Epics & User Stories](#4-detailed-epics--user-stories)
5. [Direct Native Integration Specifications](#5-direct-native-integration-specifications)
6. [Aggregator Integration (Phase 1 MVP)](#6-aggregator-integration-phase-1-mvp)
7. [Full Database Schema Architecture](#7-full-database-schema-architecture)
8. [Security & Compliance](#8-security--compliance)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [Monitoring & Observability](#10-monitoring--observability)

---

## 1. Executive Summary & Core Value Proposition

### 1.1 Business Problem

The influencer marketing industry suffers from a critical trust deficit rooted in **unverifiable performance metrics**. Current collaboration workflows rely on:

- **Screenshot fraud:** Influencers manually capture and submit analytics dashboards (Instagram Insights, YouTube Studio) with no cryptographic proof of authenticity. These screenshots can be fabricated using browser developer tools or image manipulation software.
- **Self-reported metrics:** Brand managers request follower counts, engagement rates, and audience demographics directly from influencers, creating a conflict of interest where the party being evaluated controls the data submission.
- **Stale data:** Even when metrics are shared, they represent a point-in-time snapshot with no verification of recency, trend direction, or data manipulation.
- **Manual reconciliation:** Brand teams manually aggregate data from multiple platforms (Instagram + YouTube + TikTok) into spreadsheets, introducing human error and making cross-platform audience analysis impossible.

**Quantified Impact:**
- 67% of brand marketers cite "difficulty verifying influencer metrics" as their top collaboration barrier (Influencer Marketing Hub, 2025)
- An estimated $1.8B in influencer marketing spend is wasted annually on audiences that don't match claimed demographics
- Fraudulent influencer activity costs brands $750M+ annually in the US alone

### 1.2 Solution Architecture

The platform implements a **verified server-to-server data architecture** that eliminates reliance on influencer-submitted data. The system operates as follows:

1. **OAuth Token Exchange:** Influencers authenticate directly with social platforms (Instagram, YouTube, TikTok, etc.), granting the platform read-only API access. Tokens are stored encrypted at rest using AES-256-GCM.
2. **Server-Side Metric Fetching:** The platform's backend servers, not client browsers, call platform APIs to retrieve verified metrics. This ensures data originates from authoritative platform sources.
3. **Multi-Platform Identity Graph:** A unified `SocialAccount` entity links an influencer's platform-specific identities (Instagram handle, YouTube channel ID, TikTok username) to a single canonical `User` profile.
4. **Continuous Synchronization:** Background workers periodically refresh metrics (followers, engagement rate, audience demographics) to ensure data currency and detect anomalies.
5. **Immutable Audit Trail:** Every data sync produces a timestamped, platform-signed record that brands can query to verify data provenance.

### 1.3 Core Value Proposition

| Stakeholder | Value Delivered |
|------------|-----------------|
| **Influencers** | One-time secure linking replaces repeated screenshot submissions. Verified metrics increase trust and command premium rates. |
| **Brand Managers** | Real-time, authenticated performance data replaces spreadsheet reconciliation. Cross-platform audience overlap analysis. |
| **Platform Operators** | Data integrity moat. Aggregator-first MVP enables rapid launch; native integration transition eliminates ongoing utility costs. |

---

## 2. Architecture Overview

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  React SPA (Next.js)  │  Mobile App (React Native)  │  Admin Dashboard      │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ REST/GraphQL
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Kong/NGINX  │  Rate Limiter  │  JWT Validation  │  Request Routing         │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │ User Service │  │ Metric Sync  │  │ Brand Match  │     │
│  │ (OAuth)      │  │  (Profiles)  │  │   Service    │  │   Service    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │                  │          │
│  ┌──────┴──────────────────┴──────────────────┴──────────────────┴──────┐   │
│  │                     SOCIAL INTEGRATION ENGINE                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Meta      │  │  YouTube    │  │   TikTok    │  │   Others    │  │   │
│  │  │  Graph API  │  │  Data API   │  │   API       │  │   (Phyllo)  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────── ┘   │
│         │                  │                  │                  │          │
│  ┌──────┴──────────────────┴──────────────────┴──────────────────┴──────┐   │
│  │                     QUEUE LAYER (BullMQ / Redis)                     │   │
│  │  sync-scheduler  │  metric-fetcher  │  webhook-processor  │  retry   │   │
│  └───────────────────────────────────────────────────────────────────── ┘   │
│                                                                             │
└───────────────────────────────┬─────────────────────────────────────────────┘ 
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Primary)  │  Redis (Cache/Queue)  │  S3 (Media/Exports)        │
│  Prisma ORM            │  BullMQ               │  Encrypted at Rest         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Design Principles

1. **Zero Client-Side Token Exposure:** OAuth tokens never reach the browser. All API calls to social platforms originate from server-side workers.
2. **Fail-Silent Architecture:** If a platform's API is unreachable, the system continues operating with cached data and queues retries.
3. **Idempotent Sync Operations:** Every sync operation can be safely retried without data duplication, using platform-specific content IDs as natural keys.
4. **Encrypted Credential Vault:** All OAuth tokens are encrypted at rest using AES-256-GCM with per-user encryption keys derived from a master secret.

---

## 3. Phase Rollout Strategy

### 3.1 Phase 1: Aggregator-First MVP (Months 1-3)

**Objective:** Launch a functional product within 90 days by leveraging unified API aggregators that abstract platform-specific complexity.

**Architecture:**
- Primary data source: Phyllo API (unified endpoints for Instagram, YouTube, TikTok, Twitch, Twitter/X)
- Fallback: EnsembleData for supplementary demographic data
- All platform interactions routed through aggregator REST endpoints

**Advantages:**
- Single integration point for 8+ platforms
- No individual platform app review requirements
- Unified webhook events for account status changes
- Aggregator handles token refresh, rate limiting, and API versioning

**Disadvantages:**
- Monthly SaaS cost ($500-$2,000/month based on connected accounts)
- Limited access to advanced platform features (e.g., Instagram Creator Studio, TikTok Research API)
- Data freshness dependent on aggregator polling frequency (typically 24-hour refresh)
- Vendor lock-in risk if aggregator pricing changes

### 3.2 Phase 2: Native Direct Integration (Months 4-9)

**Objective:** Replace aggregator dependencies with direct platform integrations to eliminate recurring costs and unlock advanced features.

**Migration Approach:**
1. Deploy native integrations in parallel with aggregator fallback
2. Migrate existing connected accounts via background re-authentication campaigns
3. Deprecate aggregator endpoints once native coverage exceeds 95%
4. Retain aggregator as emergency fallback for edge-case platforms

**Target Platforms (Native):**
- Meta Graph API (Instagram + Facebook)
- YouTube Data API v3
- TikTok Content Posting API
- Snapchat Kit
- Twitch Helix API
- X API v2
- LinkedIn Marketing APIs
- Pinterest (secondary priority)

---

## 4. Detailed Epics & User Stories

### Epic 1: Influencer Onboarding & Multi-Account Linking

#### Story 1.1: Platform Selection
```
As an influencer,
I want to see a grid of social platforms with clear status indicators (connected/disconnected),
So that I can quickly identify which accounts I need to link.

Acceptance Criteria:
- Platform grid displays Instagram, YouTube, TikTok, Snapchat, Twitch, X, LinkedIn with platform logos
- Connected accounts show green badge with verified checkmark
- Disconnected accounts show "Connect" CTA button
- Page loads within 2 seconds
- Mobile-responsive layout with 2-column grid on small screens
```

#### Story 1.2: OAuth Authorization Flow
```
As an influencer,
I want to securely authorize the platform to access my social media analytics,
So that I don't have to manually share screenshots of my metrics.

Acceptance Criteria:
- Clicking "Connect" on a platform triggers redirect to platform's OAuth consent screen
- Consent screen displays exactly which permissions the platform requests (e.g., "Read your Instagram insights, follower count, and engagement data")
- On successful authorization, user is redirected back to the linking page with success toast
- On denied authorization, user sees explanatory message with retry option
- OAuth state parameter is CSRF-protected using crypto.randomBytes(32)
- Callback URL is validated against whitelist before token exchange
- Refresh tokens are stored encrypted immediately upon receipt
- Connection status updates in real-time without page refresh (WebSocket or polling)
```

#### Story 1.3: Account Disconnection
```
As an influencer,
I want to disconnect a previously linked account,
So that I can revoke the platform's access to that account.

Acceptance Criteria:
- Disconnect button visible on each connected account card
- Confirmation modal warns that historical data may become stale
- On confirmation, platform calls platform API to revoke token (if supported)
- Local token record is soft-deleted (marked as revoked, not purged)
- Background sync jobs skip revoked accounts
- User sees updated status within 5 seconds
```

#### Story 1.4: Account Reconnection (Token Recovery)
```
As an influencer,
I want to be notified when a platform connection breaks (e.g., password change, token revocation),
So that I can promptly re-authenticate and maintain verified status.

Acceptance Criteria:
- Background health-check job runs every 6 hours per connected account
- If token refresh fails 3 consecutive times, account status transitions to "Connection Error"
- User receives in-app notification and optional email alert
- Error page displays platform name, error reason (e.g., "Token expired"), and "Reconnect" button
- Reconnection flow reuses Story 1.2 OAuth flow without requiring full re-onboarding
```

### Epic 2: Platform Admin & Brand Manager Metric Views

#### Story 2.1: Aggregated Metric Dashboard
```
As a brand manager,
I want to view an influencer's verified performance metrics across all linked platforms,
So that I can make data-driven collaboration decisions without requesting screenshots.

Acceptance Criteria:
- Dashboard displays metric cards for each connected platform: followers, engagement rate, average impressions, audience demographics (age/gender/location)
- Total cross-platform reach is calculated and displayed prominently
- Last-synced timestamp shown on each card with "Refresh Now" manual trigger option
- Metric cards are sortable by platform, followers, or engagement rate
- Data loads within 3 seconds for up to 10 connected platforms
```

#### Story 2.2: Audience Demographics Overlap Analysis
```
As a brand manager,
I want to see the demographic overlap between an influencer's audience and my target market,
So that I can assess fit without manual analysis.

Acceptance Criteria:
- Demographics view shows age distribution (18-24, 25-34, 35-44, 45-54, 55+), gender split, top 5 countries, and top 5 cities
- Overlap score calculated as percentage match against brand's target demographic profile
- Visualization uses horizontal bar charts for age, pie chart for gender, ranked list for geography
- Data is sourced from platform APIs (not self-reported)
- If platform does not provide demographics (e.g., Twitter/X), card shows "Demographics unavailable for this platform"
```

#### Story 2.3: Historical Performance Trend
```
As a brand manager,
I want to view an influencer's follower growth and engagement trends over the past 90 days,
So that I can assess trajectory and detect anomalies.

Acceptance Criteria:
- Line chart displays daily follower count for each platform over 90-day window
- Engagement rate trend shown as secondary axis on same chart
- Data points are clickable to reveal exact values for that date
- Anomaly detection highlights statistically significant spikes or drops (e.g., >10% daily change)
- Data refreshes on each page load using latest cached sync data
```

### Epic 3: Background Error Handling & Connection Health

#### Story 3.1: Token Expiration Handling
```
As a system administrator,
I want the platform to automatically refresh expired OAuth tokens without user intervention,
So that metric synchronization continues uninterrupted.

Acceptance Criteria:
- Token refresh job runs every 5 minutes for tokens expiring within 24 hours
- Refresh uses platform-specific token endpoint with client_id, client_secret, and refresh_token
- On success, new access_token and expiration are persisted; old token is overwritten
- On failure (invalid_grant), account status transitions to "Token Invalid" and user is notified
- Refresh operations are idempotent and concurrency-safe (distributed lock per account)
```

#### Story 3.2: Rate Limit Handling
```
As a system administrator,
I want the platform to respect platform-specific rate limits and queue requests accordingly,
So that API access is never suspended.

Acceptance Criteria:
- Rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset) are parsed from every API response
- When remaining quota drops below 10%, sync frequency is reduced to half
- When rate limit is exhausted, requests are queued with retry-after delay
- Circuit breaker pattern: if 5 consecutive rate limit violations occur, platform integration is paused for 1 hour
- Rate limit status is logged to monitoring dashboard (DataDog/Datadog)
```

#### Story 3.3: Platform API Downtime
```
As a system administrator,
I want the platform to gracefully handle temporary social platform outages,
So that metric data remains as fresh as possible without failed job cascades.

Acceptance Criteria:
- Health check endpoint for each platform is pinged before batch sync operations
- If health check fails, sync for that platform is deferred to next scheduled window
- Cached metrics from last successful sync are served to brand managers with "Data may be up to X hours stale" indicator
- Consecutive failure counter increments; after 10 failures, alert is triggered to ops team
- Recovery: when health check passes, full sync resumes automatically
```

---

## 5. Direct Native Integration Specifications

### 5.1 Instagram & Facebook (Meta Graph API)

#### Account Requirements
- **Instagram Business Account** OR **Instagram Creator Account** required (personal accounts do not have Insights API access)
- Instagram account must be linked to a **Facebook Page** via Meta Business Suite
- Facebook Page must be owned or managed by a **Meta Business Manager** account with the app assigned
- App must be in **Live mode** (Development mode limited to app admins/testers)
- **App Review:** Required for Instagram Basic Display and Instagram Graph API. Submission requires screen recording demonstrating permission usage and a written justification. Review typically takes 3-7 business days.

#### OAuth Scopes
```
instagram_basic          - Read profile info, media list, media details
instagram_manage_insights - Access Instagram Insights (follower demographics, content performance)
pages_show_list           - List Facebook Pages the user manages
pages_read_engagement     - Read engagement data on Pages
business_management       - Manage Business Manager assets (required for Instagram Graph API)
```

#### Primary Endpoints
```
GET /me/accounts                    - List Pages managed by user (returns Page access token)
GET /{ig-user-id}                  - Get Instagram Business Account metadata
GET /{ig-user-id}/media           - List Instagram media (feed, reels, stories)
GET /{ig-user-id}/insights         - Get Instagram Insights metrics

GET /{ig-user-id}/insights?metric=impressions,reach,follower_count&period=day
GET /{ig-user-id}/insights?metric=email_contacts,phone_call_clicks,text_message_clicks&period=lifetime
GET /{ig-user-id}/insights?metric=audience_city,audience_country,audience_gender_age&period=lifetime

GET /{ig-media-id}/insights        - Per-media insights (likes, comments, saves, shares)
```

#### Required Metrics & Fields
```
Followers:          ig-user-insights metric=follower_count
Engagement Rate:    (likes + comments + saves + shares) / impressions × 100
Demographics:       ig-user-insights metric=audience_gender_age, audience_country, audience_city
Impressions:        ig-user-insights metric=impressions (period=day, date range)
```

#### Platform-Specific Gotchas & Roadblocks
- **Page Token vs. User Token:** Instagram Graph API requires a **Page Access Token**, not a User Access Token. The flow involves: User OAuth → get User Token → call `GET /me/accounts` → obtain long-lived Page Token.
- **Long-Lived Token Expiry:** Page Tokens obtained via the exchange endpoint do not expire if the app is in Live mode and the user remains a Page admin. However, tokens are invalidated if the user changes their password, removes the app, or the app is suspended.
- **Insights API Limitations:** Instagram Insights are only available for the last 2 years. Engagement metrics (likes, comments) are only available for posts from the last 24 months.
- **Business/Creator Account Switch:** If an influencer switches from Business to Creator account type, historical Insights data may become temporarily inaccessible during the transition (24-48 hours).
- **Rate Limits:** 200 calls per user per hour (shared across all Instagram Graph API endpoints).
- **App Review Stringency:** Meta's app review is notoriously strict. Apps requesting `instagram_manage_insights` must demonstrate that the user explicitly benefits from the insight access. Generic "analytics platform" descriptions are frequently rejected.
- **Sandbox Mode:** In Development mode, the app can only access Instagram accounts of approved testers. Maximum 10 testers per app. Testing requires real Instagram Business accounts (not test accounts).

---

### 5.2 YouTube (Google Data API v3)

#### Account Requirements
- **YouTube Channel** (any type: personal, brand, or creator)
- **Google Cloud Console project** with YouTube Data API v3 enabled
- **OAuth consent screen** configured (External user type for public-facing apps)
- **App verification:** Required if requesting sensitive/restricted scopes. YouTube Data API does not require verification for read-only scopes, but Google reserves the right to request verification if usage patterns suggest automated data extraction.

#### OAuth Scopes
```
https://www.googleapis.com/auth/youtube.readonly        - Read-only access to YouTube account and videos
https://www.googleapis.com/auth/youtube.force-ssl       - Force HTTPS for all API requests (recommended)
https://www.googleapis.com/auth/yt-analytics.readonly   - Access YouTube Analytics API (required for demographic data)
```

**Note:** For audience demographics (age, gender, geography), the **YouTube Analytics API** is required in addition to the Data API. This requires a separate API enablement in Google Cloud Console.

#### Primary Endpoints
```
YouTube Data API v3:
GET /youtube/v3/channels?part=snippet,statistics,contentDetails&id={channelId}
GET /youtube/v3/search?part=snippet&channelId={channelId}&order=date&type=video
GET /youtube/v3/videos?part=statistics,contentDetails&id={videoId}

YouTube Analytics API:
GET /youtube/analytics/v2/reports?ids=channel=={channelId}&metrics=views,likes,comments,shares,estimatedMinutesWatched&dimensions=day&startDate={start}&endDate={end}
GET /youtube/analytics/v2/reports?ids=channel=={channelId}&metrics=viewerPercentage&dimensions=ageGroup,gender&startDate={start}&endDate={end}
GET /youtube/analytics/v2/reports?ids=channel=={channelId}&metrics=viewerPercentage&dimensions=country&startDate={start}&endDate={end}
```

#### Required Metrics & Fields
```
Followers:          channels.statistics.subscriberCount
Engagement Rate:    (likes + comments + shares) / views × 100
Demographics:       Analytics API viewerPercentage by ageGroup, gender, country
Views:              videos.statistics.viewCount (per video or aggregate)
Watch Time:         Analytics API estimatedMinutesWatched
```

#### Platform-Specific Gotchas & Roadblocks
- **Subscriber Count Precision:** YouTube hides subscriber counts for channels below 1,000 subscribers (returns rounded number or "hidden"). Above 1,000, counts are accurate but may have a 24-hour delay.
- **Analytics API Quota:** YouTube Analytics API has a separate quota from Data API v3 (10,000 units/day default). Each Analytics report call costs ~3-5 quota units depending on dimensions.
- **Demographic Data Lag:** YouTube Analytics demographic data is typically 2-3 days behind real-time. The `endDate` parameter cannot be "today" for demographic reports.
- **OAuth Token Lifetime:** Google OAuth tokens expire after 1 hour (access tokens). Refresh tokens are valid for 6 months of inactivity (if the app is in "Testing" mode). In production, refresh tokens do not expire unless explicitly revoked.
- **Consent Screen Verification:** If the app requests YouTube Analytics scopes and is verified as "In Production," Google may require a security assessment ($25K for sensitive scopes).
- **Video Metadata Granularity:** The `statistics` part of the Videos endpoint does not include demographic data; this requires the Analytics API.

---

### 5.3 TikTok (TikTok Content/Research APIs)

#### Account Requirements
- **TikTok Business Account** OR **TikTok Creator Account** (personal accounts have limited API access)
- App registered as a **TikTok for Developers** application (https://developers.tiktok.com/)
- App must be approved for **Content Posting** or **Research** API access (requires application)
- **Research API access** requires a commercial partnership agreement with TikTok (typically reserved for enterprise clients; involves NDA and revenue-sharing terms)

#### OAuth Scopes
```
user.info.basic        - Access basic user profile information (username, avatar, follower count)
user.info.profile      - Access extended profile data (bio, verified status)
video.list             - List user's uploaded videos
video.stats            - Access video-level statistics (views, likes, comments, shares)
insights               - Access TikTok Insights (audience demographics, content performance) [Research API only]
```

#### Primary Endpoints
```
GET /v2/user/info/              - Get authenticated user's profile info
GET /v2/video/list/             - List user's videos with basic stats
GET /v2/video/info/             - Get detailed video statistics

TikTok Research API (requires partnership):
GET /research/user/insights/    - Audience demographics (age, gender, location)
GET /research/video/insights/   - Video performance metrics
GET /research/keyword/insights/ - Keyword/topic analysis
```

#### Required Metrics & Fields
```
Followers:          user.follower_count (from /v2/user/info/)
Engagement Rate:    (likes + comments + shares) / views × 100
Demographics:       Research API only (age, gender, top regions)
Views:              video.statistics.play_count
Video Count:        video.total_count
```

#### Platform-Specific Gotchas & Roadblocks
- **Research API Access:** The TikTok Research API is not available to all developers. Applications require: (1) proof of commercial use case, (2) minimum 10,000 monthly active users on the developer's platform, (3) signed Data Processing Agreement, (4) compliance with TikTok's Acceptable Use Policy.
- **Standard API Limitations:** The non-Research API does NOT provide audience demographic data (age, gender, location). Only basic profile info and video stats are available.
- **Rate Limits:** 1,000 requests per minute per app (standard). Research API has separate, higher quotas negotiated per partnership.
- **Token Expiration:** TikTok access tokens expire after 24 hours. Refresh tokens are valid for 30 days. Developers must implement daily token refresh logic.
- **Content Posting API:** Separate from analytics; requires additional OAuth scopes (`content.publish`) and app review. Not needed for metric fetching but useful for influencer content management.
- **Sandbox Environment:** TikTok provides a sandbox environment with test accounts for development, but demographic data in sandbox is synthetic (not realistic).
- **GDPR Restrictions:** TikTok restricts data access for users in the European Economic Area (EEA). Audience demographic data may be partially or fully unavailable for EU-based creators.

---

### 5.4 Snapchat (Snap Kit)

#### Account Requirements
- **Snapchat Account** (personal or creator)
- Snap Kit app registered at https://kit.snapchat.com/
- App must be approved for **Creative Kit** (for content posting) and **Profile Kit** (for user data)
- **Snapchat Creator Account** recommended for access to Spotlight analytics

#### OAuth Scopes
```
user.display_name    - Access display name
user.bitmoji         - Access Bitmoji avatar
user.friends         - Access friend count (deprecated; limited availability)
```

**Note:** Snapchat's API access is significantly more limited than other platforms. Audience demographics are NOT available through Snap Kit APIs.

#### Primary Endpoints
```
Snap Kit APIs do not use traditional REST endpoints. They use a token-based authentication system:

GET https://sdk.snapkit.com/v1/me                - Get user profile (display name, bitmoji)
GET https://sdk.snapkit.com/v1/me/friends        - Get friend list (deprecated)
POST https://sdk.snapkit.com/v1/media/share      - Share content to Snapchat (Creative Kit)
```

#### Required Metrics & Fields
```
Followers:          NOT AVAILABLE via API (Snapchat does not expose follower count)
Engagement Rate:    NOT AVAILABLE (no public engagement metrics)
Demographics:       NOT AVAILABLE
Profile Info:       Display name, Bitmoji avatar only
```

#### Platform-Specific Gotchas & Roadblocks
- **Extremely Limited Data:** Snapchat's public API does not expose follower counts, engagement metrics, or audience demographics. The only accessible data is basic profile information.
- **Spotlight Analytics:** Available only to Snapchat+ subscribers or verified creators through the Snapchat app (not API). Cannot be programmatically accessed.
- **Creator Hub:** Snapchat provides a web-based Creator Hub with some analytics, but this is not accessible via API.
- **Friend Count Deprecation:** The `user.friends` scope was deprecated in 2022. Existing apps may still access friend counts for legacy users, but new apps cannot request this permission.
- **App Review:** Snap Kit app review requires demonstrating a legitimate use case. Approval typically takes 5-10 business days.
- **Token Lifetime:** Snap Kit access tokens expire after 24 hours. Refresh tokens are not provided; users must re-authenticate daily.
- **Integration Value:** Snapchat integration is primarily useful for verifying that an influencer has a Snapchat account and for content sharing (Creative Kit). It does NOT provide meaningful performance data.

---

### 5.5 Twitch (Twitch API / Helix)

#### Account Requirements
- **Twitch Account** (any type; Affiliate or Partner accounts have more data available)
- Twitch Developer Application registered at https://dev.twitch.tv/
- App registered as a **Confidential Client** (for server-side OAuth)
- **Extension or Game integration** not required for basic API access

#### OAuth Scopes
```
user:read:email         - Read user email (for account matching)
user:read:broadcast     - Read broadcast metadata (stream title, game, language)
analytics:read:extensions - Read extension analytics
analytics:read:games    - Read game analytics
channel:read:subscriptions - Read subscriber count (Affiliate/Partner only)
channel:read:follows    - Read follower list (deprecated; limited to 100 entries)
```

#### Primary Endpoints
```
GET https://api.twitch.tv/helix/users                  - Get user profile (id, login, display_name, follower_count)
GET https://api.twitch.tv/helix/channels               - Get channel metadata (title, game, language, follower_count)
GET https://api.twitch.tv/helix/streams                - Get live stream info (viewer_count, started_at)
GET https://api.twitch.tv/helix/videos                 - Get user's videos (VODs) with view counts
GET https://api.twitch.tv/helix/analytics/extensions   - Extension analytics (unique viewers, minutes watched)
GET https://api.twitch.tv/helix/subscriptions          - Subscriber list (Affiliate/Partner)
```

#### Required Metrics & Fields
```
Followers:          channels.broadcaster_type (Affiliate/Partner) + channels.follower_count (limited)
Engagement Rate:    (subscribers + bits + donations) / unique_viewers × 100 (approximate; some metrics not API-accessible)
Concurrent Viewers: streams.viewer_count (live streams only)
VOD Views:          videos.view_count (past broadcasts)
Subscribers:        subscriptions.total (count; individual subscriber data requires special access)
```

#### Platform-Specific Gotchas & Roadblocks
- **Follower Count:** The `channels` endpoint returns `follows` count, but this field was deprecated and returns `-1` for many users. The `users` endpoint no longer returns follower count directly. Workaround: use the `streams` endpoint during live broadcasts for viewer counts, and scrape the profile page for follower counts (against ToS).
- **Subscriber Data Limitations:** The `subscriptions` endpoint is only available to Affiliate/Partner accounts and requires the broadcaster's OAuth token. Third-party apps cannot query subscription counts for other channels.
- **Rate Limits:** 800 requests per minute for Helix API (shared across all endpoints). Burst limit: 800 requests per second.
- **Token Lifetime:** Twitch access tokens expire after 4 hours (user access tokens). App/Client tokens (using client_credentials grant) do not expire but have limited scope.
- **EventSub:** Twitch's webhook system (EventSub) is useful for real-time notifications (stream online/offline, follows, subs) but requires endpoint verification and subscription management.
- **Cost Structure:** Free for read-only API access. Twitch Extensions (interactive overlays) require separate approval and revenue-sharing agreements.

---

### 5.6 Twitter / X (X API v2)

#### Account Requirements
- **X (Twitter) Account** (any type)
- X Developer Account registered at https://developer.x.com/
- **Free Tier:** Read-only access to tweets, followers (limited), profile info
- **Basic Tier ($100/month):** Write access, enhanced analytics, historical data
- **Pro Tier ($5,000/month):** Full archive search, advanced analytics, real-time streaming
- **Enterprise Tier (custom pricing):** Custom rate limits, dedicated support, compliance features

#### OAuth Scopes (OAuth 2.0 with PKCE)
```
tweet.read             - Read tweets from authenticated user
tweet.write            - Post tweets on behalf of authenticated user (Basic+)
users.read             - Read authenticated user's profile information
follows.read           - Read following/followers list
follows.write          - Follow/unfollow users
offline.access         - Obtain refresh token for long-lived access
space.read             - Read Spaces data
```

**Note:** X API v2 does NOT expose audience demographics (age, gender, location) through any tier. These are only available through X Analytics (web dashboard) or third-party tools using scraping.

#### Primary Endpoints
```
GET /2/users/me                                           - Get authenticated user profile
GET /2/users/{id}/followers                               - List followers
GET /2/users/{id}/following                               - List following
GET /2/users/{id}/tweets                                  - List user's tweets with metrics
GET /2/tweets?ids={tweet_ids}&tweet.fields=public_metrics - Get tweet metrics (likes, retweets, replies, quotes)
GET /2/users/{id}?user.fields=public_metrics,description - Get user metrics (followers, following, tweet count)

X Analytics (not API):
Dashboard at analytics.twitter.com provides impressions, engagement rate, demographics
NOT programmatically accessible via API
```

#### Required Metrics & Fields
```
Followers:          users.public_metrics.followers_count
Engagement Rate:    (likes + retweets + replies + quotes) / impressions × 100 (impressions require Basic tier)
Tweet Count:        users.public_metrics.tweet_count
Demographics:       NOT AVAILABLE via API (X Analytics dashboard only)
Impressions:        tweet.public_metrics.impression_count (Basic tier and above)
```

#### Platform-Specific Gotchas & Roadblocks
- **Cost Structure:** This is the most expensive platform integration:
  - Free Tier: 1,500 tweets read/month, 50 tweets write/month, 50,000 followers read/month
  - Basic Tier ($100/month): 10,000 tweets read/month, 3,000 tweets write/month
  - Pro Tier ($5,000/month): 1,000,000 tweets read/month, 300,000 tweets write/month
  - Enterprise: Custom pricing ($42,000+/year typical)
- **Demographics Gap:** X does NOT provide audience demographics through any API tier. This is a critical limitation for influencer-brand matching. Workaround: Use X Analytics dashboard export (manual) or third-party tools (Phyllo, Sprout Social).
- **Token Lifetime:** OAuth 2.0 access tokens expire after 2 hours. Refresh tokens (with `offline.access`) are valid for 6 months. App-only bearer tokens do not expire but have limited scopes.
- **Rate Limits:** Varies by endpoint and tier:
  - Free: 15 app requests per 15 minutes (user timeline), 900 requests per 15 minutes (search)
  - Basic: 60 app requests per 15 minutes
  - Pro: 300 app requests per 15 minutes
- **API Version Confusion:** X has migrated from v1.1 to v2. Some features (media upload, DMs) still require v1.1. The v2 API uses different endpoint structures and response formats.
- **App Review:** Required for write access and elevated access tiers. Review typically takes 1-5 business days for Basic tier, 2-4 weeks for Pro/Enterprise.
- **Rate Limit Headers:** X provides `x-rate-limit-reset`, `x-rate-limit-remaining`, and `x-rate-limit-limit` headers on every response. Implement exponential backoff when limits are approached.

---

### 5.7 LinkedIn (LinkedIn Marketing APIs)

#### Account Requirements
- **LinkedIn Page** OR **LinkedIn Profile** (for personal branding)
- LinkedIn Developer App registered at https://www.linkedin.com/developers/
- App must be associated with a **LinkedIn Marketing Developer Platform** (MDP) organization
- **Marketing Developer Platform** access requires application and approval (separate from standard LinkedIn API)
- **Cost:** Free for basic access; premium tiers for advanced analytics

#### OAuth Scopes
```
r_liteprofile          - Read basic profile information (name, profile photo)
r_emailaddress         - Read email address
rw_organization        - Read/write organization (Page) data
r_organization_social  - Read organization social data (followers, posts)
w_organization_social  - Write organization social data (posting)
r_member_social        - Read member's social data (posts, comments)
```

#### Primary Endpoints
```
GET /v2/me                                  - Get authenticated user's basic profile
GET /v2/organizations/{orgId}               - Get organization (Page) info
GET /v2/organizations/{orgId}/followers     - Get follower statistics
GET /v2/organizations/{orgId}/posts         - List organization's posts
GET /v2/posts/{postId}                      - Get post details with social actions

GET /v2/organizationalEntityFollowStatistics - Follower statistics by organization
GET /v2/organizationalEntityShareStatistics  - Share statistics by organization
GET /v2/socialActions/{postId}              - Get likes, comments, shares for a post
```

#### Required Metrics & Fields
```
Followers:          organizationalEntityFollowStatistics.totalFollowerCount
Engagement Rate:    (reactions + comments + shares) / impressions × 100 (impressions require MDP access)
Impressions:        organizationalEntityShareStatistics.totalImpressions (MDP required)
Demographics:       NOT available through standard API (requires LinkedIn Marketing API partnership)
Post Performance:   socialActions endpoint for per-post metrics
```

#### Platform-Specific Gotchas & Roadblocks
- **Marketing Developer Platform (MDP):** Standard LinkedIn API does NOT provide impression data or demographic breakdowns. Access to `organizationalEntityShareStatistics` (which includes impressions, clicks, shares) requires MDP approval, which involves:
  1. Submitting a use case description
  2. Demonstrating that your app serves advertisers or content creators
  3. Signing LinkedIn's Terms of Use for Advertising APIs
  4. Approval timeline: 2-6 weeks
- **Follower Count vs. Connection Count:** LinkedIn differentiates between "followers" (can be anyone) and "connections" (mutual). The API exposes follower count for Pages but connection count is limited.
- **Token Lifetime:** LinkedIn access tokens expire after 60 days. Refresh tokens are not provided; users must re-authenticate. For long-running integrations, LinkedIn recommends using the `r_liteprofile` scope with periodic re-authentication prompts.
- **Rate Limits:** 100,000 calls per day per app (default). 100 requests per second. Rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- **Post Impression Data:** Available only through MDP. Standard API returns `totalShareStatistics` with shares, comments, reactions but NOT impressions.
- **Personal Profile Limitations:** LinkedIn's API is designed primarily for Page/Organization analytics. Personal profile analytics (who viewed your profile, post views) are NOT available through the API.
- **GDPR Restrictions:** LinkedIn restricts data access for EU users. Demographic data may be partially unavailable.
- **App Review:** LinkedIn requires app review for production access. Review typically takes 1-3 weeks. Apps must demonstrate legitimate business use case.

---

### 5.8 Pinterest (Secondary Priority)

#### Account Requirements
- **Pinterest Business Account** (required for API access; personal accounts cannot use the API)
- Pinterest Developer App registered at https://developers.pinterest.com/
- App registered as a **Business Integration**

#### OAuth Scopes
```
read_users            - Read user profile information
read_pins             - Read pins and their engagement data
read_boards           - Read boards and their metadata
read_account_analytics - Read account-level analytics (impressions, engagement, audience)
```

#### Primary Endpoints
```
GET /v5/user-account                      - Get authenticated user's profile
GET /v5/pins                             - List user's pins
GET /v5/boards                           - List user's boards
GET /v5/user-account/analytics/metrics    - Account-level analytics

GET /v5/user-account/analytics?start_date={start}&end_date={end}&metric_types=IMPRESSIONS,ENGAGEMENT,CLICK_OUTS,SAVE_IMPRESSIONS
GET /v5/user-account/analytics?metric_types=TOTAL_AUDIENCE,ENGAGED_AUDIENCE&start_date={start}&end_date={end}
```

#### Required Metrics & Fields
```
Followers:          user_account.follower_count
Engagement Rate:    (saves + clicks + engagements) / impressions × 100
Impressions:        Analytics API metric=IMPRESSIONS
Demographics:       Analytics API provides TOTAL_AUDIENCE breakdown (age, gender, country)
Save Rate:          saves / impressions × 100 (key Pinterest metric)
```

#### Platform-Specific Gotchas & Roadblocks
- **Business Account Required:** Pinterest API is exclusively for Business accounts. Personal accounts must convert (free, but requires business profile setup).
- **Rate Limits:** 1,000 calls per hour per app. 100 requests per second.
- **Token Lifetime:** Pinterest access tokens do not expire (no refresh token required). However, tokens can be revoked by the user at any time.
- **Demographic Data:** Pinterest provides demographic breakdowns (age, gender, country) through the Analytics API, but this data is aggregated and may not be granular enough for individual post analysis.
- **Visual Platform:** Pinterest engagement metrics (saves, closeups) are weighted differently than other platforms. A "save" indicates higher intent than a "like" on Instagram.

---

## 6. Aggregator Integration (Phase 1 MVP)

### 6.1 Phyllo API Integration

#### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    INFLUENCER CLIENT (Browser)                   │
│                                                                  │
│  1. Click "Connect Instagram"                                   │
│  2. Platform generates Phyllo Connect Token                     │
│  3. Redirect to Phyllo Connect Widget (iframe/popup)            │
│  4. Influencer authenticates with platform (Instagram OAuth)     │
│  5. Phyllo receives tokens, exchanges for platform access        │
│  6. Phyllo fires webhook to platform backend                    │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM BACKEND                              │
│                                                                  │
│  Webhook Listener → Event Router → Account Service              │
│  (Express.js)         (BullMQ)      (Prisma/PostgreSQL)        │
│                                                                  │
│  7. Receive webhook event type: "account.connected"             │
│  8. Store Phyllo account_id, platform, linked_user_id           │
│  9. Trigger initial metric sync                                 │
│  10. Update user's dashboard with verified metrics              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Operational Requirements

**Phyllo Connect Token Generation:**
```typescript
// Server-side endpoint: POST /api/phyllo/connect-token
// Generates a one-time token for Phyllo Connect Widget

interface PhylloConnectTokenRequest {
  userId: string;           // Platform's internal user ID
  environment: 'sandbox' | 'production';
  products: string[];       // ['identity', 'engagement', 'audience']
  redirectUri: string;      // Post-authentication redirect URL
}

interface PhylloConnectTokenResponse {
  connectToken: string;     // One-time use token (valid for 5 minutes)
  connectUrl: string;       // URL to open Phyllo Connect Widget
}
```

**Phyllo Connect Widget Embedding:**
```html
<!-- Frontend: Embed Phyllo Connect Widget -->
<script src="https://cdn.phyllo.com/connect-widget/v1/phyllo-connect.js"></script>

<script>
const phylloConnect = PhylloConnect.initialize({
  environment: 'production',  // or 'sandbox' for testing
  connectToken: '<CONNECT_TOKEN_FROM_BACKEND>',
  onSuccess: (account) => {
    // account.account_id, account.platform, account.status
    // Widget closes; update UI
  },
  onExit: () => {
    // Widget closed without completion
  },
  onError: (error) => {
    // Authentication failed; display error
  }
});

phylloConnect.open();
</script>
```

### 6.2 Webhook Listener Architecture

#### Webhook Endpoint Specification

**Endpoint:** `POST /api/webhooks/phyllo`  
**Content-Type:** `application/json`  
**Authentication:** Phyllo webhook signature verification (HMAC-SHA256)

#### Event Schema

```typescript
// Webhook event payload structure

interface PhylloWebhookEvent {
  event_type: 'account.connected' | 'account.disconnected' | 'account.error' | 'data.sync_completed' | 'data.sync_failed';
  timestamp: string;                    // ISO 8601 format
  account_id: string;                   // Phyllo's unique account identifier
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch' | 'twitter' | 'snapchat' | 'linkedin';
  linked_user_id: string;               // Platform's internal user ID (passed during connect token generation)
  data?: {
    metrics?: SyncedMetrics;            // Populated on data.sync_completed
    error?: string;                     // Populated on data.sync_failed
  };
}

interface SyncedMetrics {
  followers: number;
  engagement_rate: number;
  impressions?: number;
  reach?: number;
  demographics?: {
    age?: Record<string, number>;       // { "18-24": 0.35, "25-34": 0.45 }
    gender?: Record<string, number>;    // { "male": 0.6, "female": 0.4 }
    top_locations?: Array<{ location: string; percentage: number }>;
  };
  last_post_date?: string;
  total_posts?: number;
}
```

#### Webhook Handler Implementation

```typescript
// src/services/webhook-handler.ts

import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { syncMetricsQueue } from '../lib/queue';

const PHYLLO_WEBHOOK_SECRET = process.env.PHYLLO_WEBHOOK_SECRET;

export async function handlePhylloWebhook(req, res) {
  // 1. Verify webhook signature
  const signature = req.headers['x-phyllo-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', PHYLLO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event: PhylloWebhookEvent = req.body;

  // 2. Route event to appropriate handler
  switch (event.event_type) {
    case 'account.connected':
      await handleAccountConnected(event);
      break;
    case 'account.disconnected':
      await handleAccountDisconnected(event);
      break;
    case 'account.error':
      await handleAccountError(event);
      break;
    case 'data.sync_completed':
      await handleSyncCompleted(event);
      break;
    case 'data.sync_failed':
      await handleSyncFailed(event);
      break;
  }

  return res.status(200).json({ received: true });
}

async function handleAccountConnected(event: PhylloWebhookEvent) {
  // Upsert social account record
  await prisma.socialAccount.upsert({
    where: {
      platform_platformAccountId: {
        platform: event.platform,
        platformAccountId: event.account_id,
      },
    },
    create: {
      userId: event.linked_user_id,
      platform: event.platform,
      platformAccountId: event.account_id,
      status: 'ACTIVE',
      connectedAt: new Date(event.timestamp),
      lastSyncAt: null,
    },
    update: {
      status: 'ACTIVE',
      connectedAt: new Date(event.timestamp),
      disconnectedAt: null,
    },
  });

  // Queue initial metric sync
  await syncMetricsQueue.add('initial-sync', {
    socialAccountId: event.account_id,
    platform: event.platform,
  });
}

async function handleAccountDisconnected(event: PhylloWebhookEvent) {
  await prisma.socialAccount.update({
    where: {
      platform_platformAccountId: {
        platform: event.platform,
        platformAccountId: event.account_id,
      },
    },
    data: {
      status: 'DISCONNECTED',
      disconnectedAt: new Date(event.timestamp),
      accessToken: null,       // Purge credentials
      refreshToken: null,
    },
  });
}

async function handleSyncCompleted(event: PhylloWebhookEvent) {
  const metrics = event.data?.metrics;
  if (!metrics) return;

  await prisma.socialAccount.update({
    where: {
      platform_platformAccountId: {
        platform: event.platform,
        platformAccountId: event.account_id,
      },
    },
    data: {
      lastSyncAt: new Date(event.timestamp),
      cachedFollowers: metrics.followers,
      cachedEngagementRate: metrics.engagement_rate,
      cachedDemographics: metrics.demographics || undefined,
    },
  });

  // Publish real-time update to connected brand managers
  await publishMetricUpdate(event.linked_user_id, event.platform, metrics);
}

async function handleSyncFailed(event: PhylloWebhookEvent) {
  await prisma.socialAccount.update({
    where: {
      platform_platformAccountId: {
        platform: event.platform,
        platformAccountId: event.account_id,
      },
    },
    data: {
      status: 'SYNC_FAILED',
      lastSyncError: event.data?.error || 'Unknown sync failure',
    },
  });
}
```

### 6.3 Sync Scheduler

```typescript
// src/workers/sync-scheduler.ts

import { Queue, Worker } from 'bullmq';
import { prisma } from '../lib/prisma';

const syncQueue = new Queue('metric-sync', { connection: redisConnection });

// Schedule recurring sync jobs for all active accounts
export async function schedulePeriodicSync() {
  const activeAccounts = await prisma.socialAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, platform: true, userId: true },
  });

  for (const account of activeAccounts) {
    // Add sync job with platform-specific priority
    await syncQueue.add(
      'refresh-metrics',
      { socialAccountId: account.id, platform: account.platform },
      {
        jobId: `sync-${account.id}`,
        removeOnComplete: 50,     // Keep last 50 completed jobs
        removeOnFail: 20,         // Keep last 20 failed jobs
        attempts: 3,              // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 60000,           // Start with 60s delay
        },
      }
    );
  }
}

// Worker that processes sync jobs
const syncWorker = new Worker('metric-sync', async (job) => {
  const { socialAccountId, platform } = job.data;

  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId },
  });

  if (!account || account.status !== 'ACTIVE') {
    return; // Skip disconnected accounts
  }

  // Fetch metrics from Phyllo API
  const metrics = await fetchMetricsFromPhyllo(account.platformAccountId, platform);

  // Update cached metrics in database
  await prisma.socialAccount.update({
    where: { id: socialAccountId },
    data: {
      cachedFollowers: metrics.followers,
      cachedEngagementRate: metrics.engagement_rate,
      cachedDemographics: metrics.demographics,
      lastSyncAt: new Date(),
      lastSyncError: null,
    },
  });

  return metrics;
}, {
  connection: redisConnection,
  concurrency: 10,  // Process 10 sync jobs concurrently
});
```

---

## 7. Full Database Schema Architecture

### 7.1 Prisma Schema

```prisma
// schema.prisma

generator client {
  provider        = "prisma-client-js"
  binaryTargets   = ["native", "rhel-openssl-1.0.x"]
}

generator zod {
  provider = "zod-prisma"
  output   = "../src/generated/zod"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// CORE USER MODEL
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  role          UserRole  @default(INFLUENCER)
  
  // Brand-specific fields (null for influencers)
  companyName   String?
  companyWebsite String?
  industry      String?
  targetDemographics Json?  // { ageRanges: ["18-24", "25-34"], genders: ["female"], countries: ["US"] }
  
  // Account status
  onboardingCompleted Boolean @default(false)
  emailVerified       Boolean @default(false)
  tosAcceptedAt       DateTime?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  socialAccounts     SocialAccount[]
  brandCampaigns     BrandCampaign[]       @relation("BrandCampaigns")
  influencerCampaigns InfluencerCampaign[] @relation("InfluencerCampaigns")
  notifications      Notification[]
  auditLogs          AuditLog[]
  apiKeys            ApiKey[]
  
  @@index([role])
  @@index([email])
  @@map("users")
}

enum UserRole {
  INFLUENCER
  BRAND_MANAGER
  PLATFORM_ADMIN
}

// ============================================================================
// SOCIAL ACCOUNT MODEL (Core Integration Entity)
// ============================================================================

model SocialAccount {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Platform identification
  platform        Platform  @db.VarChar(20)
  platformAccountId String  @db.VarChar(255)  // Platform's unique user ID (e.g., Instagram Business Account ID)
  platformUsername String?  @db.VarChar(255)  // Public username/handle
  profileUrl      String?  @db.VarChar(500)   // Public profile URL
  
  // OAuth credentials (encrypted at rest)
  accessToken     String?   @db.Text          // AES-256-GCM encrypted
  refreshToken    String?   @db.Text          // AES-256-GCM encrypted
  tokenExpiresAt  DateTime?                   // When the current access token expires
  tokenType       String?   @db.VarChar(50)   // Usually "bearer"
  grantedScopes   String[]  @db.VarChar(100)  // List of OAuth scopes granted
  
  // Connection status
  status          SocialAccountStatus @default(PENDING)
  connectedAt     DateTime?           // When the account was first connected
  disconnectedAt  DateTime?           // When the account was disconnected
  lastHealthCheck DateTime?           // Last successful token validation
  consecutiveFailures Int    @default(0)  // Count of consecutive sync/refresh failures
  
  // Cached metrics (updated on each sync)
  cachedFollowers          Int?
  cachedFollowing          Int?
  cachedEngagementRate     Decimal?  @db.Decimal(5, 4)  // 0.0000 to 1.0000
  cachedImpressions30d     Int?
  cachedReach30d           Int?
  cachedVideoViews30d      Int?
  cachedPostCount          Int?
  cachedAverageLikes       Decimal?  @db.Decimal(12, 2)
  cachedAverageComments    Decimal?  @db.Decimal(12, 2)
  cachedAverageShares      Decimal?  @db.Decimal(12, 2)
  cachedDemographics       Json?     // { age: {"18-24": 0.35}, gender: {"female": 0.6}, locations: [...] }
  
  // Sync metadata
  lastSyncAt               DateTime?
  lastSyncError            String?   @db.Text
  nextScheduledSync        DateTime?
  syncFrequencyMinutes     Int       @default(1440)  // Default: 24 hours
  
  // Phyllo aggregator reference (Phase 1)
  phylloAccountId          String?   @db.VarChar(255)
  
  // Timestamps
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  // Relations
  metricSnapshots  MetricSnapshot[]
  syncLogs         SyncLog[]
  
  @@unique([platform, platformAccountId])
  @@index([userId])
  @@index([platform, status])
  @@index([status, nextScheduledSync])
  @@map("social_accounts")
}

enum Platform {
  INSTAGRAM
  YOUTUBE
  TIKTOK
  TWITCH
  TWITTER      // X (formerly Twitter)
  LINKEDIN
  SNAPCHAT
  PINTEREST
}

enum SocialAccountStatus {
  PENDING           // Initial state; waiting for OAuth completion
  ACTIVE            // Successfully connected and syncing
  TOKEN_EXPIRED     // Access token expired, refresh failed
  CONNECTION_ERROR  // Platform API unreachable or account suspended
  DISCONNECTED      // User manually disconnected
  SYNC_FAILED       // Sync failed due to temporary error
  RATE_LIMITED      // Platform rate limit exceeded
}

// ============================================================================
// METRIC SNAPSHOT MODEL (Historical Data)
// ============================================================================

model MetricSnapshot {
  id              String    @id @default(cuid())
  socialAccountId String
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)
  
  // Snapshot metadata
  snapshotDate    DateTime  @default(now())
  periodStart     DateTime? // For time-range snapshots (e.g., last 30 days)
  periodEnd       DateTime?
  
  // Core metrics
  followers       Int?
  following       Int?
  engagementRate  Decimal?  @db.Decimal(5, 4)
  impressions     Int?
  reach           Int?
  videoViews      Int?
  postCount       Int?
  
  // Platform-specific metrics
  likes           Int?
  comments        Int?
  shares          Int?
  saves           Int?
  clicks          Int?
  profileViews    Int?
  websiteClicks   Int?
  emailContacts   Int?
  phoneContacts   Int?
  
  // Audience demographics at snapshot time
  demographics    Json?     // { age: {...}, gender: {...}, locations: [...] }
  
  // Raw API response (for debugging/audit)
  rawResponse     Json?     @db.Text
  
  // Data provenance
  source          MetricSource @default(PLATFORM_API)
  
  createdAt       DateTime  @default(now())
  
  @@index([socialAccountId, snapshotDate])
  @@index([snapshotDate])
  @@map("metric_snapshots")
}

enum MetricSource {
  PLATFORM_API    // Direct platform API call
  AGGREGATOR      // Phyllo, EnsembleData, or other aggregator
  MANUAL          // Admin manual entry (emergency)
}

// ============================================================================
// SYNC LOG MODEL (Audit Trail)
// ============================================================================

model SyncLog {
  id              String    @id @default(cuid())
  socialAccountId String
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)
  
  // Sync details
  syncType        SyncType
  status          SyncStatus
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  durationMs      Int?      // Sync duration in milliseconds
  
  // Error tracking
  errorCode       String?   @db.VarChar(50)
  errorMessage    String?   @db.Text
  retryCount      Int       @default(0)
  
  // Request/Response metadata
  apiEndpoint     String?   @db.VarChar(500)
  apiStatusCode   Int?
  rateLimitRemaining Int?
  rateLimitReset  DateTime?
  
  // Platform cost tracking
  quotaUnitsUsed  Int?      // API quota units consumed
  
  @@index([socialAccountId, startedAt(sort: Desc)])
  @@index([startedAt])
  @@map("sync_logs")
}

enum SyncType {
  INITIAL_SYNC        // First sync after account connection
  SCHEDULED_SYNC      // Periodic background sync
  MANUAL_SYNC         // User-triggered refresh
  TOKEN_REFRESH       // OAuth token refresh attempt
  HEALTH_CHECK        // Connection health verification
}

enum SyncStatus {
  RUNNING
  SUCCESS
  FAILED
  RATE_LIMITED
  CANCELLED
  PARTIAL_SUCCESS    // Some metrics fetched, others failed
}

// ============================================================================
// BRAND CAMPAIGN MODEL
// ============================================================================

model BrandCampaign {
  id              String    @id @default(cuid())
  brandUserId     String
  brandUser       User      @relation("BrandCampaigns", fields: [brandUserId], references: [id])
  
  name            String    @db.VarChar(255)
  description     String?   @db.Text
  status          CampaignStatus @default(DRAFT)
  
  // Campaign requirements
  targetPlatforms Platform[]
  minFollowers    Int?
  maxFollowers    Int?
  minEngagementRate Decimal? @db.Decimal(5, 4)
  targetDemographics Json?   // { age: ["18-24", "25-34"], gender: ["female"], countries: ["US"] }
  
  // Budget
  budgetMin       Decimal?  @db.Decimal(10, 2)
  budgetMax       Decimal?  @db.Decimal(10, 2)
  
  // Dates
  startDate       DateTime?
  endDate         DateTime?
  applicationDeadline DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  influencers     InfluencerCampaign[]
  
  @@map("brand_campaigns")
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

// ============================================================================
// INFLUENCER CAMPAIGN MODEL (Junction)
// ============================================================================

model InfluencerCampaign {
  id              String    @id @default(cuid())
  campaignId      String
  campaign        BrandCampaign @relation(fields: [campaignId], references: [id])
  influencerUserId String
  influencerUser  User      @relation("InfluencerCampaigns", fields: [influencerUserId], references: [id])
  
  status          InfluencerCampaignStatus @default(APPLIED)
  
  // Negotiated terms
  agreedRate      Decimal?  @db.Decimal(10, 2)
  deliverables    Json?     // [{ type: "story", quantity: 2 }, { type: "reel", quantity: 1 }]
  
  // Performance tracking
  metricsAtStart  Json?     // Metrics snapshot when campaign started
  metricsAtEnd    Json?     // Metrics snapshot when campaign ended
  
  appliedAt       DateTime  @default(now())
  acceptedAt      DateTime?
  completedAt     DateTime?
  
  @@unique([campaignId, influencerUserId])
  @@map("influencer_campaigns")
}

enum InfluencerCampaignStatus {
  APPLIED
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  REJECTED
  CANCELLED
}

// ============================================================================
// NOTIFICATION MODEL
// ============================================================================

model Notification {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type            NotificationType
  title           String    @db.VarChar(255)
  message         String    @db.Text
  
  // Link to relevant entity
  entityType      String?   @db.VarChar(50)  // "social_account", "campaign", etc.
  entityId        String?   @db.VarChar(255)
  
  read            Boolean   @default(false)
  readAt          DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([userId, read, createdAt(sort: Desc)])
  @@map("notifications")
}

enum NotificationType {
  ACCOUNT_CONNECTED
  ACCOUNT_DISCONNECTED
  ACCOUNT_ERROR
  SYNC_FAILED
  CAMPAIGN_UPDATE
  NEW_APPLICATION
  SYSTEM_ALERT
}

// ============================================================================
// AUDIT LOG MODEL
// ============================================================================

model AuditLog {
  id              String    @id @default(cuid())
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  
  action          String    @db.VarChar(100)  // "social_account.connected", "campaign.created", etc.
  entityType      String    @db.VarChar(50)
  entityId        String    @db.VarChar(255)
  
  changes         Json?     // { before: {...}, after: {...} }
  
  ipAddress       String?   @db.VarChar(45)  // IPv4 or IPv6
  userAgent       String?   @db.VarChar(500)
  
  createdAt       DateTime  @default(now())
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
  @@map("audit_logs")
}

// ============================================================================
// API KEY MODEL (for programmatic access)
// ============================================================================

model ApiKey {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name            String    @db.VarChar(100)
  keyHash         String    @db.VarChar(255)  // bcrypt hash of the API key
  prefix          String    @db.VarChar(10)   // First 8 chars for identification
  
  scopes          String[]  @db.VarChar(100)  // ["read:metrics", "read:campaigns", "write:applications"]
  
  lastUsedAt      DateTime?
  expiresAt       DateTime?
  revokedAt       DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([keyHash])
  @@map("api_keys")
}
```

### 7.2 Database Indexes Strategy

```sql
-- Performance-critical indexes for SocialAccount queries
-- (Prisma generates these automatically, but documented for reference)

-- Fast lookup of all active accounts needing sync
CREATE INDEX idx_social_accounts_sync_queue 
ON social_accounts(status, nextScheduled_sync) 
WHERE status = 'ACTIVE';

-- Fast lookup by platform and status (for platform-specific operations)
CREATE INDEX idx_social_accounts_platform_status 
ON social_accounts(platform, status);

-- Fast lookup of metric snapshots for trending
CREATE INDEX idx_metric_snapshots_date_trend 
ON metric_snapshots(social_account_id, snapshot_date DESC);

-- Fast lookup for audit trail queries
CREATE INDEX idx_audit_logs_entity 
ON audit_logs(entity_type, entity_id, created_at DESC);
```

### 7.3 Data Privacy Considerations

#### Encryption at Rest

All OAuth tokens (`accessToken`, `refreshToken`) are encrypted before storage using AES-256-GCM:

```typescript
// src/lib/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv, {
    authTagLength: 16,
  });
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:ciphertext:authTag (all base64-encoded)
  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
}

export function decrypt(encryptedPayload: string): string {
  const [ivBase64, ciphertextBase64, authTagBase64] = encryptedPayload.split(':');
  
  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
}
```

#### Scope Protection (Client-Side)

OAuth scopes must NEVER be exposed to the client browser. The `grantedScopes` field is stored server-side and used only for authorization logic:

```typescript
// Server-side authorization middleware
export function requireScope(requiredScope: string) {
  return async (req, res, next) => {
    const socialAccountId = req.params.socialAccountId;
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      select: { grantedScopes: true, userId: true },
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    if (account.userId !== req.user.id && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!account.grantedScopes.includes(requiredScope)) {
      return res.status(403).json({ error: `Missing required scope: ${requiredScope}` });
    }
    
    next();
  };
}
```

---

## 8. Security & Compliance

### 8.1 OAuth Security

1. **State Parameter:** All OAuth flows use `crypto.randomBytes(32).toString('hex')` as the state parameter, stored in a server-side session (not client-side cookie) and validated on callback.
2. **PKCE (Proof Key for Code Exchange):** Required for all OAuth flows, especially for mobile clients and public-facing SPAs.
3. **Redirect URI Validation:** Callback URLs are validated against a pre-registered whitelist. No wildcard matching. HTTPS enforced.
4. **Token Storage:** OAuth tokens are NEVER stored in browser localStorage, sessionStorage, or cookies. All token operations occur server-side.

### 8.2 API Security

1. **Rate Limiting:** All API endpoints are rate-limited using token bucket algorithm (100 requests/minute per user, 1000 requests/minute per API key).
2. **Input Validation:** All incoming data is validated using Zod schemas at the API boundary.
3. **SQL Injection Prevention:** Prisma ORM parameterizes all queries. Raw SQL (if any) uses prepared statements.
4. **CORS Policy:** Only whitelisted origins are permitted. `Access-Control-Allow-Credentials: true` is set only for authenticated endpoints.

### 8.3 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| OAuth Tokens | Until disconnection | Immediate secure deletion (overwrite + delete) |
| Metric Snapshots | 2 years | Automated cron job (weekly) |
| Sync Logs | 1 year | Automated cron job (weekly) |
| Audit Logs | 3 years | Automated cron job (monthly) |
| User Accounts | Until deletion request | GDPR-compliant soft delete, then hard delete after 30 days |

### 8.4 GDPR Compliance

1. **Right to Access:** Users can request a data export (JSON format) containing all personal data, social account connections, and metric history.
2. **Right to Erasure:** Users can request account deletion. All associated data is purged within 30 days, except audit logs (retained for legal compliance).
3. **Data Minimization:** Only OAuth scopes strictly necessary for the platform's functionality are requested. Demographic data is aggregated and never tied to individual-level tracking.
4. **Consent Management:** OAuth consent screens clearly state what data is accessed and how it is used. Users can revoke consent at any time via the platform's settings or the social platform's app management.

---

## 9. Error Handling & Edge Cases

### 9.1 Error Classification

| Error Code | Category | User Action | System Action |
|-----------|----------|-------------|---------------|
| `OAUTH_DENIED` | User Error | Retry OAuth flow | Log, no retry |
| `OAUTH_INVALID_STATE` | Security | Retry OAuth flow | Log, alert, no retry |
| `TOKEN_EXPIRED` | Platform | Auto-refresh | Retry immediately |
| `TOKEN_REVOKED` | User/Platform | Re-authenticate | Mark account as CONNECTION_ERROR |
| `RATE_LIMITED` | Platform | Wait for reset | Queue with backoff |
| `PLATFORM_DOWN` | Platform | None (automatic) | Retry after health check passes |
| `INVALID_SCOPES` | App Config | Contact support | Log, alert ops |
| `QUOTA_EXCEEDED` | Billing | Upgrade plan | Pause sync for affected platform |

### 9.2 Retry Strategy

```
Attempt 1: Immediate retry (0s delay)
Attempt 2: 60s delay (exponential backoff)
Attempt 3: 300s delay (exponential backoff)
Attempt 4: 1800s delay (exponential backoff)
Attempt 5+: Mark account as SYNC_FAILED, notify user
```

### 9.3 Idempotency

All sync operations use `socialAccountId + platform + snapshotDate` as a natural key. Duplicate sync attempts within the same day update the existing snapshot rather than creating duplicates.

---

## 10. Monitoring & Observability

### 10.1 Key Metrics (DataDog / Prometheus)

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| `social_account.sync.success_rate` | Gauge | < 95% over 1 hour |
| `social_account.sync.duration_ms` | Histogram | p95 > 30s |
| `social_account.token.refresh.success_rate` | Gauge | < 90% over 1 hour |
| `social_account.connection.error_count` | Counter | > 10 per hour |
| `api.rate_limit.violations` | Counter | > 0 per 5 minutes |
| `api.response.time_ms` | Histogram | p95 > 2s |
| `webhook.processing.time_ms` | Histogram | p95 > 5s |

### 10.2 Alerting Rules

| Alert | Severity | Condition | Action |
|-------|----------|-----------|--------|
| High Sync Failure Rate | Critical | success_rate < 90% for 1 hour | Page on-call engineer |
| Token Refresh Failure Spike | Warning | failure_rate > 10% for 30 minutes | Slack notification to #ops |
| Platform API Downtime | Critical | health_check fails for 3 consecutive checks | Page on-call, switch to cached data |
| Rate Limit Exhaustion | Warning | rate_limit_remaining < 5% for any platform | Slack notification, reduce sync frequency |

---

## Appendix A: Platform Comparison Matrix

| Platform | Demographics Available | Follower Count | Engagement Rate | Rate Limit | Token Lifetime | Cost |
|----------|----------------------|----------------|-----------------|------------|----------------|------|
| Instagram | Yes (age, gender, location) | Yes | Yes | 200 calls/hr/user | Long-lived (if Page Token) | Free |
| YouTube | Yes (age, gender, country) | Yes | Yes | 10,000 units/day | 1hr (refresh: 6mo) | Free |
| TikTok | Research API only | Yes | Yes | 1,000 req/min | 24hr (refresh: 30d) | Free (limited) |
| Snapchat | No | No | No | N/A | 24hr | Free |
| Twitch | No | Limited | Limited | 800 req/min | 4hr | Free |
| X/Twitter | No | Yes | Limited | Tier-dependent | 2hr (refresh: 6mo) | $100-5,000/mo |
| LinkedIn | MDP required | Yes | MDP required | 100K/day | 60 days | Free (basic) |
| Pinterest | Yes (age, gender, country) | Yes | Yes | 1,000/hr | Non-expiring | Free |

---

## Appendix B: Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zerify_db

# Redis (Queue & Cache)
REDIS_URL=redis://localhost:6379

# Encryption
ENCRYPTION_KEY=64_char_hex_string_for_aes256gcm_encryption

# Phyllo (Aggregator - Phase 1)
PHYLLO_CLIENT_ID=your_phyllo_client_id
PHYLLO_CLIENT_SECRET=your_phyllo_client_secret
PHYLLO_WEBHOOK_SECRET=your_phyllo_webhook_secret
PHYLLO_ENVIRONMENT=production

# Meta (Instagram/Facebook)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_WEBHOOK_SECRET=your_meta_webhook_secret

# YouTube
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Twitch
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

# X/Twitter
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ORG_ID=your_linkedin_organization_id
```

---

**Document End**

*This PRD is a living document. Updates require review from Engineering, Product, and Security stakeholders.*
