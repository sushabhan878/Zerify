# API Reference — Zerify

## 1. Overview

| Property | Value |
|----------|-------|
| **Base URL** | `http://localhost:4000/api/v1` |
| **Protocol** | HTTP/HTTPS + WebSocket (Socket.IO) |
| **Content-Type** | `application/json` |
| **Authentication** | JWT Bearer token |
| **Documentation** | Swagger decorators present (UI not yet configured) |

---

## 2. Authentication

### Register (Brand)
```
POST /api/v1/auth/register/brand
```
**Body**:
```json
{
  "email": "brand@company.com",
  "password": "securePassword123",
  "name": "John Doe",
  "companyName": "Acme Inc"
}
```
**Response**:
```json
{
  "accessToken": "eyJhbG...",
  "user": { "id": "uuid", "email": "brand@company.com", "role": "BRAND" }
}
```

### Register (Influencer)
```
POST /api/v1/auth/register/influencer
```
**Body**:
```json
{
  "email": "creator@email.com",
  "password": "securePassword123",
  "name": "Jane Creator",
  "handle": "@janecreates"
}
```

### Login
```
POST /api/v1/auth/login
```
**Body**:
```json
{
  "email": "user@email.com",
  "password": "securePassword123"
}
```
**Response**:
```json
{
  "accessToken": "eyJhbG...",
  "user": { "id": "uuid", "email": "user@email.com", "role": "BRAND" }
}
```

### OAuth (Social Login)
```
GET /api/v1/social/{provider}/auth-url    → Returns OAuth authorization URL
GET /api/v1/social/{provider}/callback     → Handles OAuth callback
```
Supported providers: `meta`, `instagram`, `youtube`, `linkedin`, `x`, `threads`

---

## 3. Common Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 4. Response Formats

**Note**: Response format is not standardized across the API. Formats vary by controller:

| Format | Used By | Example |
|--------|---------|---------|
| Raw data | Campaign, Deliverable, Review | `{ "id": "uuid", "title": "..." }` |
| `{ statusCode, data }` | Social | `{ "statusCode": 200, "data": { ... } }` |
| `{ accessToken, user }` | Auth | `{ "accessToken": "...", "user": { ... } }` |
| `{ success, message, data }` | VIP | `{ "success": true, "message": "OK", "data": { ... } }` |

---

## 5. Campaign Endpoints

### List Brand Campaigns
```
GET /api/v1/campaigns
Auth: Required (BRAND)
```
**Response**: `CampaignItem[]`

### Get Campaign Details
```
GET /api/v1/campaigns/:id
Auth: Optional
```

### Create Campaign
```
POST /api/v1/campaigns
Auth: Required (BRAND)
```
**Body**: `CreateCampaignDto` — title, description, objective, platforms, budget, deliverables, requirements, etc.

### Update Campaign
```
PATCH /api/v1/campaigns/:id
Auth: Required (BRAND, Campaign Owner)
```

### Publish Campaign
```
POST /api/v1/campaigns/:id/publish
Auth: Required (BRAND, Campaign Owner)
```
Transitions: `DRAFT → OPEN`

### Pause Campaign
```
POST /api/v1/campaigns/:id/pause
Auth: Required (BRAND, Campaign Owner)
```

### Cancel Campaign
```
POST /api/v1/campaigns/:id/cancel
Auth: Required (BRAND, Campaign Owner)
```

### Close Applications
```
POST /api/v1/campaigns/:id/close-applications
Auth: Required (BRAND, Campaign Owner)
```

### Discover Campaigns (Influencer)
```
GET /api/v1/campaigns/discover
Auth: Optional
Query: Filtering, search, sorting parameters
```

---

## 6. Application Endpoints

### Apply to Campaign
```
POST /api/v1/applications
Auth: Required (INFLUENCER)
```

### Get Campaign Applications
```
GET /api/v1/applications/campaign/:campaignId
Auth: Required (BRAND)
```

### Shortlist Application
```
POST /api/v1/applications/:id/shortlist
Auth: Required (BRAND)
```

### Reject Application
```
POST /api/v1/applications/:id/reject
Auth: Required (BRAND)
```

### Withdraw Application
```
POST /api/v1/applications/:id/withdraw
Auth: Required (INFLUENCER)
```

---

## 7. Offer Endpoints

### Send Offer
```
POST /api/v1/offers
Auth: Required (BRAND)
```
**Body**: `CreateOfferDto` — applicationId, compensationAmount, compensationPaymentModel, startDate, endDate, etc.

### Get Campaign Offers
```
GET /api/v1/offers/campaign/:campaignId
Auth: Required (BRAND)
```

### Accept Offer
```
POST /api/v1/offers/:id/accept
Auth: Required (INFLUENCER)
```
Creates `CampaignParticipant` and `ParticipantDeliverable` instances.

### Decline Offer
```
POST /api/v1/offers/:id/decline
Auth: Required (INFLUENCER)
```

---

## 8. Deliverable Endpoints

### Get Participant Deliverables
```
GET /api/v1/deliverables/participant/:participantId
Auth: Required
```

### Submit Deliverable Draft
```
POST /api/v1/deliverables/:id/submit-draft
Auth: Required (INFLUENCER)
```
**Body**: `{ contentUrls: string[], submissionNotes?: string }`

### Review Deliverable
```
POST /api/v1/deliverables/:id/review
Auth: Required (BRAND)
```
**Body**: `{ decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED', comments?: string }`

### Submit Published Link
```
POST /api/v1/deliverables/:id/publish
Auth: Required (INFLUENCER)
```

### Verify Deliverable
```
POST /api/v1/deliverables/:id/verify
Auth: Required (BRAND)
```

### Get Campaign Participants
```
GET /api/v1/deliverables/campaign/:campaignId/participants
Auth: Required
```

---

## 9. Review Endpoints

### Submit Campaign Review
```
POST /api/v1/reviews
Auth: Required
```
**Body**:
```json
{
  "campaignId": "uuid",
  "reviewType": "BRAND_TO_INFLUENCER",
  "revieweeInfluencerId": "uuid",
  "comment": "Great experience!",
  "ratings": [
    { "questionId": "brand-to-influencer-0", "rating": 5 },
    { "questionId": "brand-to-influencer-1", "rating": 4 }
  ]
}
```
**Validation**:
- Campaign must be `COMPLETED` or `CANCELLED`
- Reviewer must be a participant (influencer) or owner (brand)
- Cannot submit duplicate review for same campaign + type
- All question IDs must be valid and active
- Ratings must be 0-5

**Response**: `CampaignReviewItem` with normalized `overallRating` (0-5)

### Get Review Questions
```
GET /api/v1/reviews/questions?type=BRAND_TO_INFLUENCER
```
**Query**: `type` — `BRAND_TO_INFLUENCER` or `INFLUENCER_TO_BRAND`

**Response**: `ReviewQuestion[]` (sorted by `order`)

### Get Campaign Reviews
```
GET /api/v1/reviews/campaign/:campaignId
```

### Check Review Status
```
GET /api/v1/reviews/campaign/:campaignId/status
Auth: Required
```
**Response**:
```json
{
  "hasBrandReview": false,
  "hasInfluencerReview": true
}
```

### Get Influencer Average Rating
```
GET /api/v1/reviews/influencer/:influencerId/rating
```
**Response**:
```json
{
  "averageRating": 4.5,
  "totalReviews": 12
}
```

### Get Brand Average Rating
```
GET /api/v1/reviews/brand/:brandId/rating
```

---

## 10. Messaging Endpoints

### List Conversations
```
GET /api/v1/messaging/conversations
Auth: Required
```

### Get Conversation Messages
```
GET /api/v1/messaging/conversations/:id/messages
Auth: Required (Conversation Participant)
```

### Send Message (REST fallback)
```
POST /api/v1/messaging/conversations/:id/messages
Auth: Required (Conversation Participant)
```

### WebSocket (Primary)
```
ws://localhost:4000/messaging
```
**Events**:
- `join_conversation` — Join a conversation room
- `leave_conversation` — Leave a conversation room
- `send_message` — Send a message
- `typing_start` / `typing_stop` — Typing indicators
- `new_message` — Receive a message
- `message_status` — Delivery/read status

---

## 11. Social Integration Endpoints

### Get OAuth URL
```
GET /api/v1/social/{provider}/auth-url
Auth: Required
```

### OAuth Callback
```
GET /api/v1/social/{provider}/callback?code=...&state=...
```

### Sync Account
```
POST /api/v1/social/accounts/:accountId/sync
Auth: Required
```

### Get Account Analytics
```
GET /api/v1/social/accounts/:accountId/analytics
Auth: Required
```

---

## 12. File Upload Endpoints

### Upload File
```
POST /api/v1/file-upload/upload
Auth: Required
Content-Type: multipart/form-data
```
**Body**: `file` (binary)

### Get Signed Upload URL
```
POST /api/v1/file-upload/signed-url
Auth: Required
```

---

## 13. Payment Endpoints

### Create Payment Order
```
POST /api/v1/payments/create-order
Auth: Required (BRAND)
```

### Get Payment Status
```
GET /api/v1/payments/:orderId/status
Auth: Required
```

### Webhook (Cashfree)
```
POST /api/v1/payments/webhook/cashfree
Auth: None (signature-verified)
```

### Get Campaign Finance
```
GET /api/v1/payments/campaign/:campaignId/finance
Auth: Required (BRAND, Campaign Owner)
```

### Raise Dispute
```
POST /api/v1/payments/disputes
Auth: Required
```

---

## 14. Brand Endpoints

### Get Brand Profile
```
GET /api/v1/brands/profile
Auth: Required (BRAND)
```

### Update Brand Profile
```
PATCH /api/v1/brands/profile
Auth: Required (BRAND)
```

### Get Brand Products
```
GET /api/v1/brands/products
Auth: Required (BRAND)
```

---

## 15. Influencer Endpoints

### Get Influencer Profile
```
GET /api/v1/influencers/profile
Auth: Required (INFLUENCER)
```

### Update Influencer Profile
```
PATCH /api/v1/influencers/profile
Auth: Required (INFLUENCER)
```

### Get My Collaborations
```
GET /api/v1/deliverables/my-collaborations
Auth: Required (INFLUENCER)
```

---

## 16. Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Validation Error
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than 6 characters"],
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## 17. Rate Limiting

- **HTTP endpoints**: None currently configured (planned)
- **WebSocket**: 60 messages per 60 seconds per socket connection
- **Planned**: `express-rate-limit` on auth endpoints

---

## 18. Pagination

Currently no standardized pagination. Most `findMany` queries use Prisma's `skip`/`take` internally but do not expose pagination parameters consistently. Campaign discovery (`GET /campaigns/discover`) has query DTOs for filtering.

**Recommended pattern** (not yet implemented):
```
GET /api/v1/resource?page=1&limit=20
```
**Response**:
```json
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```
