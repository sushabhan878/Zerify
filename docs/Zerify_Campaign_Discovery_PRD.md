# Zerify Campaign Discovery & Collaboration

## Product Requirements Document (PRD)

**Product:** Zerify\
**Feature:** Campaign Discovery, Applications, Selection &
Collaboration\
**Version:** 1.0\
**Status:** Product Specification\
**Date:** August 22, 2026

------------------------------------------------------------------------

# 1. Executive Summary

Zerify enables companies to discover and collaborate with relevant
influencers through a structured campaign marketplace.

The core problem is that influencer campaigns are often managed through
scattered DMs, spreadsheets, emails, and manual follow-ups. Companies
struggle to identify suitable creators, compare applicants, manage
selection, track deliverables, and handle payments. Influencers struggle
to find relevant opportunities and understand campaign requirements.

This feature introduces a complete campaign lifecycle:

``` text
Company creates campaign
        ↓
Campaign is published
        ↓
Influencers discover campaign
        ↓
Influencers apply
        ↓
Zerify calculates eligibility and match information
        ↓
Company reviews applications
        ↓
Company shortlists candidates
        ↓
Company sends offers
        ↓
Influencers accept or decline
        ↓
Confirmed influencers join campaign
        ↓
Deliverables are managed
        ↓
Content is submitted and reviewed
        ↓
Content is published and verified
        ↓
Performance is tracked
        ↓
Payments are released
        ↓
Campaign is completed
```

The system must support both single-influencer and multi-influencer
campaigns.

------------------------------------------------------------------------

# 2. Problem Statement

## Company Problems

Companies currently face the following challenges:

-   Finding influencers relevant to a specific campaign.
-   Verifying whether influencer audience and profile characteristics
    match campaign goals.
-   Comparing multiple influencers efficiently.
-   Collecting applications and proposals in one place.
-   Managing multiple selected influencers simultaneously.
-   Tracking deliverables and approvals.
-   Managing campaign budgets and individual influencer allocations.
-   Measuring campaign performance.
-   Maintaining a structured history of collaborations.

## Influencer Problems

Influencers face the following challenges:

-   Discovering legitimate and relevant brand opportunities.
-   Understanding requirements before applying.
-   Knowing whether they are a strong fit.
-   Tracking application status.
-   Negotiating campaign terms.
-   Managing deliverables and deadlines.
-   Tracking payment status.

------------------------------------------------------------------------

# 3. Product Goals

## Primary Goals

1.  Allow companies to create structured influencer campaigns.
2.  Make relevant campaigns discoverable by influencers.
3.  Provide application and proposal workflows.
4.  Help companies evaluate and compare applicants.
5.  Support selecting one or multiple influencers.
6.  Require influencer confirmation before collaboration begins.
7.  Provide a shared workspace for confirmed participants.
8.  Track deliverables through completion.
9.  Integrate campaign participation with payments.
10. Build a scalable data model for future matching and analytics.

## Secondary Goals

-   Improve campaign discovery using match scores.
-   Reduce manual communication and coordination.
-   Create reusable influencer performance history.
-   Support future recommendation algorithms.

## Non-Goals for MVP

The first version does not need to include:

-   Fully automated contract generation.
-   Advanced AI campaign optimization.
-   Automated social data collection for every metric.
-   Complex affiliate attribution.
-   Automated fraud detection.
-   Full negotiation chat with versioned offers.

These can be added after the core lifecycle is stable.

------------------------------------------------------------------------

# 4. User Roles

## 4.1 Company User

A company user can:

-   Create and manage campaigns.
-   Save campaigns as drafts.
-   Publish and close campaigns.
-   Review applicants.
-   Shortlist or reject applicants.
-   Send collaboration offers.
-   Confirm campaign participants.
-   Allocate campaign budget.
-   Review deliverables.
-   Request revisions.
-   Approve content.
-   Track campaign performance.
-   Complete or cancel campaigns.

## 4.2 Influencer User

An influencer can:

-   Complete and manage their profile.
-   Connect social accounts.
-   Discover campaigns.
-   Filter campaigns.
-   View eligibility and match information.
-   Apply to campaigns.
-   Submit a proposal and relevant work.
-   Withdraw applications.
-   Accept or decline offers.
-   Manage campaign deliverables.
-   Submit drafts and published links.
-   Track payment status.

## 4.3 Platform Admin

An admin may later support:

-   Campaign moderation.
-   User verification.
-   Dispute handling.
-   Fraud review.
-   Campaign removal.
-   Payment reconciliation.
-   Analytics and audit access.

Admin functionality should be designed separately from the MVP but
audit-friendly records should exist from the beginning.

------------------------------------------------------------------------

# 5. End-to-End User Flow

## 5.1 Main Lifecycle

``` text
┌─────────────┐
│    DRAFT    │
└──────┬──────┘
       │ Company publishes
       ▼
┌─────────────┐
│    OPEN     │◄──────────────────────┐
└──────┬──────┘                       │
       │ Influencers apply            │ New applications
       ▼                              │
┌─────────────┐                       │
│ APPLICATION │───────────────────────┘
│   REVIEW    │
└──────┬──────┘
       │ Shortlist
       ▼
┌─────────────┐
│ SHORTLISTED │
└──────┬──────┘
       │ Company sends offer
       ▼
┌─────────────┐
│ OFFER SENT  │
└──────┬──────┘
       │ Influencer accepts
       ▼
┌─────────────┐
│  CONFIRMED  │
└──────┬──────┘
       │ Campaign starts
       ▼
┌─────────────┐
│   ACTIVE    │
└──────┬──────┘
       │ Deliverables complete
       ▼
┌─────────────┐
│  COMPLETED  │
└─────────────┘
```

An offer may also be declined, withdrawn, or expire. A company can then
select another applicant.

------------------------------------------------------------------------

# 6. Company Campaign Creation Flow

## Step 1: Start Campaign

The company selects **Create Campaign**.

A campaign is immediately created or locally persisted as:

``` text
status = DRAFT
```

The company may save progress and return later.

## Step 2: Basic Information

Required fields:

-   Campaign name.
-   Campaign objective.
-   Campaign description.
-   Industry.
-   Brand/product/service name.
-   Campaign category.
-   Campaign start date.
-   Campaign end date.
-   Application deadline.

Optional fields:

-   Website URL.
-   Landing page URL.
-   Product information.
-   Internal campaign reference.
-   Campaign cover image.

### Campaign Objectives

Suggested values:

-   BRAND_AWARENESS
-   PRODUCT_LAUNCH
-   WEBSITE_TRAFFIC
-   APP_INSTALLS
-   LEAD_GENERATION
-   SALES_CONVERSIONS
-   UGC_CREATION
-   SOCIAL_GROWTH
-   EVENT_PROMOTION
-   OTHER

## Step 3: Influencer Requirements

The company defines the ideal influencer.

### Platform Requirements

One or more:

-   Instagram
-   YouTube
-   TikTok
-   X
-   LinkedIn

### Profile Requirements

-   Minimum followers.
-   Maximum followers.
-   Minimum engagement rate.
-   Influencer location.
-   Country.
-   State or region.
-   City.
-   Content categories.
-   Niches.
-   Languages.
-   Verified account preference.
-   Minimum posting frequency.
-   Minimum account activity.

### Audience Requirements

Where data is available:

-   Audience countries.
-   Audience cities.
-   Audience age ranges.
-   Audience gender distribution.
-   Audience interests.

Requirements should support **required** and **preferred** values.
Required values are used for strict eligibility. Preferred values
influence match score.

## Step 4: Deliverables

The company defines one or more deliverables.

Examples:

### Instagram

-   Reel.
-   Feed post.
-   Carousel.
-   Story.
-   Live session.

### YouTube

-   Dedicated video.
-   Sponsored integration.
-   Short.

### Other

-   UGC asset.
-   Product review.
-   Event appearance.
-   Affiliate promotion.

Each deliverable should support:

-   Deliverable type.
-   Platform.
-   Quantity.
-   Description.
-   Due date.
-   Required CTA.
-   Mandatory hashtags.
-   Mandatory mentions.
-   Content guidelines.
-   Revision limit.

## Step 5: Budget

The company defines:

-   Total campaign budget.
-   Currency.
-   Payment model.
-   Minimum budget per influencer.
-   Maximum budget per influencer.
-   Whether price is fixed or negotiable.

Supported payment models:

-   FIXED
-   NEGOTIABLE
-   RANGE
-   PERFORMANCE_BASED
-   COMMISSION
-   BARTER
-   HYBRID

## Step 6: Influencer Slots

The company defines:

-   Target number of influencers.
-   Maximum number of influencers.
-   Whether applications close automatically when target is reached.

Example:

``` text
targetParticipants = 5
maxParticipants = 10
```

## Step 7: Eligibility Settings

The company chooses:

### Strict Eligibility

Only influencers meeting required criteria can apply.

### Flexible Eligibility

Influencers can apply even if they do not satisfy all preferred
criteria. Zerify displays match and eligibility information to the
company.

Recommended default:

``` text
Flexible Eligibility + transparent Match Score
```

## Step 8: Review and Publish

Before publishing, show:

-   Basic details.
-   Requirements.
-   Deliverables.
-   Budget.
-   Timeline.
-   Number of participants.
-   Application settings.

Actions:

-   Save Draft.
-   Preview.
-   Publish.

On publish:

``` text
status = OPEN
publishedAt = current timestamp
```

------------------------------------------------------------------------

# 7. Campaign Discovery Flow

Influencers access a **Discover Campaigns** page.

## Search

Support:

-   Keyword search.
-   Company name.
-   Campaign name.
-   Industry.
-   Category.

## Filters

### Campaign

-   Objective.
-   Category.
-   Platform.
-   Application deadline.
-   Campaign duration.
-   Campaign status.

### Requirements

-   Minimum follower requirement.
-   Maximum follower requirement.
-   Engagement requirement.
-   Influencer location.
-   Language.
-   Content niche.

### Compensation

-   Minimum budget.
-   Maximum budget.
-   Currency.
-   Payment model.
-   Negotiable only.

### Matching

-   Eligible only.
-   Minimum match score.

## Sorting

-   Best match.
-   Newest.
-   Highest budget.
-   Application deadline.
-   Most relevant.

------------------------------------------------------------------------

# 8. Match and Eligibility System

The system should distinguish between:

## Eligibility

Binary or rule-based.

Examples:

``` text
minimumFollowers >= 10000
platform = INSTAGRAM
location contains INDIA
category intersects [FASHION, BEAUTY]
```

Result:

``` text
ELIGIBLE
PARTIALLY_ELIGIBLE
NOT_ELIGIBLE
```

## Match Score

A numerical score, for example 0-100.

Suggested future calculation:

``` text
Match Score =
Profile Fit × 25%
Audience Fit × 25%
Engagement Fit × 15%
Content/Niche Fit × 20%
Location Fit × 10%
Campaign Experience Fit × 5%
```

The exact algorithm should be configurable and should not be hardcoded
into the UI.

### Important Product Rule

The system must store a match-score snapshot at application time. If an
influencer profile changes later, historical application ranking should
remain explainable.

Example fields:

``` text
matchScoreSnapshot
eligibilitySnapshot
matchReasonsSnapshot
```

------------------------------------------------------------------------

# 9. Influencer Application Flow

## Step 1: Open Campaign

The influencer views:

-   Company information.
-   Campaign objective.
-   Full brief.
-   Requirements.
-   Deliverables.
-   Timeline.
-   Budget.
-   Application deadline.

## Step 2: Eligibility Check

Before applying, show:

``` text
You meet all required criteria.
```

or:

``` text
82% Match
You match most requirements.
```

or:

``` text
You do not meet the minimum follower requirement.
```

The company determines whether non-eligible influencers can continue.

## Step 3: Application Form

The influencer submits:

### Social Profile

If multiple accounts are connected, select the account used for the
campaign.

### Application Message

Explain why they are suitable.

### Proposed Price

Behavior depends on campaign payment model:

-   Fixed: prefilled and locked.
-   Negotiable: influencer proposes price.
-   Range: influencer proposes within or outside range with warning.
-   Barter: no cash proposal required.
-   Hybrid: structured proposal.

### Relevant Work

Optional:

-   Previous campaign links.
-   Portfolio links.
-   Selected social posts.

### Proposed Content Idea

Optional but recommended.

## Step 4: Submit

Initial status:

``` text
APPLIED
```

The application must store snapshots of relevant profile data so later
profile changes do not alter historical evaluation.

## Application Rules

-   One active application per campaign per influencer profile.
-   Influencer cannot duplicate an application with the same social
    account.
-   Influencer may withdraw before offer acceptance.
-   Application editing may be allowed until company review begins or
    the deadline passes.
-   Expired campaigns cannot receive new applications.

------------------------------------------------------------------------

# 10. Application Review Workflow

Company campaign dashboard shows:

``` text
Total Applications
New
Under Review
Shortlisted
Offer Sent
Confirmed
Rejected
Withdrawn
```

## Applicant Card

Display:

-   Influencer name.
-   Primary handle.
-   Match score.
-   Eligibility result.
-   Followers.
-   Engagement.
-   Categories.
-   Location.
-   Proposed price.
-   Application date.

Actions:

-   View profile.
-   Mark under review.
-   Shortlist.
-   Reject.
-   Compare.
-   Send offer.

## Recommended Application Statuses

``` text
APPLIED
UNDER_REVIEW
SHORTLISTED
REJECTED
WITHDRAWN
EXPIRED
OFFER_SENT
OFFER_DECLINED
OFFER_EXPIRED
OFFER_ACCEPTED
```

`CONFIRMED` should belong to the campaign participant relationship
rather than only the application.

------------------------------------------------------------------------

# 11. Influencer Comparison

The company should be able to select multiple applicants and compare
them.

Comparison categories:

## Profile

-   Followers.
-   Engagement rate.
-   Average views.
-   Posting frequency.
-   Growth.

## Audience

When available:

-   Countries.
-   Cities.
-   Age distribution.
-   Gender distribution.
-   Interests.

## Content

-   Niche.
-   Recent content.
-   Portfolio.
-   Relevant campaign work.

## Commercial

-   Proposed price.
-   Estimated cost per engagement.
-   Estimated cost per view.
-   Historical performance, where available.

## Zerify Trust Metrics

Future:

-   Response rate.
-   Completion rate.
-   Reliability score.
-   Average review score.
-   Cancellation history.

------------------------------------------------------------------------

# 12. Shortlisting and Selection

Shortlisting does not create a binding collaboration.

Flow:

``` text
APPLIED
   ↓
UNDER_REVIEW
   ↓
SHORTLISTED
   ↓
OFFER_SENT
   ↓
ACCEPTED / DECLINED
```

The company can shortlist more influencers than available campaign
slots.

Example:

``` text
Target Participants: 5
Shortlisted: 12
Offers Sent: 7
Confirmed: 5
```

------------------------------------------------------------------------

# 13. Offer Flow

## Company Sends Offer

An offer should include:

-   Campaign participant.
-   Final compensation.
-   Currency.
-   Deliverables.
-   Start date.
-   End date.
-   Response deadline.
-   Payment terms.
-   Any custom notes.

The offer must be stored independently so the company has a historical
record.

## Influencer Actions

-   Accept.
-   Decline.
-   Allow offer to expire.

On acceptance:

``` text
CampaignParticipant is created
participant.status = CONFIRMED
```

On decline:

``` text
application.status = OFFER_DECLINED
```

The company may send an offer to another applicant.

------------------------------------------------------------------------

# 14. Multi-Influencer Campaign Architecture

A campaign must support multiple confirmed participants.

Do not model this as a simple `campaign.influencerId`.

Recommended relationship:

``` text
Campaign
   │
   ├── CampaignApplications
   │       ├── Application A
   │       ├── Application B
   │       └── Application C
   │
   └── CampaignParticipants
           ├── Participant A
           │      ├── Deliverables
           │      ├── Payment Allocation
           │      └── Performance
           │
           └── Participant B
                  ├── Deliverables
                  ├── Payment Allocation
                  └── Performance
```

This enables each influencer to have independent:

-   Price.
-   Deliverables.
-   Deadlines.
-   Approval state.
-   Payment.
-   Performance.

------------------------------------------------------------------------

# 15. Campaign Workspace

After confirmation, company and influencer access a shared campaign
workspace.

## Sections

### Overview

-   Campaign details.
-   Timeline.
-   Participant status.
-   Important deadlines.

### Brief

-   Guidelines.
-   Mandatory mentions.
-   Hashtags.
-   CTA.
-   Assets.
-   Reference content.

### Deliverables

Task-style tracking.

Example:

``` text
Receive Product
Create Draft
Submit Draft
Revision
Approval
Publish
Submit Live URL
Verify
```

### Communication

Campaign-specific messaging can be introduced in a later phase. The
database should be extensible for conversations and messages.

### Files

-   Brand assets.
-   Product images.
-   Logos.
-   Brief PDFs.
-   Reference links.

------------------------------------------------------------------------

# 16. Deliverable Workflow

Recommended state machine:

``` text
PENDING
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   ↓
┌───────────────┬──────────────────┐
│               │                  │
▼               ▼                  │
APPROVED    REVISION_REQUESTED ────┘
   ↓
READY_TO_PUBLISH
   ↓
PUBLISHED
   ↓
VERIFIED
```

## Influencer Actions

-   Start work.
-   Submit draft.
-   Upload file or link.
-   Resubmit after revision.
-   Submit published URL.

## Company Actions

-   Approve.
-   Request revision.
-   Reject according to campaign rules.

Every revision should be auditable.

------------------------------------------------------------------------

# 17. Publishing and Verification

Influencer submits:

-   Published URL.
-   Platform.
-   Published timestamp.
-   Optional screenshot or proof.

Initial state:

``` text
PUBLISHED
```

Future automated verification can check connected social accounts.

After verification:

``` text
VERIFIED
```

Manual verification must be available for platforms or APIs where
automated verification is unavailable.

------------------------------------------------------------------------

# 18. Performance Tracking

Performance should be stored at two levels.

## Deliverable Level

For individual posts:

-   Views.
-   Reach.
-   Impressions.
-   Likes.
-   Comments.
-   Shares.
-   Saves.
-   Clicks.

## Participant Level

Aggregated across deliverables.

## Campaign Level

Aggregate:

-   Total reach.
-   Total impressions.
-   Total views.
-   Total engagement.
-   Total spend.
-   Cost per engagement.
-   Cost per view.
-   Conversions, where tracking exists.
-   Revenue.
-   ROI/ROAS, where tracking exists.

Metrics should support periodic snapshots rather than overwriting
historical data.

------------------------------------------------------------------------

# 19. Payment Integration

The campaign workflow should integrate with Zerify's payment system but
remain decoupled from a specific provider.

Recommended flow:

``` text
Offer accepted
      ↓
Participant compensation confirmed
      ↓
Company funds campaign / payment requirement created
      ↓
Funds associated with participant
      ↓
Deliverables completed
      ↓
Company approval / release conditions satisfied
      ↓
Payout initiated
      ↓
Payout completed
```

For multi-influencer campaigns, each participant must have independent
financial allocation.

Example:

``` text
Campaign Budget: ₹100,000

Participant A: ₹20,000
Participant B: ₹20,000
Participant C: ₹15,000
Participant D: ₹25,000
Participant E: ₹20,000
```

The campaign budget must not be considered automatically spent until
payment state confirms the financial action.

------------------------------------------------------------------------

# 20. Campaign Completion

A campaign can be completed when:

-   Required participants have completed their obligations.
-   Required deliverables are verified or accepted.
-   Payment release conditions are met.
-   No unresolved critical disputes remain.

Final status:

``` text
COMPLETED
```

Future:

-   Company review of influencer.
-   Influencer review of company.
-   Collaboration history.
-   Rehire/saved creator functionality.

------------------------------------------------------------------------

# 21. Status Design

## Campaign Status

Recommended MVP:

``` text
DRAFT
OPEN
FILLING
ACTIVE
COMPLETED
CANCELLED
PAUSED
```

Suggested transitions:

``` text
DRAFT → OPEN
OPEN → FILLING
FILLING → ACTIVE
ACTIVE → COMPLETED

OPEN/FILLING/ACTIVE → PAUSED
OPEN/FILLING/ACTIVE → CANCELLED
```

`FILLING` can be entered when at least one offer or confirmed
participant exists.

## Application Status

``` text
APPLIED
UNDER_REVIEW
SHORTLISTED
REJECTED
WITHDRAWN
EXPIRED
OFFER_SENT
OFFER_ACCEPTED
OFFER_DECLINED
OFFER_EXPIRED
```

## Participant Status

``` text
CONFIRMED
ACTIVE
COMPLETED
CANCELLED
```

## Deliverable Status

``` text
PENDING
IN_PROGRESS
SUBMITTED
REVISION_REQUESTED
APPROVED
READY_TO_PUBLISH
PUBLISHED
VERIFIED
REJECTED
```

------------------------------------------------------------------------

# 22. Database Design

The following design assumes MongoDB with Mongoose, aligned with
Zerify's existing JavaScript/TypeScript stack.

## 22.1 Entity Relationship Diagram

``` text
┌───────────────┐
│     User      │
└───────┬───────┘
        │
        ├──────────────┐
        ▼              ▼
┌───────────────┐  ┌─────────────────┐
│CompanyProfile │  │InfluencerProfile│
└───────┬───────┘  └────────┬────────┘
        │                   │
        ▼                   ▼
┌───────────────┐      ┌───────────────┐
│   Campaign    │◄─────│SocialAccount  │
└───────┬───────┘      └───────────────┘
        │
        ├───────────────────────────┐
        ▼                           ▼
┌───────────────────┐      ┌───────────────────┐
│CampaignApplication│      │CampaignParticipant│
└─────────┬─────────┘      └─────────┬─────────┘
          │                          │
          │                          ├──────────┐
          │                          ▼          ▼
          │                   ┌───────────┐ ┌──────────┐
          │                   │Deliverable│ │ Payment  │
          │                   └─────┬─────┘ └──────────┘
          │                         │
          ▼                         ▼
      Application             PerformanceMetric
      Snapshot
```

------------------------------------------------------------------------

# 23. Core Collections

## 23.1 User

The existing user system should remain the identity source.

Key fields:

``` typescript
{
  _id: ObjectId,
  email: string,
  role: "COMPANY" | "INFLUENCER" | "ADMIN",
  status: "ACTIVE" | "SUSPENDED",
  createdAt: Date,
  updatedAt: Date
}
```

## 23.2 CompanyProfile

``` typescript
{
  _id: ObjectId,
  userId: ObjectId,
  companyName: string,
  displayName: string,
  industry: string,
  description: string,
  website: string,
  logoUrl: string,
  headquarters: {
    country: string,
    state: string,
    city: string
  },
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED",
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
userId unique
companyName
industry
```

## 23.3 InfluencerProfile

``` typescript
{
  _id: ObjectId,
  userId: ObjectId,
  displayName: string,
  bio: string,
  location: {
    country: string,
    state: string,
    city: string
  },
  languages: [string],
  categories: [string],
  niches: [string],
  portfolioUrls: [string],
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
userId unique
categories
niches
location.country
location.city
```

## 23.4 SocialAccount

Store connected social identities separately.

``` typescript
{
  _id: ObjectId,
  influencerProfileId: ObjectId,
  platform: "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "X" | "LINKEDIN",
  platformUserId: string,
  username: string,
  profileUrl: string,
  followersCount: number,
  followingCount: number,
  postsCount: number,
  engagementRate: number,
  averageViews: number,
  isVerified: boolean,
  isPublic: boolean,
  lastSyncedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
platform + platformUserId unique
influencerProfileId
platform
followersCount
engagementRate
username
```

------------------------------------------------------------------------

# 24. Campaign Schema

``` typescript
{
  _id: ObjectId,
  companyId: ObjectId,

  title: string,
  slug: string,
  objective: string,
  description: string,

  industry: string,
  categories: [string],

  product: {
    name: string,
    description: string,
    websiteUrl: string,
    landingPageUrl: string
  },

  status: CampaignStatus,

  platforms: [Platform],

  requirements: {
    strictEligibility: boolean,

    social: {
      minFollowers: number,
      maxFollowers: number,
      minEngagementRate: number,
      verifiedOnly: boolean,
      minPostingFrequency: number
    },

    influencer: {
      countries: [string],
      states: [string],
      cities: [string],
      languages: [string],
      categories: [string],
      niches: [string]
    },

    audience: {
      countries: [string],
      cities: [string],
      minAge: number,
      maxAge: number,
      genderPreferences: [string],
      interests: [string]
    }
  },

  budget: {
    totalAmount: number,
    currency: string,
    paymentModel: PaymentModel,
    minPerInfluencer: number,
    maxPerInfluencer: number
  },

  participantSettings: {
    targetParticipants: number,
    maxParticipants: number,
    autoCloseWhenFilled: boolean
  },

  timeline: {
    applicationDeadline: Date,
    startDate: Date,
    endDate: Date
  },

  contentGuidelines: {
    description: string,
    requiredHashtags: [string],
    requiredMentions: [string],
    requiredCtas: [string],
    referenceUrls: [string],
    assetUrls: [string]
  },

  publishedAt: Date,
  applicationsClosedAt: Date,
  completedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Recommended indexes:

``` text
companyId + status
status + timeline.applicationDeadline
categories
platforms
requirements.influencer.countries
budget.totalAmount
createdAt
```

------------------------------------------------------------------------

# 25. Campaign Application Schema

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  influencerProfileId: ObjectId,
  socialAccountId: ObjectId,

  status: ApplicationStatus,

  applicationMessage: string,

  proposal: {
    proposedAmount: number,
    currency: string,
    contentIdea: string,
    portfolioUrls: [string]
  },

  matchSnapshot: {
    score: number,
    eligibility: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "NOT_ELIGIBLE",
    reasons: [
      {
        criterion: string,
        result: "MATCHED" | "PARTIAL" | "NOT_MATCHED",
        weight: number,
        details: string
      }
    ],
    calculatedAt: Date,
    algorithmVersion: string
  },

  profileSnapshot: {
    displayName: string,
    username: string,
    platform: string,
    followersCount: number,
    engagementRate: number,
    categories: [string],
    location: {
      country: string,
      state: string,
      city: string
    }
  },

  review: {
    reviewedBy: ObjectId,
    reviewedAt: Date,
    notes: string
  },

  submittedAt: Date,
  withdrawnAt: Date,
  rejectedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Critical unique index:

``` text
campaignId + socialAccountId unique
```

This prevents duplicate applications using the same social account.

Recommended additional indexes:

``` text
campaignId + status
influencerProfileId + createdAt
campaignId + matchSnapshot.score
```

------------------------------------------------------------------------

# 26. Campaign Offer Schema

Offers should be separate from applications to preserve negotiation and
decision history.

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  applicationId: ObjectId,
  influencerProfileId: ObjectId,

  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED",

  compensation: {
    amount: number,
    currency: string,
    paymentModel: PaymentModel
  },

  startDate: Date,
  endDate: Date,
  responseDeadline: Date,

  termsSnapshot: object,

  sentBy: ObjectId,
  sentAt: Date,
  respondedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Recommended indexes:

``` text
campaignId + status
applicationId
influencerProfileId + status
responseDeadline
```

------------------------------------------------------------------------

# 27. Campaign Participant Schema

This is the central relationship after offer acceptance.

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  influencerProfileId: ObjectId,
  socialAccountId: ObjectId,
  applicationId: ObjectId,
  offerId: ObjectId,

  status: "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED",

  compensation: {
    agreedAmount: number,
    currency: string,
    paymentModel: PaymentModel
  },

  allocationStatus: "PENDING" | "ALLOCATED" | "FUNDED" | "RELEASED",

  joinedAt: Date,
  startedAt: Date,
  completedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Unique index:

``` text
campaignId + influencerProfileId unique
```

Recommended indexes:

``` text
campaignId + status
influencerProfileId + status
```

------------------------------------------------------------------------

# 28. Deliverable Schema

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  participantId: ObjectId,

  platform: Platform,
  type: string,

  title: string,
  description: string,

  quantity: number,
  dueDate: Date,

  status: DeliverableStatus,

  submission: {
    contentUrls: [string],
    notes: string,
    submittedAt: Date
  },

  review: {
    status: "PENDING" | "APPROVED" | "REVISION_REQUESTED" | "REJECTED",
    reviewedBy: ObjectId,
    reviewedAt: Date,
    comments: string,
    revisionCount: number
  },

  publication: {
    publishedUrl: string,
    publishedAt: Date,
    proofUrls: [string],
    verifiedAt: Date,
    verifiedBy: ObjectId
  },

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
participantId + status
campaignId + status
dueDate + status
```

------------------------------------------------------------------------

# 29. Deliverable Revision Schema

For complete auditability, revisions should eventually be separated.

``` typescript
{
  _id: ObjectId,
  deliverableId: ObjectId,
  version: number,
  submittedBy: ObjectId,
  files: [string],
  notes: string,
  status: "SUBMITTED" | "APPROVED" | "REVISION_REQUESTED" | "REJECTED",
  reviewComments: string,
  createdAt: Date
}
```

This can be introduced in Phase 2 if the MVP initially embeds revision
information in `Deliverable`.

------------------------------------------------------------------------

# 30. Payment Schema

Payment provider implementation should be abstracted.

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  participantId: ObjectId,

  companyId: ObjectId,
  influencerProfileId: ObjectId,

  amount: number,
  currency: string,

  type: "CAMPAIGN_FUNDING" | "PARTICIPANT_ALLOCATION" | "PAYOUT" | "REFUND",

  status: "PENDING" | "PROCESSING" | "FUNDED" | "HELD" | "RELEASED" | "FAILED" | "REFUNDED",

  provider: string,
  providerTransactionId: string,

  releaseCondition: string,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
participantId + status
campaignId + status
providerTransactionId
```

------------------------------------------------------------------------

# 31. Performance Metric Schema

Metrics should be stored as snapshots.

``` typescript
{
  _id: ObjectId,

  campaignId: ObjectId,
  participantId: ObjectId,
  deliverableId: ObjectId,

  platform: Platform,

  metrics: {
    views: number,
    reach: number,
    impressions: number,
    likes: number,
    comments: number,
    shares: number,
    saves: number,
    clicks: number,
    conversions: number,
    revenue: number
  },

  capturedAt: Date,
  source: "API" | "MANUAL" | "VERIFIED_IMPORT",

  createdAt: Date
}
```

Indexes:

``` text
campaignId + capturedAt
participantId + capturedAt
deliverableId + capturedAt
```

------------------------------------------------------------------------

# 32. Recommended API Design

Base route:

``` text
/api/v1
```

## Campaign APIs

``` text
POST   /campaigns
GET    /campaigns
GET    /campaigns/:campaignId
PATCH  /campaigns/:campaignId
DELETE /campaigns/:campaignId

POST   /campaigns/:campaignId/publish
POST   /campaigns/:campaignId/pause
POST   /campaigns/:campaignId/close-applications
POST   /campaigns/:campaignId/cancel
```

## Discovery APIs

``` text
GET /campaigns/discover
GET /campaigns/discover/filters
GET /campaigns/:campaignId/match
```

Example query:

``` text
GET /campaigns/discover?
platform=INSTAGRAM&
category=FASHION&
minBudget=10000&
country=IN&
minMatchScore=70&
sort=BEST_MATCH
```

## Application APIs

``` text
POST /campaigns/:campaignId/applications
GET  /campaigns/:campaignId/applications
GET  /applications/:applicationId
PATCH /applications/:applicationId
POST /applications/:applicationId/withdraw
POST /applications/:applicationId/review
POST /applications/:applicationId/shortlist
POST /applications/:applicationId/reject
```

## Offer APIs

``` text
POST /applications/:applicationId/offers
GET  /offers/:offerId
POST /offers/:offerId/accept
POST /offers/:offerId/decline
POST /offers/:offerId/cancel
```

## Participant APIs

``` text
GET   /campaigns/:campaignId/participants
GET   /participants/:participantId
POST  /participants/:participantId/start
POST  /participants/:participantId/complete
POST  /participants/:participantId/cancel
```

## Deliverable APIs

``` text
GET   /participants/:participantId/deliverables
POST  /participants/:participantId/deliverables
GET   /deliverables/:deliverableId
PATCH /deliverables/:deliverableId
POST  /deliverables/:deliverableId/submit
POST  /deliverables/:deliverableId/request-revision
POST  /deliverables/:deliverableId/approve
POST  /deliverables/:deliverableId/publish
POST  /deliverables/:deliverableId/verify
```

## Payment APIs

Provider-specific endpoints should be hidden behind a payment service.

``` text
POST /campaigns/:campaignId/funding
GET  /campaigns/:campaignId/payments
GET  /participants/:participantId/payment
POST /participants/:participantId/payment/release
```

------------------------------------------------------------------------

# 33. Permission Rules

## Company

Can access only:

-   Its own campaigns.
-   Applications to its campaigns.
-   Offers sent by its campaigns.
-   Participants in its campaigns.
-   Campaign deliverables.
-   Campaign payment records.

## Influencer

Can access only:

-   Public/open campaigns.
-   Their own applications.
-   Offers sent to them.
-   Campaigns where they are confirmed participants.
-   Their own deliverables.
-   Their own payment information.

## Admin

Access controlled separately through administrative permissions.

Every sensitive update should validate ownership server-side.
Client-side visibility must never be treated as authorization.

------------------------------------------------------------------------

# 34. Important Business Rules

## Campaign

1.  A campaign cannot be published without required fields.
2.  Application deadline must be before campaign start date.
3.  Campaign end date must be after start date.
4.  Target participants must be greater than zero.
5.  Maximum participants must be greater than or equal to target
    participants.
6.  Campaign cannot accept applications after closure or deadline.
7.  Company cannot exceed configured participant capacity without
    explicit override.

## Application

1.  One active application per campaign/social account.
2.  Influencer must own the selected social account.
3.  Application must be submitted before deadline.
4.  Application snapshots must be immutable after submission.
5.  Rejected applications cannot directly be accepted without a new
    workflow action.

## Offer

1.  Offer can only be sent by the campaign owner.
2.  Offer can only be sent to a valid campaign applicant.
3.  Offer expiration must be enforced server-side.
4.  Accepting an offer must be transactional/idempotent.
5.  Accepted offer creates exactly one participant.

## Participant

1.  A participant belongs to one campaign.
2.  Each participant has independent compensation.
3.  Each participant can have independent deliverable progress.
4.  Participant cannot be duplicated for the same campaign/influencer
    combination.

## Deliverables

1.  Only the assigned influencer can submit work.
2.  Only authorized company users can approve or request revisions.
3.  Published status requires publication information.
4.  Verified status requires a verification event.

------------------------------------------------------------------------

# 35. Notifications

The system should notify users for major state changes.

## Influencer Notifications

-   Campaign application received.
-   Application shortlisted.
-   Offer received.
-   Offer deadline approaching.
-   Offer accepted confirmation.
-   Revision requested.
-   Deliverable approved.
-   Deadline approaching.
-   Payment released.

## Company Notifications

-   New application.
-   High-match application.
-   Influencer accepts/declines offer.
-   Deliverable submitted.
-   Deliverable deadline approaching.
-   Published content submitted.
-   Campaign participant completed.

Notification delivery can later support:

-   In-app.
-   Email.
-   Push.

Recommended data model:

``` text
Notification {
  userId,
  type,
  title,
  body,
  entityType,
  entityId,
  readAt,
  createdAt
}
```

------------------------------------------------------------------------

# 36. UI Pages

## Company

### Campaign Management

-   Campaign list.
-   Create campaign wizard.
-   Draft editor.
-   Campaign preview.
-   Campaign overview dashboard.
-   Application list.
-   Applicant comparison.
-   Offer management.
-   Participant management.
-   Deliverables dashboard.
-   Payment dashboard.
-   Campaign analytics.

## Influencer

### Campaign Discovery

-   Discover page.
-   Search and filters.
-   Campaign details.
-   Match explanation.
-   Application form.
-   My applications.
-   Offer inbox.
-   My collaborations.
-   Deliverable workspace.
-   Payment history.

------------------------------------------------------------------------

# 37. Recommended MVP Scope

## Phase 1: Core Discovery

Build:

-   Company campaign creation.
-   Draft/publish.
-   Campaign listing.
-   Discovery search.
-   Core filters.
-   Influencer application.
-   Application management.
-   Shortlisting.
-   Offer acceptance/decline.
-   Campaign participant creation.

## Phase 2: Collaboration

Build:

-   Campaign workspace.
-   Deliverable management.
-   Draft submission.
-   Revision workflow.
-   Approval.
-   Published link submission.

## Phase 3: Payments

Build:

-   Participant-level compensation.
-   Funding records.
-   Payment status.
-   Provider integration.
-   Release workflow.
-   Refund/dispute extensions.

## Phase 4: Intelligence

Build:

-   Match score.
-   Match explanations.
-   Advanced audience matching.
-   Influencer comparison.
-   Performance analytics.
-   Recommendations.

------------------------------------------------------------------------

# 38. Success Metrics

## Discovery

-   Campaign views.
-   Search-to-detail conversion.
-   Detail-to-application conversion.
-   Average applications per campaign.
-   Percentage of campaigns receiving at least one qualified
    application.

## Matching

-   Percentage of shortlisted applicants with match score above
    threshold.
-   Match score versus final selection correlation.
-   Application acceptance rate.

## Collaboration

-   Offer acceptance rate.
-   Time from application to selection.
-   Deliverable completion rate.
-   Revision rate.
-   Campaign completion rate.

## Marketplace

-   Repeat company campaign creation.
-   Repeat influencer collaborations.
-   Average time to fill participant slots.
-   Total campaign GMV, where applicable.

------------------------------------------------------------------------

# 39. Risks and Edge Cases

## Too Many Applications

Mitigation:

-   Pagination.
-   Filters.
-   Ranking.
-   Match score.
-   Shortlisting.
-   Application limits in future.

## No Applications

Allow:

-   Campaign extension.
-   Requirement relaxation.
-   Suggested influencer outreach in a future version.

## Influencer Accepts Multiple Campaigns

Do not block by default, but expose potential schedule conflicts in
future.

## Influencer Becomes Inactive

Store profile and application snapshots so historical records remain
intact.

## Campaign Cancelled After Offers

Cancellation rules must determine:

-   Whether offers are automatically cancelled.
-   Whether participants are notified.
-   Whether funds are refunded.

## Payment Failure

Campaign collaboration status and payment status must remain separate.
Never mark payment complete solely because a provider request was
initiated.

## Deadline Expiry

Use server-side jobs/cron processing to:

-   Expire offers.
-   Close applications.
-   Send reminders.
-   Flag overdue deliverables.

------------------------------------------------------------------------

# 40. Technical Architecture Recommendation

``` text
Next.js / React Frontend
          │
          ▼
API Layer / Backend
          │
 ┌────────┼──────────────┐
 ▼        ▼              ▼
Campaign  Matching     Collaboration
Service   Service      Service
 │        │              │
 └────────┼──────────────┘
          ▼
      MongoDB
          │
          ├── Payment Provider Adapter
          ├── Social Platform Integrations
          ├── Object/File Storage
          └── Notification Service
```

For the MVP, these do not need to be physically separate microservices.
They can be modular service layers inside one backend. Keep interfaces
clean so matching, payment, and social integrations can later be
extracted.

------------------------------------------------------------------------

# 41. Recommended Transaction-Sensitive Operations

Use MongoDB transactions where supported or carefully designed
idempotent operations for:

## Offer Acceptance

``` text
Verify offer is PENDING
        ↓
Verify not expired
        ↓
Mark offer ACCEPTED
        ↓
Update application OFFER_ACCEPTED
        ↓
Create CampaignParticipant
        ↓
Increment campaign confirmed count if stored
        ↓
Commit
```

## Payment Release

``` text
Verify release conditions
        ↓
Verify payment not already released
        ↓
Create payout action
        ↓
Record provider transaction
        ↓
Update payment status
```

Never rely only on frontend button disabling for duplicate prevention.

------------------------------------------------------------------------

# 42. Future Enhancements

-   AI influencer recommendations.
-   Invite influencers directly to campaigns.
-   Campaign templates.
-   Saved searches.
-   Saved influencer lists.
-   Rehire previous creators.
-   Automated contracts.
-   In-platform negotiation.
-   Team collaboration and company roles.
-   Automated social verification.
-   Audience authenticity scoring.
-   Fraud detection.
-   Affiliate links and conversion attribution.
-   A/B testing across influencer groups.
-   Predictive campaign performance.
-   Influencer reliability score.

------------------------------------------------------------------------

# 43. Final Recommended Core Data Relationship

``` text
User
 ├── CompanyProfile
 │      └── Campaign
 │             ├── CampaignApplication
 │             │       └── CampaignOffer
 │             │               └── CampaignParticipant
 │             │
 │             └── CampaignParticipant
 │                     ├── Deliverable
 │                     │       ├── DeliverableRevision
 │                     │       └── PerformanceMetric
 │                     │
 │                     └── Payment
 │
 └── InfluencerProfile
        └── SocialAccount
```

The most important architectural principle is:

> **Application, Offer, and Campaign Participation must be separate
> entities.**

This allows Zerify to accurately model the lifecycle:

``` text
Discovery
   ↓
Application
   ↓
Evaluation
   ↓
Shortlisting
   ↓
Offer
   ↓
Acceptance
   ↓
Participant
   ↓
Deliverables
   ↓
Performance
   ↓
Payment
```

This design supports both an MVP and future marketplace-scale expansion
without forcing Zerify to redesign the fundamental campaign relationship
later.
