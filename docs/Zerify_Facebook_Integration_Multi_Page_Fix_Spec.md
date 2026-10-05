# Zerify — Facebook Integration Data Integrity & Multi-Account Remediation Specification

**Document type:** Production remediation / TRD  
**Project:** Zerify  
**Scope:** Facebook personal-profile connection + multiple Facebook Pages + profile metadata + insights + demographics + content + sync/token lifecycle  
**Date:** 2026-09-09  
**Status:** Implementation-ready

---

# 1. Objective

Fix the Facebook social integration so that a Zerify user can:

1. Connect their Facebook identity/account.
2. See all Facebook Pages that the authenticated identity is authorized to manage.
3. Explicitly choose which Pages to connect.
4. Connect multiple Pages from the same Facebook login.
5. Keep the Facebook identity and each Page as separate social-account records.
6. Store real platform data only.
7. Persist account/profile metadata correctly.
8. Persist Page insights and historical performance.
9. Persist Page/content records.
10. Persist audience/demographic data only when returned by Facebook/Meta.
11. Persist token lifecycle information.
12. Persist sync state, failures, retry information, and next synchronization time.
13. Avoid duplicating the same current-state fields across `social_accounts` and child tables.

---

# 2. Current Problems

The current implementation has the following issues:

- Facebook login stores only the personal account.
- Only one Page is stored.
- There is no Page-selection UI.
- Users cannot select multiple Pages.
- Token lifecycle data is missing.
- Refresh-token handling is missing/incorrect.
- Engagement rate is missing.
- Follower count is missing.
- Profile URL is missing.
- `is_verified` is always/incorrectly stored as `false`.
- `social_account_performance` contains zero values instead of real API values.
- Reach is not populated.
- Impressions are not populated.
- Profile views are not populated.
- Audience demographics appear synthetic.
- `social_media_contents` has no usable Facebook content data.
- `social_profile_metadata` has many empty fields.
- `social_sync_status` is empty.
- Child tables may duplicate fields that should belong to `social_accounts`.

These must be treated as data-model and ingestion problems, not merely frontend bugs.

---

# 3. Critical Architecture Decision

## 3.1 A Facebook login is not the same thing as a Facebook Page

The integration must model these as separate objects.

Recommended relationship:

```text
Zerify User
    |
    +---- Facebook Connection / Credential
              |
              +---- Facebook Identity
              |
              +---- Facebook Page A
              |
              +---- Facebook Page B
              |
              +---- Facebook Page C
```

The Facebook identity is the authorization/connection context.

Each Page is a separately connected social account.

---

# 4. Required Multi-Page Connection Flow

The current flow must be changed.

## Current incorrect flow

```text
Facebook Login
      ↓
Get user
      ↓
Store user
      ↓
Get first Page
      ↓
Store first Page
```

## Required flow

```text
Facebook Login
      ↓
Exchange authorization code
      ↓
Obtain User Access Token
      ↓
Fetch authorized Pages
      ↓
Display Page-selection screen
      ↓
User selects one or more Pages
      ↓
For each selected Page:
    fetch Page Access Token
    fetch Page profile
    fetch Page insights
    create/update social account
      ↓
Run initial sync
```

Meta's Pages API exposes the managed Pages through `/me/accounts`; the response can include Page ID, Page name, Page access token and Page tasks. The implementation must process the complete returned list rather than taking `[0]`. citeturn1search0turn1search1

---

# 5. Page Selection UI

After Facebook authentication, Zerify must show a Page-selection screen.

Example:

```text
Connect Facebook

Facebook account:
John Doe

Select Pages to connect:

☑ Zerify Official
☑ Cheri Fashion
☐ My Old Page
☐ Test Page

[ Select All ]

[ Connect Selected Pages ]
```

The user must be able to:

- select one Page
- select multiple Pages
- select all Pages
- deselect Pages
- continue without connecting a Page, if product policy allows
- later connect additional Pages

---

# 6. Never Automatically Select the First Page

This is a major bug.

Do NOT implement:

```python
pages[0]
```

or:

```python
first_page = response["data"][0]
```

Instead:

```python
pages = fetch_managed_pages(user_access_token)

return [
    {
        "id": page["id"],
        "name": page["name"],
        "tasks": page.get("tasks", [])
    }
    for page in pages
]
```

The frontend should send:

```json
{
  "selected_page_ids": [
    "123",
    "456",
    "789"
  ]
}
```

The backend then processes exactly those Pages.

---

# 7. Pagination for `/me/accounts`

Do not assume all Pages are returned in a single response.

Implement pagination:

```python
while next_url:
    response = get(next_url)

    process_pages(response["data"])

    next_url = (
        response.get("paging", {})
        .get("next")
    )
```

Continue until no `paging.next` exists.

---

# 8. Multiple Pages Must Be Independently Stored

For:

```text
Facebook user
    ├── Page A
    ├── Page B
    └── Page C
```

there must be three separate `social_accounts` records for the Pages.

Example:

```text
social_accounts

id | platform | platform_account_id | account_type
---------------------------------------------------
1  | facebook | USER_123             | personal
2  | facebook | PAGE_111             | page
3  | facebook | PAGE_222             | page
4  | facebook | PAGE_333             | page
```

The Page IDs must be unique.

Recommended constraint:

```text
UNIQUE(platform, platform_account_id)
```

---

# 9. Facebook Identity vs Facebook Page

Use an explicit account type.

Recommended:

```text
account_type:
    personal
    page
```

Optionally:

```text
connection_type:
    facebook_user
    facebook_page
```

This prevents the application from confusing:

```text
John's Facebook identity
```

with:

```text
Zerify Official Facebook Page
```

---

# 10. Token Architecture

The current implementation incorrectly assumes that every Facebook connection should have a normal OAuth refresh token.

That assumption must be removed.

Facebook/Meta token lifecycle differs from conventional OAuth providers. A Page Access Token is obtained from the User Access Token through the Pages API. Meta's API documentation shows `/me/accounts` returning a Page `access_token` for the managed Page. citeturn1search0

Therefore the database must model:

```text
user access token
page access token
token expiration
token status
token source
refresh/exchange mechanism
```

rather than requiring:

```text
refresh_token != NULL
```

for every Facebook record.

---

# 11. Recommended Credential Table

Create/use:

```text
social_account_credentials
```

Schema:

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
refresh_method
token_status
scopes
provider_user_id
provider_app_id
last_token_error
created_at
updated_at
```

## Credential types

```text
facebook_user
facebook_page
```

---

# 12. Refresh Token Handling

Do not fabricate a Facebook refresh token.

If Facebook does not return a conventional `refresh_token` in the selected authentication flow:

```text
refresh_token = NULL
```

is correct.

But the implementation must still persist the actual lifecycle strategy.

Example:

```text
refresh_method = long_lived_user_token_exchange
```

or:

```text
refresh_method = reauthorization_required
```

or whatever is appropriate for the exact Meta auth flow implemented by Zerify.

The application must not use the presence of a `refresh_token` as the only indicator of whether a Facebook account is healthy.

---

# 13. User Token vs Page Token

Store the two concepts separately.

```text
Facebook User Token
        |
        +---- Page A Access Token
        |
        +---- Page B Access Token
        |
        +---- Page C Access Token
```

Do not overwrite the User Token with a Page Token.

Do not use one Page Token for another Page.

---

# 14. Token Security

All tokens must be encrypted at rest.

Never:

- log access tokens
- return access tokens from REST endpoints
- place tokens in `raw_payload`
- include tokens in exception traces
- include tokens in frontend state
- include tokens in analytics events

The frontend only needs:

```text
page_id
page_name
connection status
```

---

# 15. `social_accounts` Ownership

`social_accounts` should hold the current canonical identity/state.

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
bio
category
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

Only retain fields that actually represent the current account.

---

# 16. Profile URL

The Page/profile URL must be populated from the API when available.

Do not generate a URL blindly from a username if Facebook did not provide a valid public URL.

If the API provides:

```text
link
```

or the applicable profile URL field:

```text
profile_url = returned value
```

If unavailable:

```text
profile_url = NULL
```

Do not use:

```text
"https://facebook.com/" + username
```

as a substitute unless the application has explicitly validated that URL construction is valid for the selected Facebook account type.

---

# 17. Follower Count

Follower count must be fetched from the appropriate Page/profile API field or supported insight.

Do not use:

```text
0
```

as the fallback for:

```text
not returned
```

Correct:

```text
follower_count = NULL
```

when unavailable.

If Facebook explicitly returns:

```text
0
```

then store:

```text
0
```

---

# 18. `is_verified` Bug

The current behavior:

```text
is_verified = false
```

for every Facebook account is incorrect.

Do not default:

```python
is_verified = response.get("is_verified", False)
```

because this converts:

```text
field unavailable
```

into:

```text
false
```

Use:

```python
is_verified = response.get("is_verified")
```

Result:

```text
true  = API explicitly says verified
false = API explicitly says not verified
NULL  = API did not provide verification state
```

This distinction is mandatory.

---

# 19. Engagement Rate

Facebook does not necessarily return a universal field named:

```text
engagement_rate
```

The application should calculate it from real metrics.

Example:

```text
engagement_rate =
    total_interactions / reach * 100
```

when both are available and this is the analytics definition selected by Zerify.

Never calculate:

```text
0 / 0
```

or interpret missing metrics as zero.

If required inputs are unavailable:

```text
engagement_rate = NULL
```

Store/document the formula used by Zerify.

---

# 20. `social_account_performance`

This table must contain historical measurements.

It must NOT become a duplicate of `social_accounts`.

Remove fields that are simply current-state duplicates:

```text
username
display_name
profile_url
profile_picture_url
follower_count
following_count
is_verified
account_type
```

unless a field is explicitly renamed/documented as a historical snapshot.

---

# 21. Historical Follower Counts

If Zerify wants historical follower tracking, use:

```text
followers_at_snapshot
```

instead of:

```text
follower_count
```

This makes the meaning clear.

Example:

```text
social_accounts.follower_count
    = current follower count

social_account_performance.followers_at_snapshot
    = follower count measured on 2026-09-09
```

---

# 22. Facebook Performance Schema

Recommended:

```text
social_account_performance
--------------------------------
id
social_account_id
metric_date
period
reach
impressions
media_views
engaged_users
total_interactions
likes
comments
shares
clicks
followers_at_snapshot
engagement_rate
raw_metrics
source
fetched_at
created_at
updated_at
```

All metrics should be nullable.

---

# 23. Zero vs NULL

This is a critical data-integrity rule.

### API returned zero

```json
{
  "reach": 0
}
```

Store:

```text
reach = 0
```

### API did not return reach

Store:

```text
reach = NULL
```

### Incorrect

```text
reach = 0
```

for every missing metric.

The current behavior where every performance field is initialized to zero must be removed.

---

# 24. Facebook Page Insights

The implementation must request the metrics supported by the configured Graph API version.

Facebook Page Insights have undergone metric deprecations. Meta's current documentation indicates that several older Page Insights metrics are being deprecated, and newer Page Media View metrics are being used as alternatives. citeturn1search2turn1search9

Therefore do not build the adapter around an assumption that every historical metric remains available.

---

# 25. Reach and Impressions

If the active API version provides the applicable Page reach/impression metric:

```text
fetch
↓
parse
↓
validate
↓
upsert
```

If a requested metric is no longer supported:

```text
value = NULL
availability = unsupported
```

Do not convert the unsupported metric into:

```text
0
```

---

# 26. Current/Future Metric Compatibility

Create a capability map:

```python
FACEBOOK_PAGE_METRIC_CAPABILITIES = {
    "reach": {
        "supported": True,
        "api_metric": "...",
    },
    "impressions": {
        "supported": "...",
        "api_metric": "...",
    },
    "media_views": {
        "supported": True,
        "api_metric": "page_media_view",
    },
    "engagement": {
        "supported": "...",
        "api_metric": "...",
    },
}
```

The exact API metric names must be bound to the Graph API version used by the application.

---

# 27. Facebook Audience Demographics

The current demographic data appears synthetic.

That must be removed.

Production data rule:

> **No synthetic social analytics are allowed in Zerify production tables.**

Do not generate:

```text
age distribution
gender distribution
country distribution
city distribution
```

using random numbers, fixtures, percentages, or fallback values.

---

# 28. Demographic Source Tracking

Recommended schema:

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
source = facebook_api
source_metric = page_fans_city
dimension = city
dimension_value = Kolkata
value = 1200
percentage = 12.5
```

---

# 29. Unsupported Demographics

If Facebook does not provide a particular demographic:

```text
do not invent it
do not estimate it
do not copy another platform's data
do not populate random values
```

Instead:

```text
value = NULL
```

and log:

```text
metric_unavailable
```

with a reason.

---

# 30. `social_media_contents`

The current Facebook integration must populate this table.

For a Facebook Page, content ingestion should retrieve supported Page posts/media.

Recommended schema:

```text
social_media_contents
--------------------------------
id
social_account_id
platform_media_id
content_type
title
message
caption
permalink
media_url
thumbnail_url
published_at
updated_at
like_count
comment_count
share_count
view_count
is_published
raw_payload
created_at
updated_at
```

All platform-specific fields must be nullable.

---

# 31. Content Mapping

Do not invent content fields.

For every Facebook post:

```text
Facebook API response
        ↓
Facebook adapter
        ↓
Normalized media/content DTO
        ↓
social_media_contents
```

Example:

```python
NormalizedSocialContent(
    platform_media_id=post["id"],
    message=post.get("message"),
    permalink=post.get("permalink_url"),
    published_at=post.get("created_time"),
    ...
)
```

---

# 32. Content Pagination

Facebook Page content endpoints must be paginated.

Never only retrieve the first response.

Implement:

```python
while next_url:
    response = fetch(next_url)

    for item in response["data"]:
        upsert_content(item)

    next_url = response.get("paging", {}).get("next")
```

---

# 33. Content Upsert

Use:

```text
UNIQUE(
    social_account_id,
    platform_media_id
)
```

If a post already exists:

```text
UPDATE
```

Do not insert another copy.

---

# 34. Content Performance

Do not mix post-level metrics into account-level performance.

Recommended:

```text
social_media_performance
--------------------------------
id
social_media_content_id
metric_date
reach
impressions
views
likes
comments
shares
clicks
engagement_rate
raw_metrics
source
fetched_at
created_at
updated_at
```

---

# 35. `social_profile_metadata`

This table should contain platform-specific profile information.

It should not become a second copy of the whole `social_accounts` table.

Recommended fields:

```text
id
social_account_id
platform
biography
category
website
profile_picture_url
cover_photo_url
contact_email
contact_phone
public_email
username
display_name
external_id
raw_payload
fetched_at
created_at
updated_at
```

Only include fields that Facebook actually returns and that Zerify needs.

---

# 36. Do Not Duplicate `social_accounts`

Do NOT repeat these current canonical fields in every child table:

```text
platform
platform_account_id
username
display_name
profile_url
follower_count
is_verified
account_type
```

Those belong to `social_accounts`.

If `social_profile_metadata` needs historical profile snapshots, explicitly model:

```text
snapshot_at
```

and treat the row as a snapshot.

Otherwise keep it as platform-specific metadata only.

---

# 37. `social_sync_status`

This table must be fully operational.

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
created_at
updated_at
```

---

# 38. `next_sync_at`

This must be persisted after every successful sync.

Example:

```text
sync interval = 6 hours

last_completed_at = 2026-09-09 12:00

next_sync_at = 2026-09-09 18:00
```

Do not calculate this only in the scheduler.

The database must know when the next synchronization is expected.

---

# 39. `last_error`

When synchronization fails:

```text
status = failed
last_error = normalized error
last_error_code = provider/application code
last_error_at = now
retry_count += 1
next_retry_at = calculated backoff
```

Example:

```text
last_error:
Facebook Graph API request failed: OAuth token expired
```

Never include:

```text
access_token
authorization header
client secret
```

in the error.

---

# 40. Sync Status Ownership

`social_sync_status` should contain operational synchronization state only.

Do NOT duplicate:

```text
username
profile_url
follower_count
engagement_rate
bio
platform_account_id
```

Those belong elsewhere.

---

# 41. Connection State vs Sync State

Keep these concepts separate.

### Connection state

```text
active
revoked
reauthorization_required
disconnected
```

### Sync state

```text
idle
queued
running
success
partial_success
failed
paused
```

A Page can be:

```text
connection = active
sync = failed
```

for example, if a temporary API request fails.

---

# 42. Facebook Sync Pipeline

Do not create one giant function.

Implement:

```text
FacebookSyncOrchestrator
        |
        +--> sync_user_identity()
        |
        +--> sync_page_profile()
        |
        +--> sync_page_insights()
        |
        +--> sync_page_demographics()
        |
        +--> sync_page_content()
        |
        +--> sync_content_insights()
        |
        +--> update_sync_status()
```

---

# 43. Connection Pipeline

Recommended implementation:

```text
POST /social/facebook/connect
        ↓
OAuth redirect
        ↓
GET /social/facebook/callback
        ↓
Exchange authorization code
        ↓
Persist encrypted user credential
        ↓
GET /me
        ↓
GET /me/accounts
        ↓
Return selectable Pages
```

Then:

```text
POST /social/facebook/pages/select

{
    "page_ids": [
        "PAGE_A",
        "PAGE_B"
    ]
}
```

Backend:

```text
for page_id in selected_page_ids:
    validate page belongs to authorized user
    fetch Page token
    create/update social_account
    create/update credential
    create sync status
    fetch profile
    queue initial sync
```

---

# 44. Security Check During Page Selection

Never trust Page IDs submitted by the browser.

The backend must verify:

```text
selected_page_id
    ∈
pages returned by Meta for the authenticated user
```

If not:

```text
403 Forbidden
```

This prevents a user from attempting to attach an unauthorized Page.

---

# 45. Reconnecting Facebook

When the same Facebook user reconnects:

```text
DO NOT create duplicate social_accounts
```

Instead:

```text
find existing Facebook identity
update credential
fetch current Page list
show Page selection again
```

If a previously connected Page is no longer returned:

```text
mark Page connection as disconnected/reauthorization_required
```

Do not delete historical analytics automatically.

---

# 46. Adding More Pages Later

The user must be able to:

```text
Connect Facebook
      ↓
Manage connected Pages
      ↓
+ Add another Page
```

The application should call `/me/accounts` again and present all currently authorized Pages.

---

# 47. Removing a Page

If a user disconnects a Page:

```text
is_active = false
```

Do not immediately delete:

- historical performance
- historical content
- historical demographic snapshots
- sync logs

unless the product's data-retention policy explicitly requires deletion.

---

# 48. API Adapter

Create:

```text
FacebookAdapter
```

with:

```python
get_user_profile()
get_managed_pages()
get_page(page_id)
get_page_access_token(page_id)
get_page_insights(page_id)
get_page_demographics(page_id)
get_page_posts(page_id)
get_post_insights(post_id)
exchange_token()
refresh_or_extend_token()
debug_token()
```

Only methods supported by the configured Meta API version should be implemented.

---

# 49. Normalized Profile DTO

Example:

```python
@dataclass
class NormalizedFacebookProfile:
    platform_account_id: str
    account_type: str
    username: str | None
    display_name: str | None
    profile_url: str | None
    profile_picture_url: str | None
    biography: str | None
    website: str | None
    followers_count: int | None
    following_count: int | None
    is_verified: bool | None
    raw_payload: dict
```

---

# 50. Normalized Page Performance DTO

```python
@dataclass
class NormalizedFacebookPerformance:
    metric_date: date
    period: str
    reach: int | None
    impressions: int | None
    media_views: int | None
    engaged_users: int | None
    total_interactions: int | None
    likes: int | None
    comments: int | None
    shares: int | None
    clicks: int | None
    raw_metrics: dict
```

---

# 51. Derived Engagement Rate

Calculate only when inputs exist.

Example:

```python
if reach and reach > 0:
    engagement_rate = (
        total_interactions / reach
    ) * 100
else:
    engagement_rate = None
```

Do not turn:

```text
missing reach
```

into:

```text
reach = 0
```

---

# 52. Data Source Tracking

Every analytics record should be traceable.

Recommended:

```text
source = facebook_api
source_metric = page_media_view
fetched_at = timestamp
```

This makes the dashboard auditable.

---

# 53. Raw Payload

Use:

```text
raw_payload JSONB
```

for debugging and future field mapping.

Sanitize:

```text
access_token
refresh_token
authorization
cookies
client_secret
```

---

# 54. Database Constraints

Recommended:

```text
social_accounts:
UNIQUE(platform, platform_account_id)

social_media_contents:
UNIQUE(social_account_id, platform_media_id)

social_account_performance:
UNIQUE(social_account_id, metric_date, period)

social_media_performance:
UNIQUE(social_media_content_id, metric_date)

social_sync_status:
UNIQUE(social_account_id, sync_type)

social_profile_metadata:
UNIQUE(social_account_id)

social_account_credentials:
UNIQUE(social_account_id, credential_type)
```

Adjust constraints if the existing application intentionally supports multiple credential records/history.

---

# 55. Migration Plan

## Migration 1 — Account ownership cleanup

Review:

```text
social_accounts
social_account_performance
social_profile_metadata
social_media_contents
social_sync_status
```

Mark every duplicated field:

```text
canonical
historical
derived
platform_specific
duplicate
obsolete
```

Remove unjustified duplicates.

---

## Migration 2 — Credential lifecycle

Create/update:

```text
social_account_credentials
```

Add:

```text
credential_type
access_token_encrypted
refresh_token_encrypted
issued_at
expires_at
last_refreshed_at
next_refresh_at
refresh_method
token_status
scopes
last_token_error
```

---

## Migration 3 — Sync state

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

## Migration 4 — Performance cleanup

Remove current-state duplicates from:

```text
social_account_performance
```

Keep historical values only when explicitly modeled as snapshots.

---

## Migration 5 — Demographic cleanup

Delete synthetic/test Facebook demographic records.

Do not backfill fake values.

---

## Migration 6 — Content support

Add the required nullable Facebook content fields.

Add:

```text
platform_media_id
```

and a uniqueness constraint.

---

# 56. Existing Synthetic Data Cleanup

Before production launch:

```sql
DELETE FROM social_audience_demographics
WHERE source IN ('synthetic', 'mock', 'fixture', 'test');
```

Use the actual values used by the current implementation.

If source information does not currently exist, first identify synthetic records through migration/audit logic before deletion.

---

# 57. Backfill Strategy

For existing connected Facebook accounts:

```text
1. Validate User Token
2. Fetch managed Pages
3. Compare returned Pages to existing DB records
4. Show/reconcile Page connections
5. Refresh/replace credential lifecycle state
6. Fetch Page profile
7. Fetch Page insights
8. Fetch Page demographics
9. Fetch Page content
10. Fetch content performance
11. Populate sync status
```

Do not manufacture old data.

Only backfill what the API can actually return.

---

# 58. Retry Strategy

Use persisted exponential backoff.

Example:

```text
attempt 1 → 1 minute
attempt 2 → 5 minutes
attempt 3 → 15 minutes
attempt 4 → 30 minutes
attempt 5 → 60 minutes
```

Cap retries.

For authentication/permission failures:

```text
status = reauthorization_required
```

Do not retry forever.

---

# 59. Sync Error Categories

Normalize provider errors into:

```text
TOKEN_EXPIRED
TOKEN_REVOKED
PERMISSION_DENIED
RATE_LIMITED
INVALID_PAGE
PAGE_NOT_FOUND
API_UNAVAILABLE
INVALID_RESPONSE
VALIDATION_ERROR
UNKNOWN
```

Persist:

```text
last_error_code
last_error
```

---

# 60. Observability

Log events:

```text
facebook_oauth_started
facebook_oauth_completed
facebook_pages_discovered
facebook_page_selection_completed
facebook_page_connected
facebook_page_disconnected
facebook_sync_started
facebook_sync_completed
facebook_sync_failed
facebook_token_refresh_started
facebook_token_refresh_completed
facebook_token_refresh_failed
facebook_metric_unavailable
facebook_rate_limited
facebook_permission_error
```

Never log credentials.

---

# 61. Automated Tests

## Authentication

Test:

```text
OAuth callback
authorization-code exchange
invalid code
expired code
token failure
```

## Page selection

Test:

```text
0 Pages
1 Page
2 Pages
10 Pages
pagination
select one
select multiple
select all
unauthorized submitted Page ID
```

## Page storage

Test:

```text
same Page twice => one social_account
different Pages => separate social_accounts
```

## Profile

Test:

```text
profile URL returned
profile URL unavailable
verified=true
verified=false
verified missing => NULL
follower count returned
follower count missing => NULL
```

## Insights

Test:

```text
reach returned
impressions returned
metric deprecated
metric unavailable
metric explicitly zero
```

## Demographics

Test:

```text
real API response => stored
no API response => NULL/no row
synthetic data => rejected
```

## Content

Test:

```text
first page
pagination
duplicate post
updated post
post with no message
post with no media
```

## Sync

Test:

```text
success
failure
retry
rate limit
token expiry
next_sync_at
last_error
```

---

# 62. API Contract Fixtures

Create sanitized fixtures based on real Meta responses for:

```text
/me
/me/accounts
/Page_ID
/Page_ID/feed
/Page_ID/insights
/Page_ID/posts
/Post_ID
/Post_ID/insights
token exchange/debug responses
permission error
rate-limit error
```

Never use synthetic analytics fixtures that look like real production values unless they are clearly marked as test fixtures.

---

# 63. Frontend Requirements

The Facebook connection UI must support:

### Step 1

```text
Connect Facebook
```

### Step 2

```text
Facebook authorization
```

### Step 3

```text
Select Pages
```

### Step 4

```text
Connection progress
```

### Step 5

```text
Initial synchronization
```

### Step 6

```text
Connected accounts
```

Example:

```text
Facebook

John Doe
Personal profile
Connected

Pages

✓ Zerify Official
✓ Cheri Fashion
```

---

# 64. Connected Accounts UI

Do not display one generic:

```text
Facebook Connected
```

Instead show:

```text
Facebook

Personal Profile
    John Doe
    Connected

Pages
    Zerify Official
    Connected

    Cheri Fashion
    Connected

    My Business
    Connected
```

Each Page should have its own:

```text
sync status
last synced
next sync
connection status
```

---

# 65. Dashboard Data Rules

Dashboard must not calculate:

```text
missing metric → 0
```

Instead:

```text
missing metric → unavailable
```

UI example:

```text
Reach
15,240

Impressions
Unavailable

Reason:
Metric not returned by the current Facebook API version.
```

This is much more trustworthy than displaying:

```text
Impressions: 0
```

---

# 66. Cross-Platform Schema Rule

The same principle must be applied to every Zerify social integration.

```text
social_accounts
    ↓
credentials
    ↓
profile metadata
    ↓
account performance
    ↓
audience demographics
    ↓
media/content
    ↓
media performance
    ↓
sync status
```

Each table has a single responsibility.

---

# 67. Ownership Matrix

| Data | Owner |
|---|---|
| Platform account ID | `social_accounts` |
| Account type | `social_accounts` |
| Username | `social_accounts` |
| Display name | `social_accounts` |
| Current profile URL | `social_accounts` |
| Current follower count | `social_accounts` |
| Current verification state | `social_accounts` |
| Current engagement rate | `social_accounts` |
| Historical follower count | `social_account_performance` |
| Historical reach | `social_account_performance` |
| Historical impressions | `social_account_performance` |
| Historical interactions | `social_account_performance` |
| Audience demographics | `social_audience_demographics` |
| Facebook Page posts | `social_media_contents` |
| Post-level metrics | `social_media_performance` |
| Platform-specific bio/category | `social_profile_metadata` |
| Access token | `social_account_credentials` |
| Token expiry | `social_account_credentials` |
| Token lifecycle | `social_account_credentials` |
| Last sync | `social_sync_status` |
| Next sync | `social_sync_status` |
| Last sync error | `social_sync_status` |

---

# 68. Definition of Done

The Facebook integration is complete only when:

- [ ] Facebook login works.
- [ ] Facebook identity is stored separately from Pages.
- [ ] `/me/accounts` is called after authentication.
- [ ] All available Pages are discovered.
- [ ] Page discovery is paginated.
- [ ] Page-selection UI exists.
- [ ] Users can select one Page.
- [ ] Users can select multiple Pages.
- [ ] Users can add Pages later.
- [ ] Backend validates selected Page IDs.
- [ ] Each selected Page gets its own `social_accounts` record.
- [ ] Page IDs are unique.
- [ ] User token is stored securely.
- [ ] Page token is stored securely.
- [ ] No fake refresh token is created.
- [ ] Token lifecycle strategy is persisted.
- [ ] Token expiration is persisted when available.
- [ ] Token status is persisted.
- [ ] `profile_url` is populated from real data when available.
- [ ] `follower_count` is populated from real data when available.
- [ ] `is_verified` is tri-state (`true`, `false`, `NULL`) rather than defaulting to false.
- [ ] Engagement rate is calculated from real metrics.
- [ ] Performance fields are not initialized to fake zero values.
- [ ] Reach is populated when supported/returned.
- [ ] Impressions are populated when supported/returned.
- [ ] Deprecated metrics are handled explicitly.
- [ ] Audience demographics contain only real API-derived data.
- [ ] Synthetic demographic data is removed.
- [ ] Facebook Page content is ingested.
- [ ] Content pagination works.
- [ ] Duplicate content cannot be inserted.
- [ ] Content performance is separated from account performance.
- [ ] Profile metadata is populated from real API responses.
- [ ] Profile metadata does not duplicate canonical account fields.
- [ ] Sync status is created for every connected account.
- [ ] `last_synced_at` is persisted.
- [ ] `next_sync_at` is persisted.
- [ ] `last_error` is persisted on failure.
- [ ] Retry state is persisted.
- [ ] Reauthorization state is persisted.
- [ ] Sync operations are idempotent.
- [ ] Raw API responses are sanitized.
- [ ] Tokens never appear in logs.
- [ ] Automated tests cover multi-page connection.
- [ ] Automated tests cover token failures.
- [ ] Automated tests cover unavailable metrics.
- [ ] Automated tests cover pagination.
- [ ] Automated tests cover duplicate prevention.

---

# 69. Implementation Order

## Phase 1 — Audit

Inspect:

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

Produce a field ownership matrix.

---

## Phase 2 — Fix OAuth

Implement:

```text
authorization code
→ user access token
→ token lifecycle
→ managed Pages
```

---

## Phase 3 — Multi-Page UI

Implement:

```text
fetch Pages
→ selection UI
→ selected Page IDs
→ backend validation
```

---

## Phase 4 — Page Account Creation

For every selected Page:

```text
Page Access Token
↓
social_accounts
↓
credentials
↓
profile
↓
sync status
```

---

## Phase 5 — Profile Sync

Populate:

```text
username
display_name
profile_url
profile_picture
bio
category
follower count
verification state
```

only when returned by Facebook.

---

## Phase 6 — Performance Sync

Implement the API-version-specific metric mapping.

Populate:

```text
reach
impressions
media views
interactions
likes
comments
shares
clicks
```

where actually available.

---

## Phase 7 — Demographics

Remove synthetic values.

Implement real API ingestion only.

---

## Phase 8 — Content

Implement:

```text
Page posts
pagination
upsert
content metadata
content performance
```

---

## Phase 9 — Sync Engine

Implement:

```text
last_synced_at
next_sync_at
last_error
retry_count
next_retry_at
status
```

---

## Phase 10 — Cleanup

Remove:

```text
duplicate fields
fake zeros
synthetic demographics
hard-coded verification=false
first-page-only logic
first-page auto-selection
unused token assumptions
```

---

# 70. Final Production Rule

The Facebook integration must never infer that:

```text
not returned
=
false
```

or:

```text
not returned
=
0
```

or:

```text
not returned
=
synthetic estimate
```

Instead:

```text
API returned true
    → true

API returned false
    → false

API returned 0
    → 0

API did not return the field
    → NULL / unavailable
```

And the most important architectural rule is:

```text
One Facebook login
        ↓
Many authorized Pages
        ↓
Many independent social_accounts
        ↓
Independent tokens/profile/insights/content/sync state
```

This is the structure Zerify needs to support real Facebook users who manage multiple Pages while keeping account identity, historical analytics, platform metadata, credentials, and synchronization state cleanly separated.
