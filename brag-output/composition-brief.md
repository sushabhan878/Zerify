# Hyperframes Composition Brief: Zerify

## Objective
Create a short, premium launch-style brag video for Zerify showcasing its creator-brand collaboration marketplace, influencer discovery, campaign workspace, and real-time analytics.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21.5 seconds

## Source Material
- Project root: `c:/Users/susha/OneDrive/Desktop/Zerify`
- Primary files read: `apps/frontend/src/app/page.tsx`, `apps/frontend/src/app/globals.css`, `apps/frontend/src/components/landing/Hero.tsx`, `apps/frontend/src/components/landing/PlatformShowcase.tsx`, `README.md`
- Product name: Zerify
- Tagline / strongest claim: "The Fastest & Easiest Way for Brands & Influencers to Connect — Without Ad Agency Overhead."
- Key UI or visual moments to recreate:
  - Zerify brand mark and lightning bolt icon (`apps/frontend/public/logo.png`)
  - AI Creator Match UI with 98% audience fit score (`apps/frontend/public/dashboard/AI Creator Match.png`)
  - Campaign Workspace and Analytics Dashboard (`apps/frontend/public/dashboard/Campaign Workspace.png`, `apps/frontend/public/dashboard/Analytics Dashboard.png`)
- Copy that must appear verbatim:
  - "The Fastest & Easiest Way for Brands & Influencers to Connect."
  - "Direct Brand-Creator Marketplace"
  - "Zero Agency Markup"
  - "98% Audience Fit Confidence"
  - "Real-Time ROAS & Reach Tracking"
  - "zerify.com"

## Creative Direction
- Tone preset: `polished`
- Creative direction: "Introducing Zerify — Premium SaaS Launch Film"
- Interpretation: Serious, elegant, high-impact startup launch film. Confident typography, silky smooth reveals, glassmorphism cards, glowing cosmic lighting, punchy metrics, and seamless transitions.
- Angle: Creator marketing is burdened by 40% agency commissions and opaque negotiations. Zerify creates an autonomous, verified marketplace with instant escrow milestones, AI creator matching, and live ROI tracking.
- Hook: "Traditional creator marketing is broken by 40% agency overhead."
- Outro / punchline: "Connect. Collaborate. Scale. • zerify.com"
- Avoid:
  - Generic SaaS stock footage or cartoons
  - Flat, boring slide transitions
  - Abstract filler graphics

## Visual Identity
- Background: `#07090E`
- Text: `#FFFFFF` primary, `#94A3B8` secondary
- Accent: Gradient `#8B5CF6` (violet) → `#EC4899` (fuchsia) → `#3B82F6` (sapphire)
- Display font: `Playfair Display`, serif, and `Plus Jakarta Sans`, sans-serif
- Body font: `Plus Jakarta Sans`, sans-serif
- Visual references from the project:
  - Ambient glowing orbs (`bg-purple-600/18`, `bg-pink-600/12`)
  - Dot matrix / grid lines
  - Dark glassmorphism cards (`background: rgba(15, 23, 42, 0.75)`, border `rgba(255, 255, 255, 0.1)`)
  - Real screenshot mockups from `apps/frontend/public/dashboard/`

## Storyboard
Refer to `brag-output/brag-plan.md` for the full creative contract.

Scene summary:
1. Scene 1 — The Problem & Vision — 4.5s (0.0s – 4.5s) — Dark obsidian canvas, statement on agency markup, problem chips glide in.
2. Scene 2 — Reveal: Introducing Zerify — 4.5s (4.5s – 9.0s) — Zerify logo bursts with glowing aura, "Direct Brand-Creator Marketplace", 3 core pillars.
3. Scene 3 — AI Creator Match & Discovery — 4.5s (9.0s – 13.5s) — Real AI Creator Match UI card, 98% audience fit confidence meter, multi-platform badges.
4. Scene 4 — Workspace & Real-Time Analytics — 4.3s (13.5s – 17.8s) — Campaign Workspace + Analytics Dashboard cards, live counter tick to +342% Reach and $0 Agency Fees.
5. Scene 5 — Outro & Call to Action — 3.7s (17.8s – 21.5s) — Cinematic final badge with rotating conic glow, "Connect. Collaborate. Scale.", CTA "zerify.com".

## Audio
- Audio role: Warm modern electronic bed with punchy rhythmic pulse, subtle UI click accents, and a clean logo resolve.
- Audio arc: Ambient intrigue in opening, dynamic rhythmic drop at Zerify reveal, steady momentum through features, triumphant chime resolve.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: Volume 0.70, slight duck under key transitions, subtle fade out at 20.0s - 21.5s.
- Music cue guidance:
  - Preset: `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  - Strong cues: 8.74s (reveal apex), 13.11s (workspace entrance), 17.47s / 18.56s (analytics & outro impact)
  - Beat-grid windows: Scene 2 tags (6.00s, 6.56s, 7.09s), Scene 3 metrics (10.37s, 10.93s, 11.46s)
- Audio-reactive treatment: Subtle; ambient background light and border glow breathe gently with music energy.
- SFX selection guidance:
  - `impact/impactSoft_medium_001.ogg` for transitions and reveal
  - `casino/card-slide-1.ogg` for card appearances
  - `impact/impactBell_heavy_000.ogg` for outro logo chime
  - `interface/click_003.ogg` for metric tags
- Exact SFX choice: Hyperframes copies the needed audio files into `brag-output/composition/assets/`.
