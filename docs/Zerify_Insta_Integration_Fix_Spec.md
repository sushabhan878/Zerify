# Zerify — Social Media Integration Data Integrity & Instagram Fix Specification

**Document type:** Production remediation / TRD  
**Project:** Zerify  
**Primary focus:** Instagram integration, with schema principles that must also be applied to other social platforms  
**Date:** 2026-09-09  
**Status:** Implementation-ready specification

---

## 1. Executive Summary

Zerify's social-media integration currently has a data-integrity problem: OAuth credentials, account-level metrics, performance snapshots, audience demographics, media/content records, profile metadata, and synchronization state are not consistently populated from the real platform APIs.

The implementation must be changed from a **schema-first / placeholder-first** approach to an **API-contract-first** approach:

1. Store every value that is actually supplied by the platform API.
2. Never invent/synthesize Instagram analytics data.
3. Do not duplicate account-level canonical fields in performance tables unless the duplicate is intentionally a historical snapshot.
4. Preserve historical metrics in performance tables only when they represent a measurement at a specific time/window.
5. Store token lifecycle state separately from ordinary account profile data.
6. Make sync state operationally complete: `last_synced_at`, `next_sync_at`, `last_error`, retry information, and current status must be persisted.
7. Make all ingestion idempotent and upsert-based.
8. Record raw API payloads where useful for debugging/auditing, but do not expose access tokens.
9. Apply the same normalization principles to Instagram, Facebook, LinkedIn, X, Threads, YouTube, etc.

> **Important API note:** Instagram's available insight metrics have changed over time. Do not blindly keep legacy fields such as `profile_views`, `impressions`, or `website_clicks` as if they are guaranteed to be available. The integration must use the metric set supported by the configured Instagram API version and account type, and persist `NULL` plus an explicit availability/source status when a metric is unavailable.

---

# 2. Problems To Fix

## 2.1 Instagram OAuth/token problems

Current symptoms:

- No refresh-token/lifecycle information is visible in the DB.
- Token expiration is not being handled robustly.
- Token refresh state is not observable.
- The system cannot reliably determine whether an account needs reauthorization.

### Required behavior

The system must distinguish between:

- access token
- refresh mechanism / refresh token, **only where the selected Instagram authentication flow actually provides one**
- token issued time
- token expiration time
- last successful token refresh
- next refresh attempt
- token status
- authorization scopes/permissions
- reauthorization requirement

### Critical clarification

Do **not** assume Instagram always provides a conventional OAuth `refresh_token` column.

For the Instagram API flow currently used by Zerify, verify the exact Meta authentication flow and API version. Some Instagram long-lived token flows use the current long-lived access token with a refresh endpoint rather than returning a conventional OAuth refresh token.

Therefore:

```text
refresh_token = nullable
```

is acceptable.

What is **not** acceptable is:

```text
no token lifecycle state
```

The DB must know how the token is expected to be renewed.

---

# 3. Canonical Data Ownership

Before modifying tables, establish one owner for every piece of data.

## 3.1 `social_accounts`

This is the canonical representation of the connected social account.

Keep fields such as:

- `id`
- `user_id`
- `platform`
- `platform_account_id`
- `username`
- `display_name`
- `profile_url`
- `profile_picture_url`
- `account_type`
- `is_verified`
- `follower_count`
- `following_count`
- `media_count`
- `engagement_rate` — only if it is a current/canonical calculated account metric
- `last_profile_sync_at`
- `created_at`
- `updated_at`

### Rule

If a value describes the **current state of the social account**, it belongs here.

Examples:

```text
username
profile_url
follower_count
following_count
profile_picture_url
is_verified
```

---

# 4. `social_account_performance`

This table must represent **historical measurements**, not a second copy of the account table.

## 4.1 Remove redundant fields

If these currently exist solely as duplicates:

- `follower_count`
- `engagement_rate`
- username
- profile URL
- display name
- account type

remove them from `social_account_performance`.

### Exception

A value may remain if the explicit purpose is historical snapshotting.

For example:

```text
followers_at_snapshot
```

is different from:

```text
follower_count
```

because it records the number at a specific measurement time.

If historical follower tracking is required, rename the field accordingly rather than pretending it is current account data.

---

# 5. Recommended Performance Schema

Use a measurement model such as:

```text
social_account_performance
--------------------------------
id
social_account_id
metric_date
period
source
reach
impressions
profile_views
website_clicks
accounts_engaged
total_interactions
views
likes
comments
shares
saves
replies
follows
unfollows
profile_links_taps
raw_metrics
created_at
updated_at
```

All platform-specific fields should be nullable.

Do not store zero when the API did not provide a metric.

### Correct

```json
{
  "reach": 15230,
  "impressions": null,
  "profile_views": null
}
```

### Incorrect

```json
{
  "reach": 15230,
  "impressions": 0,
  "profile_views": 0
}
```

`0` means the API explicitly reported zero.

`NULL` means unavailable/not returned/not supported.

---

# 6. Instagram Account Insights

The ingestion layer must explicitly request the metrics supported by the active Instagram API version.

A current metric family can include metrics such as:

- `views`
- `reach`
- `accounts_engaged`
- `total_interactions`
- `likes`
- `comments`
- `shares`
- `saves`
- `replies`
- `follows_and_unfollows`
- `profile_links_taps`
- audience demographic metrics

Do not hard-code an assumption that all legacy metrics remain available.

## 6.1 Legacy metrics

Fields such as:

- `impressions`
- `profile_views`
- `website_clicks`

must be treated as compatibility/legacy fields.

The ingestion code should maintain a metric capability map:

```python
INSTAGRAM_METRIC_CAPABILITIES = {
    "reach": {...},
    "views": {...},
    "accounts_engaged": {...},
    "total_interactions": {...},
    "likes": {...},
    "comments": {...},
    "shares": {...},
    "saves": {...},
    "replies": {...},
    "follows_and_unfollows": {...},
    "profile_links_taps": {...},
}
```

The exact supported set must be tied to the configured Graph API version.

---

# 7. Engagement Rate

The DB currently has an `engagement_rate` field but it is not populated reliably.

## 7.1 Do not expect Instagram to return a universal `engagement_rate`

Engagement rate should normally be calculated from platform-provided values.

For an account-level period:

```text
engagement_rate =
    total_interactions / reach * 100
```

if both values are available and that definition is what Zerify has selected.

Alternative definitions may use followers or views.

Therefore the implementation must store:

```text
engagement_rate
engagement_rate_formula
engagement_rate_denominator
```

only if analytics reproducibility is important.

At minimum, document the formula in application code.

### Never calculate:

```text
0 / 0
```

or treat missing reach as zero.

If the denominator is unavailable:

```text
engagement_rate = NULL
```

---

# 8. Reach, Impressions, Profile Views, Website Clicks

These fields must not silently remain empty.

For every requested metric:

1. Determine whether the API version supports it.
2. Determine whether the connected account type supports it.
3. Request it.
4. Parse the returned metric object.
5. Save the value for the correct date/window.
6. If unavailable, save `NULL`.
7. Record an availability reason in logs/metadata.

Example:

```json
{
  "metric": "profile_views",
  "value": null,
  "status": "unsupported_by_api_version"
}
```

This is much better than silently failing.

---

# 9. Audience Demographics

## Current concern

`social_audience_demographics` may contain synthetic/mock values.

This must be eliminated.

### Production rule

**Instagram audience demographics must never be fabricated.**

Only persist data returned by Instagram.

Potential Instagram demographic dimensions include:

- age
- gender
- country
- city

and may be available through follower/engaged-audience demographic insight metrics subject to platform requirements.

## 9.1 Recommended schema

```text
social_audience_demographics
--------------------------------
id
social_account_id
metric_type
dimension
dimension_value
value
percentage
timeframe
source
source_metric
fetched_at
raw_data
created_at
updated_at
```

Example:

```text
social_account_id: 123
metric_type: follower_demographics
dimension: country
dimension_value: IN
value: 7200
percentage: 42.5
timeframe: last_30_days
source: instagram_api
fetched_at: ...
```

### Important

Instagram may impose minimum follower requirements and timeframe requirements for demographic data.

If the account does not qualify:

```text
do not synthesize data
do not insert fake rows
```

Instead record:

```text
status = unavailable
reason = minimum_follower_requirement
```

---

# 10. Social Media Content

`social_media_contents` must be mapped directly to platform media objects.

For Instagram, the ingestion should request fields appropriate for the active API version, including where available:

- `id`
- `caption`
- `media_type`
- `media_product_type`
- `media_url`
- `thumbnail_url`
- `permalink`
- `shortcode`
- `timestamp`
- `username`
- `like_count`
- `comments_count`
- `children`
- `is_comment_enabled`
- `is_shared_to_feed`
- `alt_text`
- applicable media-specific fields

## 10.1 Recommended schema

```text
social_media_contents
--------------------------------
id
social_account_id
platform_media_id
media_type
media_product_type
caption
permalink
shortcode
media_url
thumbnail_url
published_at
like_count
comments_count
view_count
is_comment_enabled
is_shared_to_feed
alt_text
raw_payload
created_at
updated_at
```

All fields that are not universally available must be nullable.

---

# 11. Carousel / Album Handling

For:

```text
CAROUSEL_ALBUM
```

the parent media record must be stored.

Its children should be fetched/stored separately if Zerify needs per-child media information.

Do not flatten the carousel into unrelated posts.

Recommended relationship:

```text
social_media_contents
        |
        | parent_media_id
        v
social_media_content_children
```

If the existing design already supports children through JSON, retain that only if querying individual children is not required.

---

# 12. Media Insights

Do not assume account insights and media insights are the same.

For supported media types, fetch media-specific insights separately.

Examples of useful metrics can include:

- views
- reach
- likes
- comments
- shares
- saves
- total interactions

The exact metric availability depends on media type and API version.

Recommended model:

```text
social_media_performance
--------------------------------
id
social_media_content_id
metric_date
views
reach
likes
comments
shares
saves
replies
total_interactions
raw_metrics
created_at
updated_at
```

This prevents account performance and content performance from becoming mixed.

---

# 13. Social Profile Metadata

The profile metadata table currently has too many missing fields.

The metadata model should capture **platform-returned profile information**, not analytics that belong in performance tables.

Recommended fields:

```text
social_profile_metadata
--------------------------------
id
social_account_id
biography
profile_url
profile_picture_url
website
email
phone
category
account_type
is_business
is_creator
is_verified
username
name
followers_count
following_count
media_count
external_id
platform
raw_payload
fetched_at
created_at
updated_at
```

### Important

Do not populate fields that Instagram does not return for the selected account/API permission set.

Use:

```text
NULL
```

rather than invented values.

---

# 14. Avoid Duplicating Account Data in Profile Metadata

There should be clear ownership.

### `social_accounts`

Current canonical account identity/state.

### `social_profile_metadata`

Platform-specific profile attributes and the latest raw profile response.

### `social_account_performance`

Historical analytics.

### `social_audience_demographics`

Historical/periodic audience composition.

### `social_media_contents`

Published content/media.

### `social_media_performance`

Historical performance of individual content.

### `social_sync_status`

Operational synchronization state.

---

# 15. Social Sync Status

This is a major production issue.

The sync table must persist the complete lifecycle.

Recommended schema:

```text
social_sync_status
--------------------------------
id
social_account_id
sync_type
status
last_started_at
last_completed_at
last_synced_at
next_sync_at
last_success_at
last_error
last_error_code
last_error_at
retry_count
next_retry_at
records_synced
sync_cursor
sync_window_start
sync_window_end
locked_until
created_at
updated_at
```

## 15.1 Status values

Use a constrained enum:

```text
idle
queued
running
success
partial_success
failed
paused
reauthorization_required
```

---

# 16. `next_sync_at`

This field must actually be calculated and persisted.

After successful sync:

```text
next_sync_at = now + configured_sync_interval
```

Example:

```text
sync interval = 6 hours

last_completed_at = 2026-09-09 12:00
next_sync_at      = 2026-09-09 18:00
```

Do not calculate this only in memory.

---

# 17. `last_error`

When a sync fails:

```text
status = failed
last_error = normalized human-readable message
last_error_code = platform/application code
last_error_at = now
retry_count += 1
next_retry_at = backoff(now, retry_count)
```

Do not store secrets, access tokens, authorization headers, or complete sensitive API responses in `last_error`.

Example:

```text
last_error:
Instagram API request failed: OAuth token expired
```

---

# 18. Retry Strategy

Use exponential backoff.

Example:

```text
attempt 1 → 1 minute
attempt 2 → 5 minutes
attempt 3 → 15 minutes
attempt 4 → 30 minutes
attempt 5 → 60 minutes
```

Cap retries.

For authentication errors:

```text
reauthorization_required
```

instead of endlessly retrying.

For rate-limit errors:

```text
retry_after
```

should be honored when supplied by the platform.

---

# 19. Token Lifecycle Model

Add a dedicated token/authentication model if the existing `social_accounts` table is overloaded.

Recommended:

```text
social_account_credentials
--------------------------------
id
social_account_id
access_token_encrypted
refresh_token_encrypted
token_type
expires_at
issued_at
last_refreshed_at
next_refresh_at
refresh_method
token_status
scopes
last_token_error
created_at
updated_at
```

### Security

Tokens must be encrypted at rest.

Never:

- log raw access tokens
- store tokens in `raw_payload`
- return tokens through API serializers
- include tokens in error traces

---

# 20. Instagram Token Refresh Worker

Implement a scheduled background job:

```text
refresh_social_tokens()
```

Pseudo-flow:

```python
for credential in expiring_credentials:
    if credential.refresh_method == "instagram_long_lived":
        refresh_instagram_token(credential)

    elif credential.refresh_method == "oauth_refresh_token":
        refresh_oauth_token(credential)

    else:
        mark_reauthorization_required()
```

Refresh before expiration rather than waiting for failure.

Example policy:

```text
if expires_at <= now + 7 days:
    refresh
```

After a successful refresh:

```text
access_token = new token
expires_at = now + expires_in
last_refreshed_at = now
next_refresh_at = calculated threshold
token_status = active
```

---

# 21. Sync Pipeline

Do not implement one huge Instagram sync function.

Use separate stages:

```text
InstagramSyncOrchestrator
        |
        +--> sync_profile()
        |
        +--> sync_account_insights()
        |
        +--> sync_audience_demographics()
        |
        +--> sync_media()
        |
        +--> sync_media_insights()
        |
        +--> update_sync_status()
```

This gives better failure isolation.

---

# 22. Idempotency

Every API ingestion must be safe to run multiple times.

## Accounts

Unique:

```text
(platform, platform_account_id)
```

## Media

Unique:

```text
(social_account_id, platform_media_id)
```

## Account performance

Unique:

```text
(social_account_id, metric_date, period)
```

or include `metric_type` if the design is metric-row based.

## Audience demographics

Unique:

```text
(
    social_account_id,
    metric_type,
    dimension,
    dimension_value,
    timeframe,
    snapshot_date
)
```

This prevents duplicate rows on every sync.

---

# 23. Pagination

Every Instagram list endpoint must support pagination.

Do not only fetch the first page.

For example:

```python
while next_url:
    response = request(next_url)
    process(response["data"])
    next_url = response.get("paging", {}).get("next")
```

Stop only when:

```text
next == null
```

or the configured synchronization limit is reached.

---

# 24. Incremental Synchronization

Do not re-import the entire account every few hours.

Maintain:

```text
sync_cursor
last_synced_at
sync_window_start
sync_window_end
```

Use incremental windows where the API supports them.

Media sync should use the latest known media timestamp/ID.

Performance sync should backfill a small overlap window to catch delayed platform metrics.

Example:

```text
sync window = last 48 hours
```

Then upsert.

---

# 25. Raw API Payloads

For production debugging, store sanitized raw API responses.

Example:

```text
raw_payload JSONB
```

But sanitize:

- access tokens
- authorization headers
- cookies
- secrets

Raw payloads are extremely useful when Meta changes a response shape.

---

# 26. API Mapping Layer

Do not directly map API JSON into ORM models everywhere.

Create a dedicated adapter:

```text
InstagramAdapter
```

with functions:

```python
get_profile()
get_account_insights()
get_audience_demographics()
get_media()
get_media_insights()
refresh_token()
```

Then normalize:

```text
Instagram API response
        ↓
InstagramAdapter
        ↓
Normalized DTO
        ↓
Repository
        ↓
Database
```

This makes the architecture reusable for other platforms.

---

# 27. Normalized DTOs

Example:

```python
@dataclass
class NormalizedSocialProfile:
    platform_account_id: str
    username: str | None
    display_name: str | None
    profile_url: str | None
    profile_picture_url: str | None
    biography: str | None
    website: str | None
    followers_count: int | None
    following_count: int | None
    media_count: int | None
    is_verified: bool | None
    raw_payload: dict
```

Account insights:

```python
@dataclass
class NormalizedAccountPerformance:
    metric_date: date
    period: str
    reach: int | None
    views: int | None
    accounts_engaged: int | None
    total_interactions: int | None
    likes: int | None
    comments: int | None
    shares: int | None
    saves: int | None
    replies: int | None
    follows: int | None
    unfollows: int | None
    profile_links_taps: int | None
    raw_metrics: dict
```

---

# 28. Missing Data Policy

Use three states conceptually:

### Value exists

```text
15200
```

### API explicitly returned zero

```text
0
```

### API did not provide the metric

```text
NULL
```

Never use:

```text
0
```

as a substitute for unavailable data.

---

# 29. Migration Plan

## Migration 1 — Remove duplicated performance fields

Identify duplicate fields in:

```text
social_account_performance
```

Move historical values only if they are genuinely needed.

Otherwise drop them.

Potentially remove:

```text
follower_count
engagement_rate
```

if they are merely duplicates of `social_accounts`.

---

## Migration 2 — Add credential lifecycle fields

Create or update:

```text
social_account_credentials
```

with:

```text
access_token_encrypted
refresh_token_encrypted
expires_at
issued_at
last_refreshed_at
next_refresh_at
refresh_method
token_status
scopes
last_token_error
```

---

## Migration 3 — Expand sync state

Add:

```text
last_started_at
last_completed_at
last_synced_at
next_sync_at
last_success_at
last_error
last_error_code
last_error_at
retry_count
next_retry_at
records_synced
```

---

## Migration 4 — Audience cleanup

Delete synthetic/test demographic rows.

Only production API-derived rows should remain.

Add:

```text
source
source_metric
timeframe
fetched_at
```

---

## Migration 5 — Media fields

Ensure `social_media_contents` has the API-backed fields required by the current Instagram API adapter.

---

# 30. Data Backfill

After migrations:

1. Reconnect/revalidate Instagram accounts.
2. Refresh token state.
3. Run profile sync.
4. Run account insight sync.
5. Run demographic sync.
6. Run media sync.
7. Run media insight sync.
8. Validate records.
9. Mark sync successful.

Do not manufacture historical data for fields that were never collected.

---

# 31. Automated Validation

Create a management command/job:

```text
validate_social_integrations
```

Checks:

### Account

```text
platform_account_id != NULL
profile_url valid when returned
username present when returned
```

### Credentials

```text
access_token exists
expires_at exists when token is expiring
token_status valid
```

### Performance

```text
social_account_id exists
metric_date exists
no duplicate snapshot
```

### Demographics

```text
source != synthetic
value >= 0
percentage between 0 and 100
```

### Media

```text
platform_media_id exists
published_at exists when returned
permalink valid when returned
```

### Sync

```text
next_sync_at exists
status valid
failed => last_error exists
success => last_completed_at exists
```

---

# 32. API Contract Tests

Mock real Instagram API responses.

Test:

```text
profile response
account insights response
demographic response
media response
carousel response
media insights response
token refresh response
expired token response
rate-limit response
permission error response
```

Every response fixture should be based on an actual API response shape, with secrets removed.

---

# 33. Critical Test Cases

## Test 1 — New Instagram connection

Expected:

```text
social_account created
credential record created
profile metadata populated
sync status created
next_sync_at populated
```

---

## Test 2 — Token refresh

Expected:

```text
old token replaced
expires_at updated
last_refreshed_at updated
token_status = active
```

---

## Test 3 — Expired/revoked token

Expected:

```text
sync status = reauthorization_required
last_error populated
no infinite retries
```

---

## Test 4 — Account insights

Expected:

```text
reach stored if returned
views stored if returned
accounts_engaged stored if returned
total_interactions stored if returned
unsupported metrics remain NULL
```

---

## Test 5 — Demographics unavailable

Expected:

```text
no synthetic data
no fake percentages
status/reason recorded
```

---

## Test 6 — Media

Expected:

```text
media ID stored
caption stored
media type stored
media product type stored
permalink stored
timestamp stored
like/comment counts stored when returned
```

---

## Test 7 — Sync failure

Expected:

```text
status = failed
last_error != NULL
last_error_at != NULL
retry_count incremented
next_retry_at populated
```

---

# 34. Observability

Add structured logs:

```text
social_sync_started
social_sync_completed
social_sync_failed
social_token_refresh_started
social_token_refresh_completed
social_token_refresh_failed
social_metric_unavailable
social_permission_error
social_rate_limited
```

Include:

```text
social_account_id
platform
sync_type
request_id
```

Never include access tokens.

---

# 35. Metrics To Monitor

Application monitoring should expose:

```text
social_sync_success_rate
social_sync_failure_rate
social_sync_duration
instagram_api_error_rate
instagram_rate_limit_count
token_refresh_success_rate
reauthorization_required_count
media_ingestion_count
insight_ingestion_count
demographic_ingestion_count
```

---

# 36. Apply The Same Principle To Other Platforms

The same schema cleanup must be applied to all tables linked to `social_accounts`.

For each platform:

```text
social_accounts
    ↓
profile metadata
    ↓
account performance
    ↓
audience demographics
    ↓
content
    ↓
content performance
    ↓
sync status
    ↓
credentials
```

Platform-specific fields belong in platform-specific JSON/metadata or nullable columns where justified.

Do not force Instagram-only concepts into every platform.

---

# 37. Recommended Ownership Matrix

| Data | Canonical table |
|---|---|
| Account ID | `social_accounts` |
| Username | `social_accounts` / profile metadata snapshot |
| Profile URL | `social_accounts` |
| Current follower count | `social_accounts` |
| Historical follower count | performance snapshot |
| Current engagement rate | `social_accounts` if used |
| Historical engagement rate | performance snapshot |
| Reach | account performance |
| Views | account performance |
| Interactions | account performance |
| Audience country | audience demographics |
| Audience age | audience demographics |
| Audience gender | audience demographics |
| Media ID | social media contents |
| Caption | social media contents |
| Media URL | social media contents |
| Permalink | social media contents |
| Media likes | content/performance |
| Media comments | content/performance |
| Token | credentials |
| Token expiry | credentials |
| Token refresh state | credentials |
| Last sync | sync status |
| Next sync | sync status |
| Last error | sync status |

---

# 38. Definition Of Done

This work is complete only when all of the following are true:

- [ ] Instagram connection creates credential lifecycle state.
- [ ] Access tokens are encrypted.
- [ ] Refresh/re-authentication behavior is implemented according to the selected Meta auth flow.
- [ ] Token expiration is persisted.
- [ ] Token refresh is scheduled before expiration where supported.
- [ ] `social_accounts.profile_url` is populated from real API data when available.
- [ ] `social_accounts.engagement_rate` is calculated from documented real metrics when possible.
- [ ] `social_account_performance` no longer duplicates current account fields without a historical reason.
- [ ] Reach is stored when supported/returned.
- [ ] Views are stored when supported/returned.
- [ ] Legacy metrics are not falsely represented as available.
- [ ] Accounts engaged is stored when available.
- [ ] Total interactions are stored when available.
- [ ] Audience demographics contain only real API-derived data.
- [ ] Synthetic demographic records are removed.
- [ ] Content records map correctly to Instagram media IDs.
- [ ] Media pagination works.
- [ ] Carousel media is handled correctly.
- [ ] Media insights are fetched separately.
- [ ] Profile metadata is populated from real profile responses.
- [ ] Missing API fields remain NULL rather than fake values.
- [ ] `last_synced_at` is persisted.
- [ ] `next_sync_at` is persisted.
- [ ] `last_error` is persisted on failure.
- [ ] Retry state is persisted.
- [ ] Reauthorization state is persisted.
- [ ] Sync operations are idempotent.
- [ ] Raw payloads are sanitized.
- [ ] Automated integration tests pass.
- [ ] Database constraints prevent duplicate ingestion.
- [ ] The same ownership/normalization rules are applied to other social platforms.

---

# 39. Implementation Order

Implement in this order to minimize breakage:

### Phase 1 — Schema audit

Inventory:

```text
social_accounts
social_account_credentials
social_account_performance
social_audience_demographics
social_media_contents
social_media_performance
social_profile_metadata
social_sync_status
```

Mark each field as:

```text
CURRENT
HISTORICAL
PLATFORM_SPECIFIC
DUPLICATE
DERIVED
UNUSED
```

---

### Phase 2 — Database migrations

Remove unjustified duplicates.

Add missing lifecycle and sync fields.

Add unique constraints.

---

### Phase 3 — Instagram adapter

Implement real API mapping for:

```text
profile
account insights
demographics
media
media insights
token lifecycle
```

---

### Phase 4 — Sync orchestration

Implement:

```text
profile sync
performance sync
demographic sync
content sync
content performance sync
```

---

### Phase 5 — Token worker

Implement:

```text
token expiry detection
refresh
failure handling
reauthorization state
```

---

### Phase 6 — Validation

Run:

```text
migration tests
API contract tests
integration tests
idempotency tests
failure/retry tests
```

---

### Phase 7 — Cleanup

Remove:

```text
synthetic demographic data
obsolete metric code
duplicate fields
dead columns
legacy assumptions
```

---

# 40. Final Architectural Rule

The most important rule for Zerify going forward is:

> **The database schema must describe the source of truth, not invent one.**

Instagram API data should flow through:

```text
Meta / Instagram API
        ↓
Platform Adapter
        ↓
Normalized DTO
        ↓
Validation
        ↓
Upsert Repository
        ↓
Canonical Database
        ↓
Analytics / Dashboard
```

Never:

```text
Dashboard assumption
        ↓
fake/default value
        ↓
database
```

For every metric, Zerify should be able to answer:

1. Where did this value come from?
2. Which API metric produced it?
3. For which account?
4. For which period?
5. When was it fetched?
6. Is it current, historical, calculated, or unavailable?
7. Why is it NULL if it is missing?

If the system can answer those seven questions, the social integration becomes production-grade and auditable.
