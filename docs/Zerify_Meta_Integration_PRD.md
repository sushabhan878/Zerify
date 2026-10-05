# Product Requirements Document (PRD)
# Zerify – Meta Social Account Integration

**Version:** 1.0  
**Owner:** Zerify Team  
**Status:** Draft

---

# 1. Objective

Build a unified Meta integration that allows users to connect all supported Meta assets through a single authentication flow.

Supported assets:

- Facebook Profile
- Facebook Pages
- Instagram Business / Creator Accounts
- Threads Profile (when available)

The integration should require only one login and automatically discover all eligible connected assets.

---

# 2. Problem Statement

Influencers and brands manage multiple social accounts across Meta. Existing tools often require separate logins or manual configuration.

Zerify should provide a seamless onboarding experience by automatically discovering and connecting all available Meta assets.

---

# 3. Goals

- One-click Meta connection
- Automatic asset discovery
- Store all connected assets
- Support future publishing and analytics
- Scalable architecture

---

# 4. User Flow

```
User
    │
    ▼
Click "Connect Meta"
    │
    ▼
Meta OAuth Login
    │
    ▼
Grant Permissions
    │
    ▼
Receive User Access Token
    │
    ├───────────────┐
    ▼               ▼
Facebook Profile  Facebook Pages
                       │
                       ▼
             Instagram Business Accounts
                       │
                       ▼
               Threads Profile (Future)
```

---

# 5. Functional Requirements

## FR-1 Authentication

- Login using Meta OAuth
- Secure OAuth callback
- Store encrypted access token
- Refresh token where supported

---

## FR-2 Facebook Profile

Fetch:

- Facebook User ID
- Name
- Email
- Profile Picture

Store against Zerify account.

---

## FR-3 Facebook Pages

Discover every page managed by the user.

Store:

- Page ID
- Page Name
- Category
- Profile Picture
- Access Token
- Connected Status

Support multiple pages.

---

## FR-4 Instagram Accounts

Automatically detect Instagram Business/Creator accounts linked to each Facebook Page.

Store:

- Instagram ID
- Username
- Display Name
- Biography
- Followers
- Following
- Media Count
- Profile Picture

Support multiple accounts.

---

## FR-5 Threads

If available through Meta APIs:

Store:

- Threads ID
- Username
- Profile Picture
- Connected Instagram Account

Design database to support future Threads publishing.

---

# 6. Database Design

## User

- id
- email
- name

## Meta Connection

- id
- userId
- facebookUserId
- accessToken
- expiresAt

## Facebook Page

- id
- pageId
- name
- accessToken
- metaConnectionId

## Instagram Account

- id
- instagramId
- username
- followers
- mediaCount
- pageId

## Threads Account

- id
- threadsId
- username
- instagramAccountId

---

# 7. Permissions

Initial:

- public_profile
- email

Business:

- pages_show_list (or current Meta equivalent)
- pages_read_engagement
- instagram_basic
- instagram_manage_insights

Future:

- pages_manage_posts
- instagram_content_publish
- business_management

---

# 8. API Flow

1. Redirect user to Meta OAuth.
2. Exchange authorization code for access token.
3. Fetch Facebook profile.
4. Fetch managed Facebook Pages.
5. Discover linked Instagram accounts.
6. Discover Threads profile if supported.
7. Persist all assets.

---

# 9. Error Handling

- OAuth cancelled
- Invalid permissions
- No Pages found
- No linked Instagram account
- Expired token
- Revoked permissions

Provide actionable user messages.

---

# 10. Security

- Encrypt tokens at rest
- HTTPS only
- Never expose App Secret
- Validate OAuth state
- Least-privilege permissions

---

# 11. Future Enhancements

- Facebook Page publishing
- Instagram publishing
- Threads publishing
- Reels scheduling
- Insights dashboard
- Webhooks
- Multi-business support

---

# 12. Success Metrics

- Meta connection success rate >95%
- OAuth completion <30 seconds
- Automatic asset discovery >95%
- Token refresh failure <1%
- Support multiple Pages and Instagram accounts per user
