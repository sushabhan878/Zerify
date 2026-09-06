# Zerify — X (Twitter) Integration PRD

**Document Type:** Product Requirements Document (PRD)  
**Product:** Zerify  
**Feature:** X (Twitter) Social Platform Integration  
**Version:** 1.0  
**Date:** September 6, 2026  
**Status:** Implementation Ready

---

## 1. Executive Summary

Zerify is an influencer/brand marketplace where creators can connect their social accounts and brands can discover, evaluate, communicate with, and collaborate with creators.

This PRD defines the complete product and technical requirements for integrating **X (formerly Twitter)** into Zerify.

The integration has two major purposes:

1. **Creator account connection:** Allow an influencer to securely connect their X account to Zerify using X OAuth 2.0.
2. **Creator analytics and discovery:** Import permitted X profile, post, and engagement data into Zerify so that creators can build richer profiles and brands can evaluate them.

The implementation must be designed as a reusable social-integration architecture so that X behaves consistently with Zerify's existing/future YouTube, Instagram, TikTok, LinkedIn, and other integrations.

---

# 2. Goals

## 2.1 Primary Goals

- Allow creators to connect X to their Zerify account.
- Authenticate users through X OAuth 2.0 Authorization Code Flow with PKCE.
- Securely store access and refresh tokens.
- Retrieve the authorized X user's permitted profile information.
- Retrieve permitted posts and associated metrics.
- Normalize X data into Zerify's common creator/social schema.
- Display X as a connected platform on the creator profile.
- Provide platform-specific analytics while maintaining unified creator analytics.
- Support token refresh and reconnection.
- Allow creators to disconnect X.
- Handle API errors, expired authorization, rate limits, and unavailable permissions gracefully.

## 2.2 Secondary Goals

- Make X integration reusable for future social networks.
- Avoid exposing OAuth secrets or tokens to the frontend.
- Minimize unnecessary API calls.
- Make synchronization asynchronous where possible.
- Maintain an auditable connection/sync history.

---

# 3. Non-Goals

The first version does **not** require:

- Posting tweets from Zerify.
- Sending X direct messages from Zerify.
- Managing X advertisements.
- Automatically following/unfollowing users.
- Automatically liking/reposting content.
- Circumventing X API restrictions.
- Scraping data in a way that violates X policies.
- Building a complete X-native social client inside Zerify.

If these features are needed later, they should be separate product/technical initiatives.

---

# 4. User Personas

## 4.1 Influencer / Creator

The creator connects X to Zerify to:

- Verify ownership of their X account.
- Display their X audience.
- Display their X content and engagement.
- Improve brand discovery and matching.
- Maintain a unified social profile.

## 4.2 Brand

The brand uses X information to:

- Discover creators.
- Evaluate audience size.
- Review recent content.
- Compare engagement.
- Select creators for campaigns.

## 4.3 Zerify Admin

Admins need to:

- Monitor integration health.
- Investigate failed connections.
- Inspect synchronization status.
- Monitor API errors and rate limits.
- Disable/problem-isolate broken integrations.

---

# 5. User Experience

## 5.1 Entry Point

Creator:

**Profile → Connected Accounts → X**

Display:

```text
X
Connect your X account

[ Connect X ]
```

After connection:

```text
X
@creator_username

Connected
Last synced: 10 minutes ago

[Sync Now] [Disconnect]
```

---

# 6. OAuth 2.0 Architecture

Zerify should use:

**X OAuth 2.0 Authorization Code Flow with PKCE**

High-level flow:

```text
Creator
   |
   | Click "Connect X"
   v
Zerify Frontend
   |
   | Request connection
   v
Zerify Backend
   |
   | Generate state + PKCE
   v
X Authorization Endpoint
   |
   | User approves
   v
X Callback
   |
   | authorization code + state
   v
Zerify Backend
   |
   | Validate state
   | Exchange code
   v
X Token Endpoint
   |
   | access token
   | refresh token (when granted)
   v
Zerify Token Store
   |
   v
X User/Profile API
   |
   v
Normalization Layer
   |
   v
Zerify Creator Profile
```

---

# 7. X Developer Portal Setup

The implementation team must create an X developer application using X's current developer portal.

Official developer portal:

https://developer.x.com/

Create/configure:

```text
X Developer Project
    |
    └── Zerify X App
```

The exact portal labels and access tiers may change over time, so the implementation team must verify the current X documentation before production deployment.

---

# 8. Environment Variables

The backend should support environment variables similar to:

```env
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=

X_AUTH_URL=https://x.com/i/oauth2/authorize
X_TOKEN_URL=https://api.x.com/2/oauth2/token
X_API_BASE_URL=https://api.x.com/2
```

Do not expose:

```text
X_CLIENT_SECRET
access_token
refresh_token
```

to the browser.

The client secret must exist only in backend/server-side infrastructure.

---

# 9. Redirect URI

Development:

```text
http://localhost:3000/api/integrations/x/callback
```

Production example:

```text
https://api.zerify.in/api/integrations/x/callback
```

The exact URI configured in X must match the URI used by Zerify.

Recommended architecture:

```text
Frontend:
https://app.zerify.in

Backend:
https://api.zerify.in
```

Callback:

```text
https://api.zerify.in/api/integrations/x/callback
```

---

# 10. OAuth Scopes

Request the minimum scopes required by the actual feature set.

Likely initial scopes include:

```text
users.read
tweet.read
offline.access
```

Potential additional scopes must only be added when the corresponding Zerify functionality requires them.

### Scope principles

- Request minimum permissions.
- Explain permissions to users.
- Do not request write permissions for read-only analytics.
- Re-evaluate scopes when new X functionality is added.

---

# 11. OAuth Security

## 11.1 State

Generate a cryptographically secure random `state`.

Store the state temporarily server-side or in a secure short-lived session.

On callback:

```text
received_state == stored_state
```

If false:

```text
401 / OAuth session invalid
```

Do not continue token exchange.

## 11.2 PKCE

Generate:

```text
code_verifier
code_challenge
```

Use:

```text
S256
```

Store the verifier securely for the OAuth transaction.

## 11.3 Token Storage

Tokens must be encrypted at rest.

Recommended:

```text
Database
  |
  └── encrypted access token
  └── encrypted refresh token
```

Encryption keys must be stored separately from application data, preferably in a secrets manager/KMS.

---

# 12. Backend API Design

## 12.1 Start OAuth

```http
GET /api/integrations/x/connect
```

Responsibilities:

1. Authenticate Zerify user.
2. Generate OAuth state.
3. Generate PKCE verifier/challenge.
4. Store OAuth transaction.
5. Build X authorization URL.
6. Redirect to X.

Example response behavior:

```text
HTTP 302
Location: https://x.com/i/oauth2/authorize?...
```

---

# 13. OAuth Callback

```http
GET /api/integrations/x/callback
```

Expected query parameters include:

```text
code
state
```

Potential error parameters must also be handled.

Processing:

```text
1. Validate state
2. Retrieve PKCE verifier
3. Exchange authorization code
4. Validate token response
5. Fetch authorized X user
6. Create/update social account
7. Queue initial synchronization
8. Redirect user to Zerify
```

Successful redirect:

```text
https://app.zerify.in/settings/connected-accounts?x=connected
```

Failure:

```text
https://app.zerify.in/settings/connected-accounts?x=error
```

Do not put tokens in the redirect URL.

---

# 14. Token Exchange

Backend exchanges the authorization code with the X token endpoint.

Conceptually:

```text
POST X_TOKEN_URL

grant_type=authorization_code
code=<authorization_code>
redirect_uri=<redirect_uri>
code_verifier=<pkce_verifier>
```

The exact authentication method and request format must follow the current X OAuth documentation.

Expected token information may include:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 7200,
  "token_type": "bearer",
  "scope": "users.read tweet.read offline.access"
}
```

The application must not assume every response has identical fields; validate the actual response.

---

# 15. Fetch Authorized User

After token exchange, identify the X account belonging to the Zerify user.

Store normalized information such as:

```text
platform = "x"
platform_user_id
username
display_name
profile_image_url
description
```

The implementation must use the X API fields actually available under the application's access level.

---

# 16. Data Model

## 16.1 social_accounts

Recommended schema:

```sql
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    profile_image_url TEXT,

    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,

    token_expires_at TIMESTAMP,
    scopes TEXT,

    status VARCHAR(50) NOT NULL DEFAULT 'connected',

    connected_at TIMESTAMP NOT NULL,
    last_synced_at TIMESTAMP,
    last_sync_status VARCHAR(50),
    last_sync_error TEXT,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    UNIQUE(platform, platform_user_id),
    UNIQUE(user_id, platform)
);
```

The final schema should follow Zerify's existing database conventions.

---

# 17. OAuth Transaction Table

Use a temporary OAuth transaction store:

```text
oauth_transactions

id
user_id
provider
state_hash
code_verifier_encrypted
redirect_uri
expires_at
created_at
```

Requirements:

- Short expiration.
- Single-use.
- Delete after successful/failed completion.
- Never log the raw verifier or token.

---

# 18. X Creator Profile Data

Normalize X information into Zerify's creator model.

Example:

```json
{
  "platform": "x",
  "platformUserId": "123456",
  "username": "creator",
  "displayName": "Creator Name",
  "profileImage": "...",
  "bio": "...",
  "followers": 84000,
  "following": 1200
}
```

Additional fields should only be stored if supported and useful.

---

# 19. Post Data

Recommended normalized post model:

```text
social_posts

id
social_account_id
platform
platform_post_id
text
media_type
media_url
permalink
published_at

like_count
reply_count
repost_count
quote_count
view_count

created_at
updated_at
```

Not every metric will necessarily be available for every X account/API access level.

Missing metrics must be represented as:

```text
NULL
```

rather than incorrectly storing `0`.

---

# 20. Metrics

For each synchronized post, store available metrics.

Potential metrics:

```text
likes
replies
reposts
quotes
views
bookmarks
```

The actual metrics available depend on the X endpoint and current API access.

---

# 21. Engagement Rate

Zerify may calculate a normalized engagement rate.

Example:

```text
engagements =
likes
+ replies
+ reposts
+ quotes
```

Possible follower-based rate:

```text
engagement_rate =
engagements / followers × 100
```

Example:

```text
Followers = 100,000
Likes = 1,500
Replies = 100
Reposts = 200
Quotes = 50

Engagements = 1,850

Engagement Rate =
1,850 / 100,000 × 100
= 1.85%
```

Clearly label calculated metrics as Zerify calculations.

Do not represent calculated metrics as X-provided metrics.

---

# 22. Initial Synchronization

Immediately after successful connection:

```text
OAuth complete
     ↓
Create social account
     ↓
Queue sync job
     ↓
Fetch profile
     ↓
Fetch permitted recent posts
     ↓
Fetch available metrics
     ↓
Normalize
     ↓
Persist
     ↓
Update creator analytics
```

The OAuth callback should not perform a large synchronization synchronously.

Use a background worker.

---

# 23. Sync Jobs

Recommended:

```text
POST /api/integrations/x/sync
```

This should enqueue:

```text
XInitialSyncJob
```

or:

```text
XIncrementalSyncJob
```

Worker flow:

```text
Job
 ↓
Load social account
 ↓
Decrypt token
 ↓
Refresh token if required
 ↓
Call X API
 ↓
Handle pagination
 ↓
Normalize response
 ↓
Upsert records
 ↓
Update sync timestamp
```

---

# 24. Scheduled Synchronization

Recommended initial strategy:

```text
Initial sync:
Immediately

Incremental sync:
Every 6–24 hours
```

The exact interval should be adjusted according to:

- X API limits.
- Zerify product requirements.
- Cost.
- Creator activity.
- Required freshness.

Avoid syncing every account unnecessarily.

---

# 25. Incremental Sync

Maintain:

```text
last_synced_at
```

Fetch only data newer than the previous synchronization where the API supports an appropriate mechanism.

Store a cursor when pagination supports cursor-based retrieval.

Example:

```text
sync_cursor
```

This reduces API usage.

---

# 26. Pagination

Never assume a single API response contains all posts.

Worker must support:

```text
response
   ↓
next_token?
   ↓ yes
fetch next page
   ↓
repeat
```

Add safety limits to prevent runaway jobs.

Example:

```text
MAX_PAGES_PER_SYNC = 20
```

The value should be configurable.

---

# 27. Rate Limits

The integration must expect:

```text
429 Too Many Requests
```

Behavior:

```text
429
 ↓
Read retry information when available
 ↓
Retry with exponential backoff
 ↓
If retries exhausted
 ↓
Mark job delayed/failed
```

Do not aggressively retry.

Recommended retry pattern:

```text
30 sec
60 sec
120 sec
300 sec
```

with jitter.

Exact values should be configurable.

---

# 28. Token Refresh

When access token expiration is approaching:

```text
Access token
     ↓
Check expiry
     ↓
Expired/near expiry?
     ↓ yes
Refresh token
     ↓
Store new token
     ↓
Continue API request
```

Refresh tokens must be handled securely.

If refresh fails because the user revoked access or authorization is invalid:

```text
social_account.status = "reauthorization_required"
```

Creator UI:

```text
X connection needs attention.

[Reconnect X]
```

---

# 29. Disconnect Flow

Frontend:

```text
[Disconnect X]
```

Backend:

```http
DELETE /api/integrations/x
```

Actions:

1. Revoke/release authorization according to current X API capabilities.
2. Delete encrypted access/refresh tokens.
3. Mark/remove social account.
4. Stop pending sync jobs.
5. Decide whether historical analytics should remain.

Recommended:

```text
Connection credentials → delete
Current connection → remove
Historical creator analytics → retain where product/legal policy permits
```

The final retention policy should be documented separately.

---

# 30. Frontend Components

Create:

```text
XConnectButton
XConnectionCard
XConnectionStatus
XAnalyticsCard
XProfileCard
XPostsList
XSyncStatus
XReconnectBanner
```

Example:

```text
┌─────────────────────────────────────┐
│ X                                   │
│ @creator                             │
│                                     │
│ 84.2K followers                     │
│ 3.8% engagement                     │
│                                     │
│ Connected ✓                         │
│ Last synced: 12 min ago             │
│                                     │
│ [Sync Now]       [Disconnect]       │
└─────────────────────────────────────┘
```

---

# 31. Creator Profile

The creator's Zerify profile should show:

```text
Social Presence

YouTube     120K subscribers
Instagram    85K followers
X             84K followers
LinkedIn       9K followers
```

This allows Zerify to provide a unified multi-platform creator profile.

---

# 32. Brand Discovery

Brands should be able to filter/search creators by X-related fields when those fields are available.

Potential filters:

```text
X connected
X followers
X engagement rate
X category
X location
X recent activity
```

Example:

```text
Platform: X
Followers: 10K–500K
Engagement: >2%
Category: Technology
```

Important:

Creator discovery and creator OAuth are separate capabilities.

OAuth proves/establishes a creator's connection to an account. It does not automatically provide unrestricted global influencer discovery.

---

# 33. Discovery Architecture

Use:

```text
Social Integration
        ↓
Creator Data
        ↓
Normalization
        ↓
Search Index
        ↓
Brand Discovery
```

Do not tightly couple discovery queries to X API requests.

Instead, store permitted/appropriate data in Zerify's own indexed model and refresh it according to product requirements and applicable platform policies.

---

# 34. API Layer

Recommended endpoints:

```http
GET    /api/integrations/x/connect
GET    /api/integrations/x/callback
GET    /api/integrations/x
POST   /api/integrations/x/sync
DELETE /api/integrations/x
GET    /api/integrations/x/posts
GET    /api/integrations/x/analytics
```

Optional:

```http
GET /api/integrations/x/status
POST /api/integrations/x/reconnect
```

---

# 35. Service Layer

Recommended backend structure:

```text
XIntegrationController
        ↓
XIntegrationService
        ↓
XOAuthService
        ↓
XApiClient
        ↓
XDataNormalizer
        ↓
SocialAccountRepository
        ↓
SocialPostRepository
```

Keep X-specific API logic isolated.

---

# 36. Suggested Code Structure

```text
src/
  integrations/
    x/
      x.controller.ts
      x.service.ts
      x.oauth.ts
      x.client.ts
      x.normalizer.ts
      x.types.ts
      x.errors.ts
      x.constants.ts
      x.sync.ts
```

If Zerify uses Python:

```text
integrations/
  x/
    router.py
    service.py
    oauth.py
    client.py
    normalizer.py
    schemas.py
    sync.py
    exceptions.py
```

Use the language/framework already adopted by the Zerify backend.

---

# 37. Error Handling

## OAuth Denied

User denies authorization.

Show:

```text
You cancelled the X connection.

You can connect X anytime from Connected Accounts.
```

## Invalid State

```text
OAuth session expired or invalid.
Please try connecting X again.
```

## Token Expired

Attempt refresh.

If unsuccessful:

```text
X authorization has expired.

[Reconnect X]
```

## Rate Limited

Do not show a technical error to creators.

Show:

```text
X data synchronization is temporarily delayed.
We'll retry automatically.
```

## API Unavailable

Queue retry.

## Permission Error

Display:

```text
Zerify doesn't currently have the required X permissions.
Please reconnect your X account.
```

---

# 38. Logging

Log:

```text
OAuth started
OAuth callback received
OAuth successful/failed
Token refresh successful/failed
Sync started
Sync completed
Sync failed
Rate limited
Account disconnected
```

Never log:

```text
access_token
refresh_token
client_secret
code_verifier
authorization_code
```

Use correlation IDs:

```text
request_id
user_id
social_account_id
job_id
```

---

# 39. Monitoring

Track:

```text
x_oauth_success_total
x_oauth_failure_total

x_sync_success_total
x_sync_failure_total

x_api_429_total
x_api_401_total
x_api_403_total

x_token_refresh_success_total
x_token_refresh_failure_total

x_connected_accounts_total
x_disconnected_accounts_total
```

Dashboard should include:

```text
Connected X accounts
Successful sync rate
Failed sync rate
API error rate
Average sync duration
Accounts requiring reauthorization
```

---

# 40. Security Requirements

Mandatory:

- HTTPS in production.
- OAuth state validation.
- PKCE.
- Encrypted tokens at rest.
- Server-side client secret.
- No tokens in URLs.
- No tokens in frontend localStorage.
- No token logging.
- Short-lived OAuth transactions.
- Authentication before starting connection.
- Authorization checks before accessing a user's social account.
- Audit logging for connection/disconnection events.
- Secrets stored using environment/secrets management infrastructure.

---

# 41. Privacy

Zerify should only collect data required for its product functionality.

The creator should understand:

```text
What Zerify accesses
Why Zerify accesses it
How it is used
How to disconnect
```

The implementation team must ensure the integration follows applicable X developer terms, privacy requirements, and Zerify's own privacy policy.

---

# 42. Data Retention

Recommended:

### OAuth credentials

Delete when:

```text
Creator disconnects
```

or when the integration is permanently invalidated, subject to required operational/security records.

### Social content

Retain according to Zerify's platform/data-retention policy.

### Analytics

Historical analytics may be retained where permitted and useful, but must not imply that Zerify has ongoing access to the disconnected account.

---

# 43. Idempotency

Synchronization must be idempotent.

Use:

```text
(platform, platform_user_id)
```

for social accounts.

For posts:

```text
(platform, platform_post_id)
```

Use upsert operations.

Running the same sync twice must not create duplicate posts or accounts.

---

# 44. Concurrency

Prevent multiple simultaneous sync jobs for the same X account.

Recommended lock:

```text
social_account_id + platform
```

or a distributed lock.

Example:

```text
X Sync Job A → running
X Sync Job B → skip/requeue
```

---

# 45. Testing Requirements

## Unit Tests

Test:

- OAuth URL generation.
- PKCE generation.
- State generation/validation.
- Token response parsing.
- Profile normalization.
- Post normalization.
- Metric normalization.
- Pagination.
- Error mapping.
- Token expiry logic.
- Token refresh logic.

## Integration Tests

Test:

```text
Connect
→ OAuth callback
→ Token exchange
→ Profile retrieval
→ Database persistence
→ Initial sync
```

## Failure Tests

Test:

```text
User denies OAuth
Invalid state
Expired OAuth transaction
Invalid authorization code
401
403
429
5xx
Token refresh failure
Duplicate sync
Network timeout
Malformed API response
```

---

# 46. End-to-End Acceptance Criteria

### AC-01 — Connect

Given an authenticated creator,

when they click **Connect X**,

then they are redirected to X authorization.

### AC-02 — Authorization

Given the creator authorizes Zerify,

then Zerify receives the callback and securely exchanges the authorization code.

### AC-03 — Account Creation

After successful authorization:

```text
social_accounts.platform = "x"
```

and the correct X user ID is stored.

### AC-04 — Profile

The creator's X username/profile information appears in Zerify.

### AC-05 — Sync

An initial background sync is automatically queued.

### AC-06 — Posts

Permitted recent X posts are imported and normalized.

### AC-07 — Metrics

Available post/account metrics are stored accurately.

### AC-08 — Refresh

Expired access tokens are refreshed when possible.

### AC-09 — Reauthorization

If refresh fails because authorization is invalid, the account is marked for reconnection.

### AC-10 — Disconnect

Creator can disconnect X and credentials are removed securely.

### AC-11 — Security

Tokens and secrets never appear in browser responses, URLs, logs, or client-side storage.

### AC-12 — Idempotency

Repeated synchronization does not create duplicate records.

---

# 47. Product Flow

Complete creator flow:

```text
Creator signs into Zerify
          ↓
Profile / Settings
          ↓
Connected Accounts
          ↓
Click "Connect X"
          ↓
Zerify generates state + PKCE
          ↓
Redirect to X
          ↓
Creator authorizes
          ↓
X redirects to Zerify
          ↓
Validate state
          ↓
Exchange authorization code
          ↓
Store encrypted tokens
          ↓
Fetch X account
          ↓
Create social account
          ↓
Queue initial sync
          ↓
Import permitted profile/posts/metrics
          ↓
Normalize data
          ↓
Update creator profile
          ↓
Creator sees "X Connected"
```

---

# 48. Architecture Diagram

```text
                    ┌──────────────────┐
                    │  Zerify Frontend │
                    └────────┬─────────┘
                             │
                     Connect X request
                             │
                             ▼
                    ┌──────────────────┐
                    │  Zerify Backend  │
                    └────────┬─────────┘
                             │
                    OAuth + PKCE + State
                             │
                             ▼
                    ┌──────────────────┐
                    │       X API      │
                    └────────┬─────────┘
                             │
                       Access Token
                             │
                             ▼
                    ┌──────────────────┐
                    │ Token Encryption │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Social Accounts  │
                    └────────┬─────────┘
                             │
                       Sync Queue
                             │
                             ▼
                    ┌──────────────────┐
                    │   Sync Worker    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ X API / v2 Data  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Data Normalizer  │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
      Creator Profile                Analytics Engine
              │                             │
              └──────────────┬──────────────┘
                             ▼
                       Brand Discovery
```

---

# 49. Implementation Phases

## Phase 1 — Developer Setup

- Create X developer project/app.
- Configure OAuth 2.0.
- Configure callback URLs.
- Configure required scopes.
- Add environment variables.

## Phase 2 — OAuth

- Build connect endpoint.
- Build state management.
- Build PKCE.
- Build callback.
- Implement token exchange.
- Implement secure token storage.

## Phase 3 — Account

- Fetch authorized X user.
- Create social account.
- Display connection state.
- Implement disconnect.

## Phase 4 — Synchronization

- Build X API client.
- Build initial sync.
- Build pagination.
- Build post normalization.
- Store metrics.

## Phase 5 — Analytics

- Calculate Zerify engagement metrics.
- Build X analytics UI.
- Add X to unified creator analytics.

## Phase 6 — Reliability

- Token refresh.
- Retry/backoff.
- Rate-limit handling.
- Monitoring.
- Error states.

## Phase 7 — Discovery

- Index X creator data.
- Add brand filters.
- Add X to creator matching/ranking.

---

# 50. Definition of Done

The X integration is considered production-ready when:

- [ ] X developer application is configured.
- [ ] Production OAuth redirect URI is configured.
- [ ] OAuth 2.0 + PKCE works.
- [ ] State validation works.
- [ ] Access/refresh tokens are encrypted.
- [ ] Client secret remains server-side.
- [ ] Authorized X account is identified.
- [ ] Creator can see their connected X account.
- [ ] Initial synchronization works asynchronously.
- [ ] Posts are normalized.
- [ ] Available metrics are normalized.
- [ ] Token refresh works.
- [ ] Reauthorization flow works.
- [ ] Disconnect works.
- [ ] Duplicate records are prevented.
- [ ] Pagination works.
- [ ] Rate limiting is handled.
- [ ] Errors are observable.
- [ ] Sensitive values are excluded from logs.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Production monitoring is configured.
- [ ] Current X API documentation and access requirements have been verified before launch.

---

# 51. Important API/Policy Note

X's API products, pricing, access tiers, endpoints, scopes, rate limits, and developer requirements can change.

Therefore, implementation must treat the current X developer documentation as the source of truth before deployment.

Official resources:

- X Developer Platform: https://developer.x.com/
- X API documentation: https://developer.x.com/en/docs/x-api
- X OAuth documentation: https://developer.x.com/en/docs/authentication/oauth-2-0

The engineering team must verify the current endpoint names, scopes, required access level, rate limits, and commercial/data-use restrictions immediately before production launch.

---

# 52. Recommended Zerify Integration Standard

X should be implemented as one provider inside a generic social integration framework:

```text
SocialIntegration
    |
    ├── YouTubeIntegration
    ├── InstagramIntegration
    ├── TikTokIntegration
    ├── LinkedInIntegration
    └── XIntegration
```

Common interface:

```text
connect()
callback()
refreshToken()
getProfile()
getPosts()
getMetrics()
sync()
disconnect()
```

This allows Zerify to add additional platforms without rewriting the entire social-account system.

---

# 53. Final Product Outcome

After implementation, a Zerify creator should be able to connect X in a few clicks and have X become part of their unified creator identity.

Example:

```text
                    ZERIFY CREATOR

┌───────────────────────────────────────────────┐
│ Creator Name                                  │
│ Technology • AI • Startups                    │
│                                               │
│ Social Reach                                  │
│                                               │
│ YouTube     120K                              │
│ Instagram    85K                              │
│ X            84K                              │
│ LinkedIn      9K                              │
│                                               │
│ Overall Engagement: 4.2%                     │
└───────────────────────────────────────────────┘
```

The X integration should therefore be treated not merely as an authentication feature, but as a core component of Zerify's **creator identity, analytics, discovery, and brand-influencer matching infrastructure**.
