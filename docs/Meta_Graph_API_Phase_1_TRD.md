# Meta Graph API Integration – Phase 1 (Zerify)

## Goal
Allow users to securely connect their **Facebook Page** and **Instagram Professional Account**.

---

## Architecture

```text
User
   │
   ▼
Click "Connect Meta"
   │
   ▼
Facebook OAuth
   │
   ▼
User logs in
   │
   ▼
User selects Facebook Pages
   │
   ▼
Backend receives Access Token
   │
   ▼
Store encrypted token
   │
   ▼
Fetch connected Instagram Business Account
```

## Step 1 – Create the Meta App

- App Type: **Business**
- Add:
  - Facebook Login for Business
  - Instagram Graph API

## Step 2 – Configure Facebook Login

Redirect URI example:

```text
http://localhost:3000/api/auth/meta/callback
```

Production:

```text
https://app.zerify.ai/api/auth/meta/callback
```

## Step 3 – Redirect User to Meta

Frontend calls:

```text
GET /auth/meta
```

Redirect to:

```text
https://www.facebook.com/v23.0/dialog/oauth
```

Parameters:

```text
client_id=YOUR_APP_ID
redirect_uri=https://yourdomain.com/api/auth/meta/callback
response_type=code
scope=public_profile,email,pages_show_list,instagram_basic
```

Avoid requesting advanced scopes in Phase 1:
- pages_read_engagement
- instagram_manage_insights
- instagram_manage_comments

## Step 4 – Exchange Authorization Code

Receive:

```json
{
  "access_token": "...",
  "expires_in": ...
}
```

## Step 5 – Fetch Facebook Pages

Endpoint:

```text
GET /me/accounts
```

Store:
- Page ID
- Page Name
- Page Access Token

## Step 6 – Fetch Linked Instagram Business Account

```text
GET /{page-id}?fields=instagram_business_account
```

Store:
- Instagram Business ID
- Facebook Page ID

## Step 7 – Fetch Instagram Profile

Retrieve:
- Username
- Name
- Profile Picture
- Followers Count

## Database Schema

```text
MetaConnection
- userId
- facebookPageId
- facebookPageName
- pageAccessToken
- instagramBusinessId
- instagramUsername
- connectedAt
```

## Phase 1 Deliverables

- Facebook Page connected
- Instagram Business Account linked
- Secure token storage
- Display connected account information

## Phase 2

Add:
- pages_read_engagement
- instagram_manage_insights

Then implement:
- Reach
- Impressions
- Engagement
- Stories
- Reels
- Audience Insights
