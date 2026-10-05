# Zerify — Active Campaign & Deliverable Submission PRD

**Document Type:** Product Requirements Document  
**Product:** Zerify  
**Module:** Creator Campaign Execution, Deliverables & Approval  
**Status:** Draft for implementation  
**Primary Users:** Creators / Influencers, Brands / Campaign Managers, Zerify Admins  
**Version:** 1.0

---

## 1. Executive Summary

Zerify needs a clear end-to-end workflow for creators who have accepted an active campaign and must complete, submit, revise, publish, and receive approval/payment for campaign deliverables.

The experience must make the creator's **next action obvious at every stage**. Campaign cards should therefore be state-aware: the primary CTA changes according to what the creator needs to do next.

A campaign is not treated as a single upload. It is a container for multiple **campaign deliverables**, and each deliverable has its own lifecycle:

> Requirement → Creation → Submission → Review → Revision/Approval → Publication → Performance Tracking

The campaign-level lifecycle aggregates the state of its individual deliverables and connects completion to payment/escrow.

---

# 2. Problem Statement

Creators participating in influencer campaigns need to understand:

- Which campaigns are currently active.
- What they are expected to deliver.
- What the deadline is.
- How much they will receive.
- What action they need to take next.
- Whether content is awaiting brand review.
- Whether revisions are required.
- Whether content has been approved.
- Whether the content needs to be published.
- Whether payment is processing or released.

Brands need to:

- Define deliverables and requirements.
- Review creator submissions.
- Request revisions with actionable feedback.
- Approve or reject submissions.
- Track campaign completion.
- Maintain a reliable audit trail.
- Trigger the appropriate payment/escrow workflow.

Zerify must provide a single workflow connecting all of these steps.

---

# 3. Goals

## 3.1 Primary Goals

1. Provide creators with a clear Active Campaign dashboard.
2. Make the next required action obvious.
3. Support campaigns containing multiple deliverables.
4. Support both:
   - File-based submission for pre-publication approval.
   - Published social URL submission for already-published content.
5. Support draft and final content workflows.
6. Allow brands to review submissions.
7. Support revision requests and resubmission.
8. Maintain submission version history.
9. Track deliverable-level and campaign-level progress.
10. Connect campaign completion to payment/escrow.
11. Maintain a complete audit trail.
12. Prepare submitted content for downstream social-performance tracking.

## 3.2 Secondary Goals

- Reduce creator confusion.
- Reduce back-and-forth communication.
- Prevent missed deadlines.
- Prevent ambiguous submission states.
- Make disputes easier to investigate.
- Create a foundation for automated campaign-performance tracking.

---

# 4. Non-Goals

The first version does not need to provide:

- Full social-media content creation/editing software.
- Advanced video editing.
- AI-generated content creation.
- A complete influencer CRM.
- Manual payment reconciliation outside the existing payment architecture.
- Social analytics beyond the data required to verify and track campaign content.

---

# 5. User Roles

## 5.1 Creator

Can:

- View active campaigns.
- View campaign requirements.
- Start a campaign.
- View deliverables.
- Upload deliverables.
- Submit published URLs.
- Submit drafts/final content.
- Add creator notes.
- View brand feedback.
- Resubmit revised versions.
- View submission history.
- View approval status.
- View campaign payment status.

## 5.2 Brand / Campaign Manager

Can:

- View assigned creators.
- View campaign deliverables.
- Review submissions.
- Approve submissions.
- Request revisions.
- Provide revision feedback.
- View version history.
- Confirm publication where required.
- View campaign completion.
- View payment/escrow state.

## 5.3 Zerify Admin

Can:

- View all campaigns and submissions.
- Override states when necessary.
- Investigate disputes.
- View audit history.
- Review failed processing.
- Manage moderation/abuse cases.
- Assist with payment exceptions.

---

# 6. Core UX Principle

## Every screen should answer three questions

### 1. What is this?

Example:

> Mamaearth — Vitamin C Face Serum Campaign

### 2. What is its current state?

Example:

> Revision Requested

### 3. What should I do next?

Example:

> Fix & Resubmit

The primary CTA must therefore be **state-aware**.

---

# 7. Campaign Card

The Active Campaign card is the primary entry point for creators.

## 7.1 Required Information

Each card should show:

- Brand logo.
- Brand name.
- Campaign name.
- Campaign status.
- Campaign ID where useful.
- Number/type of deliverables.
- Campaign value.
- Submission deadline / next deadline.
- Campaign progress.
- Current action/status message.
- Primary CTA.

## 7.2 Recommended Card

```text
┌──────────────────────────────────────────────────────────────┐
│ [Brand Logo]  Mamaearth                                    │
│ Vitamin C Face Serum Campaign                              │
│                                                              │
│ ● ACTIVE                    Campaign #ZFY-2841              │
│                                                              │
│ Deliverables                                                  │
│ 1 × Reel       3 × Stories                                  │
│                                                              │
│ Submission deadline       Campaign value                    │
│ 28 Sep 2026                ₹8,500                           │
│                                                              │
│ Progress                                                       │
│ ●───────●────────○                                          │
│ Accepted  In Progress  Submitted                            │
│                                                              │
│ ⚠ Reel submission due in 2 days                             │
│                                                              │
│ [ View Campaign ]              [ Submit Deliverable ]       │
└──────────────────────────────────────────────────────────────┘
```

## 7.3 Card Information Priority

| Information | Priority |
|---|---|
| Brand + campaign | Required |
| Status | Required |
| Next action | Required |
| Deadline | Required |
| Deliverable count | Required |
| Payment amount | Required |
| Progress | Required |
| Campaign ID | Optional |
| Brief summary | Optional |
| Full brief | Not on card |
| Contract | Not on card |

---

# 8. State-Aware CTA System

The primary CTA must change according to campaign state.

| State | Primary CTA |
|---|---|
| Accepted, not started | Start Campaign |
| Campaign started | View Requirements |
| Content creation | Continue Campaign |
| Deliverable ready | Submit Deliverable |
| Submission pending review | View Submission |
| Revision requested | Fix & Resubmit |
| Approved | View Campaign |
| Payment pending | View Payment |
| Payment processing | View Payment |
| Completed | View Campaign |

Secondary actions can include:

- View Campaign.
- View Brief.
- View Payment.
- Contact Brand.

Only one primary CTA should dominate the card.

---

# 9. Campaign Workspace

Clicking `View Campaign` opens the campaign workspace.

## 9.1 Header

```text
← Back to Campaigns

Mamaearth
Vitamin C Face Serum Campaign

● ACTIVE                     ₹8,500
Deadline: 28 Sep 2026
```

## 9.2 Campaign Progress

```text
✓ Campaign Accepted
✓ Brief Reviewed
● Content Creation
○ Deliverables Submitted
○ Brand Approval
○ Payment Released
```

The timeline should update automatically based on actual state transitions.

---

# 10. Campaign Requirements

The workspace must show:

## Campaign Brief

- Campaign objective.
- Product/service information.
- Target audience.
- Required messaging.
- Key talking points.
- Mandatory mentions.
- Required hashtags.
- Required social accounts/tags.
- CTA requirements.
- Content guidelines.
- Prohibited content.
- Disclosure requirements where configured.
- Posting requirements.
- Submission deadline.
- Publication deadline.

The exact fields should be configurable by the campaign creator.

---

# 11. Deliverable Architecture

A campaign can contain one or more deliverables.

Example:

```text
Campaign
│
├── Instagram Reel
│   └── Deliverable
│
├── Instagram Story #1
│   └── Deliverable
│
├── Instagram Story #2
│   └── Deliverable
│
└── Instagram Story #3
    └── Deliverable
```

Each deliverable must have its own state.

## Example

```text
Instagram Reel
Status: Approved

Instagram Story #1
Status: Approved

Instagram Story #2
Status: Revision Requested

Instagram Story #3
Status: Not Submitted
```

Campaign progress should be derived from these deliverables.

---

# 12. Deliverable Card

Each deliverable should display:

- Platform.
- Content type.
- Quantity.
- Requirements summary.
- Submission deadline.
- Publication deadline, if applicable.
- Current state.
- Version.
- Primary CTA.

Example:

```text
┌─────────────────────────────────────────────┐
│ 🎬 Instagram Reel                          │
│                                             │
│ Quantity: 1                                 │
│ Status: In Progress                         │
│ Due: 28 Sep                                 │
│                                             │
│ [ Submit Reel ]                             │
└─────────────────────────────────────────────┘
```

---

# 13. Deliverable Lifecycle

Each deliverable follows:

```text
NOT_STARTED
    ↓
IN_PROGRESS
    ↓
READY_FOR_SUBMISSION
    ↓
SUBMITTED
    ↓
UNDER_REVIEW
    ↓
 ┌───────────────┐
 │               │
APPROVED     REVISION_REQUESTED
 │               │
 ↓               ↓
PUBLISHED     RESUBMITTED
 │               │
 ↓               └────→ UNDER_REVIEW
 │
 ↓
PERFORMANCE_TRACKING
 │
 ↓
COMPLETED
```

Additional terminal/error states may be required for cancellation, rejection, or disputes.

---

# 14. Deliverable Submission Flow

Clicking `Submit Deliverable` should open a guided submission flow.

## Step 1 — Identify Submission

```text
Submit Deliverable

Instagram Reel
Campaign: Mamaearth Vitamin C

What are you submitting?

○ Draft for approval
● Final content

[ Continue ]
```

The UI should clearly distinguish:

- Draft.
- Final submission.

---

# 15. Submission Methods

Zerify must support two primary methods.

## 15.1 Upload File

Used when the creator needs brand approval before publication.

Supported examples:

- MP4.
- MOV.
- Images.
- Other content types configured by campaign.

The allowed MIME types and file size must be configurable.

UI:

```text
Upload Content

┌────────────────────────────────────────────┐
│                                            │
│        Drag & Drop your content            │
│                                            │
│              or                            │
│                                            │
│          [ Upload File ]                   │
│                                            │
│ MP4, MOV • Max configured size             │
└────────────────────────────────────────────┘
```

## 15.2 Published Social URL

Used when content has already been published.

Example:

```text
Paste published URL

https://instagram.com/reel/xxxxxxxx

[ Verify URL ]
```

Zerify should attempt to verify:

- URL validity.
- Platform.
- Creator ownership.
- Post existence.
- Publication timestamp.
- Content type where available.
- Campaign-required account.
- Required mentions.
- Required hashtags.
- Social metrics when available.

---

# 16. Pre-Publication Approval Flow

```text
Creator
   ↓
Upload content
   ↓
Submit for brand review
   ↓
Brand review
   ↓
 ┌─────────────┐
 │             │
Approve     Revision
 │             │
 ↓             ↓
Creator      Creator
publishes    edits
 │             │
 ↓             │
Submit URL ←──┘
```

---

# 17. Post-Publication Submission Flow

```text
Creator creates content
        ↓
Publishes to social platform
        ↓
Copies post URL
        ↓
Pastes URL into Zerify
        ↓
Zerify verifies URL
        ↓
Brand review
        ↓
Approval
        ↓
Performance tracking
```

---

# 18. Submission Review Screen

Before final submission, creators must see a review screen.

```text
Review Submission

Instagram Reel

┌─────────────────────────┐
│                         │
│      CONTENT PREVIEW    │
│                         │
└─────────────────────────┘

File
reel_final_v3.mp4

Duration
00:32

Size
24.8 MB

Caption
"Discover the new Vitamin C..."

Hashtags
#Mamaearth #VitaminC

Mentions
@mamaearth

Creator Note
"Created according to the campaign brief."

☑ I confirm this content follows the campaign
  requirements.

[ Submit for Brand Review ]
```

---

# 19. Validation Before Submission

Zerify should validate:

### File submissions

- File exists.
- File type is allowed.
- File size is within limit.
- File upload completed.
- File is readable/processable.
- Required metadata is present.

### URL submissions

- URL is syntactically valid.
- Platform is supported.
- URL resolves to a supported post where verification is available.
- Creator ownership can be verified where API capabilities allow.
- Required campaign platform matches.
- Duplicate submission is detected.

### Campaign rules

- Deliverable belongs to active campaign.
- Submission is within permitted time window.
- Creator is assigned to campaign.
- Deliverable is not already completed unless resubmission is explicitly allowed.

---

# 20. Submission Confirmation

After successful submission:

```text
Submission Received

Your Instagram Reel has been submitted
to Mamaearth for review.

Submission
Version 1

Submitted
26 Sep 2026, 14:32

Status
● Under Review

[ View Submission ]
```

---

# 21. Brand Review

Brand reviewers should see:

```text
Creator: @creatorname

Instagram Reel
Version 2

[Content Preview]

Campaign Requirements

✓ Required mention
✓ Required hashtag
✓ Content type
✓ Submission received

Creator Note:
"Updated product shot as requested."

Actions:

[ Approve ]
[ Request Revision ]
```

---

# 22. Revision Request

A brand must provide a reason when requesting revision.

Required:

- Revision message.
- Optional timestamp/reference.
- Optional category.
- Optional attachment/reference.

Example:

```text
Revision Requested

Please add the product usage shot between
00:12 – 00:16 and update the caption with
the campaign CTA.

[ Resubmit ]
```

Revision categories may include:

- Content quality.
- Campaign requirement.
- Caption.
- Hashtag.
- Mention/tag.
- Product visibility.
- Brand guideline.
- Technical issue.
- Other.

---

# 23. Version Management

Every submission revision must create a new immutable version.

Example:

```text
Submission History

v3  ● Current
    Submitted Sep 27
    Under Review

v2
    Submitted Sep 26
    Revision Requested

v1
    Submitted Sep 25
    Revision Requested
```

Requirements:

- Previous versions cannot be silently overwritten.
- Each version stores submission timestamp.
- Each version stores uploader.
- Each version stores file/URL.
- Each version stores metadata.
- Each version stores review decision.
- Each version stores reviewer feedback.

---

# 24. Resubmission Flow

```text
Revision Requested
       ↓
Creator opens submission
       ↓
Reads feedback
       ↓
Uploads revised content
       ↓
New version created
       ↓
Submit
       ↓
Under Review
```

Primary CTA:

> **Fix & Resubmit**

---

# 25. Approval Flow

When approved:

```text
🎉 Deliverable Approved

Your Instagram Reel has been approved
by Mamaearth.

Status:
✓ Approved

[ View Campaign ]
```

If publication is still required:

```text
Approved for Publication

The brand approved your content.

Next step:
Publish the content and submit the
published social URL.

[ Submit Published URL ]
```

---

# 26. Publication Tracking

For deliverables requiring publication:

States:

```text
APPROVED_FOR_PUBLICATION
        ↓
AWAITING_PUBLICATION
        ↓
PUBLISHED
        ↓
URL_VERIFIED
        ↓
PERFORMANCE_TRACKING
```

Zerify should not mark a deliverable as fully completed solely because a pre-publication file was approved if the campaign requires public posting.

---

# 27. Social URL Verification

When a creator submits a published URL, Zerify should attempt to verify:

- Social platform.
- Post ID.
- Creator/account.
- Post availability.
- Publication date.
- Content type.
- Caption where available.
- Mentions.
- Hashtags.
- Initial performance metrics.

Verification should be asynchronous when external API response time or availability requires it.

Possible states:

```text
VERIFYING
VERIFIED
VERIFICATION_FAILED
MANUAL_REVIEW_REQUIRED
```

---

# 28. Campaign Completion

A campaign becomes eligible for completion when all required deliverables satisfy their configured completion criteria.

Example:

```text
1 × Reel       ✓ Approved + Published
3 × Stories    ✓ Approved + Published

Campaign
✓ All required deliverables complete
```

The exact completion rule must be configurable per campaign.

---

# 29. Payment / Escrow Integration

Campaign completion must connect to the existing Zerify payment/escrow system.

Example:

```text
Deliverables Complete
        ↓
Campaign Completion
        ↓
Payment Eligibility Check
        ↓
Escrow Release Conditions
        ↓
Payment Processing
        ↓
Payment Completed
```

Campaign card:

```text
✓ CAMPAIGN APPROVED

All deliverables approved

₹8,500

Payment
Processing

[ View Payment ]
```

Payment states should be read from the payment system rather than duplicated manually in campaign records.

---

# 30. Campaign-Level State

Recommended campaign states:

```text
DRAFT
PUBLISHED
ACCEPTED
IN_PROGRESS
ACTION_REQUIRED
SUBMISSION_PENDING
UNDER_REVIEW
REVISION_REQUIRED
PARTIALLY_APPROVED
APPROVED
AWAITING_PUBLICATION
COMPLETED
PAYMENT_PROCESSING
PAYMENT_COMPLETED
CANCELLED
DISPUTED
```

The system should distinguish between:

- Campaign state.
- Deliverable state.
- Payment state.

These must not be collapsed into one database field.

---

# 31. Deliverable-Level State

Recommended deliverable states:

```text
NOT_STARTED
IN_PROGRESS
READY_FOR_SUBMISSION
SUBMITTED
UNDER_REVIEW
REVISION_REQUESTED
RESUBMITTED
APPROVED
APPROVED_FOR_PUBLICATION
AWAITING_PUBLICATION
PUBLISHED
VERIFICATION_PENDING
VERIFIED
COMPLETED
REJECTED
CANCELLED
```

---

# 32. Suggested Data Model

## campaigns

```text
id
brand_id
name
description
status
start_date
end_date
currency
total_budget
created_at
updated_at
```

## campaign_assignments

```text
id
campaign_id
creator_id
status
accepted_at
completed_at
created_at
updated_at
```

## campaign_deliverables

```text
id
campaign_id
assignment_id
platform
content_type
title
description
quantity
status
submission_deadline
publication_deadline
requires_pre_approval
requires_publication
payment_amount
created_at
updated_at
```

## deliverable_requirements

```text
id
deliverable_id
requirement_type
requirement_key
requirement_value
is_mandatory
created_at
```

Examples:

```text
HASHTAG
MENTION
CONTENT_TYPE
MIN_DURATION
MAX_DURATION
CAPTION_TEXT
DISCLOSURE
PRODUCT_VISIBILITY
POSTING_WINDOW
```

## deliverable_submissions

```text
id
deliverable_id
version
submission_type
file_id
published_url
status
creator_note
submitted_by
submitted_at
created_at
updated_at
```

## submission_reviews

```text
id
submission_id
reviewer_id
decision
feedback
reviewed_at
created_at
```

## submission_revisions

```text
id
submission_id
requested_by
reason
category
requested_at
resolved_at
```

## social_publications

```text
id
deliverable_id
platform
external_post_id
profile_id
post_url
published_at
verification_status
verified_at
created_at
updated_at
```

## deliverable_performance

```text
id
social_publication_id
captured_at
impressions
reach
views
likes
comments
shares
saves
engagement_rate
```

## campaign_payment_reference

```text
id
campaign_id
assignment_id
payment_id
escrow_id
amount
currency
status
release_condition
created_at
updated_at
```

Payment records should remain owned by the payment subsystem. This table should primarily reference the payment/escrow system.

---

# 33. Important Data Ownership Rule

Do not duplicate the same source-of-truth fields across multiple tables.

For example:

- Payment status → Payment subsystem.
- Social post metrics → Social analytics/performance subsystem.
- Creator profile → Creator/account subsystem.
- Campaign status → Campaign subsystem.
- Deliverable status → Deliverable subsystem.

Campaign views can aggregate these values without creating conflicting duplicate records.

---

# 34. API Requirements

## Creator APIs

### Get active campaigns

```http
GET /api/v1/creator/campaigns?status=active
```

### Get campaign

```http
GET /api/v1/campaigns/{campaignId}
```

### Get deliverables

```http
GET /api/v1/campaigns/{campaignId}/deliverables
```

### Start campaign

```http
POST /api/v1/campaigns/{campaignId}/start
```

### Create submission

```http
POST /api/v1/deliverables/{deliverableId}/submissions
```

### Upload file

```http
POST /api/v1/deliverables/{deliverableId}/submissions/upload
```

### Submit published URL

```http
POST /api/v1/deliverables/{deliverableId}/submissions/url
```

### Get submission

```http
GET /api/v1/submissions/{submissionId}
```

### Resubmit

```http
POST /api/v1/submissions/{submissionId}/resubmit
```

---

# 35. Brand APIs

### Get submissions

```http
GET /api/v1/brand/campaigns/{campaignId}/submissions
```

### Approve submission

```http
POST /api/v1/submissions/{submissionId}/approve
```

### Request revision

```http
POST /api/v1/submissions/{submissionId}/request-revision
```

### View submission history

```http
GET /api/v1/submissions/{submissionId}/versions
```

---

# 36. Example Submission API

```json
{
  "deliverableId": "del_123",
  "submissionType": "FILE",
  "fileId": "file_456",
  "isFinal": true,
  "creatorNote": "Created according to the campaign brief."
}
```

Published URL example:

```json
{
  "deliverableId": "del_123",
  "submissionType": "PUBLISHED_URL",
  "publishedUrl": "https://instagram.com/reel/abc123",
  "isFinal": true
}
```

---

# 37. Notification Requirements

Creators should receive notifications for:

- Campaign accepted.
- Campaign deadline approaching.
- Deliverable deadline approaching.
- Submission successfully received.
- Brand approved.
- Brand requested revision.
- Brand rejected.
- Published URL verification completed.
- Payment processing.
- Payment completed.
- Campaign completed.

Brands should receive notifications for:

- Creator submitted deliverable.
- Creator resubmitted revision.
- Publication URL submitted.
- Campaign approaching deadline.
- Campaign completed.

---

# 38. Deadline Notifications

Recommended configurable thresholds:

- 72 hours before deadline.
- 24 hours before deadline.
- Deadline day.
- Overdue.

Avoid sending repeated notifications unnecessarily.

---

# 39. Overdue Handling

If a deliverable passes its deadline:

```text
⚠ OVERDUE

Instagram Reel

Submission deadline:
28 Sep 2026

This deliverable is overdue.

[ Submit Deliverable ]
```

Campaign status may become:

```text
ACTION_REQUIRED
```

Overdue does not automatically mean cancellation.

The campaign's configured rules determine what happens next.

---

# 40. Error Handling

## Upload failure

Show:

```text
Upload failed.

Your file could not be uploaded.
Please try again.

[ Retry ]
```

## URL verification failure

```text
We couldn't verify this post.

Check that:
• The URL is correct.
• The post is publicly accessible.
• The post belongs to the connected account.

[ Try Again ]
[ Request Manual Review ]
```

## Duplicate URL

```text
This post has already been submitted
for this campaign.

[ View Existing Submission ]
```

---

# 41. Security Requirements

- Only assigned creators can submit deliverables.
- Only authorized brand members can review.
- Submission versions must be immutable.
- File URLs should use secure access controls.
- Signed URLs should be used for private uploads where appropriate.
- File type must be validated server-side.
- File size limits must be enforced server-side.
- Malware/content scanning should be considered before making uploaded content available.
- All state-changing actions require authorization.
- Audit events must be recorded.
- Payment state must never be client-controlled.
- Social verification must not trust user-provided metadata without verification.

---

# 42. Audit Log

Every significant state change should generate an audit event.

Example:

```text
DELIVERABLE_SUBMITTED
SUBMISSION_REVIEW_STARTED
REVISION_REQUESTED
SUBMISSION_RESUBMITTED
SUBMISSION_APPROVED
PUBLICATION_SUBMITTED
PUBLICATION_VERIFIED
DELIVERABLE_COMPLETED
CAMPAIGN_COMPLETED
PAYMENT_RELEASE_REQUESTED
PAYMENT_COMPLETED
```

Each event should include:

```text
event_id
entity_type
entity_id
actor_id
actor_role
event_type
previous_state
new_state
metadata
timestamp
```

---

# 43. Analytics Events

Track:

```text
campaign_card_viewed
campaign_opened
campaign_started
deliverable_opened
submission_started
submission_file_uploaded
submission_url_entered
submission_validation_failed
submission_submitted
submission_viewed_by_brand
revision_requested
submission_resubmitted
submission_approved
publication_url_submitted
publication_verified
deliverable_completed
campaign_completed
payment_viewed
```

These events should be used to measure funnel performance.

---

# 44. Product Analytics Metrics

Track:

### Creator funnel

```text
Active Campaign
      ↓
Campaign Opened
      ↓
Submission Started
      ↓
Submission Completed
      ↓
Approved
      ↓
Published
      ↓
Campaign Completed
```

Metrics:

- Campaign start rate.
- Deliverable submission rate.
- Average time to submission.
- Average number of revisions.
- Approval rate.
- Average approval time.
- Publication completion rate.
- Campaign completion rate.
- Overdue rate.

### Brand metrics

- Average review time.
- Revision rate.
- Approval rate.
- Average revisions per deliverable.
- Campaign completion time.

---

# 45. UX Rules

1. Always show the current status.
2. Always show the next required action.
3. Use one dominant primary CTA.
4. Keep detailed requirements inside the campaign workspace.
5. Never make creators guess whether a submission was successful.
6. Preserve previous submission versions.
7. Make revision feedback actionable.
8. Separate campaign status from deliverable status.
9. Separate payment status from campaign status.
10. Do not make the creator re-enter information already available from the campaign brief.
11. Show deadlines prominently.
12. Make overdue states visually obvious.
13. Show payment amount without requiring the creator to open another page.
14. Do not mark a campaign complete until required deliverables satisfy completion criteria.

---

# 46. Recommended Creator Dashboard

The Active Campaign section should look approximately like:

```text
Active Campaigns

┌──────────────────────────────────────────────────────┐
│ Mamaearth                                             │
│ Vitamin C Campaign                                    │
│                                                      │
│ ⚠ ACTION REQUIRED                                   │
│ 1 Reel · 3 Stories                                  │
│ Deadline: 28 Sep                                    │
│ Value: ₹8,500                                       │
│                                                      │
│ 2 / 4 Deliverables Complete                         │
│                                                      │
│ [ Submit Deliverable ] [ View Campaign ]            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Minimalist                                            │
│ Skincare Launch                                      │
│                                                      │
│ ● UNDER REVIEW                                      │
│ Reel submitted Sep 26                               │
│                                                      │
│ Waiting for brand approval                           │
│                                                      │
│ [ View Submission ]                                 │
└──────────────────────────────────────────────────────┘
```

---

# 47. Complete Creator Journey

```text
ACTIVE CAMPAIGN
      │
      ▼
VIEW CAMPAIGN
      │
      ▼
READ BRIEF
      │
      ▼
START CAMPAIGN
      │
      ▼
VIEW DELIVERABLES
      │
      ▼
CREATE CONTENT
      │
      ▼
SUBMIT DELIVERABLE
      │
      ├───────────────┐
      │               │
      ▼               ▼
UPLOAD FILE       PUBLISHED URL
      │               │
      └───────┬───────┘
              ▼
       VALIDATE SUBMISSION
              │
              ▼
       SUBMIT FOR REVIEW
              │
              ▼
         BRAND REVIEW
              │
       ┌──────┴───────┐
       │              │
       ▼              ▼
   APPROVED       REVISION
       │              │
       │              ▼
       │         NEW VERSION
       │              │
       │              └────→ BRAND REVIEW
       │
       ▼
   PUBLICATION
       │
       ▼
URL VERIFICATION
       │
       ▼
PERFORMANCE TRACKING
       │
       ▼
DELIVERABLE COMPLETE
       │
       ▼
ALL DELIVERABLES COMPLETE
       │
       ▼
CAMPAIGN COMPLETE
       │
       ▼
ESCROW / PAYMENT
       │
       ▼
PAYMENT COMPLETED
```

---

# 48. Edge Cases

The implementation must handle:

### Creator

- Creator abandons campaign.
- Creator submits after deadline.
- Creator attempts duplicate submission.
- Creator uploads unsupported file.
- Creator uploads oversized file.
- Creator loses connection during upload.
- Creator disconnects social account.
- Creator submits post from wrong account.
- Creator submits deleted post.
- Creator submits private post.
- Creator submits the same URL twice.

### Brand

- Brand requests multiple revisions.
- Brand approves an older version.
- Brand attempts to review a superseded version.
- Brand changes campaign requirements after submission.
- Brand cancels campaign after content creation.
- Brand fails to review before deadline.

### Payment

- Campaign complete but payment fails.
- Escrow release delayed.
- Payment partially fails.
- Payment disputed.
- Campaign cancelled before completion.

Every such case must preserve the audit trail.

---

# 49. Acceptance Criteria

## Campaign Card

- [ ] Active campaigns appear for eligible creators.
- [ ] Brand and campaign name are visible.
- [ ] Current state is visible.
- [ ] Deliverable count is visible.
- [ ] Deadline is visible.
- [ ] Campaign value is visible.
- [ ] Progress is visible.
- [ ] CTA changes based on state.
- [ ] Overdue campaigns are clearly identified.

## Campaign Workspace

- [ ] Creator can view campaign brief.
- [ ] Creator can view all assigned deliverables.
- [ ] Each deliverable has independent state.
- [ ] Requirements are visible.
- [ ] Deadlines are visible.
- [ ] Payment information is visible.

## Submission

- [ ] Creator can upload supported files.
- [ ] Creator can submit published social URLs.
- [ ] Creator can mark a submission as draft/final.
- [ ] File validation occurs server-side.
- [ ] URL validation occurs.
- [ ] Submission confirmation is shown.
- [ ] Submission receives a unique ID.
- [ ] Submission creates a version.

## Review

- [ ] Brand can view submissions.
- [ ] Brand can approve.
- [ ] Brand can request revision.
- [ ] Revision feedback is required.
- [ ] Creator receives notification.
- [ ] New submission version is created on resubmission.

## Publication

- [ ] Approved content can move to publication.
- [ ] Creator can submit published URL.
- [ ] Zerify attempts verification.
- [ ] Verification state is persisted.
- [ ] Verified publication can enter performance tracking.

## Completion

- [ ] Campaign completion is derived from required deliverables.
- [ ] Payment system receives appropriate completion/release signal.
- [ ] Payment status is displayed from the payment subsystem.
- [ ] Audit events exist for critical transitions.

---

# 50. MVP Scope

## Phase 1 — MVP

Implement:

1. Active campaign cards.
2. State-aware CTAs.
3. Campaign workspace.
4. Deliverable list.
5. File upload.
6. Published URL submission.
7. Draft/final designation.
8. Brand approval.
9. Revision request.
10. Resubmission.
11. Submission version history.
12. Campaign progress.
13. Basic notifications.
14. Payment status integration.
15. Audit logging.

## Phase 2

Add:

- Automated social URL verification.
- Social account ownership verification.
- Automatic hashtag/mention validation.
- Automatic content requirement validation.
- Performance synchronization.
- Advanced deadline automation.
- Dispute workflows.
- Creator/brand messaging integration.

## Phase 3

Add:

- AI-assisted brief compliance.
- AI content compliance checks.
- Automated fraud detection.
- Predictive campaign risk detection.
- Automated performance reports.
- Advanced campaign analytics.

---

# 51. Definition of Done

The feature is considered production-ready when:

1. A creator can accept a campaign.
2. The campaign appears correctly in Active Campaigns.
3. The campaign card communicates the correct next action.
4. The creator can open the campaign workspace.
5. The creator can see every required deliverable.
6. The creator can submit a file or published URL.
7. The system validates the submission.
8. The brand can review it.
9. The brand can approve or request revision.
10. Revision creates a new immutable version.
11. The creator can resubmit.
12. Approval moves the deliverable to the correct next state.
13. Published content can be verified.
14. Required deliverables determine campaign completion.
15. Payment/escrow status is correctly connected.
16. Notifications are generated at important state changes.
17. Audit logs capture critical actions.
18. Unauthorized users cannot modify campaign/submission state.
19. Failed uploads and verification failures recover gracefully.
20. Campaign and deliverable states remain consistent under concurrent actions.

---

# 52. Final Product Principle

The Zerify campaign experience should feel like a guided workflow rather than a document repository.

The creator should never have to ask:

> "What am I supposed to do now?"

The interface should answer it directly:

```text
WHAT IS THIS?
→ Mamaearth Vitamin C Campaign

WHAT DO I NEED TO DO?
→ Submit 1 Reel + 3 Stories

WHAT IS DUE?
→ Reel due Sep 28

WHAT IS THE NEXT ACTION?
→ Submit Deliverable

WHAT HAPPENS AFTER THAT?
→ Brand Review

WHAT IF THEY ASK FOR CHANGES?
→ Fix & Resubmit

WHAT HAPPENS AFTER APPROVAL?
→ Publish → Verify → Complete → Payment
```

This state-driven workflow should be the foundation for the Zerify creator campaign experience.
