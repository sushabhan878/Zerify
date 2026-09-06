# Zerify — YouTube Integration TRD

**Version:** 1.0  
**Date:** September 2026  
**Status:** Technical Requirements Document  
**Integration:** YouTube  
**Primary APIs:** YouTube Data API v3, YouTube Analytics API  
**Authentication:** Google OAuth 2.0

---

## 1. Objective

The objective is to integrate YouTube into Zerify so that:

1. Influencers can connect their YouTube channel to Zerify.
2. Zerify can retrieve and maintain YouTube profile information.
3. Zerify can retrieve authorized YouTube analytics.
4. Companies can use YouTube creator information during influencer discovery.
5. Zerify can associate YouTube content with campaigns.
6. Zerify can calculate campaign-level performance and engagement.
7. Zerify can periodically synchronize creator and video data.
8. Creators can disconnect/revoke YouTube access.

The integration must support a platform-independent social-account architecture so that Instagram, TikTok, LinkedIn, and X can later use the same pattern.

---

## 2. High-Level Architecture

```text
                         ZERIFY
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Frontend                    Backend
             │                           │
      Connect YouTube                   │
             │                           │
             └──────────► OAuth Service ◄┘
                              │
                              ▼
                     Google Authorization
                              │
                         User Consent
                              │
                              ▼
                       OAuth Callback
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Access Token        Refresh Token
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    YouTube Integration
                       Service Layer
                              │
                ┌─────────────┴──────────────┐
                │                            │
        YouTube Data API             YouTube Analytics API
                │                            │
                └─────────────┬──────────────┘
                              ▼
                         Data Processor
                              │
                              ▼
                          PostgreSQL
                              │
                ┌─────────────┴─────────────┐
                │                           │
          Creator Profile              Campaign Data
                │                           │
                └─────────────┬─────────────┘
                              ▼
                       Zerify Dashboard
```

---

## 3. Integration Components

```text
YouTube Integration
│
├── OAuth Manager
├── Token Manager
├── YouTube Data Client
├── YouTube Analytics Client
├── Channel Service
├── Video Service
├── Analytics Service
├── Sync Service
├── Campaign Attribution Service
├── Data Normalizer
├── Encryption Service
└── Event/Webhook Handler (if required)
```

---

## 4. Google Cloud Configuration

Create a dedicated Google Cloud project for Zerify.

Enable:

```text
YouTube Data API v3
YouTube Analytics API
```

Create:

```text
OAuth 2.0 Client ID
Application Type: Web Application
```

Configure authorized origins:

```text
https://zerify.com
```

Production callback:

```text
https://api.zerify.com/api/integrations/youtube/callback
```

Development callback:

```text
http://localhost:3000/api/integrations/youtube/callback
```

The redirect URI used by Zerify must exactly match the URI configured in Google Cloud.

---

## 5. OAuth Scopes

For the MVP, use the minimum required permissions.

### YouTube account access

```text
https://www.googleapis.com/auth/youtube.readonly
```

### YouTube analytics

```text
https://www.googleapis.com/auth/yt-analytics.readonly
```

Do not request write/upload scopes unless Zerify later needs to manage or upload YouTube content.

Use incremental authorization where practical.

---

## 6. Creator Connection Flow

```text
Creator Profile
       │
       ▼
Social Accounts
       │
       ▼
YouTube
       │
       ▼
[ Connect YouTube ]
       │
       ▼
Google OAuth
       │
       ▼
Creator grants permission
       │
       ▼
Google redirects to Zerify
       │
       ▼
Backend exchanges authorization code
       │
       ▼
Tokens stored securely
       │
       ▼
Fetch YouTube channel
       │
       ▼
Trigger initial synchronization
       │
       ▼
YouTube Connected ✓
```

---

## 7. OAuth API Endpoints

### Start OAuth

```http
GET /api/integrations/youtube/connect
```

Authentication: required.

Purpose:

Generate the Google authorization URL.

The authorization request should include:

```text
client_id
redirect_uri
response_type=code
scope
access_type=offline
include_granted_scopes=true
state
```

The `state` parameter must be cryptographically random and tied to the authenticated Zerify user/session.

### OAuth Callback

```http
GET /api/integrations/youtube/callback
```

Expected parameters:

```text
?code=...
&state=...
```

Process:

1. Validate OAuth state.
2. Validate the authenticated user/session.
3. Exchange the authorization code for tokens.
4. Encrypt and store the refresh token.
5. Store token metadata.
6. Fetch the user's YouTube channel.
7. Save channel information.
8. Enqueue initial synchronization.
9. Redirect the creator back to Zerify.

---

## 8. OAuth State Security

Generate a cryptographically secure random state value.

Example:

```text
state = random_256_bit_value
```

Store temporarily:

```text
userId
state
createdAt
```

On callback:

```text
received_state === stored_state
```

If validation fails:

```text
403 OAuth state validation failed
```

State values must be short-lived and single-use.

---

## 9. Token Management

Store:

```text
access_token
refresh_token
expires_at
scope
token_type
```

Do not expose OAuth tokens to the frontend.

Architecture:

```text
Frontend
   │
   │ never receives tokens
   ▼
Backend
   │
   ├── encrypted refresh token
   ├── access token
   └── token expiration
             │
             ▼
       YouTube API
```

The backend should automatically refresh expired access tokens.

Refresh-token failures should transition the integration into a `REAUTH_REQUIRED` state.

---

## 10. Database Design

### 10.1 social_accounts

Use a platform-independent table.

```sql
social_accounts

id
user_id
platform
platform_user_id
username
display_name
profile_url
profile_image_url

access_token_encrypted
refresh_token_encrypted
token_expires_at

scopes
status

connected_at
last_synced_at
created_at
updated_at
```

Example:

```json
{
  "platform": "youtube",
  "platform_user_id": "UC123456",
  "display_name": "TechWithAlex",
  "status": "connected"
}
```

### 10.2 youtube_channels

```sql
youtube_channels

id
social_account_id

channel_id
channel_title
channel_description
custom_url

thumbnail_url

subscriber_count
video_count
view_count

published_at
country

last_synced_at
created_at
updated_at
```

### 10.3 youtube_videos

```sql
youtube_videos

id
youtube_channel_id

video_id

title
description

thumbnail_url

published_at
duration

view_count
like_count
comment_count

privacy_status
live_broadcast_content

last_synced_at
created_at
updated_at
```

### 10.4 youtube_video_analytics

Store daily snapshots rather than overwriting historical data.

```sql
youtube_video_analytics

id
video_id
date

views
likes
comments

estimated_minutes_watched
average_view_duration

shares
subscribers_gained
subscribers_lost

created_at
```

### 10.5 youtube_channel_analytics

```sql
youtube_channel_analytics

id
youtube_channel_id
date

views
likes
comments
shares

subscribers_gained
subscribers_lost

estimated_minutes_watched
average_view_duration

created_at
```

---

## 11. YouTube Data API Usage

Use the YouTube Data API v3 for public/channel/content data.

Primary operations:

```text
channels.list
playlistItems.list
videos.list
```

### Channel retrieval

Retrieve channel:

- Channel ID
- Title
- Description
- Thumbnail
- Statistics
- Uploads playlist

### Video discovery

Use the channel's uploads playlist to identify uploaded videos rather than repeatedly searching YouTube.

Flow:

```text
Channel
   │
   ▼
Uploads Playlist
   │
   ▼
Video IDs
   │
   ▼
videos.list
   │
   ▼
Video metadata + statistics
```

---

## 12. Initial Synchronization

After successful OAuth:

```text
YouTube Connected
       │
       ▼
Fetch Channel
       │
       ▼
Fetch Channel Statistics
       │
       ▼
Identify Uploads Playlist
       │
       ▼
Fetch Videos
       │
       ▼
Fetch Video Statistics
       │
       ▼
Fetch Authorized Analytics
       │
       ▼
Persist Data
       │
       ▼
Mark Integration Active
```

Initial synchronization must run asynchronously through a background job.

Do not block the OAuth callback while processing large amounts of historical data.

---

## 13. Background Job Architecture

Use a queue such as Redis-backed workers.

Suggested jobs:

```text
youtube.initial_sync
youtube.channel_sync
youtube.video_sync
youtube.analytics_sync
youtube.token_refresh
```

Flow:

```text
OAuth Callback
      │
      ▼
Create Job
      │
      ▼
Queue
      │
      ▼
Worker
      │
      ├── Channel
      ├── Videos
      └── Analytics
```

Jobs must be retryable and idempotent.

---

## 14. Recurring Synchronization

Suggested MVP cadence:

### Channel data

Every 12–24 hours.

### Recent videos

Every 6–12 hours.

### Active campaign videos

Every 6–12 hours.

### Historical analytics

Daily.

The final cadence should be configurable based on API quota and system scale.

---

## 15. Campaign Attribution

Zerify should associate YouTube content with campaigns.

Create:

```sql
campaign_social_content

id
campaign_id
creator_id
platform
platform_content_id

content_url

published_at

created_at
updated_at
```

Example:

```text
campaign_id = 101
creator_id = 42
platform = youtube
platform_content_id = "abc123"
```

---

## 16. Campaign Video Association

### MVP — Creator submits video

Creator selects:

```text
[ Add YouTube Video ]
```

and submits a YouTube URL.

Zerify:

1. Validates the URL.
2. Extracts the video ID.
3. Confirms the video exists.
4. Retrieves metadata.
5. Associates it with the campaign.

### Future — Automatic detection

Zerify can later identify likely campaign videos using:

```text
Campaign hashtag
Brand name
Campaign keywords
Creator identity
Publishing window
Video title
Video description
```

Automatic detection should be treated as a future feature and should not be required for MVP.

---

## 17. Campaign Analytics

For an associated campaign video:

```text
Campaign
   │
   └── YouTube Videos
           │
           ├── Views
           ├── Likes
           ├── Comments
           ├── Shares
           ├── Watch Time
           └── Engagement
```

Calculate:

```text
Total Views
Total Likes
Total Comments
Total Shares
Total Watch Time
Average Engagement Rate
Average Views / Creator
```

Keep raw platform metrics separate from calculated Zerify metrics.

---

## 18. Engagement Rate

Initial Zerify formula:

```text
Engagement Rate =
(Likes + Comments + Shares) / Views × 100
```

Example:

```text
Views = 100,000
Likes = 5,000
Comments = 500
Shares = 300

Engagement = 5,800

ER = 5,800 / 100,000 × 100
   = 5.8%
```

The formula must be implemented in the analytics layer rather than hard-coded into stored raw data.

---

## 19. Creator Dashboard

Example:

```text
YouTube
────────────────────────

Connected ✓

TechWithAlex

125K Subscribers
18.4M Total Views
247 Videos

Last synced:
5 minutes ago

[ View Analytics ]

[ Disconnect ]
```

The frontend should read primarily from Zerify's database, not directly from YouTube.

---

## 20. Company Dashboard

Example:

```text
Campaign Performance
────────────────────────────

YouTube

Creators          12
Videos            18

Total Views       2.4M
Likes             142K
Comments          8.2K
Shares            11K

Engagement Rate   6.7%
```

---

## 21. Influencer Discovery

Public YouTube data can power discovery without requiring creator OAuth.

Example filters:

```text
Platform: YouTube
Subscribers: 10K–100K
Category: Technology
Location: India
Average Views: > 5K
Engagement: > 3%
```

Important distinction:

```text
Public YouTube Data
        ↓
Influencer Discovery
```

versus:

```text
OAuth-Authorized YouTube
        ↓
Creator Analytics
        ↓
Campaign Analytics
```

Public information and authorized/private analytics must be handled separately.

---

## 22. API Key vs OAuth

Use an API key for appropriate public YouTube API requests.

Use OAuth for creator-authorized data.

Conceptually:

```text
API Key
   ↓
Public Data

OAuth
   ↓
Authorized Creator Data
```

The backend should determine which authentication mechanism is appropriate for each request.

---

## 23. Security Requirements

### Never

```text
❌ Store Google client secret in frontend
❌ Store OAuth tokens in localStorage
❌ Send refresh tokens to browser
❌ Log access tokens
❌ Log refresh tokens
❌ Put tokens in URLs
```

### Must

```text
✓ HTTPS
✓ OAuth state validation
✓ Secure cookies/session
✓ Encrypt sensitive tokens at rest
✓ Token refresh handling
✓ Access control
✓ Audit logging
✓ Disconnect/revocation handling
✓ Secret management
```

---

## 24. Disconnect Flow

Frontend:

```text
YouTube Connected

[ Disconnect ]
```

Backend:

```http
DELETE /api/integrations/youtube
```

Process:

```text
1. Revoke authorization where appropriate.
2. Delete encrypted OAuth credentials.
3. Mark social account disconnected.
4. Stop synchronization jobs.
5. Preserve historical campaign metrics according to Zerify's data-retention policy.
```

Disconnecting the integration and deleting historical campaign data should be treated as separate operations.

---

## 25. Error Handling

Handle at least:

```text
OAUTH_ACCESS_DENIED
OAUTH_STATE_INVALID
OAUTH_CODE_EXPIRED
TOKEN_REFRESH_FAILED
TOKEN_REVOKED
YOUTUBE_API_ERROR
YOUTUBE_QUOTA_EXCEEDED
CHANNEL_NOT_FOUND
VIDEO_NOT_FOUND
ANALYTICS_ACCESS_DENIED
INSUFFICIENT_SCOPE
RATE_LIMITED
```

Example:

```text
Token refresh failed
       │
       ▼
status = REAUTH_REQUIRED
       │
       ▼
Creator sees:

"Your YouTube connection needs
to be re-authorized."

[ Reconnect YouTube ]
```

---

## 26. API Quota Management

YouTube APIs use quota units, so Zerify must minimize unnecessary requests.

Do not implement:

```text
Creator opens dashboard
        ↓
Direct YouTube API request
        ↓
Every page load
```

Prefer:

```text
YouTube
   │
   ▼
Background Sync
   │
   ▼
Zerify Database
   │
   ▼
Zerify API
   │
   ▼
Frontend
```

Store frequently used data locally and synchronize it in the background.

Avoid repeated `search.list` requests when channel-specific APIs can provide the required data.

---

## 27. Caching

Persist in PostgreSQL:

```text
Channel data
Video metadata
Video statistics
Analytics snapshots
Campaign associations
```

Use Redis for:

```text
OAuth state
Short-lived cache
Job queues
Distributed locks
Rate limiting
```

---

## 28. Backend API

Recommended endpoints:

```http
GET    /api/integrations/youtube/connect
GET    /api/integrations/youtube/callback

GET    /api/integrations/youtube
DELETE /api/integrations/youtube

POST   /api/integrations/youtube/sync

GET    /api/youtube/channel
GET    /api/youtube/videos
GET    /api/youtube/analytics

POST   /api/campaigns/:id/youtube/videos
GET    /api/campaigns/:id/youtube/analytics
DELETE /api/campaigns/:id/youtube/videos/:videoId
```

---

## 29. Backend Service Structure

Recommended structure:

```text
src/
│
├── modules/
│   └── integrations/
│       └── youtube/
│           │
│           ├── youtube.controller.ts
│           ├── youtube.service.ts
│           ├── youtube.oauth.service.ts
│           ├── youtube.data.service.ts
│           ├── youtube.analytics.service.ts
│           ├── youtube.sync.service.ts
│           ├── youtube.mapper.ts
│           ├── youtube.types.ts
│           └── youtube.errors.ts
│
├── jobs/
│   └── youtube/
│       ├── initial-sync.job.ts
│       ├── channel-sync.job.ts
│       ├── video-sync.job.ts
│       └── analytics-sync.job.ts
│
└── modules/
    └── campaigns/
```

---

## 30. Frontend Components

```text
components/
│
├── social/
│   ├── SocialAccounts.tsx
│   ├── YouTubeConnectButton.tsx
│   ├── YouTubeAccountCard.tsx
│   ├── YouTubeDisconnectModal.tsx
│   └── YouTubeSyncStatus.tsx
│
└── analytics/
    ├── YouTubeOverview.tsx
    ├── YouTubeVideoTable.tsx
    └── YouTubePerformanceChart.tsx
```

---

## 31. Connection States

Use explicit states:

```text
NOT_CONNECTED
CONNECTING
CONNECTED
SYNCING
SYNCED
REAUTH_REQUIRED
ERROR
DISCONNECTED
```

Example:

```text
YouTube

● Connected
Last synced 12 minutes ago

[ View Analytics ] [ Disconnect ]
```

---

## 32. Sync State

Maintain:

```text
sync_status
last_sync_started_at
last_sync_completed_at
last_sync_error
```

Example:

```text
Last synced:
2 hours ago
```

or:

```text
Sync failed

Reason:
Authorization expired

[ Reconnect ]
```

---

## 33. Analytics Architecture

Do not store only aggregate numbers.

Use:

```text
Raw YouTube Data
        │
        ▼
Normalization
        │
        ▼
Daily Snapshots
        │
        ▼
Zerify Analytics Engine
        │
        ▼
Campaign Metrics
```

This supports future metrics such as:

```text
ROI
CPM
CPE
Cost per view
Creator score
Campaign score
Performance prediction
```

---

## 34. Data Normalization

Create a platform-independent model:

```text
SocialProfile
SocialContent
SocialMetrics
SocialAnalytics
```

YouTube maps to:

```text
SocialProfile
      │
      └── YouTube Channel

SocialContent
      │
      └── YouTube Video

SocialMetrics
      │
      ├── Views
      ├── Likes
      ├── Comments
      └── Shares
```

Future platforms:

```text
Instagram ─┐
YouTube ───┤
TikTok ────┤
LinkedIn ──┤──► Zerify Social Data Model
X ─────────┘
```

---

## 35. MVP Scope

### Phase 1 — Connection

```text
✓ Google OAuth
✓ Connect YouTube
✓ Disconnect YouTube
✓ Token management
✓ Channel retrieval
✓ Basic profile statistics
```

### Phase 2 — Content

```text
✓ Retrieve videos
✓ Video statistics
✓ Video database
✓ Initial synchronization
```

### Phase 3 — Analytics

```text
✓ YouTube Analytics OAuth
✓ Daily metrics
✓ Watch time
✓ Engagement
✓ Subscriber growth
```

### Phase 4 — Campaigns

```text
✓ Associate video with campaign
✓ Campaign performance
✓ Creator performance
✓ Aggregate campaign metrics
```

### Phase 5 — Optimization

```text
○ Automatic campaign-video detection
○ Advanced creator scoring
○ Benchmarking
○ AI recommendations
○ Predictive campaign performance
```

---

## 36. Non-Functional Requirements

### Security

```text
OAuth tokens encrypted
HTTPS required
CSRF protection
RBAC
Audit logs
Secrets stored in environment/secret manager
```

### Performance

Target:

```text
Database-backed normal API response: < 300ms
```

YouTube API calls should not normally occur synchronously during dashboard requests.

### Reliability

```text
Retry transient API failures
Exponential backoff
Dead-letter queue
Idempotent sync jobs
```

### Scalability

The architecture should support at least:

```text
10,000+ connected creators
100,000+ channels
Millions of videos
```

without requiring a fundamental redesign.

---

## 37. Idempotency

Every synchronization job must be idempotent.

YouTube video IDs must be unique:

```sql
UNIQUE(platform, video_id)
```

If the same video is retrieved twice:

```text
Do not create a duplicate.
Update the existing record.
```

Analytics snapshots should similarly use a uniqueness constraint such as:

```text
UNIQUE(video_id, date)
```

or the equivalent composite key.

---

## 38. Recommended Sync Strategy

Avoid:

```text
Every sync
    ↓
Fetch ALL videos
```

Instead:

```text
Initial sync
    ↓
Fetch historical videos
```

Then:

```text
Regular sync
    ↓
Fetch recently published videos
    ↓
Update recently active campaign videos
```

For historical analytics:

```text
Daily snapshots
```

---

## 39. Observability

Track:

```text
youtube.oauth.success
youtube.oauth.failure

youtube.api.requests
youtube.api.errors
youtube.api.quota

youtube.sync.started
youtube.sync.completed
youtube.sync.failed

youtube.token.refresh
youtube.token.refresh_failed
```

Operational dashboard:

```text
Connected creators
Active connections
Failed connections
Sync failures
API errors
Average sync duration
Quota consumption
```

---

## 40. Acceptance Criteria

### OAuth

- Creator can click **Connect YouTube**.
- Creator is redirected to Google.
- Creator can authorize Zerify.
- Zerify receives the authorization callback.
- OAuth state is validated.
- Access/refresh credentials are securely stored.
- Creator is returned to Zerify.

### Channel

- Zerify retrieves the correct YouTube channel.
- Channel information is stored.
- Subscriber, view, and video statistics are stored.

### Videos

- Zerify retrieves channel videos.
- Video metadata is stored.
- Video statistics are stored.
- Duplicate videos are prevented.

### Analytics

- Authorized analytics can be retrieved.
- Daily snapshots can be stored.
- Analytics failures do not break the entire synchronization pipeline.

### Campaign

- Creator can attach a YouTube video to a campaign.
- Campaign can aggregate YouTube metrics.
- Company dashboard can display YouTube campaign performance.

### Security

- Tokens are never exposed to frontend clients.
- Tokens are never logged.
- OAuth state validation works.
- Disconnect removes authorization credentials from Zerify.
- Reauthorization is supported when credentials become invalid.

---

## 41. Recommended Final Architecture

```text
                         ┌───────────────────┐
                         │      ZERIFY       │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                FRONTEND                       BACKEND
                    │                             │
             Connect YouTube              OAuth Controller
                    │                             │
                    │                     OAuth Service
                    │                             │
                    │                      Token Manager
                    │                             │
                    │                   ┌─────────┴─────────┐
                    │                   │                   │
                    │              Data API           Analytics API
                    │                   │                   │
                    │                   └─────────┬─────────┘
                    │                             │
                    │                       Sync Workers
                    │                             │
                    │                             ▼
                    │                         PostgreSQL
                    │                             │
                    │                   ┌─────────┴─────────┐
                    │                   │                   │
                    │                Creator             Campaign
                    │                 Data                 Data
                    │                   │                   │
                    └───────────────────┴─────────┬─────────┘
                                                  │
                                             Analytics
                                                  │
                                                  ▼
                                         Company Dashboard
```

---

## 42. Key Product Decision

Zerify should implement YouTube in two layers.

### Layer 1 — Public YouTube Data

Purpose:

```text
Influencer Discovery
```

Data:

```text
Channel
Subscribers
Public videos
Public statistics
```

### Layer 2 — OAuth-Connected YouTube

Purpose:

```text
Creator Analytics
Campaign Analytics
Historical Performance
```

Data:

```text
Authorized channel information
Analytics
Watch time
Subscriber changes
Video performance
```

This separation should also be used as the model for future social-platform integrations.

---

## 43. Implementation Principles

1. Use official YouTube APIs rather than page scraping.
2. Keep OAuth entirely backend-controlled.
3. Encrypt refresh tokens.
4. Never expose tokens to frontend clients.
5. Use background workers for synchronization.
6. Store historical analytics snapshots.
7. Make synchronization idempotent.
8. Minimize YouTube API quota consumption.
9. Normalize YouTube data into Zerify's common social data model.
10. Keep public discovery data separate from creator-authorized analytics.
11. Make campaign attribution explicit and auditable.
12. Design the integration so other social platforms can reuse the same architecture.

---

## 44. External References

- YouTube Data API: https://developers.google.com/youtube/v3
- YouTube OAuth / Server-side Web Apps: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps
- YouTube Analytics Metrics: https://developers.google.com/youtube/analytics/metrics
- YouTube API Quota: https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits
- Google Cloud Console: https://console.cloud.google.com/
