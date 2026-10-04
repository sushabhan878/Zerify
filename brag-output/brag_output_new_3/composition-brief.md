# Hyperframes Composition Brief: Zerify

## Objective
Create a short, fast-paced launch-style brag video for Zerify, a direct brand–creator collaboration platform.

## Output
- Composition directory: `brag_output_new_3/composition/`
- Rendered video: `brag_output_new_3/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 24.5 seconds

## Source Material
- Project root: `.`
- Primary files read: `README.md`, `apps/frontend/src/components/landing/Hero.tsx`, `apps/frontend/src/app/globals.css`, `apps/frontend/src/components/dashboard/brand-views/find-influencers/CreatorCard.tsx`, `apps/frontend/src/components/dashboard/brand-views/find-influencers/CreatorInviteModal.tsx`, `apps/frontend/public/dashboard_preview1.png`, `apps/frontend/public/dashboard_preview2.png`
- Product name: Zerify
- Tagline / strongest claim: “The Fastest & Easiest Way for Brands & Influencers to Connect.”
- Key UI or visual moment to recreate: the glassmorphic hero/dashboard interface, creator match card, campaign analytics, invite CTA, and payout confirmation.
- Copy that must appear verbatim:
  - The Fastest & Easiest Way for Brands & Influencers to Connect.
  - Invite to Campaign
  - Creative analytics
  - Automate payouts
  - Get started for free

## Creative Direction
- Tone preset: default
- Creative direction: smooth, high-energy product sizzle with premium purple motion
- Interpretation: Fast-paced with readable holds, springy UI arrivals, clean glass surfaces, and motion that compresses the brand-to-creator workflow into a satisfying direct path.
- Angle: Goodbye to the agency maze — Zerify turns discovery, briefing, measurement, and payout into one connected product flow.
- Hook: “GOODBYE, AGENCY MAZE.” with a visible BRAND → CREATOR route line.
- Outro / punchline: “Direct connection. Zero agency overhead.”
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Invented customer names, URLs, or credentials
  - Unreadable rapid-fire feature copy

## Visual Identity
- Background: #07090E
- Text: #F3F4F6 / #FFFFFF
- Accent: #A855F7 with #F472B6 and #818CF8 glow support
- Display font: Playfair Display, shipped locally
- Body font: Plus Jakarta Sans, shipped locally
- Visual references from the project: dotted grid, dark glass panels, purple/pink/indigo glow, hero/dashboard screenshots, creator discovery UI.

## Storyboard
Use `brag_output_new_3/brag-plan.md` as the creative contract.

Scene summary:
1. Direct connection — 3.4s — hook with BRAND → CREATOR route
2. The platform — 4.1s — real Zerify hero UI and verbatim promise
3. Find the right creator — 4.4s — creator discovery + match metrics + invite action
4. Run the campaign — 4.8s — campaign workspace + creative analytics + reach
5. Direct flow — 3.8s — discover → brief → measure → payout automated
6. Zerify — 4.0s — logo, tagline, and CTA lockup

## Audio
- Audio role: dense rhythmic layer with polished interface accents
- Audio arc: upbeat bed starts immediately, gains density through the match and analytics scenes, then leaves room for the logo hit and final hold.
- Music: `assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3`
- Music treatment: 0.30 volume, 0.35s fade-in, 1.0s fade-out; no voiceover.
- Music cue guidance: bundled preset `.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`; major cue locks around 15.82s and 20.19s, with sequential beat-grid hints from the plan.
- Audio-reactive treatment: subtle; pre-extracted bass/RMS data gently modulates the main purple halo and final logo halo.
- Audio-coupled moments:
  - Scene 1 route line — a soft rise/impact
  - Scene 3 metric chips — light stagger accents, not every text line
  - Scene 3 invite action — click
  - Scene 4 analytics counter — short tick/impact on landing
  - Scene 6 logo — final impact/chime
- SFX selection guidance: use low/medium high-frequency-risk interface clicks, soft impacts, and one restrained bell/chime; match exact motion timing.
- SFX analysis guidance: `.agents/skills/brag/assets/sfx/sfx-analysis.md` if available.
- Exact SFX choice: use bundled local files copied into `composition/assets/sfx/`.
- Audio files: copy music and selected SFX into `brag_output_new_3/composition/assets/`.

## Hyperframes Instructions
Use one standalone composition with one paused GSAP timeline registered as `window.__timelines["main"]`. Use local GSAP and local fonts. Show the actual Zerify hero/dashboard images. Keep all text within safe margins and readable in the final render. Use deterministic motion only; no network requests, timers, random values, or infinite repeats. Run `npx hyperframes check` before rendering.
