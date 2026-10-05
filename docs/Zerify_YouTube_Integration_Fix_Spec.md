# Zerify — YouTube Integration Data Integrity & Analytics Remediation Specification

**Document type:** Production remediation / TRD  
**Scope:** YouTube OAuth, channel profile, subscriber/follower metrics, verification state, account performance, audience demographics, videos/content, profile metadata, synchronization, and schema ownership  
**Date:** 2026-09-09  
**Status:** Implementation-ready

---

# 1. Objective

Fix Zerify's YouTube integration so that a connected YouTube channel becomes a fully populated, production-grade social account.

The integration must:

1. Connect the user's YouTube/Google authorization correctly.
2. Persist the OAuth token lifecycle.
3. Persist the Google refresh token for offline access when the OAuth flow returns one.
4. Fetch and store the YouTube channel's real current profile data.
5. Store subscriber/follower count.
6. Correctly handle verification instead of defaulting to `false`.
7. Populate `profile_url`.
8. Calculate/store engagement rate from real YouTube metrics where the selected definition is supported.
9. Populate `social_account_performance` with real YouTube Analytics data.
10. Populate `social_audience_demographics` only with real YouTube Analytics data.
11. Populate `social_media_contents` with real videos.
12. Populate `social_media_performance` with real video-level analytics where authorized/available.
13. Populate `social_profile_metadata` from the actual YouTube channel response.
14. Populate every operational field in `social_sync_status`.
15. Remove unjustified duplicate fields from child tables when the canonical value belongs in `social_accounts`.
16. Never convert unavailable metrics into fake zeroes.
17. Never generate synthetic analytics in production.

YouTube's Data API exposes channel statistics such as `subscriberCount`, `videoCount`, and `viewCount`; subscriber counts are rounded down to three significant figures. citeturn0search0

---

# 2. Current Problems

The current YouTube implementation has the following problems:

- No engagement rate is stored.
- No follower/subscriber count is stored.
- `is_verified` is stored as `false`.
- No profile URL is stored.
- `social_account_performance` is empty.
- `social_audience_demographics` is empty.
- `social_media_contents` is empty.
- `social_profile_metadata` is largely empty.
- `social_sync_status` is partially empty.
- `next_sync_at` is not persisted.
- `last_error` is not persisted.
- OAuth refresh-token lifecycle is not reliably persisted.
- Child tables may duplicate values already owned by `social_accounts`.

These are not independent issues. They indicate that the YouTube integration is currently authenticating without completing a proper **profile → analytics → content → metadata → sync** ingestion pipeline.

---

# 3. Important YouTube API Architecture

Zerify should use two YouTube APIs for different purposes.

## YouTube Data API

Use it for:

```text
channel identity
channel profile
channel statistics
channel branding/snippet
uploads playlist
video metadata
video public statistics
```

The YouTube Data API's `channels.list` resource exposes channel information, and `contentDetails.relatedPlaylists.uploads` identifies the playlist containing the channel's uploaded videos. citeturn0search0turn0search4

## YouTube Analytics API

Use it for:

```text
channel analytics
time-series performance
engagement metrics
subscriber gains/losses
watch time
audience demographics
other authorized analytics
```

The Analytics API supports metrics including `views`, `likes`, `comments`, `shares`, `subscribersGained`, `subscribersLost`, `estimatedMinutesWatched`, and `averageViewDuration`. citeturn0search1

---

# 4. OAuth Refresh Token

Unlike some Meta flows, Google's OAuth flow can provide a conventional refresh token.

For a long-running Zerify integration, request offline access.

The YouTube OAuth documentation explicitly describes offline access and refresh tokens for long-lived server-side access. citeturn1search0turn1search5

The authorization request should use the equivalent of:

```text
access_type=offline
```

and the application must correctly handle cases where Google does not issue a new refresh token on every authorization.

Google documentation notes that refresh tokens may only be issued on the first authorization unless consent is explicitly forced again. citeturn1search12

---

# 5. Refresh Token Storage

Create/use:

```text
social_account_credentials
```

Recommended:

```text
id
social_account_id
credential_type
access_token_encrypted
refresh_token_encrypted
token_type
issued_at
expires_at
last_refreshed_at
next_refresh_at
token_status
scopes
provider_account_id
last_token_error
created_at
updated_at
```

For YouTube:

```text
credential_type = youtube_oauth
```

---

# 6. Critical Refresh Token Rule

When Google returns a new authorization response:

```python
if response.refresh_token:
    credentials.refresh_token = response.refresh_token
```

If the response does NOT include a refresh token:

```python
keep_existing_refresh_token()
```

Do NOT overwrite a valid existing refresh token with:

```text
NULL
```

This is a common OAuth integration bug.

---

# 7. Token Security

Encrypt:

```text
access_token
refresh_token
```

at rest.

Never:

- expose tokens to frontend
- return tokens through API serializers
- log tokens
- store tokens in raw YouTube payloads
- include tokens in exception messages

---

# 8. YouTube Channel Identity

The canonical YouTube account must be represented in:

```text
social_accounts
```

Recommended fields:

```text
id
user_id
platform
platform_account_id
account_type
username
display_name
profile_url
profile_picture_url
follower_count
following_count
media_count
is_verified
engagement_rate
is_active
last_profile_sync_at
created_at
updated_at
```

For YouTube:

```text
platform = youtube
account_type = channel
platform_account_id = YouTube channel ID
```

---

# 9. Subscriber Count = Follower Count

Zerify's normalized schema may use:

```text
follower_count
```

but for YouTube this represents:

```text
subscriberCount
```

Map:

```text
channel.statistics.subscriberCount
        ↓
social_accounts.follower_count
```

YouTube documents `subscriberCount` as the channel subscriber count, rounded down to three significant figures. citeturn0search0

Do not store:

```text
0
```

when the field is unavailable.

Use:

```text
NULL
```

for unavailable.

---

# 10. Video Count

Map:

```text
channel.statistics.videoCount
        ↓
social_accounts.media_count
```

if `media_count` is the normalized field chosen by Zerify.

Alternatively keep a platform-specific field in profile metadata if `media_count` is intended to mean something different.

---

# 11. Total Channel View Count

Map:

```text
channel.statistics.viewCount
```

to an appropriate current account-level metric.

Do NOT place a lifetime channel total into a daily performance snapshot.

Recommended:

```text
social_profile_metadata.total_view_count
```

or a dedicated canonical account field if Zerify wants it.

YouTube's channel `viewCount` represents the total views across videos/formats for the channel. citeturn0search0

---

# 12. `is_verified` Bug

The current:

```text
is_verified = false
```

is not acceptable.

The implementation must distinguish:

```text
true
false
NULL
```

Do NOT write:

```python
is_verified = response.get("is_verified", False)
```

because this converts an unavailable field into a false assertion.

Use:

```python
is_verified = response.get("is_verified")
```

or derive verification only from an authoritative YouTube API field if one is actually available to the selected integration.

If YouTube does not return a usable verification state for the channel:

```text
is_verified = NULL
```

Do not claim that the channel is unverified.

---

# 13. Profile URL

The integration must populate a real YouTube channel URL.

Prefer:

```text
channel custom URL / handle URL
```

when available from the current channel metadata.

Otherwise use the canonical channel URL:

```text
https://www.youtube.com/channel/{channel_id}
```

because the channel ID is authoritative.

Do not construct URLs from an unreliable username.

---

# 14. Channel Metadata

Use:

```text
channels.list
```

with the appropriate parts, such as:

```text
snippet
contentDetails
statistics
brandingSettings
```

where required.

The YouTube channel resource includes channel metadata and the uploads playlist reference through `contentDetails`. citeturn0search0turn0search4

---

# 15. `social_profile_metadata`

This table should contain YouTube-specific profile information that is not the canonical account identity.

Recommended:

```text
id
social_account_id
platform
channel_title
description
country
custom_url
handle
default_language
published_at
banner_url
thumbnail_url
uploads_playlist_id
privacy_status
total_view_count
total_video_count
hidden_subscriber_count
keywords
raw_payload
fetched_at
created_at
updated_at
```

Only persist fields actually returned by YouTube.

---

# 16. No Duplicate Canonical Fields

If the following belong to `social_accounts`:

```text
platform
platform_account_id
username
display_name
profile_url
profile_picture_url
follower_count
is_verified
account_type
engagement_rate
```

do not repeat them in:

```text
social_profile_metadata
social_account_performance
social_sync_status
social_media_contents
```

unless the field is explicitly a historical snapshot.

---

# 17. Profile Metadata Snapshot Exception

If historical profile snapshots are required, explicitly model them.

Example:

```text
social_profile_metadata
--------------------------------
id
social_account_id
snapshot_at
...
```

Then it is a snapshot table.

Otherwise keep one current metadata record:

```text
UNIQUE(social_account_id)
```

---

# 18. Engagement Rate

YouTube does not provide a universal canonical field called:

```text
engagement_rate
```

Zerify should calculate it from real metrics.

For example, a documented Zerify formula could be:

```text
engagement_rate =
    (likes + comments + shares) / views * 100
```

or another explicitly chosen definition.

The formula must be consistent across the application.

If:

```text
views = NULL
```

or:

```text
views = 0
```

then:

```text
engagement_rate = NULL
```

Do not divide by zero.

---

# 19. Engagement Rate Ownership

Current account-level engagement rate:

```text
social_accounts.engagement_rate
```

Historical daily/periodic engagement rate:

```text
social_account_performance.engagement_rate
```

These are not duplicates if one is current and the other is historical.

If Zerify does not need historical engagement rate:

```text
remove it from performance
```

and calculate it dynamically.

---

# 20. `social_account_performance`

This table must no longer be empty.

Populate it using the YouTube Analytics API.

Recommended:

```text
id
social_account_id
metric_date
period
views
engaged_views
estimated_minutes_watched
average_view_duration
likes
comments
shares
subscribers_gained
subscribers_lost
net_subscribers
engagement_rate
raw_metrics
source
fetched_at
created_at
updated_at
```

YouTube identifies `views`, `likes`, `comments`, `shares`, `subscribersGained`, `subscribersLost`, `engagedViews`, `estimatedMinutesWatched`, and `averageViewDuration` as supported Analytics metrics, subject to the API's metric/deprecation rules. citeturn0search1

---

# 21. Reach and Impressions

Do not blindly map YouTube concepts to Instagram/Facebook concepts.

YouTube has different analytics semantics.

For example:

```text
video thumbnail impressions
```

are not the same thing as:

```text
Instagram reach
```

YouTube's Reporting API includes reach reports with `video_thumbnail_impressions` and `video_thumbnail_impressions_ctr`. citeturn0search10

If Zerify's normalized performance table has:

```text
reach
impressions
```

only populate them when a valid YouTube metric maps semantically to that field.

Recommended:

```text
reach = NULL
```

if YouTube does not provide a compatible channel-level reach metric through the selected API/report.

Do not use:

```text
reach = 0
```

as a fallback.

---

# 22. YouTube Performance Metric Mapping

Create an explicit adapter mapping.

Example:

```python
YOUTUBE_ANALYTICS_METRICS = {
    "views": "views",
    "engaged_views": "engagedViews",
    "watch_time_minutes": "estimatedMinutesWatched",
    "average_view_duration": "averageViewDuration",
    "likes": "likes",
    "comments": "comments",
    "shares": "shares",
    "subscribers_gained": "subscribersGained",
    "subscribers_lost": "subscribersLost",
}
```

Do not use generic Instagram/Facebook mappings such as:

```text
profile_views
website_clicks
accounts_engaged
```

unless a valid YouTube API metric actually exists.

---

# 23. Zero vs NULL

This rule applies everywhere.

### API returns:

```json
{
  "likes": 0
}
```

Store:

```text
likes = 0
```

### API doesn't return likes:

```text
likes = NULL
```

### Incorrect:

```text
likes = 0
```

for all missing fields.

---

# 24. Historical Date/Period

Every performance record must identify the measurement period.

Recommended:

```text
metric_date
period
```

For example:

```text
metric_date = 2026-09-08
period = daily
```

For time-series reports, store one row per date.

---

# 25. YouTube Analytics Query

Use:

```text
ids = channel==CHANNEL_ID
startDate = ...
endDate = ...
metrics = ...
dimensions = day
sort = day
```

The Analytics API's query interface supports `ids`, `startDate`, `endDate`, `dimensions`, `metrics`, and filters. citeturn1search1turn1search3

---

# 26. Initial Historical Backfill

When a channel is first connected:

```text
current profile
+
historical analytics window
+
existing videos
```

Recommended initial analytics window:

```text
last 28–90 days
```

depending on Zerify's product requirements and API availability.

Do not pretend to have historical metrics older than the data returned by the API.

---

# 27. Audience Demographics

The current empty:

```text
social_audience_demographics
```

must be populated where YouTube Analytics provides authorized demographic reports.

The YouTube Analytics API supports demographic dimensions such as:

```text
ageGroup
gender
```

and its query model can return these dimensions with metrics such as viewer percentage. citeturn1search1turn1search6

---

# 28. Demographic Schema

Recommended:

```text
social_audience_demographics
--------------------------------
id
social_account_id
metric_type
dimension
dimension_value
metric_name
value
percentage
period
source
source_metric
fetched_at
raw_data
created_at
updated_at
```

Example:

```text
metric_type = viewer_demographics
dimension = age_group
dimension_value = AGE_25_34
metric_name = viewer_percentage
value = 31.4
percentage = 31.4
source = youtube_analytics_api
```

---

# 29. Demographic Queries

Use the YouTube Analytics API with the appropriate report and dimensions.

Possible dimensions include:

```text
ageGroup
gender
country
```

only where supported by the selected report/API.

The API documentation explicitly supports `ageGroup` and `gender` dimensions for demographic reports. citeturn1search1turn1search2

---

# 30. Never Generate Synthetic Demographics

Delete/disable any code such as:

```python
random.randint(...)
```

or:

```python
fake_demographics()
```

or:

```python
generate_demo_audience()
```

for production synchronization.

Production data must come from:

```text
YouTube Analytics API
```

only.

If demographics are unavailable:

```text
no rows
```

or:

```text
availability = unavailable
```

Do not generate estimates.

---

# 31. Demographic Availability

Demographic data can be limited by YouTube reporting availability, privacy, thresholds, authorization, and report support.

Therefore:

```text
API returns data
    → store data

API returns no data
    → do not fabricate

API says report unavailable
    → record unavailable reason
```

---

# 32. `social_media_contents`

This table must be populated with the channel's videos.

Use:

```text
contentDetails.relatedPlaylists.uploads
```

to identify the uploads playlist and retrieve uploaded videos. YouTube documents that the uploads playlist contains the channel's uploaded videos. citeturn0search0turn0search4

---

# 33. Recommended Content Schema

```text
social_media_contents
--------------------------------
id
social_account_id
platform_media_id
content_type
title
description
caption
permalink
media_url
thumbnail_url
published_at
updated_at
duration_seconds
category_id
privacy_status
like_count
comment_count
view_count
is_live
live_status
raw_payload
created_at
updated_at
```

---

# 34. Video API Mapping

For each video:

```text
videos.list
```

request appropriate parts such as:

```text
snippet
contentDetails
statistics
status
```

Map:

```text
video.id
    → platform_media_id

snippet.title
    → title

snippet.description
    → description

snippet.publishedAt
    → published_at

statistics.viewCount
    → view_count

statistics.likeCount
    → like_count

statistics.commentCount
    → comment_count

contentDetails.duration
    → duration_seconds
```

YouTube documents the video `statistics` resource and fields such as `viewCount` and `likeCount`. citeturn0search2

---

# 35. Video URL

Canonical:

```text
https://www.youtube.com/watch?v={VIDEO_ID}
```

Store as:

```text
permalink
```

Do not depend on a user-provided URL.

---

# 36. Video Pagination

Use:

```text
playlistItems.list
```

and continue through:

```text
nextPageToken
```

Then retrieve video details in batches using:

```text
videos.list?id=...
```

Do not fetch one API request per video when batch retrieval is possible.

---

# 37. Content Upsert

Enforce:

```text
UNIQUE(
    social_account_id,
    platform_media_id
)
```

If a video already exists:

```text
UPDATE
```

Do not insert duplicates during every sync.

---

# 38. `social_media_performance`

If Zerify needs historical video-level analytics, create/populate:

```text
social_media_performance
--------------------------------
id
social_media_content_id
metric_date
views
engaged_views
estimated_minutes_watched
average_view_duration
likes
comments
shares
subscribers_gained
subscribers_lost
engagement_rate
raw_metrics
source
fetched_at
created_at
updated_at
```

Use the YouTube Analytics API where the authenticated channel has access to the requested data.

---

# 39. Public Video Statistics vs Analytics

Do not confuse:

```text
YouTube Data API video statistics
```

with:

```text
YouTube Analytics API metrics
```

Data API:

```text
viewCount
likeCount
commentCount
```

Analytics API:

```text
views
estimatedMinutesWatched
averageViewDuration
likes
comments
shares
subscribersGained
subscribersLost
```

They have different semantics and update/reporting behavior.

---

# 40. Profile Metadata vs Content

Keep this separation:

```text
social_accounts
    ↓
current account identity

social_profile_metadata
    ↓
platform-specific channel metadata

social_media_contents
    ↓
videos

social_media_performance
    ↓
historical video metrics
```

Do not place video objects into profile metadata.

---

# 41. `social_sync_status`

This table must not be empty.

Recommended:

```text
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
created_at
updated_at
```

---

# 42. Sync Types

Use explicit values:

```text
profile
performance
demographics
content
content_performance
full
```

This allows Zerify to know exactly which part of YouTube failed.

---

# 43. `next_sync_at`

After successful sync:

```text
last_completed_at = now

next_sync_at =
    now + configured_interval
```

Example:

```text
last_completed_at = 2026-09-09 12:00
next_sync_at = 2026-09-09 18:00
```

Persist it in the database.

---

# 44. `last_error`

On failure:

```text
status = failed
last_error = normalized error
last_error_code = provider/application code
last_error_at = now
retry_count += 1
next_retry_at = backoff(...)
```

Example:

```text
last_error:
YouTube Analytics API authorization expired
```

Never include credentials.

---

# 45. Token Refresh Worker

Implement:

```text
refresh_youtube_tokens()
```

Pseudo-flow:

```python
for credential in expiring_youtube_credentials:
    try:
        token_response = refresh_access_token(
            credential.refresh_token
        )

        update_access_token(
            credential,
            token_response.access_token
        )

        if token_response.refresh_token:
            update_refresh_token(
                credential,
                token_response.refresh_token
            )

        update_expiration()
        update_last_refreshed_at()
        update_token_status("active")

    except Exception as exc:
        update_token_error(exc)
```

---

# 46. Never Lose Existing Refresh Token

This is especially important.

Bad:

```python
credential.refresh_token = response.get("refresh_token")
```

If Google omits `refresh_token`, this destroys the existing credential.

Correct:

```python
new_refresh_token = response.get("refresh_token")

if new_refresh_token:
    credential.refresh_token = new_refresh_token
```

---

# 47. Token Reauthorization

If refresh fails because access was revoked:

```text
token_status = revoked
connection_status = reauthorization_required
```

Do not endlessly retry.

The UI should show:

```text
YouTube authorization expired.

[Reconnect YouTube]
```

---

# 48. Sync Pipeline

Implement:

```text
YouTubeSyncOrchestrator
        |
        +--> sync_channel_profile()
        |
        +--> sync_channel_statistics()
        |
        +--> sync_channel_performance()
        |
        +--> sync_audience_demographics()
        |
        +--> sync_videos()
        |
        +--> sync_video_performance()
        |
        +--> update_sync_status()
```

Each stage should be independently observable.

---

# 49. Recommended API Adapter

Create:

```text
YouTubeAdapter
```

Methods:

```python
get_my_channel()
get_channel(channel_id)
get_uploads_playlist(channel_id)
get_videos(video_ids)
get_channel_analytics(...)
get_video_analytics(...)
get_demographics(...)
refresh_token(...)
```

---

# 50. Normalized Channel DTO

Example:

```python
@dataclass
class NormalizedYouTubeChannel:
    platform_account_id: str
    display_name: str | None
    username: str | None
    profile_url: str | None
    profile_picture_url: str | None
    description: str | None
    country: str | None
    subscriber_count: int | None
    video_count: int | None
    total_view_count: int | None
    is_verified: bool | None
    uploads_playlist_id: str | None
    raw_payload: dict
```

---

# 51. Normalized Performance DTO

```python
@dataclass
class NormalizedYouTubePerformance:
    metric_date: date
    period: str
    views: int | None
    engaged_views: int | None
    estimated_minutes_watched: float | None
    average_view_duration: float | None
    likes: int | None
    comments: int | None
    shares: int | None
    subscribers_gained: int | None
    subscribers_lost: int | None
    engagement_rate: float | None
    raw_metrics: dict
```

---

# 52. Schema Ownership

| Data | Canonical owner |
|---|---|
| YouTube channel ID | `social_accounts` |
| Channel name | `social_accounts` |
| Current profile URL | `social_accounts` |
| Current avatar URL | `social_accounts` |
| Current subscriber count | `social_accounts` |
| Current verification state | `social_accounts` |
| Current engagement rate | `social_accounts` |
| Channel description | `social_profile_metadata` |
| Channel country | `social_profile_metadata` |
| Custom URL / handle | `social_profile_metadata` |
| Uploads playlist ID | `social_profile_metadata` |
| Historical views | `social_account_performance` |
| Historical likes | `social_account_performance` |
| Historical comments | `social_account_performance` |
| Subscriber gains | `social_account_performance` |
| Subscriber losses | `social_account_performance` |
| Audience age | `social_audience_demographics` |
| Audience gender | `social_audience_demographics` |
| Audience country | `social_audience_demographics` |
| Video ID | `social_media_contents` |
| Video title | `social_media_contents` |
| Video URL | `social_media_contents` |
| Video thumbnail | `social_media_contents` |
| Video public stats | `social_media_contents` / content performance depending on snapshot design |
| Historical video metrics | `social_media_performance` |
| Access token | `social_account_credentials` |
| Refresh token | `social_account_credentials` |
| Token expiry | `social_account_credentials` |
| Token status | `social_account_credentials` |
| Last sync | `social_sync_status` |
| Next sync | `social_sync_status` |
| Last error | `social_sync_status` |

---

# 53. Duplicate-Field Audit

For every field currently present in:

```text
social_account_performance
social_profile_metadata
social_media_contents
social_sync_status
```

compare against:

```text
social_accounts
```

Classify each as:

```text
CANONICAL
HISTORICAL
DERIVED
PLATFORM_SPECIFIC
DUPLICATE
OBSOLETE
```

Delete `DUPLICATE` and `OBSOLETE` fields.

---

# 54. Do Not Duplicate in `social_media_contents`

Do not store:

```text
follower_count
engagement_rate
is_verified
account_type
profile_url
channel_description
```

in every video record.

The video references:

```text
social_account_id
```

and obtains account information through that relationship.

---

# 55. Do Not Duplicate in `social_profile_metadata`

Do not store:

```text
social_account_id + duplicate current identity fields
```

unless the metadata is explicitly a snapshot.

---

# 56. Do Not Duplicate in `social_sync_status`

Do not store:

```text
profile_url
follower_count
engagement_rate
channel name
channel description
```

Sync status is operational state only.

---

# 57. Database Constraints

Recommended:

```text
social_accounts:
UNIQUE(platform, platform_account_id)

social_account_credentials:
UNIQUE(social_account_id, credential_type)

social_profile_metadata:
UNIQUE(social_account_id)

social_media_contents:
UNIQUE(social_account_id, platform_media_id)

social_account_performance:
UNIQUE(social_account_id, metric_date, period)

social_media_performance:
UNIQUE(social_media_content_id, metric_date)

social_sync_status:
UNIQUE(social_account_id, sync_type)
```

---

# 58. Migration Plan

## Migration 1 — Credential lifecycle

Add/update:

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
token_status
scopes
last_token_error
```

---

## Migration 2 — Account fields

Ensure:

```text
follower_count
profile_url
engagement_rate
is_verified
```

exist on `social_accounts` if they are part of Zerify's normalized account model.

---

## Migration 3 — Performance

Add the YouTube Analytics fields:

```text
views
engaged_views
estimated_minutes_watched
average_view_duration
likes
comments
shares
subscribers_gained
subscribers_lost
engagement_rate
```

Remove unrelated platform-specific fields that cannot be meaningfully populated for YouTube.

---

## Migration 4 — Demographics

Create/update:

```text
social_audience_demographics
```

to support:

```text
ageGroup
gender
country
```

where the selected Analytics reports support them.

---

## Migration 5 — Content

Ensure:

```text
social_media_contents
```

supports:

```text
platform_media_id
title
description
permalink
thumbnail_url
published_at
duration_seconds
view_count
like_count
comment_count
```

---

## Migration 6 — Sync status

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
sync_cursor
```

---

# 59. Existing Data Backfill

For every existing YouTube `social_accounts` row:

```text
1. Validate credential
2. Refresh access token
3. Fetch channel
4. Populate canonical account fields
5. Populate profile metadata
6. Fetch analytics history
7. Populate performance
8. Fetch demographics
9. Fetch uploads
10. Populate content
11. Populate content performance
12. Initialize sync status
13. Calculate next_sync_at
```

Do not fabricate unavailable historical values.

---

# 60. Incremental Content Sync

After the initial import:

```text
fetch uploads playlist
↓
compare known video IDs
↓
fetch only new/changed videos
↓
upsert
```

For performance:

```text
backfill recent analytics window
+
daily incremental sync
```

---

# 61. Analytics Backfill

Because analytics can change after publication, do not permanently freeze today's metrics.

Use an overlap window.

Example:

```text
Every sync:
re-fetch the last 48 hours
```

Then:

```text
UPSERT
```

This catches late-arriving changes.

---

# 62. Engagement Calculation

Centralize the formula.

Example:

```python
def calculate_youtube_engagement_rate(
    views,
    likes,
    comments,
    shares,
):
    if views is None or views <= 0:
        return None

    interactions = sum(
        value or 0
        for value in [likes, comments, shares]
    )

    return (interactions / views) * 100
```

Do not implement different formulas in different endpoints.

---

# 63. Data Validation

Create:

```text
validate_youtube_integration
```

Checks:

### Account

```text
platform_account_id != NULL
profile_url != NULL where derivable
follower_count populated when API provides it
```

### Credential

```text
access_token exists
refresh_token exists for offline authorization when issued
expires_at exists
```

### Performance

```text
metric_date exists
no duplicate snapshots
real API source
```

### Demographics

```text
source = youtube_analytics_api
no synthetic rows
percentage valid
```

### Content

```text
platform_media_id exists
permalink exists
published_at exists when returned
```

### Sync

```text
next_sync_at exists
success => last_completed_at exists
failure => last_error exists
```

---

# 64. Test: New YouTube Connection

Expected:

```text
social_accounts created
credential created
refresh token persisted
channel profile populated
profile metadata populated
sync status created
next_sync_at populated
initial sync queued
```

---

# 65. Test: OAuth Without New Refresh Token

Scenario:

```text
existing refresh token
Google returns access token
Google does not return refresh_token
```

Expected:

```text
existing refresh token remains unchanged
```

---

# 66. Test: Subscriber Count

API:

```text
subscriberCount = 12500
```

Expected:

```text
social_accounts.follower_count = 12500
```

If unavailable:

```text
NULL
```

---

# 67. Test: Verification

If no authoritative verification field exists:

```text
social_accounts.is_verified = NULL
```

Not:

```text
false
```

---

# 68. Test: Channel Performance

Expected:

```text
views populated
likes populated
comments populated
shares populated
subscribers_gained populated
subscribers_lost populated
watch time populated
```

where the Analytics API returns them.

---

# 69. Test: Demographics

If Analytics API returns:

```text
ageGroup
gender
```

store real rows.

If it returns no demographic data:

```text
do not create synthetic rows
```

---

# 70. Test: Content

Expected:

```text
videos discovered
video IDs stored
titles stored
descriptions stored
URLs stored
thumbnails stored
published timestamps stored
public statistics stored
```

---

# 71. Test: Pagination

Test:

```text
channel uploads > 50 videos
```

Expected:

```text
all pages retrieved
```

and no duplicates.

---

# 72. Test: Sync Failure

Expected:

```text
status = failed
last_error != NULL
last_error_at != NULL
retry_count incremented
next_retry_at populated
```

---

# 73. Test: Successful Sync

Expected:

```text
status = success
last_synced_at = now
last_completed_at = now
last_success_at = now
next_sync_at = now + interval
last_error = NULL
```

Do not necessarily erase historical error history if an audit log exists; the current status can be cleared while historical sync logs retain the failure.

---

# 74. Retry Strategy

Recommended:

```text
attempt 1 → 1 minute
attempt 2 → 5 minutes
attempt 3 → 15 minutes
attempt 4 → 30 minutes
attempt 5 → 60 minutes
```

For:

```text
invalid_grant
revoked authorization
insufficient permission
```

transition to:

```text
reauthorization_required
```

instead of retrying indefinitely.

---

# 75. Observability

Emit structured events:

```text
youtube_oauth_started
youtube_oauth_completed
youtube_token_refreshed
youtube_token_refresh_failed
youtube_channel_synced
youtube_analytics_synced
youtube_demographics_synced
youtube_video_synced
youtube_video_analytics_synced
youtube_sync_failed
youtube_rate_limited
youtube_permission_error
youtube_metric_unavailable
```

Never include secrets.

---

# 76. API Quota Awareness

YouTube APIs are quota-based.

Avoid:

```text
one API request per video
```

when batch requests are available.

Use:

```text
playlistItems.list
↓
collect video IDs
↓
videos.list in batches
```

Cache channel identity and profile data where possible.

---

# 77. Production Architecture

Final flow:

```text
Google OAuth
     ↓
Authorization Code
     ↓
Access Token + Refresh Token
     ↓
Encrypted Credentials
     ↓
YouTube Data API
     |
     +---- Channel Profile
     |
     +---- Channel Statistics
     |
     +---- Uploads Playlist
     |
     +---- Videos
     |
     ↓
YouTube Analytics API
     |
     +---- Account Performance
     |
     +---- Demographics
     |
     +---- Video Performance
     |
     ↓
Normalization Layer
     ↓
Validation
     ↓
Idempotent Upserts
     ↓
Zerify Database
     |
     +---- social_accounts
     +---- social_account_credentials
     +---- social_profile_metadata
     +---- social_account_performance
     +---- social_audience_demographics
     +---- social_media_contents
     +---- social_media_performance
     +---- social_sync_status
```

---

# 78. Final Schema Principle

Every field must have exactly one clear owner.

Use:

```text
social_accounts
```

for current canonical identity.

Use:

```text
social_profile_metadata
```

for platform-specific profile information.

Use:

```text
social_account_performance
```

for historical channel analytics.

Use:

```text
social_audience_demographics
```

for real audience composition data.

Use:

```text
social_media_contents
```

for videos/content identity and metadata.

Use:

```text
social_media_performance
```

for historical video analytics.

Use:

```text
social_account_credentials
```

for OAuth credentials and lifecycle.

Use:

```text
social_sync_status
```

for synchronization state.

---

# 79. Absolute Production Rules

### Rule 1

```text
API unavailable ≠ 0
```

### Rule 2

```text
API unavailable ≠ false
```

### Rule 3

```text
API unavailable ≠ synthetic
```

### Rule 4

```text
Current account data ≠ historical performance
```

### Rule 5

```text
Public Data API statistics ≠ Analytics API metrics
```

### Rule 6

```text
Refresh token must never be overwritten with NULL
```

### Rule 7

```text
Tokens must never be exposed or logged
```

### Rule 8

```text
Every connected account must have sync state
```

### Rule 9

```text
Every successful sync must populate next_sync_at
```

### Rule 10

```text
Every failed sync must populate last_error
```

### Rule 11

```text
No production synthetic social data
```

### Rule 12

```text
No unjustified duplicate columns across parent/child tables
```

---

# 80. Definition of Done

The YouTube integration is complete only when:

- [ ] YouTube OAuth uses appropriate offline access.
- [ ] Access token is encrypted.
- [ ] Refresh token is encrypted.
- [ ] Existing refresh token is preserved when Google omits a new one.
- [ ] Token expiration is persisted.
- [ ] Token refresh worker exists.
- [ ] Reauthorization state exists.
- [ ] Channel ID is stored.
- [ ] Channel name is stored.
- [ ] Subscriber count is stored as normalized follower count.
- [ ] Video count is stored.
- [ ] Profile URL is stored.
- [ ] Profile picture is stored.
- [ ] Verification does not default to false.
- [ ] Engagement rate is calculated using a documented formula.
- [ ] Account performance contains real YouTube Analytics data.
- [ ] Views are stored.
- [ ] Likes are stored.
- [ ] Comments are stored.
- [ ] Shares are stored when available.
- [ ] Subscriber gains are stored.
- [ ] Subscriber losses are stored.
- [ ] Watch time is stored.
- [ ] Average view duration is stored where available.
- [ ] Unsupported metrics remain NULL.
- [ ] Audience demographics contain only real API data.
- [ ] No synthetic demographics remain.
- [ ] Videos are imported.
- [ ] Video pagination works.
- [ ] Video duplicates are prevented.
- [ ] Video metadata is populated.
- [ ] Video performance is populated where authorized/available.
- [ ] Profile metadata is populated.
- [ ] `social_sync_status` is created for every account.
- [ ] `last_synced_at` is persisted.
- [ ] `next_sync_at` is persisted.
- [ ] `last_error` is persisted on failure.
- [ ] Retry information is persisted.
- [ ] Sync is idempotent.
- [ ] Child tables do not duplicate canonical `social_accounts` fields.
- [ ] Raw payloads are sanitized.
- [ ] Tokens never appear in logs.
- [ ] OAuth tests pass.
- [ ] Analytics tests pass.
- [ ] Demographic tests pass.
- [ ] Content pagination tests pass.
- [ ] Sync/retry tests pass.
- [ ] Production data contains no synthetic analytics.

---

# 81. Implementation Order

## Phase 1 — Schema audit

Audit:

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

Classify every field.

---

## Phase 2 — OAuth

Fix:

```text
offline access
refresh token persistence
token encryption
token refresh
reauthorization
```

---

## Phase 3 — Channel profile

Fix:

```text
channel ID
name
profile URL
avatar
subscriber count
video count
verification state
```

---

## Phase 4 — Analytics

Implement:

```text
daily channel analytics
engagement calculation
subscriber growth
watch time
views
likes
comments
shares
```

---

## Phase 5 — Demographics

Implement:

```text
age
gender
country
```

only where supported by the applicable Analytics report.

---

## Phase 6 — Content

Implement:

```text
uploads playlist
pagination
batch video retrieval
video upsert
video metadata
```

---

## Phase 7 — Video Analytics

Implement:

```text
video performance
engagement
views
watch time
likes
comments
shares
```

where authorized and supported.

---

## Phase 8 — Sync engine

Implement:

```text
last_started_at
last_completed_at
last_synced_at
next_sync_at
last_success_at
last_error
retry_count
next_retry_at
```

---

## Phase 9 — Cleanup

Remove:

```text
duplicate fields
fake zeros
synthetic demographics
hard-coded is_verified=false
dead columns
unsupported metric assumptions
```

---

# 82. Final Principle

Zerify should never claim to know something that YouTube did not actually provide.

The correct pipeline is:

```text
YouTube API
      ↓
Real API response
      ↓
Platform adapter
      ↓
Normalized data
      ↓
Validation
      ↓
Database
      ↓
Analytics
```

Not:

```text
Expected field
      ↓
default 0 / false
      ↓
database
```

For every YouTube value Zerify displays, the system should be able to answer:

1. Which YouTube API produced it?
2. Which endpoint/report produced it?
3. Which channel/video does it belong to?
4. Which date/period does it represent?
5. When was it fetched?
6. Is it current, historical, calculated, or unavailable?
7. Why is it NULL if unavailable?

That is the standard required for a production-grade YouTube integration.
