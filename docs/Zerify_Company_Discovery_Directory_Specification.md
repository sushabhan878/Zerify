# Zerify --- Company Discovery Directory

## Complete Search, Filter, Field & Data Specification

**Purpose:** This document defines the recommended fields, filters,
sorting options, data model, and UI structure for the **Creator →
Company Discovery Directory** in Zerify.

The goal is to help creators discover and evaluate the most relevant
companies and campaign opportunities based on profile compatibility,
campaign requirements, budget, platform, niche, audience alignment, and
trust signals.

------------------------------------------------------------------------

# 1. Product Objective

The Company Discovery Directory should answer:

> **Which companies and campaign opportunities are most relevant to this
> creator?**

The directory should not function as a simple list of companies. Zerify
should progressively evolve it into a **matching and opportunity
discovery system**.

Each company or campaign can be evaluated using:

-   Basic company relevance
-   Campaign relevance
-   Creator eligibility
-   Audience compatibility
-   Content/niche compatibility
-   Budget compatibility
-   Platform compatibility
-   Location compatibility
-   Historical performance
-   Trust and response signals

------------------------------------------------------------------------

# 2. Recommended Page Structure

## 2.1 Header

Fields:

-   Page title: `Company Discovery Directory`
-   Supporting text:
    `Find brands and opportunities matching your profile niche`
-   Total results count
-   Active filter count

Example:

``` text
Company Discovery Directory
Find brands and opportunities matching your profile niche

248 opportunities found
```

------------------------------------------------------------------------

## 2.2 Full-Width Search Bar

The primary search field should span most or all of the available
content width.

### Placeholder

``` text
Search brands, industries, products, campaigns or keywords...
```

### Searchable Fields

The search should match against:

-   Company name
-   Company description
-   Industry
-   Primary category
-   Sub-categories
-   Products
-   Services
-   Campaign title
-   Campaign description
-   Campaign keywords
-   Required creator niche
-   Target audience interests
-   Company location
-   Campaign location
-   Platform
-   Brand values
-   Hashtags/keywords
-   Product type

### Example Searches

``` text
Nike
Skincare
AI SaaS
Protein powder
Gaming headset
Product launch
Fitness brand
Indian fashion
Women 18-24
UGC
```

------------------------------------------------------------------------

# 3. Quick Filters

These filters should remain visible directly below the search bar.

Recommended quick filters:

1.  Category / Industry
2.  Budget Range
3.  Match Score
4.  Platform
5.  Campaign Type
6.  Compensation Type
7.  Location
8.  All Filters

Recommended UI:

``` text
[ All ]
[ Category ▾ ]
[ Budget ▾ ]
[ 80%+ Match ▾ ]
[ Platform ▾ ]
[ Campaign Type ▾ ]
[ Paid Only ▾ ]
[ Location ▾ ]
[ ⚙ All Filters ]
```

------------------------------------------------------------------------

# 4. Complete Filter Specification

# A. Category and Industry Filters

## A.1 Primary Industry

Recommended multi-select values:

-   Tech & AI
-   Fashion & Apparel
-   Beauty & Skincare
-   Fitness & Wellness
-   Gaming & Hardware
-   Food & Beverage
-   Finance & Fintech
-   Travel & Hospitality
-   Education
-   Entertainment
-   SaaS
-   E-commerce
-   Automotive
-   Lifestyle
-   Healthcare
-   Home & Living
-   Sports
-   Luxury
-   Consumer Electronics
-   Parenting & Family
-   Pets
-   Real Estate
-   Professional Services
-   Other

### Field

``` text
industry: string[]
```

------------------------------------------------------------------------

## A.2 Sub-Category

Sub-categories should depend on the selected primary category.

### Beauty & Skincare

-   Skincare
-   Makeup
-   Haircare
-   K-Beauty
-   Luxury Beauty
-   Natural Beauty
-   Men's Grooming
-   Fragrance
-   Personal Care

### Fashion & Apparel

-   Women's Fashion
-   Men's Fashion
-   Streetwear
-   Luxury Fashion
-   Sustainable Fashion
-   Affordable Fashion
-   Footwear
-   Accessories
-   Jewelry
-   Bridal Fashion

### Tech & AI

-   Artificial Intelligence
-   SaaS
-   Programming
-   Consumer Technology
-   Smartphones
-   Laptops
-   Gadgets
-   Cybersecurity
-   Startups
-   Productivity Tools
-   Developer Tools

### Fitness & Wellness

-   Gym & Training
-   Yoga
-   Nutrition
-   Running
-   Weight Loss
-   Bodybuilding
-   Sports
-   Mental Wellness
-   Supplements
-   Healthy Lifestyle

### Gaming & Hardware

-   PC Gaming
-   Console Gaming
-   Mobile Gaming
-   Gaming Accessories
-   Streaming
-   Esports
-   Gaming Hardware
-   VR / AR

### Field

``` text
subCategories: string[]
```

------------------------------------------------------------------------

# B. Budget Filters

Creators should be able to filter companies and campaigns based on
estimated or declared campaign budget.

## B.1 Budget Range

Fields:

``` text
minBudget: number
maxBudget: number
currency: string
```

## B.2 Quick Budget Options

-   Any Budget
-   Under \$500
-   \$500 -- \$1K
-   \$1K -- \$3K
-   \$3K -- \$5K
-   \$5K -- \$10K
-   \$10K -- \$25K
-   \$25K+
-   Custom Range

For India-specific displays, equivalent INR ranges can be supported
based on user locale.

------------------------------------------------------------------------

# C. Zerify Match Score

This is a key discovery filter.

Options:

-   Any Match
-   50%+
-   60%+
-   70%+
-   80%+
-   85%+
-   90%+
-   95%+

### Field

``` text
matchScore: number
```

### Advanced Match Filters

Allow filtering individual match components:

``` text
minOverallMatchScore: number
minAudienceMatchScore: number
minNicheMatchScore: number
minContentMatchScore: number
minBrandFitScore: number
minBudgetFitScore: number
```

------------------------------------------------------------------------

# D. Platform Filters

Multi-select:

-   Instagram
-   YouTube
-   TikTok
-   X
-   LinkedIn
-   Facebook
-   Pinterest
-   Twitch
-   Other

### Field

``` text
platforms: string[]
```

------------------------------------------------------------------------

# E. Campaign Type

Multi-select values:

-   Sponsored Post
-   Instagram Reel
-   Instagram Story
-   Instagram Carousel
-   TikTok Video
-   YouTube Long Video
-   YouTube Short
-   X Post
-   LinkedIn Post
-   Product Review
-   Product Unboxing
-   Product Demonstration
-   UGC Creation
-   Affiliate Campaign
-   Brand Ambassador
-   Long-term Partnership
-   Event Collaboration
-   Giveaway
-   Livestream
-   App Promotion
-   Product Launch Campaign
-   Other

### Field

``` text
campaignTypes: string[]
```

------------------------------------------------------------------------

# F. Compensation Filters

Multi-select:

-   Paid
-   Product Exchange
-   Affiliate Commission
-   Performance-based
-   Paid + Commission
-   Paid + Product
-   Negotiable
-   Revenue Share

### Additional Toggles

-   Payment Guaranteed
-   Escrow Available
-   Advance Payment Available
-   Payment Terms Available

### Fields

``` text
compensationTypes: string[]
paymentGuaranteed: boolean
escrowAvailable: boolean
advancePaymentAvailable: boolean
```

------------------------------------------------------------------------

# G. Company and Campaign Location

## G.1 Company Location

Fields:

``` text
country: string
state: string
city: string
```

## G.2 Collaboration Availability

Filters:

-   Accepts Global Creators
-   Remote Collaboration Available
-   Local Creators Only
-   Country-specific Campaign
-   City-specific Campaign

### Fields

``` text
acceptsGlobalCreators: boolean
remoteCollaboration: boolean
localCreatorsOnly: boolean
eligibleCountries: string[]
eligibleStates: string[]
eligibleCities: string[]
```

------------------------------------------------------------------------

# H. Creator Requirement Filters

These filters represent the requirements set by the company.

## H.1 Follower Range

Quick ranges:

-   1K -- 10K
-   10K -- 50K
-   50K -- 100K
-   100K -- 500K
-   500K -- 1M
-   1M+

Custom:

``` text
requiredMinFollowers: number
requiredMaxFollowers: number
```

## H.2 Creator Tier

-   Nano
-   Micro
-   Mid-tier
-   Macro
-   Mega

### Field

``` text
creatorTiers: string[]
```

------------------------------------------------------------------------

# I. Content Niche Requirement

The company can specify:

-   Primary creator category
-   Secondary categories
-   Required niche
-   Preferred niche
-   Excluded niches

### Fields

``` text
requiredNiches: string[]
preferredNiches: string[]
excludedNiches: string[]
```

------------------------------------------------------------------------

# J. Audience Filters

These should initially be available in Advanced Filters and become more
important as Zerify collects audience data.

## J.1 Target Audience Age

Options:

-   13--17
-   18--24
-   25--34
-   35--44
-   45--54
-   55+

Field:

``` text
targetAudienceAgeGroups: string[]
```

## J.2 Target Audience Gender

Options:

-   Male
-   Female
-   All
-   Balanced / No Preference

Field:

``` text
targetAudienceGender: string[]
```

## J.3 Target Audience Location

Fields:

``` text
targetAudienceCountries: string[]
targetAudienceStates: string[]
targetAudienceCities: string[]
```

## J.4 Audience Interests

Examples:

-   Skincare
-   Beauty
-   Fashion
-   Fitness
-   Technology
-   Gaming
-   Finance
-   Travel
-   Food
-   Startups
-   Parenting
-   Luxury
-   Sports

Field:

``` text
targetAudienceInterests: string[]
```

------------------------------------------------------------------------

# K. Language Filters

Multi-select:

-   English
-   Hindi
-   Bengali
-   Spanish
-   French
-   German
-   Portuguese
-   Japanese
-   Korean
-   Arabic
-   Other

Fields:

``` text
requiredLanguages: string[]
preferredLanguages: string[]
```

------------------------------------------------------------------------

# L. Campaign Objective

Multi-select:

-   Brand Awareness
-   Product Launch
-   Engagement
-   Website Traffic
-   Lead Generation
-   App Installs
-   Product Sales
-   UGC / Content Creation
-   Community Growth
-   Followers Growth
-   Email Signups
-   Event Promotion
-   Other

### Field

``` text
campaignObjectives: string[]
```

------------------------------------------------------------------------

# M. Collaboration Duration

Options:

-   One-time
-   Less than 1 Month
-   1 Month
-   3 Months
-   6 Months
-   Long-term
-   Ongoing

Fields:

``` text
collaborationDuration: string
minDurationDays: number
maxDurationDays: number
```

------------------------------------------------------------------------

# N. Company Profile Filters

## N.1 Company Size

-   Startup
-   Small Business
-   Growing Company
-   Established Brand
-   Enterprise

Field:

``` text
companySize: string
```

## N.2 Funding / Company Stage

-   Bootstrapped
-   Pre-seed
-   Seed
-   Series A
-   Series B
-   Series C+
-   Public Company
-   Not Disclosed

Field:

``` text
companyStage: string
```

These can remain optional because this information may not be available
for every company.

------------------------------------------------------------------------

# O. Campaign Activity Filters

## O.1 Campaign Status

-   Actively Recruiting
-   Open
-   Recently Posted
-   Applications Closing Soon
-   Paused
-   Closed

Field:

``` text
campaignStatus: string[]
```

## O.2 Posted Date

Options:

-   Last 24 Hours
-   Last 3 Days
-   Last 7 Days
-   Last 14 Days
-   Last 30 Days
-   Any Time

Fields:

``` text
postedAfter: date
postedBefore: date
```

## O.3 Application Deadline

Filters:

-   Deadline within 24 Hours
-   Deadline within 3 Days
-   Deadline within 7 Days
-   No Deadline

Field:

``` text
applicationDeadline: date
```

------------------------------------------------------------------------

# P. Creator's Interaction Status

These filters are personalized to the logged-in creator.

Options:

-   All Opportunities
-   Not Pitched
-   Pitched
-   Profile Viewed
-   Responded
-   Shortlisted
-   Accepted
-   Rejected
-   Saved
-   Hidden

Fields:

``` text
interactionStatus: string[]
isSaved: boolean
isHidden: boolean
```

------------------------------------------------------------------------

# Q. Trust and Verification Filters

Recommended filters:

-   Verified Company
-   Business Verified
-   Payment Verified
-   Escrow Available
-   Identity Verified
-   Website Verified

Fields:

``` text
isCompanyVerified: boolean
isBusinessVerified: boolean
isPaymentVerified: boolean
isIdentityVerified: boolean
isWebsiteVerified: boolean
```

------------------------------------------------------------------------

# R. Company Response Quality

These fields become valuable after Zerify has sufficient platform data.

Filters:

-   Responds within 24 Hours
-   Responds within 3 Days
-   High Response Rate
-   Frequently Collaborates
-   Repeat Creator Partnerships
-   Completed Campaigns

Metrics:

``` text
responseRate: number
averageResponseTimeHours: number
completedCampaignsCount: number
repeatCollaborationRate: number
```

Suggested quick filters:

``` text
High Response Rate: responseRate >= 70
Fast Response: averageResponseTimeHours <= 24
Experienced Brand: completedCampaignsCount >= 5
```

------------------------------------------------------------------------

# 5. Recommended Sort Options

The user should be able to sort results by:

-   Best Match
-   Highest Match Score
-   Newest
-   Oldest
-   Highest Budget
-   Lowest Budget
-   Applications Closing Soon
-   Most Active
-   Highest Response Rate
-   Fastest Response Time
-   Most Campaigns Completed
-   Recently Updated

### API Field

``` text
sortBy: string
sortOrder: asc | desc
```

Recommended default:

``` text
sortBy = matchScore
sortOrder = desc
```

------------------------------------------------------------------------

# 6. Match Score Architecture

The overall match should not depend on a single parameter.

## Recommended Base Formula

``` text
Overall Match Score =

30% Audience Match
20% Niche Match
15% Content Match
10% Engagement Quality
10% Brand Value Match
5% Location & Language Match
5% Budget Compatibility
5% Authenticity / Profile Quality
```

The exact weights should eventually be configurable by campaign
objective.

------------------------------------------------------------------------

# 7. Match Components

## 7.1 Audience Match

Compare:

-   Audience location
-   Audience age
-   Audience gender
-   Audience interests

Output:

``` text
audienceMatchScore: 0-100
```

------------------------------------------------------------------------

## 7.2 Niche Match

Compare:

-   Creator primary niche
-   Creator secondary niches
-   Company industry
-   Campaign required niches
-   Campaign preferred niches

Output:

``` text
nicheMatchScore: 0-100
```

Suggested hierarchy:

``` text
Exact niche match        90-100
Closely related niche    70-89
Broad category match     40-69
Weak relationship        20-39
Unrelated                0-19
```

------------------------------------------------------------------------

## 7.3 Content Match

Compare:

-   Content topics
-   Captions
-   Keywords
-   Hashtags
-   Product relevance
-   Content format
-   Previous brand collaborations
-   Content style

Output:

``` text
contentMatchScore: 0-100
```

------------------------------------------------------------------------

## 7.4 Brand Fit

Compare:

-   Brand values
-   Creator values/preferences
-   Premium vs affordable positioning
-   Sustainability
-   Luxury positioning
-   Product preferences
-   Previous collaborations

Output:

``` text
brandFitScore: 0-100
```

------------------------------------------------------------------------

## 7.5 Budget Fit

Compare:

-   Company campaign budget
-   Creator expected pricing
-   Required deliverables
-   Estimated compensation per deliverable

Output:

``` text
budgetFitScore: 0-100
```

------------------------------------------------------------------------

## 7.6 Location and Language Match

Compare:

-   Creator location
-   Campaign eligible locations
-   Audience geography
-   Required languages
-   Creator content languages

Output:

``` text
locationLanguageMatchScore: 0-100
```

------------------------------------------------------------------------

# 8. Campaign-Objective-Specific Weights

Different campaigns should use different weights.

## 8.1 Sales Campaign

``` text
Audience Match            30%
Niche Match               20%
Historical Performance    15%
Engagement Quality        15%
Content Match             10%
Budget Fit                10%
```

## 8.2 Brand Awareness Campaign

``` text
Audience Match            25%
Reach Potential           20%
Niche Match               20%
Content Match             15%
Engagement Quality        10%
Brand Fit                 10%
```

## 8.3 UGC Campaign

``` text
Content Quality           30%
Content Match             25%
Brand Fit                 20%
Previous UGC Performance  15%
Budget Fit                10%
```

------------------------------------------------------------------------

# 9. Company Card Fields

Each company card should show only high-value information.

## Required Display Fields

``` text
Company Logo
Company Name
Primary Industry
Campaign Title / Short Requirement
Overall Match Score
Estimated Budget Range
Campaign Type
Primary Platform
Location / Global Availability
Campaign Status
Posted Date
```

## Optional Trust Signals

``` text
Verified
Payment Verified
Escrow Available
High Response Rate
```

## Match Explanation

Do not only show:

``` text
92% Match
```

Also provide a short explanation:

``` text
92% Strong Match

✓ Your audience strongly matches their target demographic
✓ Your content niche matches Beauty & Skincare
✓ You meet the creator follower requirement
✓ Your audience is active in their target market
⚠ Your estimated rate may be near the top of their budget
```

------------------------------------------------------------------------

# 10. Recommended Card Example

``` text
[A] Aura Skincare                              [92% Match]

Beauty & Skincare
Looking for beauty and lifestyle creators for a product showcase.

Campaign:
Instagram Reels + Stories

Budget:
$1.5K – $3K

Target:
Women | 18–34 | India

[Verified] [Paid] [Escrow Available]

Posted 2 days ago

[♡ Save]                         [Pitch Brand]
```

------------------------------------------------------------------------

# 11. Recommended Advanced Filter Panel

The Advanced Filter panel can be divided into four sections.

## Company

-   Industry
-   Sub-category
-   Company location
-   Company size
-   Company stage
-   Verification status

## Campaign

-   Campaign type
-   Campaign objective
-   Budget range
-   Compensation type
-   Duration
-   Platform
-   Campaign status
-   Posted date
-   Deadline

## Creator Requirements

-   Follower range
-   Creator tier
-   Required niche
-   Preferred niche
-   Language
-   Creator location
-   Audience location
-   Audience age
-   Audience gender

## Compatibility

-   Minimum overall match
-   Minimum audience match
-   Minimum niche match
-   Minimum content match
-   Minimum brand fit
-   Budget compatibility

------------------------------------------------------------------------

# 12. Recommended Filter API Object

``` json
{
  "search": "",
  "industries": [],
  "subCategories": [],
  "platforms": [],
  "campaignTypes": [],
  "campaignObjectives": [],
  "compensationTypes": [],
  "minBudget": null,
  "maxBudget": null,
  "currency": "USD",
  "minMatchScore": null,
  "minAudienceMatchScore": null,
  "minNicheMatchScore": null,
  "minContentMatchScore": null,
  "minBrandFitScore": null,
  "minBudgetFitScore": null,
  "companyCountries": [],
  "companyStates": [],
  "companyCities": [],
  "acceptsGlobalCreators": null,
  "remoteCollaboration": null,
  "localCreatorsOnly": null,
  "creatorTiers": [],
  "minFollowers": null,
  "maxFollowers": null,
  "requiredNiches": [],
  "preferredNiches": [],
  "requiredLanguages": [],
  "targetAudienceAgeGroups": [],
  "targetAudienceGender": [],
  "targetAudienceCountries": [],
  "targetAudienceInterests": [],
  "collaborationDuration": [],
  "companySizes": [],
  "companyStages": [],
  "campaignStatuses": [],
  "postedAfter": null,
  "postedBefore": null,
  "applicationDeadlineBefore": null,
  "isCompanyVerified": null,
  "isBusinessVerified": null,
  "isPaymentVerified": null,
  "escrowAvailable": null,
  "minResponseRate": null,
  "maxAverageResponseTimeHours": null,
  "interactionStatus": [],
  "isSaved": null,
  "sortBy": "matchScore",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}
```

------------------------------------------------------------------------

# 13. Recommended V1 Filters

To avoid overbuilding, the first production version should prioritize:

1.  Search
2.  Industry / Category
3.  Sub-category
4.  Budget Range
5.  Minimum Match Score
6.  Platform
7.  Campaign Type
8.  Compensation Type
9.  Location
10. Follower Requirement
11. Campaign Status
12. Posted Date
13. Verified Company
14. Sort Options

------------------------------------------------------------------------

# 14. V2 Advanced Filters

Add once enough data is available:

-   Audience age compatibility
-   Audience gender compatibility
-   Audience location compatibility
-   Audience interest compatibility
-   Content similarity
-   Brand value match
-   Creator authenticity score
-   Historical campaign performance
-   Response rate
-   Average response time
-   Repeat collaboration rate
-   Completed campaign count
-   Estimated ROI
-   Budget efficiency

------------------------------------------------------------------------

# 15. UX Recommendations

## Keep the Main Page Clean

Do not display every filter at once.

Recommended structure:

``` text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search brands, industries, products, campaigns or keywords...           │
└─────────────────────────────────────────────────────────────────────────────┘

[ All ] [ Category ▾ ] [ Budget ▾ ] [ 80%+ Match ▾ ]
[ Platform ▾ ] [ Campaign Type ▾ ] [ Paid Only ▾ ] [ Location ▾ ]
[ ⚙ All Filters ]

Showing 248 opportunities                         Sort: Best Match ▾
```

## Active Filter Display

Show active filters as removable chips:

``` text
[ Beauty × ] [ Instagram × ] [ $1K-$5K × ] [ 80%+ Match × ]

Clear All
```

## Filter Panel Actions

Always include:

``` text
[ Reset Filters ]     [ Show 248 Results ]
```

------------------------------------------------------------------------

# 16. Recommended Data Prioritization

## Tier 1 --- Essential

-   Company name
-   Industry
-   Sub-category
-   Search keywords
-   Campaign budget
-   Platform
-   Campaign type
-   Compensation type
-   Location
-   Match score
-   Campaign status
-   Posted date

## Tier 2 --- Strong Matching

-   Creator follower requirement
-   Required niche
-   Preferred niche
-   Language
-   Target audience age
-   Target audience gender
-   Target audience location
-   Target audience interests
-   Collaboration duration

## Tier 3 --- Intelligence and Trust

-   Audience match
-   Content match
-   Brand fit
-   Budget fit
-   Historical performance
-   Response rate
-   Average response time
-   Completed campaigns
-   Verification status
-   Escrow availability

------------------------------------------------------------------------

# 17. Final Zerify Discovery Architecture

``` text
                    COMPANY DISCOVERY DIRECTORY
                               │
                               ▼
                  ┌─────────────────────────┐
                  │ Full-Width Search Engine │
                  └────────────┬────────────┘
                               │
                               ▼
                 ┌───────────────────────────┐
                 │ Quick Filters              │
                 │ Category                   │
                 │ Budget                     │
                 │ Match Score                │
                 │ Platform                   │
                 │ Campaign Type              │
                 │ Compensation               │
                 └────────────┬──────────────┘
                              │
                              ▼
                 ┌───────────────────────────┐
                 │ Advanced Filters           │
                 │ Company                    │
                 │ Campaign                   │
                 │ Creator Requirements       │
                 │ Audience                   │
                 │ Compatibility              │
                 │ Trust                      │
                 └────────────┬──────────────┘
                              │
                              ▼
                 ┌───────────────────────────┐
                 │ Zerify Matching Engine     │
                 │ Audience Match             │
                 │ Niche Match                │
                 │ Content Match              │
                 │ Brand Fit                  │
                 │ Budget Fit                 │
                 │ Location/Language Fit      │
                 └────────────┬──────────────┘
                              │
                              ▼
                 ┌───────────────────────────┐
                 │ Ranked Company Results     │
                 │ Best Match                 │
                 │ Why It Matches             │
                 │ Budget                     │
                 │ Campaign Details           │
                 │ Trust Signals              │
                 └───────────────────────────┘
```

------------------------------------------------------------------------

# 18. Core Product Principle

The most important design principle for Zerify is:

> **Do not rank opportunities primarily by company size or creator
> follower count. Rank them by relevance and compatibility.**

The strongest core matching signals should be:

1.  Audience Match
2.  Niche Match
3.  Content Match
4.  Campaign Objective Match
5.  Budget Compatibility
6.  Platform Compatibility

Followers, company size, and industry should mostly function as
**filters and supporting signals**, rather than the primary definition
of a good match.

------------------------------------------------------------------------

## Suggested Future Extensions

Future versions can add:

-   AI semantic search
-   Natural-language search such as
    `Find paid skincare brands looking for Indian creators with 10K+ followers`
-   AI-generated match explanations
-   Estimated campaign success score
-   Recommended pitch angle for each company
-   Similar company recommendations
-   Saved searches
-   Alerts when a new high-match company appears
-   Personalized opportunity feed
