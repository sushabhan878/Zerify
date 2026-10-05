# Zerify — Meta Facebook Login for Business Migration

## Objective

Update the existing Meta OAuth implementation in the Zerify NestJS backend so that the **Connect with Meta** flow uses the newly created **Facebook Login for Business configuration** instead of the current traditional Facebook OAuth scope-based flow.

The existing callback and account-discovery architecture should be preserved wherever possible.

---

## Current Backend Details

### Backend base URL

Local backend:

```text
http://localhost:4000/api/v1
```

The Meta callback route implemented by `SocialService` is:

```text
/api/v1/social/meta/callback
```

Therefore the development callback URL should be:

```text
https://<NGROK_DOMAIN>/api/v1/social/meta/callback
```

Production callback:

```text
https://api.zerify.in/api/v1/social/meta/callback
```

The exact ngrok domain must come from the current ngrok session.

---

# 1. Environment Variables

Add/use the following environment variables:

```env
META_APP_ID=<META_APP_ID>
META_APP_SECRET=<META_APP_SECRET>

META_CONFIG_ID=<FACEBOOK_LOGIN_FOR_BUSINESS_CONFIGURATION_ID>

META_REDIRECT_URI=https://<NGROK_DOMAIN>/api/v1/social/meta/callback

META_GRAPH_URL=https://graph.facebook.com/v23.0

FRONTEND_URL=<ZERIFY_FRONTEND_URL>
```

### Important

`META_CONFIG_ID` must contain the **Configuration ID** from the Facebook Login for Business configuration created in Meta Developer Dashboard.

Do not hard-code the Configuration ID in source code.

`META_REDIRECT_URI` must exactly match the redirect URI configured in Meta.

Do not use the old:

```text
http://localhost:4000/api/v1/social/meta/callback
```

for the Meta development OAuth flow because Meta requires the HTTPS ngrok callback being used here.

---

# 2. Update `MetaProvider.getAuthUrl()`

Current implementation uses:

```ts
scope=public_profile,email
```

This needs to be changed to use the Facebook Login for Business configuration.

### Required behavior

The authorization URL should include:

- `client_id`
- `redirect_uri`
- `state`
- `config_id`
- `response_type=code`
- `override_default_response_type=true`

The configuration ID should come from:

```ts
META_CONFIG_ID
```

### Recommended implementation

```ts
getAuthUrl(redirectUri: string, state: string): string {
  const appId = this.getAppId();

  const configId = this.configService.get<string>('META_CONFIG_ID');
  if (!configId) {
    throw new InternalServerErrorException(
      'META_CONFIG_ID environment variable is missing',
    );
  }

  const dialogUrl =
    this.configService.get<string>('META_OAUTH_DIALOG_URL') ||
    'https://www.facebook.com/v23.0/dialog/oauth';

  const url = new URL(dialogUrl);

  url.searchParams.append('client_id', appId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('state', state);
  url.searchParams.append('config_id', configId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('override_default_response_type', 'true');

  return url.toString();
}
```

### Do not do this for the Login for Business authorization request

Do not continue using:

```ts
url.searchParams.append('scope', scopes);
```

with:

```text
public_profile,email
```

The permissions should be defined by the Facebook Login for Business configuration.

---

# 3. Preserve the OAuth State Flow

The existing `SocialService` already generates and verifies OAuth state:

```ts
const state = generateOAuthState(userId);
```

and:

```ts
const { userId, isValid } = verifyOAuthState(state);
```

Keep this behavior.

Do not remove state validation.

The flow must remain:

```text
Authenticated Zerify user
        ↓
generateOAuthState(userId)
        ↓
Meta authorization URL
        ↓
Meta Login for Business
        ↓
callback with code + state
        ↓
verifyOAuthState(state)
        ↓
exchange code
```

---

# 4. Preserve the Callback Route

The callback route is:

```text
/api/v1/social/meta/callback
```

The callback should continue calling:

```ts
handleMetaCallback(code, state, error, errorDescription)
```

Do not rename the route unless there is a strong reason.

The configured redirect URI must be:

```text
https://<NGROK_DOMAIN>/api/v1/social/meta/callback
```

for development.

---

# 5. Preserve Token Storage Security

The existing `SocialService` encrypts access tokens before saving them:

```ts
const encryptedAccessToken = encryptToken(profile.accessToken);
```

Keep this.

Do not expose access tokens through:

```ts
getUserAccounts()
```

The existing response DTO correctly omits raw access tokens. Preserve that behavior.

---

# 6. Preserve Existing Account Discovery

The current `exchangeCodeAndGetAccounts()` does the following:

```text
Authorization code
        ↓
Meta access token
        ↓
Long-lived access token
        ↓
/me
        ↓
/me/accounts
        ↓
Facebook Pages
        ↓
Instagram Business Account attached to Page
```

Do not remove the existing Facebook Page and Instagram Business Account discovery logic while making the OAuth configuration change.

The existing implementation extracts:

### Facebook

```text
platform
platformUserId
username
displayName
avatar
accessToken
expiresAt
```

### Instagram

```text
platform
platformUserId
username
displayName
avatar
followerCount
accessToken
expiresAt
```

Keep these mappings working.

---

# 7. Important: Threads

The current code comment says:

```text
Fetch all managed Facebook Pages, Instagram Business, and Threads assets
```

but the actual implementation currently only retrieves Facebook Pages and Instagram Business Accounts through:

```text
/me/accounts
```

It does **not** currently implement Threads account discovery.

Do not pretend that Threads support already exists.

For this task:

1. Get Facebook Login for Business working.
2. Get Facebook Page discovery working.
3. Get Instagram Business Account discovery working.
4. Leave Threads implementation unchanged unless a separate, verified Threads API flow is already present elsewhere in the codebase.

Do not introduce speculative Threads endpoints.

---

# 8. Update Tests

The current `social.service.spec.ts` contains hard-coded:

```text
http://localhost:4000/api/v1/social/meta/callback
```

Update tests so they reflect the new configuration-based redirect URI.

Prefer injecting the redirect URI through the mocked `ConfigService`, for example:

```ts
if (key === 'META_REDIRECT_URI') {
  return 'https://test.ngrok-free.app/api/v1/social/meta/callback';
}
```

Do not make tests dependent on a real ngrok URL.

---

# 9. Add/Update `MetaProvider` Tests

Add tests verifying that `getAuthUrl()`:

1. Reads `META_APP_ID`.
2. Reads `META_CONFIG_ID`.
3. Includes:

```text
client_id
redirect_uri
state
config_id
response_type=code
override_default_response_type=true
```

4. Does NOT include the old:

```text
scope=public_profile,email
```

5. Throws a clear error if `META_CONFIG_ID` is missing.

Example assertion:

```ts
expect(url.searchParams.get('config_id')).toBe('test-config-id');
expect(url.searchParams.get('response_type')).toBe('code');
expect(url.searchParams.get('override_default_response_type')).toBe('true');
expect(url.searchParams.get('scope')).toBeNull();
```

---

# 10. Verify the Generated OAuth URL

After implementation, call the existing backend endpoint that invokes:

```ts
socialService.getMetaAuthUrl(userId)
```

The generated URL should contain something equivalent to:

```text
https://www.facebook.com/v23.0/dialog/oauth
    ?client_id=<APP_ID>
    &redirect_uri=https%3A%2F%2F<NGROK_DOMAIN>%2Fapi%2Fv1%2Fsocial%2Fmeta%2Fcallback
    &state=<SIGNED_STATE>
    &config_id=<CONFIGURATION_ID>
    &response_type=code
    &override_default_response_type=true
```

The exact query parameter ordering does not matter.

The following MUST be correct:

```text
config_id=<actual Facebook Login for Business Configuration ID>
```

and:

```text
redirect_uri=https://<NGROK_DOMAIN>/api/v1/social/meta/callback
```

---

# 11. Do Not Commit Secrets

Never commit:

```text
META_APP_SECRET
META_ACCESS_TOKEN
META_CONFIG_ID if considered sensitive by project policy
encryption keys
JWT secrets
database credentials
```

Use `.env` / environment configuration.

If `.env.example` exists, add placeholders only:

```env
META_APP_ID=
META_APP_SECRET=
META_CONFIG_ID=
META_REDIRECT_URI=
META_GRAPH_URL=https://graph.facebook.com/v23.0
FRONTEND_URL=
```

---

# 12. Validation Checklist

Before considering this task complete, verify:

- [ ] `META_CONFIG_ID` exists in environment configuration.
- [ ] `META_REDIRECT_URI` uses HTTPS ngrok URL for local Meta OAuth testing.
- [ ] Redirect URI ends with `/api/v1/social/meta/callback`.
- [ ] Meta Dashboard has the exact same redirect URI.
- [ ] `getAuthUrl()` includes `config_id`.
- [ ] `getAuthUrl()` no longer relies on `public_profile,email` scope for this configuration flow.
- [ ] `response_type=code` is present.
- [ ] `override_default_response_type=true` is present.
- [ ] OAuth state generation remains intact.
- [ ] OAuth state verification remains intact.
- [ ] Authorization code exchange remains intact.
- [ ] Long-lived token handling remains intact.
- [ ] Facebook Page discovery still works.
- [ ] Instagram Business Account discovery still works.
- [ ] Tokens are encrypted before database storage.
- [ ] Raw tokens are not returned by account APIs.
- [ ] Existing tests pass.
- [ ] New MetaProvider authorization URL tests pass.
- [ ] No Meta secrets are committed.

---

# 13. Important Scope of This Change

Do NOT rewrite the entire social integration.

This is primarily an OAuth authorization-flow migration:

```text
OLD

Facebook OAuth
    ↓
scope=public_profile,email
    ↓
authorization code
    ↓
token exchange


NEW

Facebook Login for Business
    ↓
config_id=<Configuration ID>
    ↓
authorization code
    ↓
token exchange
    ↓
Facebook Page + Instagram Business discovery
```

Keep the existing repository, DTO, encryption, state, callback, and account persistence architecture unless a concrete incompatibility is discovered.

---

## Expected Result

When a Zerify user clicks:

```text
Connect with Meta
```

the backend should generate a Meta authorization URL using the **Facebook Login for Business Configuration ID**.

After authorization:

```text
Meta
  ↓
https://<NGROK_DOMAIN>/api/v1/social/meta/callback
  ↓
SocialController
  ↓
SocialService.handleMetaCallback()
  ↓
MetaProvider.exchangeCodeAndGetAccounts()
  ↓
Facebook Page + Instagram Business Account
  ↓
encrypt tokens
  ↓
SocialRepository.upsertAccount()
  ↓
redirect to Zerify frontend
```

The implementation should be production-ready, type-safe, tested, and should not break the existing social account persistence flow.
