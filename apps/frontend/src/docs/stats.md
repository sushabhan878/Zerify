# Statistics & Analytics PRD (stats.md)

# Zerify Product Requirements Document

## Module: Statistics, Traffic & Analytics

------------------------------------------------------------------------

# Vision

The Analytics module should answer one question:

> "How is my creator/business growing, and what should I do next?"

Unlike the Dashboard (action-focused), this module is insight-focused.

------------------------------------------------------------------------

# Data Sources

The platform aggregates data from:

-   Instagram Graph API
-   YouTube Data API
-   TikTok API (where available)
-   Facebook Graph API
-   X (Twitter) API (optional)
-   LinkedIn API (Brands)
-   Internal Zerify data
-   Campaign performance
-   Click tracking links
-   UTM parameters
-   Pixel/server-side events

------------------------------------------------------------------------

# Statistics Page

## 1. Overview KPIs

Influencer - Total Followers - Total Reach - Total Impressions - Total
Engagement - Engagement Rate - Average Views - Profile Visits - Link
Clicks - Collaboration Earnings - Brand Invitations

Brand - Active Campaigns - Total Creators - Campaign Reach - Campaign
Impressions - Engagement - Conversions - Spend - ROI

------------------------------------------------------------------------

## 2. Audience Growth

Charts

-   Followers over time
-   Daily growth
-   Weekly growth
-   Monthly growth
-   Growth prediction (AI)

Benefit

Shows long-term creator growth.

Implementation

Store daily snapshots from each social platform and plot time-series
charts.

------------------------------------------------------------------------

## 3. Engagement Analytics

Metrics

-   Likes
-   Comments
-   Shares
-   Saves
-   Watch Time
-   Average Watch %
-   Story Replies
-   Story Completion
-   Reel Completion

Derived KPIs

-   Engagement Rate
-   Engagement per 1,000 followers
-   Save Rate
-   Share Rate

------------------------------------------------------------------------

## 4. Audience Insights

Show

-   Age
-   Gender
-   Country
-   City
-   Language
-   Active hours
-   Device type

Benefit

Helps brands evaluate audience quality.

------------------------------------------------------------------------

## 5. Content Performance

Top Posts

Display

-   Thumbnail
-   Platform
-   Reach
-   Views
-   Engagement
-   CTR
-   Saves
-   Shares

AI should identify

-   Best performing content
-   Worst performing content
-   Best posting day
-   Best posting time

------------------------------------------------------------------------

## 6. Platform Breakdown

Separate analytics for

-   Instagram
-   YouTube
-   TikTok
-   Facebook
-   X

------------------------------------------------------------------------

## 7. Campaign Performance

Metrics

-   Campaign Reach
-   Engagement
-   Link Clicks
-   Conversion Rate
-   Revenue Generated
-   Cost per Engagement
-   Cost per Click
-   ROI

------------------------------------------------------------------------

## 8. AI Insights

Examples

-   Engagement increased 23% this month.
-   Video posts outperform image posts by 41%.
-   Audience is most active between 7--9 PM.
-   Fashion content receives 2.3× more saves.
-   Post on Wednesday evening for higher reach.

------------------------------------------------------------------------

# Traffic Page

Purpose

Understand where visitors come from and how they convert.

------------------------------------------------------------------------

## Acquisition

Traffic Sources

-   Instagram
-   YouTube
-   TikTok
-   Facebook
-   Google
-   Direct
-   Referral
-   Email
-   QR Codes

Chart

Traffic source distribution.

Implementation

Use UTM parameters, short links, redirect service and server-side
attribution.

------------------------------------------------------------------------

## Link Analytics

Track

-   Bio Link Clicks
-   Story Link Clicks
-   Swipe Ups
-   Campaign Links
-   Affiliate Links

Display

CTR Clicks Unique Visitors

------------------------------------------------------------------------

## Funnel

Creator

Profile View

↓

Media Kit Open

↓

Brand Contact

↓

Campaign Invitation

↓

Accepted

↓

Completed

Brand

Campaign View

↓

Applications

↓

Shortlisted

↓

Accepted

↓

Completed

Benefit

Identify where users drop off.

------------------------------------------------------------------------

## Geographic Traffic

Maps

-   Country
-   State
-   City

Useful for targeting.

------------------------------------------------------------------------

## Device Analytics

-   Android
-   iOS
-   Desktop
-   Tablet

Browser

-   Chrome
-   Safari
-   Firefox
-   Edge

------------------------------------------------------------------------

## Visitor Analytics

-   New Visitors
-   Returning Visitors
-   Session Duration
-   Bounce Rate
-   Pages per Session

------------------------------------------------------------------------

## UTM Campaign Analytics

Track

utm_source utm_medium utm_campaign utm_content

Useful for measuring influencer campaign effectiveness.

------------------------------------------------------------------------

## Referral Analytics

Show

Top referring creators

Top referring brands

Affiliate performance

Referral revenue

------------------------------------------------------------------------

## Real-Time Analytics

Display

Live Visitors

Current Link Clicks

Live Applications

Live Messages

New Followers

------------------------------------------------------------------------

# Activity Page

Recommendation: Do NOT keep it as a standalone page.

Reason

Most activity belongs inside:

-   Notifications
-   Messages
-   Dashboard
-   Campaign Timeline

A separate Activity page often has low engagement and duplicates
information.

Instead create:

# Notification Center

Include

-   New brand invitations
-   Campaign updates
-   Payment released
-   Application accepted
-   Message received
-   Content approved
-   Collaboration completed
-   Profile viewed
-   AI recommendations

Provide filters

-   All
-   Unread
-   Campaigns
-   Payments
-   Messages
-   System

This offers more value than a generic activity feed.

------------------------------------------------------------------------

# Suggested New Pages

## Creator Insights

AI-generated growth report with recommendations.

## Competitor Benchmark

Compare creator against similar creators:

-   Followers
-   Engagement
-   Posting frequency
-   Estimated earnings

## Revenue Analytics

-   Earnings over time
-   Pending payouts
-   Completed payouts
-   Revenue by platform
-   Revenue by brand
-   Revenue by campaign

## Audience Quality

-   Fake follower detection
-   Engagement authenticity
-   Audience quality score
-   Brand safety score

## Goals

Allow creators to set goals:

-   Reach 100K followers
-   Earn \$5,000/month
-   Complete 20 collaborations

Track progress automatically.

------------------------------------------------------------------------

# Technical Implementation

Backend

-   Scheduled sync jobs (hourly/daily)
-   Webhooks where supported
-   ETL pipeline to normalize platform metrics
-   Time-series tables for historical snapshots
-   Aggregation layer for dashboards
-   AI insight engine using historical trends

Frontend

-   Interactive charts
-   Date-range selector
-   Platform filters
-   Export CSV/PDF
-   Responsive dashboards
-   Cached analytics for fast loading

------------------------------------------------------------------------

# Success Metrics

-   Analytics page DAU
-   Export usage
-   Average session duration
-   Campaign optimization improvements
-   Increase in creator applications
-   Increase in collaboration completion
-   Higher retention driven by analytics usage
