# Zerify — Threads Integration PRD

**Document Type:** Product Requirements Document  
**Product:** Zerify  
**Feature:** Threads Social Platform Integration  
**Version:** 1.0  
**Date:** September 6, 2026  
**Status:** Implementation Ready

---

## 1. Executive Summary

Zerify is an influencer/brand marketplace where creators connect their social accounts and brands discover, evaluate, communicate with, and collaborate with creators.

This PRD defines the complete integration of **Threads by Meta** into Zerify.

The integration should allow creators to:

- Connect their Threads account to Zerify.
- Authorize Zerify using the Threads/Meta OAuth flow.
- Import permitted Threads profile information.
- Import permitted Threads posts/replies and available metrics.
- Display Threads as part of their unified Zerify creator profile.
- Use Threads information in creator analytics and brand discovery.
- Disconnect and reconnect Threads securely.

A key requirement is that **Zerify currently has no Threads-specific database tables**. The implementation agent must therefore create all required migrations, tables, indexes, constraints, and relationships based on the data actually required by the integration.

The database design should preferably reuse Zerify's generic social-account architecture if one already exists. If such a reusable architecture does not exist, the agent must create the necessary Threads-specific or generalized tables.

---

# 2. Important Platform Context

Threads provides an API from Meta for authorized applications. Meta's current API materials describe OAuth authorization and endpoints for Threads profiles, Threads media/posts, replies, insights, and publishing capabilities. The available permissions include capabilities such as:

```text
threads_basic
threads_content_publish
threads_read_replies
threads_manage_replies
threads_manage_insights
```

The exact permissions required by Zerify must be limited to the features actually implemented.

For the initial Zerify creator analytics integration, prioritize read-oriented permissions and do **not** request publishing or reply-management permissions unless those features are explicitly implemented.

Meta's API examples currently use the Threads Graph host:

```text
https://graph.threads.net
```

Meta's official developer documentation is the authoritative source. API endpoints, permissions, access requirements, limits, and behavior can change, so the implementation agent must verify the current documentation immediately before production deployment.

Reference materials:
- Threads API documentation: https://developers.facebook.com/docs/threads/
- Meta Threads API Postman collection: https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api
- Meta Threads API sample repository: https://github.com/fbsamples/threads_api

---

# 3. Goals

## 3.1 Primary Goals

- Allow creators to connect Threads to Zerify.
- Authenticate through the current Threads OAuth flow.
- Securely store credentials/tokens.
- Retrieve the authorized Threads user's profile.
- Retrieve the user's permitted Threads posts.
- Retrieve permitted replies where needed.
- Retrieve available insights where the authorized account and API access support them.
- Normalize Threads data into Zerify's social data model.
- Display Threads on creator profiles.
- Include Threads metrics in creator analytics.
- Make Threads usable as an input to brand discovery/matching.
- Support token expiration, refresh/reconnection, and disconnection.
- Build a reusable integration architecture for future platforms.

## 3.2 Secondary Goals

- Maintain asynchronous synchronization.
- Minimize API usage.
- Handle pagination.
- Handle rate limits.
- Provide observability.
- Prevent duplicate data.
- Keep platform-specific API logic isolated from Zerify's core domain.

---

# 4. Non-Goals

The first version does not require:

- Publishing Threads posts from Zerify.
- Scheduling Threads posts.
- Managing Threads replies.
- Moderating Threads replies.
- Sending Threads direct messages.
- Automatically following users.
- Automatically liking/reposting Threads content.
- Scraping Threads through an unofficial browser automation system.
- Circumventing Meta/Threads API restrictions.

These can be added later as separate features.

---

# 5. User Personas

## 5.1 Creator

The creator connects Threads to:

- Verify/control their Threads account.
- Display audience information.
- Display Threads content.
- Provide brands with additional social proof.
- Improve creator matching.

## 5.2 Brand

The brand uses Threads information to:

- Evaluate creators.
- Compare reach.
- Compare engagement.
- Review content.
- Identify relevant creators.

## 5.3 Zerify Admin

Admins need:

- Integration health.
- Sync status.
- Error visibility.
- Reauthorization status.
- API usage/error monitoring.

---

# 6. User Experience

Creator navigation:

```text
Profile
  ↓
Connected Accounts
  ↓
Threads
```

Disconnected state:

```text
Threads

Connect your Threads account to add Threads
analytics to your Zerify profile.

[ Connect Threads ]
```

Connected state:

```text
Threads

@creator
Connected ✓

Followers: 84.2K
Posts: 642
Engagement: 3.4%

Last synced: 15 minutes ago

[ Sync Now ]   [ Disconnect ]
```

---

# 7. High-Level Architecture

```text
                 Zerify Frontend
                       |
                 Connect Threads
                       |
                       v
                 Zerify Backend
                       |
                OAuth / State
                       |
                       v
               Threads / Meta
                       |
                  Access Token
                       |
                       v
                Secure Token Store
                       |
                       v
                  Sync Queue
                       |
                       v
                 Threads Worker
                       |
                       v
                Threads Graph API
                       |
                       v
                Data Normalizer
                       |
          +------------+-------------+
          |                          |
          v                          v
    Creator Profile             Analytics
          |                          |
          +------------+-------------+
                       |
                       v
                Brand Discovery
```

---

# 8. Developer Portal Setup

The engineering team must create/configure a Meta developer application with the **Threads use case**.

The current Meta Threads API setup requires a Threads-enabled Meta application and authorization of app users.

Use the current Meta developer portal and follow the current Threads onboarding flow.

Do not assume that a generic Facebook/Instagram application credential is interchangeable with Threads credentials.

Meta's sample application explicitly notes that the Threads API app ID and secret are separate from regular Meta app credentials.

---

# 9. Environment Variables

Use server-side environment variables similar to:

```env
THREADS_CLIENT_ID=
THREADS_CLIENT_SECRET=

THREADS_REDIRECT_URI=

THREADS_AUTH_URL=
THREADS_TOKEN_URL=
THREADS_API_BASE_URL=https://graph.threads.net
```

The exact OAuth endpoint values must be verified against the current Threads documentation before implementation.

Never expose:

```text
THREADS_CLIENT_SECRET
access_token
refresh_token
```

to the browser.

---

# 10. Redirect URI

Development example:

```text
https://localhost:3000/api/integrations/threads/callback
```

Production example:

```text
https://api.zerify.in/api/integrations/threads/callback
```

Use the actual Zerify backend domain.

The redirect URI configured in the Meta/Threads application must match the URI used by Zerify according to the platform's current requirements.

---

# 11. OAuth Flow

Recommended flow:

```text
Creator
   |
   | Click Connect Threads
   v
Zerify Frontend
   |
   v
Zerify Backend
   |
   | Generate state
   | Create OAuth transaction
   v
Threads Authorization
   |
   | User approves
   v
Threads Callback
   |
   | code + state
   v
Zerify Backend
   |
   | Validate state
   | Exchange authorization code
   v
Threads Token Endpoint
   |
   | Access token
   v
Secure Token Store
   |
   v
Threads /me
   |
   v
Create Threads Social Account
   |
   v
Queue Initial Sync
```

---

# 12. OAuth State

Generate a cryptographically secure random state.

Store:

```text
state_hash
user_id
provider = threads
redirect_uri
expires_at
created_at
```

On callback:

```text
received_state == stored_state
```

If validation fails:

```text
401 Unauthorized
```

Do not exchange the authorization code.

OAuth transactions should be:

- Short-lived.
- Single-use.
- Deleted after completion.
- Never logged with secrets.

---

# 13. OAuth Scopes / Permissions

For a creator analytics integration, request only the minimum permissions required.

Likely read-oriented permissions include:

```text
threads_basic
```

For replies:

```text
threads_read_replies
```

For insights:

```text
threads_manage_insights
```

Do not request:

```text
threads_content_publish
threads_manage_replies
```

unless Zerify actually implements publishing or reply management.

Permission requirements must be verified against the current Threads documentation before production.

---

# 14. Token Lifecycle

The Threads API materials describe exchanging a short-lived Threads user access token for a long-lived token and refreshing unexpired long-lived tokens.

Recommended flow:

```text
OAuth Code
    ↓
Short-Lived Access Token
    ↓
Long-Lived Access Token
    ↓
Secure Storage
    ↓
Refresh before expiration
```

The implementation must follow the current Threads token-exchange/refresh contract.

Do not assume refresh behavior is identical to X, LinkedIn, or YouTube.

---

# 15. Token Storage

Tokens must be encrypted at rest.

Recommended fields:

```text
access_token_encrypted
refresh_token_encrypted
token_expires_at
scopes
```

If the Threads API currently uses a long-lived access token rather than a conventional refresh token in a particular flow, the database should still support the actual credential lifecycle rather than forcing an incorrect OAuth model.

---

# 16. DATABASE REQUIREMENT — NO THREADS TABLES CURRENTLY EXIST

**Important implementation instruction:**

Zerify currently has **no dedicated Threads tables**.

The implementation agent must inspect the existing database first.

### Step 1

Check whether Zerify already has generic tables such as:

```text
social_accounts
social_profiles
social_posts
social_metrics
social_sync_jobs
oauth_connections
```

### Step 2

If these tables exist and are designed to support multiple providers:

**Reuse them.**

Add:

```text
platform = "threads"
```

and any required provider-specific fields.

### Step 3

If the generic schema does not exist or cannot support Threads correctly:

Create the required tables.

The agent must generate database migrations rather than manually modifying production databases.

---

# 17. Recommended Database Model

Preferred architecture:

```text
users
   |
   +---- social_accounts
             |
             +---- social_posts
             |
             +---- social_post_metrics
             |
             +---- social_replies
             |
             +---- social_sync_jobs
```

Threads should be one provider:

```text
social_accounts.platform = "threads"
```

This is preferable to creating a completely separate database architecture for every platform.

---

# 18. Social Accounts Table

If Zerify does not already have a suitable table, create:

```sql
social_accounts
```

Recommended fields:

```text
id
user_id
platform
platform_user_id
username
display_name
profile_image_url
bio

access_token_encrypted
refresh_token_encrypted
token_expires_at
scopes

status

connected_at
last_synced_at
last_sync_status
last_sync_error

created_at
updated_at
```

Constraints:

```text
UNIQUE(platform, platform_user_id)
```

Potentially:

```text
UNIQUE(user_id, platform)
```

if Zerify allows only one account per platform per creator.

---

# 19. Threads-Specific Profile Data

The Threads API profile endpoint can provide information such as:

```text
id
username
name
threads_profile_picture_url
threads_biography
```

Normalize it into Zerify:

```text
platform = "threads"
platform_user_id
username
display_name
profile_image_url
bio
```

Do not assume follower counts are returned by the profile endpoint. Only store fields actually provided by the current API.

---

# 20. Threads Posts Table

If a generic post table does not exist, create:

```text
social_posts
```

Recommended fields:

```text
id
social_account_id

platform
platform_post_id

media_product_type
media_type

username
text
permalink
shortcode

published_at

is_quote_post
has_replies

media_url
thumbnail_url

raw_payload_json

created_at
updated_at
```

Use:

```text
UNIQUE(platform, platform_post_id)
```

to prevent duplicates.

The exact fields must reflect the current Threads API response.

---

# 21. Post Metrics Table

If metrics are available and needed, create:

```text
social_post_metrics
```

Recommended:

```text
id
social_post_id

likes
replies
reposts
quotes
views
shares

measured_at

raw_payload_json

created_at
updated_at
```

Do not insert unsupported metrics as zero.

Use:

```text
NULL
```

when the metric is unavailable.

The exact metric set must be based on the current Threads insights API and the app's granted permissions.

---

# 22. Threads Replies Table

If Zerify needs creator reply analytics, create:

```text
social_replies
```

Recommended:

```text
id
social_account_id
social_post_id

platform_reply_id
parent_platform_post_id

username
text
permalink

published_at

raw_payload_json

created_at
updated_at
```

Use:

```text
UNIQUE(platform, platform_reply_id)
```

If replies are not part of the first release, this table may be deferred.

---

# 23. Sync Jobs Table

If Zerify does not already have a generic job system/table, create:

```text
social_sync_jobs
```

Recommended fields:

```text
id
social_account_id
platform

sync_type
status

started_at
completed_at

cursor
items_processed

error_code
error_message

retry_count
next_retry_at

created_at
updated_at
```

Possible sync types:

```text
initial
incremental
profile
posts
replies
insights
```

---

# 24. Optional Raw API Payload Storage

For debugging and future compatibility, storing selected raw responses can be useful.

Use:

```text
raw_payload_json
```

However:

- Do not store OAuth tokens inside raw payloads.
- Do not store unnecessary personal data.
- Apply retention limits.
- Encrypt sensitive information where appropriate.

---

# 25. Threads Profile API

The current Threads API materials expose a profile endpoint conceptually equivalent to:

```http
GET /me
```

with requested fields.

Example fields include:

```text
id
username
name
threads_profile_picture_url
threads_biography
```

The implementation should request only required fields.

---

# 26. Retrieve User Threads

The current API materials expose a user media endpoint conceptually:

```http
GET /me/threads
```

with fields and pagination.

Use it to retrieve the creator's permitted Threads content.

Recommended fields should include only the fields needed by Zerify, such as:

```text
id
media_product_type
media_type
permalink
username
text
timestamp
shortcode
is_quote_post
has_replies
```

The exact field names must be checked against current API documentation.

---

# 27. Pagination

Threads responses can contain paging information/cursors.

Worker must support:

```text
Request
   ↓
data
paging
   ↓
after cursor?
   ↓ yes
Next request
```

Never assume one request returns all content.

Add a configurable safety limit:

```text
MAX_PAGES_PER_SYNC
```

---

# 28. Replies

If enabled, Threads provides API capabilities for retrieving replies and conversations.

Potential endpoints include concepts such as:

```text
/{thread_id}/replies
/{thread_id}/conversation
/me/replies
```

The implementation must verify current endpoint contracts and required permission:

```text
threads_read_replies
```

before production.

---

# 29. Insights / Analytics

If Zerify wants Threads-native insights, use the Threads insights API and the appropriate permission.

Potential analytics include metrics associated with Threads media/account performance, subject to current API availability.

Architecture:

```text
Threads API
    ↓
Insights Worker
    ↓
Metric Normalizer
    ↓
social_post_metrics
    ↓
Zerify Analytics
```

Do not calculate an X-style or Instagram-style metric and label it as an official Threads metric.

---

# 30. Zerify Engagement Rate

Zerify may calculate its own normalized engagement rate.

Example:

```text
engagements =
likes
+ replies
+ reposts
+ quotes
```

Then:

```text
engagement_rate =
engagements / followers × 100
```

If follower count is not available from the authorized API response, do not fabricate it.

Store:

```text
metric_source = "zerify_calculated"
```

where appropriate.

---

# 31. Initial Synchronization

After successful OAuth:

```text
OAuth complete
      ↓
Create social account
      ↓
Fetch profile
      ↓
Queue initial sync
      ↓
Fetch posts
      ↓
Fetch permitted metrics
      ↓
Normalize
      ↓
Upsert
      ↓
Update creator analytics
```

The callback must not perform a large synchronization synchronously.

---

# 32. Incremental Synchronization

Store:

```text
last_synced_at
```

and where supported:

```text
cursor
```

Use incremental retrieval to reduce API calls.

Recommended default:

```text
Initial sync: immediately
Incremental sync: every 6–24 hours
```

The exact frequency should be configurable based on API limits, cost, and product requirements.

---

# 33. Backend API

Recommended Zerify endpoints:

```http
GET    /api/integrations/threads/connect
GET    /api/integrations/threads/callback

GET    /api/integrations/threads
POST   /api/integrations/threads/sync
DELETE /api/integrations/threads

GET    /api/integrations/threads/posts
GET    /api/integrations/threads/analytics
GET    /api/integrations/threads/status
```

Optional:

```http
POST /api/integrations/threads/reconnect
```

---

# 34. Frontend Components

Recommended:

```text
ThreadsConnectButton
ThreadsConnectionCard
ThreadsProfileCard
ThreadsAnalyticsCard
ThreadsPostsList
ThreadsSyncStatus
ThreadsReconnectBanner
```

Example:

```text
┌─────────────────────────────────────┐
│ Threads                             │
│ @creator                            │
│                                     │
│ 84.2K followers                     │
│ 3.4% engagement                     │
│                                     │
│ Connected ✓                         │
│ Last synced: 15 min ago             │
│                                     │
│ [ Sync Now ]    [ Disconnect ]      │
└─────────────────────────────────────┘
```

---

# 35. Unified Creator Profile

Threads should appear alongside other connected platforms:

```text
Creator Social Presence

YouTube      120K
Instagram     85K
Threads       84K
X             60K
LinkedIn       9K
```

The UI should clearly distinguish:

```text
Platform-native metrics
```

from:

```text
Zerify-calculated metrics
```

---

# 36. Brand Discovery

Brands should be able to use Threads information where the data is available.

Potential filters:

```text
Threads connected
Threads followers
Threads engagement
Threads activity
Category
Location
Audience
```

However, global discovery of arbitrary Threads users is separate from creator OAuth.

OAuth provides access to an authorized creator account; it does not automatically mean Zerify has unrestricted access to every Threads user.

---

# 37. Discovery Data Pipeline

Recommended:

```text
Threads Integration
       ↓
Creator Data
       ↓
Normalizer
       ↓
PostgreSQL
       ↓
Search Index
       ↓
Brand Discovery
       ↓
Matching Engine
```

Do not make every brand search trigger a live Threads API search.

---

# 38. Service Architecture

Recommended:

```text
ThreadsIntegrationController
            ↓
ThreadsIntegrationService
            ↓
ThreadsOAuthService
            ↓
ThreadsApiClient
            ↓
ThreadsNormalizer
            ↓
SocialAccountRepository
            ↓
SocialPostRepository
            ↓
SocialMetricsRepository
```

Keep Threads-specific implementation isolated.

---

# 39. Suggested Repository Structure

TypeScript example:

```text
src/
  integrations/
    threads/
      threads.controller.ts
      threads.service.ts
      threads.oauth.ts
      threads.client.ts
      threads.normalizer.ts
      threads.sync.ts
      threads.types.ts
      threads.errors.ts
      threads.constants.ts
```

If Zerify uses another backend language, follow the existing project architecture.

---

# 40. Database Migrations

The implementation agent must create migrations for all newly required tables.

Example migration structure:

```text
migrations/
  XXXX_create_social_accounts.sql
  XXXX_create_social_posts.sql
  XXXX_create_social_post_metrics.sql
  XXXX_create_social_replies.sql
  XXXX_create_social_sync_jobs.sql
```

Only create tables that do not already exist.

If Zerify already has generic social tables, modify them with a safe migration to support:

```text
threads
```

as a provider.

---

# 41. Database Indexes

Recommended indexes:

```text
social_accounts:
  (user_id, platform)
  (platform, platform_user_id)

social_posts:
  (social_account_id, published_at)
  (platform, platform_post_id)

social_post_metrics:
  (social_post_id, measured_at)

social_replies:
  (social_account_id, published_at)

social_sync_jobs:
  (social_account_id, status)
  (status, next_retry_at)
```

Optimize based on actual query patterns.

---

# 42. Idempotency

Repeated syncs must not create duplicates.

Account:

```text
UNIQUE(platform, platform_user_id)
```

Post:

```text
UNIQUE(platform, platform_post_id)
```

Reply:

```text
UNIQUE(platform, platform_reply_id)
```

Use database upserts.

---

# 43. Rate Limiting

The API client must handle rate-limit responses.

Behavior:

```text
Rate limited
    ↓
Read retry information when available
    ↓
Backoff
    ↓
Retry
```

Use exponential backoff with jitter.

Do not retry indefinitely.

---

# 44. Error Handling

## User Denied

```text
You cancelled the Threads connection.
You can connect Threads anytime from Connected Accounts.
```

## Invalid OAuth State

```text
Your Threads connection session expired.
Please try again.
```

## Invalid Token

```text
Threads authorization needs to be renewed.
[Reconnect Threads]
```

## Rate Limited

```text
Threads synchronization is temporarily delayed.
We'll retry automatically.
```

## Permission Error

```text
Zerify does not have the required Threads permissions.
Please reconnect Threads.
```

---

# 45. Token Refresh / Reauthorization

Before API calls:

```text
Check token
   ↓
Valid?
 ├── Yes → API request
 └── No
       ↓
Refresh/exchange according to Threads API
       ↓
Success?
 ├── Yes → Save new credential
 └── No → reauthorization_required
```

Creator UI:

```text
Threads connection needs attention.

[Reconnect Threads]
```

---

# 46. Disconnect

Endpoint:

```http
DELETE /api/integrations/threads
```

Actions:

1. Stop active sync jobs.
2. Remove encrypted credentials.
3. Mark/remove the connection.
4. Handle platform-side authorization revocation according to current API capabilities.
5. Preserve/delete historical data according to Zerify's retention policy.

Never leave valid OAuth credentials in the database after disconnect.

---

# 47. Logging

Log:

```text
threads_oauth_started
threads_oauth_success
threads_oauth_failed

threads_sync_started
threads_sync_completed
threads_sync_failed

threads_token_refresh_success
threads_token_refresh_failed

threads_rate_limited
threads_disconnected
```

Never log:

```text
client_secret
access_token
refresh_token
authorization_code
state
raw credential payloads
```

---

# 48. Monitoring

Track:

```text
threads_connected_accounts
threads_oauth_success_rate
threads_oauth_failure_rate

threads_sync_success_rate
threads_sync_failure_rate

threads_api_401_total
threads_api_403_total
threads_api_429_total

threads_token_refresh_success
threads_token_refresh_failure

threads_accounts_requiring_reauthorization
```

---

# 49. Privacy and Compliance

Only collect data needed for Zerify's functionality.

Creator should be informed about:

- What Threads data Zerify accesses.
- Why it is accessed.
- How it is used.
- How to disconnect.
- How data is retained/deleted.

The implementation must comply with current Meta/Threads platform terms and Zerify's privacy policy.

---

# 50. Security Requirements

Mandatory:

- HTTPS in production.
- Secure OAuth state.
- Server-side credentials.
- Encrypted tokens.
- No credentials in frontend storage.
- No credentials in URLs.
- No credentials in logs.
- Short-lived OAuth transactions.
- Authenticated Zerify user required.
- Authorization checks before reading a connected account.
- Audit logs for connect/disconnect events.
- Secrets stored using environment variables or a secret manager.

---

# 51. Testing

## Unit Tests

Test:

- OAuth URL generation.
- State generation/validation.
- Token exchange parsing.
- Token lifecycle.
- Profile normalization.
- Post normalization.
- Reply normalization.
- Metrics normalization.
- Pagination.
- Rate-limit handling.
- Error mapping.
- Upserts.
- Duplicate prevention.

## Integration Tests

Test:

```text
Connect
→ Callback
→ Token exchange
→ Fetch profile
→ Persist account
→ Queue sync
→ Fetch posts
→ Persist posts
→ Persist metrics
```

## Failure Tests

Test:

```text
OAuth denied
Invalid state
Expired OAuth transaction
Invalid code
401
403
429
5xx
Network timeout
Token refresh failure
Duplicate sync
Malformed API response
```

---

# 52. Acceptance Criteria

### AC-01 — Connect

Authenticated creator can click:

```text
Connect Threads
```

and reach the Threads authorization flow.

### AC-02 — Authorization

Successful authorization creates a secure Zerify social connection.

### AC-03 — Profile

Authorized Threads profile is displayed correctly.

### AC-04 — Database

All required Threads/social tables are created through migrations if they do not already exist.

### AC-05 — Initial Sync

Successful connection automatically queues initial synchronization.

### AC-06 — Posts

Permitted Threads posts are imported.

### AC-07 — Metrics

Available metrics are stored accurately and missing metrics are not represented as fake zero values.

### AC-08 — Pagination

Multiple pages are handled correctly.

### AC-09 — Idempotency

Repeated sync does not create duplicates.

### AC-10 — Token Lifecycle

Valid credentials are reused/refreshed according to the current Threads API lifecycle.

### AC-11 — Reauthorization

Invalid authorization results in a clear reconnect state.

### AC-12 — Disconnect

Creator can disconnect Threads and credentials are securely removed.

### AC-13 — Security

No OAuth credentials appear in browser storage, URLs, logs, or client responses.

### AC-14 — Analytics

Threads data contributes to the creator's Zerify profile and analytics.

### AC-15 — Discovery

Threads data can be used by brand discovery where the stored data supports the relevant filter.

---

# 53. Implementation Phases

## Phase 1 — Database Audit

- Inspect existing database.
- Identify generic social-account tables.
- Identify existing migrations.
- Reuse generic architecture where possible.
- Design missing tables.

## Phase 2 — Developer Setup

- Create Meta application.
- Enable Threads use case.
- Configure credentials.
- Configure redirect URI.
- Configure permissions.

## Phase 3 — OAuth

- Build connect endpoint.
- Implement state.
- Implement authorization callback.
- Implement token exchange.
- Encrypt credentials.

## Phase 4 — Profile

- Fetch Threads profile.
- Persist account.
- Display connected state.

## Phase 5 — Content Sync

- Build API client.
- Fetch Threads posts.
- Implement pagination.
- Normalize and persist.

## Phase 6 — Analytics

- Add available Threads metrics.
- Build analytics cards.
- Add unified creator metrics.

## Phase 7 — Reliability

- Token lifecycle.
- Retries.
- Rate limits.
- Reauthorization.
- Monitoring.

## Phase 8 — Discovery

- Add Threads fields to search index.
- Add brand filters.
- Integrate with matching/ranking.

---

# 54. Definition of Done

- [ ] Meta/Threads application configured.
- [ ] Correct current Threads API access level verified.
- [ ] OAuth redirect configured.
- [ ] Required permissions configured.
- [ ] OAuth state validation implemented.
- [ ] Token exchange implemented.
- [ ] Token lifecycle implemented.
- [ ] Credentials encrypted.
- [ ] Existing Zerify database architecture audited.
- [ ] Missing database tables created through migrations.
- [ ] Threads social account stored.
- [ ] Threads profile imported.
- [ ] Threads posts imported.
- [ ] Pagination implemented.
- [ ] Available metrics imported.
- [ ] Duplicate prevention implemented.
- [ ] Background synchronization implemented.
- [ ] Rate-limit handling implemented.
- [ ] Error handling implemented.
- [ ] Reauthorization implemented.
- [ ] Disconnect implemented.
- [ ] Frontend connection UI implemented.
- [ ] Creator analytics implemented.
- [ ] Brand discovery integration implemented where supported.
- [ ] Tests pass.
- [ ] Monitoring implemented.
- [ ] Security review completed.
- [ ] Current Meta/Threads API documentation rechecked before production.

---

# 55. Recommended Generic Social Integration Interface

Threads should not be implemented as an isolated one-off system.

Use a common provider interface:

```text
SocialIntegration
    |
    ├── YouTubeIntegration
    ├── InstagramIntegration
    ├── TikTokIntegration
    ├── LinkedInIntegration
    ├── XIntegration
    └── ThreadsIntegration
```

Common methods:

```text
getAuthorizationUrl()
handleCallback()
refreshCredentials()
getProfile()
getPosts()
getReplies()
getInsights()
sync()
disconnect()
```

Provider-specific methods should only be added when necessary.

---

# 56. Final Creator Experience

After implementation:

```text
ZERIFY CREATOR PROFILE

Social Presence

YouTube       120K
Instagram      85K
Threads        84K
X              60K
LinkedIn        9K

--------------------------------

Threads

@creator

84K followers
642 posts
3.4% Zerify engagement rate

Connected ✓
Last synced: 15 minutes ago
```

Threads becomes another first-class source of creator identity and analytics within Zerify.

The integration should therefore be implemented as part of Zerify's broader **multi-platform creator data infrastructure**, not merely as an OAuth login button.

---

# 57. Final Implementation Instruction to Agent

Before writing code:

1. Inspect the entire existing Zerify repository.
2. Inspect the current authentication system.
3. Inspect existing YouTube, LinkedIn, Instagram, TikTok, or X integrations.
4. Inspect the existing database schema and migrations.
5. Determine whether a generic `social_accounts` architecture already exists.
6. Reuse existing abstractions where possible.
7. Create only the missing tables/columns required for Threads.
8. Create proper migrations and indexes.
9. Follow the existing backend framework and coding conventions.
10. Follow the existing frontend component/design system.
11. Verify the current Threads API documentation before hard-coding endpoint, scope, or token-lifecycle assumptions.
12. Never expose secrets to the frontend.
13. Never store OAuth credentials unencrypted.
14. Make synchronization asynchronous and idempotent.
15. Add comprehensive tests.
16. Do not implement Threads publishing/reply management unless explicitly requested.
17. Document all new environment variables and setup steps.
18. Update the project's `.env.example`.
19. Update relevant API documentation.
20. Provide a clear migration/runbook for deployment.

The final result must integrate Threads cleanly into Zerify's existing social platform architecture while keeping provider-specific logic isolated and maintainable.
