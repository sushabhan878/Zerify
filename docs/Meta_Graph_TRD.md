# Meta_Graph_TRD.md

# Technical Requirements Document (TRD)

## Meta Graph API Integration for Zerify

**Project:** Zerify\
**Module:** Social Media Integration -- Meta (Instagram & Facebook)\
**Version:** 1.0\
**Status:** Draft

------------------------------------------------------------------------

# 1. Objective

Implement Meta Graph API integration that allows influencers to securely
connect their Facebook and Instagram accounts to Zerify using OAuth 2.0.

This phase focuses only on account connection and identity management.
Analytics synchronization, campaign tracking, and insights are out of
scope.

------------------------------------------------------------------------

# 2. Goals

-   Connect Instagram Creator/Business accounts.
-   Connect Facebook Pages.
-   Store authenticated social accounts.
-   Support multiple connected accounts.
-   Design a provider architecture reusable for YouTube, TikTok,
    LinkedIn, and X.

------------------------------------------------------------------------

# 3. Scope

### Included

-   Meta OAuth
-   Facebook Login
-   Instagram Business discovery
-   Token exchange
-   Long-lived token storage
-   Connect / Disconnect accounts
-   List connected accounts

### Excluded

-   Insights
-   Media synchronization
-   Campaign tracking
-   Webhooks
-   Scheduled sync jobs

------------------------------------------------------------------------

# 4. Architecture

    Frontend
        │
        ▼
    Backend API
        │
        ▼
    Meta OAuth
        │
        ▼
    Facebook Login
        │
        ▼
    Access Token
        │
        ▼
    Facebook Pages
        │
        ▼
    Instagram Business Account
        │
        ▼
    Database

------------------------------------------------------------------------

# 5. User Flow

1.  User clicks **Connect Instagram**.
2.  Backend redirects to Meta OAuth.
3.  User authenticates with Facebook.
4.  User grants requested permissions.
5.  Meta redirects with authorization code.
6.  Backend exchanges code for access token.
7.  Backend retrieves Facebook Pages.
8.  Backend discovers connected Instagram Business account(s).
9.  Backend stores account information.
10. Zerify displays connected account.

------------------------------------------------------------------------

# 6. Meta App Configuration

## App Type

Business

## Products

-   Facebook Login
-   Instagram Graph API

## Required Configuration

-   App ID
-   App Secret
-   Redirect URI
-   Privacy Policy
-   Terms of Service

------------------------------------------------------------------------

# 7. OAuth Flow

    Connect Button
          ↓
    OAuth Redirect
          ↓
    User Login
          ↓
    Consent
          ↓
    Authorization Code
          ↓
    Access Token
          ↓
    Long-lived Token
          ↓
    Store Database

------------------------------------------------------------------------

# 8. Backend Endpoints

    GET    /social/meta/login
    GET    /social/meta/callback
    GET    /social/accounts
    DELETE /social/accounts/:id

------------------------------------------------------------------------

# 9. Suggested Module Structure

    modules/
        social/
            controllers/
            routes/
            services/
            providers/
            repositories/
            dto/
            utils/

Provider implementations:

-   MetaProvider
-   YouTubeProvider
-   TikTokProvider
-   LinkedInProvider

------------------------------------------------------------------------

# 10. Database Schema

## social_accounts

  Field            Type
  ---------------- ------------------------
  id               UUID
  userId           UUID
  platform         ENUM
  platformUserId   String
  username         String
  displayName      String
  avatar           String
  accessToken      Encrypted Text
  refreshToken     Encrypted Text
  expiresAt        Timestamp
  status           Connected/Disconnected
  connectedAt      Timestamp
  updatedAt        Timestamp

------------------------------------------------------------------------

# 11. Supported Platforms

-   Instagram
-   Facebook

Future:

-   YouTube
-   TikTok
-   LinkedIn
-   X

------------------------------------------------------------------------

# 12. Security

-   Encrypt access tokens at rest.
-   Never expose tokens to frontend.
-   Store App Secret only on backend.
-   Validate OAuth state parameter.
-   Use HTTPS only.
-   Refresh long-lived tokens before expiry.

------------------------------------------------------------------------

# 13. Error Handling

-   User cancels login
-   Expired authorization code
-   Invalid redirect URI
-   Missing permissions
-   No Instagram Business account connected
-   Token expiration
-   Revoked authorization

------------------------------------------------------------------------

# 14. Future Phases

## Phase 2

-   Profile synchronization
-   Followers
-   Media sync

## Phase 3

-   Insights
-   Audience demographics
-   Daily analytics

## Phase 4

-   Campaign tracking
-   Live Reel monitoring
-   ROI dashboard

------------------------------------------------------------------------

# 15. Success Criteria

-   OAuth authentication completes successfully.
-   Connected Instagram/Facebook account stored.
-   Multiple accounts supported.
-   Secure token management implemented.
-   Platform-agnostic architecture established.

------------------------------------------------------------------------

# Next TRDs

1.  Meta_Analytics_TRD.md
2.  Campaign_Tracking_TRD.md
3.  Webhook_TRD.md
4.  Social_Service_Architecture_TRD.md
5.  Multi_Platform_Integration_TRD.md
