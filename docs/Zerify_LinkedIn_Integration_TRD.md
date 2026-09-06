# Zerify LinkedIn Integration — Technical Requirements Document (TRD)

**Version:** 1.0  
**Date:** 2026-09-06  
**Product:** Zerify  
**Integration:** LinkedIn OAuth 2.0 / OpenID Connect (OIDC)  
**Status:** Implementation-ready specification

---

## 1. Purpose

This document specifies how Zerify should integrate LinkedIn so that a creator/user can securely connect their LinkedIn account to Zerify.

The initial implementation is designed around LinkedIn's current **Sign In with LinkedIn using OpenID Connect** capability. It covers:

- LinkedIn Developer App setup
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- OAuth 2.0 authorization-code flow
- OIDC scopes
- Backend token exchange
- ID token validation
- LinkedIn profile retrieval
- Secure token storage
- Account linking
- Disconnect/revoke handling
- Frontend UX
- Database schema
- API contracts
- Security
- Error handling
- Logging/observability
- Testing
- Production deployment
- Future LinkedIn creator/analytics API expansion

> **Important:** LinkedIn access is product/permission based. Creating an app does not automatically grant unrestricted access to member posts, follower counts, analytics, demographics, or other creator data. Additional LinkedIn products/permissions may require approval.

---

# 2. Goals

## 2.1 Primary goals

A Zerify user should be able to:

1. Open Zerify's social integrations.
2. Click **Connect LinkedIn**.
3. Be redirected to LinkedIn.
4. Approve the requested permissions.
5. Be redirected back to Zerify.
6. Have Zerify securely exchange the authorization code for tokens.
7. Validate the LinkedIn identity.
8. Retrieve the user's LinkedIn profile information.
9. Link the LinkedIn account to the correct Zerify user.
10. Display the connected LinkedIn account in the Zerify UI.
11. Disconnect the LinkedIn account later.

## 2.2 Non-goals for Phase 1

Do **not** assume Phase 1 can retrieve:

- Full LinkedIn post history
- Creator analytics
- Impressions
- Reach
- Follower demographics
- Audience geography
- Detailed engagement analytics
- Private LinkedIn data
- Company Page administration data
- Advertising data

Those capabilities require the relevant LinkedIn API product/permission and approval where applicable.

---

# 3. LinkedIn API Model

LinkedIn uses OAuth 2.0 for member authorization and API authentication.

For a user connecting their own LinkedIn account, Zerify should use **3-legged OAuth / Member Authorization**.

The current OIDC integration provides:

| Scope | Purpose |
|---|---|
| `openid` | Required for OIDC authentication and ID token |
| `profile` | Basic member profile information |
| `email` | Member email address |

LinkedIn describes these as the scopes for Sign In with LinkedIn using OpenID Connect.

For future posting capabilities, LinkedIn's `Share on LinkedIn` product provides `w_member_social`.

---

# 4. High-Level Architecture

```text
                    ZERIFY
                       |
                       |
             +---------v---------+
             | Frontend Web App  |
             +---------+---------+
                       |
                       | GET /api/integrations/linkedin/connect
                       |
             +---------v---------+
             |   Zerify Backend  |
             +---------+---------+
                       |
                       | Redirect
                       v
             +-------------------+
             | LinkedIn OAuth    |
             | Authorization     |
             +---------+---------+
                       |
                       | User approves
                       |
                       v
             +-------------------+
             | LinkedIn Callback |
             +---------+---------+
                       |
                       | code + state
                       v
             +-------------------+
             | Zerify Backend    |
             | Token Exchange    |
             +---------+---------+
                       |
                       | access token
                       v
             +-------------------+
             | LinkedIn OIDC/API |
             +---------+---------+
                       |
                       v
             +-------------------+
             | Zerify Database   |
             +-------------------+
```

---

# 5. Environment Variables

The backend must support:

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=
```

Recommended additional configuration:

```env
LINKEDIN_AUTHORIZATION_URL=https://www.linkedin.com/oauth/v2/authorization
LINKEDIN_TOKEN_URL=https://www.linkedin.com/oauth/v2/accessToken
LINKEDIN_USERINFO_URL=https://api.linkedin.com/v2/userinfo

LINKEDIN_SCOPES=openid profile email
```

For local development:

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/integrations/linkedin/callback
```

For production:

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://api.zerify.in/api/integrations/linkedin/callback
```

The production domain/path must exactly match the redirect URI registered in the LinkedIn Developer Portal.

---

# 6. Creating the LinkedIn Developer Application

## Step 1 — Create LinkedIn Page

Create/use the official Zerify LinkedIn Page.

The LinkedIn developer onboarding process may require a LinkedIn Page when creating an application.

## Step 2 — Open Developer Portal

Open:

https://www.linkedin.com/developers/

Go to:

```text
My Apps
  ->
Create App
```

## Step 3 — Application information

Use:

```text
Application Name: Zerify
LinkedIn Page: Zerify Company Page
App Logo: Zerify logo
```

Accept LinkedIn's terms and create the application.

## Step 4 — Retrieve Client ID

Open:

```text
My Apps
  ->
Zerify
  ->
Auth
```

Copy:

```text
Client ID
```

Set:

```env
LINKEDIN_CLIENT_ID=...
```

## Step 5 — Retrieve Client Secret

On the same Auth page, reveal/copy:

```text
Client Secret
```

Set:

```env
LINKEDIN_CLIENT_SECRET=...
```

Never expose this value in frontend JavaScript, mobile application code, Git repositories, URLs, logs, or API responses.

---

# 7. Configure Redirect URI

In LinkedIn Developer Portal:

```text
My Apps
  ->
Zerify
  ->
Auth
  ->
Authorized redirect URLs
```

Add the backend callback.

Development:

```text
http://localhost:8000/api/integrations/linkedin/callback
```

Production:

```text
https://api.zerify.in/api/integrations/linkedin/callback
```

Recommended separate environments:

```text
Development:
http://localhost:8000/api/integrations/linkedin/callback

Staging:
https://api-staging.zerify.in/api/integrations/linkedin/callback

Production:
https://api.zerify.in/api/integrations/linkedin/callback
```

Do not use an arbitrary wildcard callback.

---

# 8. Enable LinkedIn Product

Open:

```text
Developer Portal
  ->
My Apps
  ->
Zerify
  ->
Products
```

Request/enable:

```text
Sign In with LinkedIn using OpenID Connect
```

Phase 1 scopes:

```text
openid
profile
email
```

If Zerify later needs member posting, evaluate:

```text
Share on LinkedIn
```

which provides:

```text
w_member_social
```

Do not request permissions that Zerify does not actually use.

---

# 9. OAuth Flow

## 9.1 Step 1 — User clicks Connect LinkedIn

Frontend:

```http
GET /api/integrations/linkedin/connect
```

The backend:

1. Authenticates the Zerify user.
2. Generates a cryptographically random `state`.
3. Stores the state temporarily.
4. Generates the LinkedIn authorization URL.
5. Redirects the browser to LinkedIn.

---

# 10. OAuth Authorization URL

The backend should construct:

```text
https://www.linkedin.com/oauth/v2/authorization
```

with:

```text
response_type=code
client_id=<LINKEDIN_CLIENT_ID>
redirect_uri=<LINKEDIN_REDIRECT_URI>
state=<RANDOM_STATE>
scope=openid%20profile%20email
```

Conceptually:

```text
https://www.linkedin.com/oauth/v2/authorization
  ?response_type=code
  &client_id=...
  &redirect_uri=...
  &state=...
  &scope=openid%20profile%20email
```

The backend should URL-encode all query parameters.

---

# 11. State Parameter

The `state` parameter is mandatory from a security perspective.

Generate a high-entropy random value, for example:

```text
32+ random bytes
```

Store:

```text
state
user_id
created_at
provider
```

Example:

```json
{
  "state": "cryptographically-random-value",
  "userId": "zerify-user-id",
  "provider": "linkedin",
  "createdAt": "2026-09-06T00:00:00Z"
}
```

Store this in Redis or another short-lived server-side store.

Recommended expiration:

```text
5–10 minutes
```

When the callback arrives:

1. Read `state`.
2. Find the stored state.
3. Verify it belongs to the current OAuth attempt.
4. Verify it has not expired.
5. Delete it.
6. Continue the OAuth flow.

If validation fails:

```text
400 INVALID_OAUTH_STATE
```

---

# 12. LinkedIn Callback

LinkedIn redirects to:

```http
GET /api/integrations/linkedin/callback
```

Typical query:

```text
?code=AUTHORIZATION_CODE
&state=STATE
```

The callback must:

1. Validate `state`.
2. Check for OAuth error parameters.
3. Exchange `code` for access token.
4. Validate the ID token.
5. Retrieve user info if required.
6. Normalize LinkedIn data.
7. Link/update the social account.
8. Redirect the user back to Zerify.

---

# 13. Authorization Code → Access Token

Backend sends a POST request to:

```text
https://www.linkedin.com/oauth/v2/accessToken
```

Content type:

```text
application/x-www-form-urlencoded
```

Body:

```text
grant_type=authorization_code
code=<AUTHORIZATION_CODE>
redirect_uri=<LINKEDIN_REDIRECT_URI>
client_id=<LINKEDIN_CLIENT_ID>
client_secret=<LINKEDIN_CLIENT_SECRET>
```

Expected token response can contain:

```json
{
  "access_token": "...",
  "expires_in": 5184000,
  "scope": "openid profile email",
  "id_token": "..."
}
```

Do not assume the exact lifetime forever; store the returned expiration information.

---

# 14. ID Token

With OIDC, LinkedIn provides an ID token.

The ID token is a JWT.

Important claims include:

```text
iss
sub
aud
iat
exp
```

Possible identity/profile claims include:

```text
name
given_name
family_name
picture
email
email_verified
locale
```

Zerify must validate:

```text
Signature
Issuer
Audience
Expiration
Issued-at constraints
```

Use LinkedIn's OIDC discovery metadata/JWKS rather than hardcoding public keys.

Expected issuer:

```text
https://www.linkedin.com
```

JWKS:

```text
https://www.linkedin.com/oauth/openid/jwks
```

Discovery metadata identifies the supported endpoints and signing configuration.

---

# 15. UserInfo Endpoint

Zerify may also retrieve member details from:

```http
GET https://api.linkedin.com/v2/userinfo
Authorization: Bearer <ACCESS_TOKEN>
```

Expected fields may include:

```json
{
  "sub": "linkedin-member-id",
  "name": "Creator Name",
  "given_name": "Creator",
  "family_name": "Name",
  "picture": "https://...",
  "locale": "en-US",
  "email": "creator@example.com",
  "email_verified": true
}
```

Email-related fields are optional. The backend must handle missing `email` and `email_verified`.

---

# 16. Linking LinkedIn to Zerify

After successful authentication:

```text
LinkedIn sub
        ↓
Find SocialAccount
        ↓
Existing?
   /          \
 YES           NO
 |              |
Update       Create
```

The stable LinkedIn member identifier should be used as the external account identifier.

Do not use:

```text
name
email
profile URL
```

as the primary external identity key.

Recommended key:

```text
(provider, provider_user_id)
```

---

# 17. Database Schema

Recommended table:

```sql
social_accounts
```

Fields:

```text
id
user_id
provider
provider_user_id
username
display_name
profile_url
profile_image_url
email
access_token_encrypted
refresh_token_encrypted
token_expires_at
scopes
status
connected_at
updated_at
last_synced_at
metadata
```

Example:

```json
{
  "provider": "linkedin",
  "providerUserId": "linkedin-sub",
  "displayName": "Creator Name",
  "profileUrl": null,
  "profileImageUrl": "https://...",
  "status": "connected"
}
```

Recommended unique constraint:

```text
UNIQUE(provider, provider_user_id)
```

Optionally also:

```text
UNIQUE(user_id, provider)
```

if Zerify allows only one LinkedIn account per Zerify user.

---

# 18. Token Storage

Access tokens must be treated as secrets.

Recommended:

```text
Database
   ↓
Encrypted token column
   ↓
KMS/application encryption key
```

Do not store raw tokens if avoidable.

Never expose:

```text
access_token
refresh_token
client_secret
```

to the frontend.

Never include tokens in:

```text
logs
analytics
error messages
URLs
database debug output
```

---

# 19. Frontend UX

The social connections page should contain:

```text
LinkedIn

Connect your LinkedIn account to Zerify

[ Connect LinkedIn ]
```

After connection:

```text
LinkedIn
✓ Connected

Creator Name
LinkedIn profile

Connected on: 06 Sep 2026

[ Sync ]
[ Disconnect ]
```

During OAuth:

```text
Connecting LinkedIn...
```

On success:

```text
LinkedIn connected successfully.
```

On failure:

```text
We couldn't connect your LinkedIn account.
Please try again.
```

Do not expose internal OAuth errors to users.

---

# 20. Recommended Frontend Routes

Example:

```text
/settings/integrations
/settings/integrations/linkedin
```

Callback should preferably terminate on the backend and then redirect to a frontend route:

```text
https://zerify.in/settings/integrations?linkedin=connected
```

or:

```text
https://zerify.in/settings/integrations?linkedin=error
```

Do not put tokens in the frontend redirect URL.

---

# 21. Recommended Backend API

## Start OAuth

```http
GET /api/integrations/linkedin/connect
```

Authentication:

```text
Required
```

Response:

```text
302 Redirect → LinkedIn
```

## OAuth callback

```http
GET /api/integrations/linkedin/callback
```

Authentication:

```text
OAuth state
```

Response:

```text
302 Redirect → Zerify frontend
```

## Connection status

```http
GET /api/integrations/linkedin
```

Response:

```json
{
  "connected": true,
  "provider": "linkedin",
  "displayName": "Creator Name",
  "profileImageUrl": "https://...",
  "connectedAt": "2026-09-06T00:00:00Z",
  "status": "connected"
}
```

Never return access tokens.

## Disconnect

```http
DELETE /api/integrations/linkedin
```

Backend should:

1. Mark connection disconnected.
2. Delete encrypted tokens.
3. Delete provider-specific cached data as appropriate.
4. Remove related OAuth state/session data.
5. Optionally revoke tokens if LinkedIn provides the appropriate mechanism for the granted integration.

---

# 22. Service Layer

Create a provider abstraction.

Example:

```text
SocialIntegrationService
        |
        +-- LinkedInIntegrationService
        +-- YouTubeIntegrationService
        +-- InstagramIntegrationService
        +-- TikTokIntegrationService
        +-- XIntegrationService
```

LinkedIn implementation:

```text
LinkedInIntegrationService

generateAuthorizationUrl()
handleCallback()
exchangeCodeForToken()
validateIdToken()
fetchUserInfo()
normalizeProfile()
saveConnection()
disconnect()
refreshTokenIfSupported()
```

This is important because Zerify will support multiple social platforms.

---

# 23. Suggested TypeScript Interface

```ts
interface SocialIntegrationProvider {
  getAuthorizationUrl(userId: string): Promise<string>;

  handleCallback(params: {
    code: string;
    state: string;
  }): Promise<SocialAccount>;

  getConnection(userId: string): Promise<SocialAccount | null>;

  disconnect(userId: string): Promise<void>;
}
```

LinkedIn:

```ts
class LinkedInIntegrationService
  implements SocialIntegrationProvider {
  // implementation
}
```

---

# 24. Error Handling

Normalize provider errors into Zerify errors.

Recommended error codes:

```text
LINKEDIN_OAUTH_DENIED
LINKEDIN_INVALID_STATE
LINKEDIN_TOKEN_EXCHANGE_FAILED
LINKEDIN_INVALID_ID_TOKEN
LINKEDIN_PROFILE_FETCH_FAILED
LINKEDIN_ACCOUNT_ALREADY_CONNECTED
LINKEDIN_API_UNAUTHORIZED
LINKEDIN_RATE_LIMITED
LINKEDIN_CONFIGURATION_ERROR
LINKEDIN_UNKNOWN_ERROR
```

Frontend should receive safe messages.

Example:

```json
{
  "code": "LINKEDIN_OAUTH_DENIED",
  "message": "LinkedIn authorization was cancelled."
}
```

Never return:

```json
{
  "client_secret": "...",
  "access_token": "..."
}
```

---

# 25. Account Collision Handling

Consider:

```text
Zerify User A
     ↓
LinkedIn Account X
```

If User B tries to connect LinkedIn Account X:

```text
provider = linkedin
provider_user_id = X
```

The unique constraint should prevent duplicate ownership.

Return:

```text
LINKEDIN_ACCOUNT_ALREADY_CONNECTED
```

The system must never silently transfer the account.

---

# 26. OAuth CSRF Protection

Mandatory:

```text
state
```

Recommended:

```text
state = random + server-side session association
```

Do not rely only on a user ID encoded into `state`.

Optionally use PKCE if supported by the exact LinkedIn flow/library being implemented, but do not invent unsupported parameters.

---

# 27. CORS

The OAuth callback should live on the backend.

Recommended:

```text
Frontend:
https://zerify.in

Backend:
https://api.zerify.in
```

The browser does:

```text
Frontend
   ↓
Backend /connect
   ↓
LinkedIn
   ↓
Backend /callback
   ↓
Frontend
```

Avoid making the token exchange directly from the browser.

---

# 28. Security Requirements

## Secrets

Store:

```text
LINKEDIN_CLIENT_SECRET
```

only in backend secret management.

Examples:

```text
AWS Secrets Manager
GCP Secret Manager
Azure Key Vault
Railway secrets
Render secrets
Docker/Kubernetes secrets
```

## HTTPS

Production must use HTTPS.

Do not deploy OAuth credentials over HTTP.

## Cookies

If session cookies are used:

```text
Secure
HttpOnly
SameSite=Lax/appropriate
```

## Logging

Never log:

```text
client_secret
access_token
refresh_token
id_token
authorization_code
```

Redact sensitive query/body values.

---

# 29. Rate Limits

LinkedIn documents rate limits for its APIs and products.

The implementation should therefore:

```text
- Handle 429 responses
- Respect Retry-After when available
- Use exponential backoff
- Avoid unnecessary profile calls
- Cache stable profile data
- Avoid polling without a business requirement
```

Do not build a polling system until the relevant LinkedIn API product and allowed usage are confirmed.

---

# 30. Token Expiration

Store:

```text
token_expires_at
```

computed from the provider's returned expiration information.

Before making authenticated calls:

```text
if token expired:
    refresh if supported/available
    otherwise mark connection as reauthorization_required
```

Do not assume every LinkedIn token can always be refreshed indefinitely.

If reauthorization is required:

```text
status = "reauthorization_required"
```

UI:

```text
LinkedIn connection needs attention.

[Reconnect LinkedIn]
```

---

# 31. Sync Strategy

Phase 1 should use a simple sync:

```text
Connect
   ↓
Fetch profile
   ↓
Store profile
```

Optional manual:

```text
[Sync LinkedIn]
```

Avoid aggressive background polling.

Future:

```text
Scheduled sync
Webhook/event-driven sync where supported
```

Only implement these after confirming the relevant LinkedIn API product and terms.

---

# 32. Creator Profile Mapping

Zerify should normalize LinkedIn information into its creator model.

Example:

```text
LinkedIn
   |
   +-- provider_user_id
   +-- name
   +-- first_name
   +-- last_name
   +-- profile_picture
   +-- email
   +-- locale
```

Zerify:

```text
Creator
   |
   +-- socialAccounts[]
   |
   +-- displayName
   +-- profileImage
   +-- languages
   +-- platforms
```

Do not infer follower count or engagement from the basic OIDC profile response.

---

# 33. Multi-Platform Architecture

Zerify should support:

```text
Creator
 |
 +-- Instagram
 +-- YouTube
 +-- LinkedIn
 +-- Facebook
 +-- X
 +-- Snapchat
 +-- Pinterest
 +-- Moj
 +-- Josh
 +-- ShareChat
```

Use a common:

```text
SocialAccount
```

entity.

LinkedIn should not have a completely separate creator architecture.

---

# 34. LinkedIn-Specific Metadata

Keep provider-specific data in:

```text
metadata JSON
```

Example:

```json
{
  "locale": "en-US",
  "emailVerified": true,
  "oidcIssuer": "https://www.linkedin.com"
}
```

Do not put every provider-specific field directly into the common database schema.

---

# 35. Future Creator Analytics

If Zerify's goal is to become an influencer marketplace, Phase 2/3 may require much more than OIDC.

Potential future requirements include:

```text
Posts
Post engagement
Audience metrics
Follower information
Page/company information
Creator analytics
Content performance
```

These should be treated as separate API capabilities.

LinkedIn's current API access model states that many APIs/products require explicit approval. Marketing APIs and other specialized capabilities are product-specific.

Therefore:

```text
OIDC Connection
       ≠
Full Creator Analytics Access
```

Do not promise brands that connecting LinkedIn automatically gives Zerify complete LinkedIn analytics.

---

# 36. Future API Access Process

When Zerify is ready for advanced LinkedIn functionality:

```text
1. Define exact API requirement
2. Identify LinkedIn product
3. Review data restrictions
4. Request product in Developer Portal
5. Complete access form
6. Wait for approval
7. Implement only approved scopes
8. Complete required testing
9. Validate production requirements
```

Potential LinkedIn products include areas such as:

```text
Community Management
Marketing / Advertising
Conversions
Events
Matched Audiences
Lead Sync
```

The exact product should be selected based on the capability Zerify actually needs.

---

# 37. Testing Plan

## Unit tests

Test:

```text
Authorization URL generation
State generation
State validation
State expiration
Token response parsing
ID token validation
UserInfo response parsing
Profile normalization
Database mapping
Error mapping
```

## Integration tests

Test:

```text
Connect flow
Callback flow
Denied authorization
Invalid state
Expired state
Invalid authorization code
Token exchange failure
Missing email
Existing account
Duplicate account
Disconnect
```

## Security tests

Verify:

```text
Client secret never reaches frontend
Tokens never appear in logs
State prevents CSRF
Redirect URI is validated
ID token signature is validated
ID token audience is validated
Expired ID tokens are rejected
Unauthorized users cannot access another user's connection
```

---

# 38. Local Development

Recommended:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000

Callback:
http://localhost:8000/api/integrations/linkedin/callback
```

`.env`:

```env
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/integrations/linkedin/callback
```

Register exactly the same callback in LinkedIn Developer Portal.

---

# 39. Production Deployment

Example:

```text
Frontend:
https://zerify.in

Backend:
https://api.zerify.in

LinkedIn callback:
https://api.zerify.in/api/integrations/linkedin/callback
```

Environment:

```env
LINKEDIN_CLIENT_ID=production_client_id
LINKEDIN_CLIENT_SECRET=production_client_secret
LINKEDIN_REDIRECT_URI=https://api.zerify.in/api/integrations/linkedin/callback
```

Do not reuse development secrets if you create separate LinkedIn applications/environments.

---

# 40. Deployment Checklist

Before production:

```text
[ ] LinkedIn Developer App created
[ ] Zerify LinkedIn Page configured
[ ] Client ID configured
[ ] Client Secret configured
[ ] Production redirect URI registered
[ ] OIDC product enabled
[ ] openid scope tested
[ ] profile scope tested
[ ] email scope tested
[ ] OAuth state implemented
[ ] ID token validation implemented
[ ] Tokens encrypted
[ ] HTTPS enabled
[ ] Secrets excluded from Git
[ ] Sensitive logging disabled
[ ] Account collision handling implemented
[ ] Disconnect implemented
[ ] Token expiration handling implemented
[ ] Error handling implemented
[ ] Production OAuth tested
```

---

# 41. Recommended User Journey

```text
Creator
  |
  v
Zerify Settings
  |
  v
Social Accounts
  |
  v
LinkedIn
  |
  v
[Connect LinkedIn]
  |
  v
LinkedIn Login
  |
  v
Consent Screen
  |
  v
Approve
  |
  v
Zerify Callback
  |
  v
Validate State
  |
  v
Exchange Code
  |
  v
Validate ID Token
  |
  v
Fetch UserInfo
  |
  v
Create/Update SocialAccount
  |
  v
Creator Profile
  |
  v
"LinkedIn Connected ✓"
```

---

# 42. API Sequence

```text
Browser
   |
   | GET /api/integrations/linkedin/connect
   v
Zerify Backend
   |
   | generate state
   |
   | 302
   v
LinkedIn
   |
   | user authorization
   |
   | 302 code + state
   v
Zerify Backend
   |
   | validate state
   |
   | POST /oauth/v2/accessToken
   v
LinkedIn
   |
   | access_token + id_token
   v
Zerify Backend
   |
   | validate ID token
   |
   | GET /v2/userinfo
   v
LinkedIn
   |
   | profile
   v
Zerify Backend
   |
   | encrypt/store tokens
   | create/update SocialAccount
   v
Database
   |
   v
Frontend
   |
   | LinkedIn connected
   v
Creator
```

---

# 43. Data Lifecycle

```text
Authorization
      ↓
Token received
      ↓
Token encrypted
      ↓
Profile retrieved
      ↓
Profile normalized
      ↓
SocialAccount stored
      ↓
Optional future sync
      ↓
User disconnects
      ↓
Token removed
      ↓
LinkedIn data removed/anonymized according to
Zerify's data-retention policy and applicable requirements
```

Zerify should maintain a documented data-retention/deletion policy consistent with LinkedIn's applicable developer terms and privacy requirements.

---

# 44. Privacy

The integration must clearly communicate:

```text
What Zerify accesses
Why Zerify accesses it
How it is stored
How long it is stored
How the creator can disconnect
How the creator can request deletion where applicable
```

Do not request unnecessary scopes.

The OAuth consent screen should accurately reflect the actual use of LinkedIn data.

---

# 45. Important LinkedIn Restrictions

The engineering team must not assume:

```text
OAuth success
=
unlimited LinkedIn API access
```

Instead:

```text
OAuth authentication
+
approved LinkedIn products
+
approved scopes
=
available capabilities
```

For example, basic OIDC access can identify the member and provide basic profile information, while advanced Marketing/Community Management/etc. functionality has separate access requirements.

---

# 46. Recommended Implementation Order

## Sprint 1

```text
1. Create LinkedIn Developer App
2. Configure OAuth
3. Add environment variables
4. Implement connect endpoint
5. Implement callback
6. Implement state validation
7. Implement token exchange
8. Implement ID token validation
```

## Sprint 2

```text
9. Implement UserInfo
10. Create SocialAccount model
11. Encrypt token storage
12. Implement connection status
13. Implement disconnect
14. Add frontend UI
15. Add error states
16. Add tests
```

## Sprint 3

```text
17. Production configuration
18. Security audit
19. Logging/monitoring
20. End-to-end testing
21. Privacy/data retention review
```

## Future

```text
22. Evaluate LinkedIn creator analytics APIs
23. Apply for required API products
24. Implement approved APIs
25. Add content/analytics synchronization
26. Add LinkedIn-specific creator metrics
```

---

# 47. Definition of Done

LinkedIn integration is considered complete for Phase 1 when:

```text
✓ User can connect LinkedIn
✓ User is redirected to LinkedIn
✓ Consent works
✓ Callback works
✓ OAuth state is validated
✓ Authorization code is exchanged securely
✓ ID token is validated
✓ LinkedIn member identity is retrieved
✓ Basic profile is stored
✓ LinkedIn account is linked to correct Zerify user
✓ Tokens are encrypted
✓ Tokens are never exposed to frontend
✓ Duplicate account ownership is prevented
✓ User can see connection status
✓ User can disconnect
✓ Expired/invalid connections are handled
✓ Errors are user-friendly
✓ Automated tests pass
✓ Production redirect URI works
✓ Secrets are managed securely
```

---

# 48. Reference Documentation

Official LinkedIn documentation:

- LinkedIn API access:
  https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access

- Sign In with LinkedIn using OpenID Connect:
  https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2

- OAuth 2.0 overview:
  https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

- LinkedIn Developer Portal:
  https://www.linkedin.com/developers/

- Marketing API access / products:
  https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access

---

# 49. Final Engineering Decision

For Zerify's first LinkedIn implementation:

```text
Authentication:
OAuth 2.0 + OpenID Connect

Flow:
3-legged Member Authorization

Scopes:
openid
profile
email

Backend:
Required

Client Secret:
Backend only

Redirect:
Backend callback

Identity:
LinkedIn OIDC `sub`

Profile:
LinkedIn OIDC/UserInfo

Storage:
Encrypted token + normalized SocialAccount

Advanced analytics:
Separate future API-product integration
```

This architecture should be implemented as a reusable social-platform integration layer so that LinkedIn can coexist cleanly with Zerify's YouTube, Instagram, TikTok, X, Facebook and other future platform integrations.
