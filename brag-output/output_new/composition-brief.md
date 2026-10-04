# Hyperframes Composition Brief: Zerify

## Objective
Create a high-pace, chaotic-energy launch brag video for Zerify — the brand ↔ influencer marketplace.

## Output
- Composition directory: `output_new/composition/`
- Rendered video: `output_new/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 28 seconds (user range 20–30s)

## Source Material
- Project root: repo root (Zerify monorepo)
- Primary files read: `README.md`, `apps/frontend/src/app/page.tsx`, `apps/frontend/src/app/globals.css`, `apps/frontend/src/components/landing/Hero.tsx`, `PlatformShowcase.tsx`, `MotionFeatures.tsx`, `how-it-works/*`, dashboard components (match scores, escrow/payout views)
- Product name: Zerify
- Tagline / strongest claim: "The Fastest & Easiest Way for Brands & Influencers to Connect." / "without ad agency overhead"
- Key UI or visual moment to recreate: AI match % badge + score ring (CompanyDetailModal), spinning conic-gradient CTA pill (Hero)
- Copy that must appear verbatim:
  - "The fastest way for brands & creators to connect." (adapted tagline)
  - "Get started for free" (real CTA)
  - "AI Creator Match" / "97% MATCH" (real feature naming)
  - "Money doesn't move until work does." (escrow essence; echoes "See exactly who you are hiring before any money moves.")

## Creative Direction
- Tone preset: chaotic
- Creative direction: high-pace hype reel — hard cuts, zoom cuts, counters, dealt cards; loud but strictly on-brand
- Interpretation: 8 rapid scenes; ALL-CAPS accents; every text hold respects reading floors (fast-in, then hold)
- Angle: finding a creator is a match-win — scores count up, cards deal, escrow locks the money
- Hook: "Brands waste budget swiping." → "Wrong creator. Gone."
- Outro / punchline: ZERIFY logo + conic CTA pill on the strongest beat
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: #07090E
- Text: #F3F4F6 / #FFFFFF; muted #94A3B8
- Accent: #A855F7 (purple), #F472B6 (pink), #818CF8 (indigo), #34D399 (emerald for escrow/money)
- Panel: #0B0F19 / rgba glass with 1px rgba(168,85,247,.25) borders
- Display font: Playfair Display (local: assets/fonts/playfair-latin.woff2, italic variant included)
- Body font: Plus Jakarta Sans (local: assets/fonts/jakarta-latin.woff2)
- Visual references from the project: interactive dot grid, purple/pink blurred glow spheres, glassmorphic cards, conic-gradient spinning CTA border, match badges with Sparkles

## Storyboard
Use `output_new/brag-plan.md` as the creative contract.

1. Hook — 3.6s — pain line slam + flash cut
2. Reveal — 3.6s — ZERIFY logo + zero-agency line
3. AI Match counter — 3.6s — card deals in, 0→97% counter, badge stamp
4. Product proof 1 — 2.6s — real AI Creator Match screenshot, Ken Burns push
5. Escrow lock — 3.4s — ₹ amount + lock stamp + "Money doesn't move until work does."
6. Product proof 2 — 2.6s — real hero screenshot, slow zoom out
7. Feature rapid-fire — 4.6s — three chips dealt on beats, hold together
8. Outro — 4.0s — ZERIFY slam + conic CTA pill, hold

## Audio
- Audio role: dense rhythmic layer (chaotic), professional execution
- Audio arc: full-energy from frame 0; rhythm accents on deals/stamps; brief low swell at escrow; payoff bell at logo; bed fades under final hold
- Music: `assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3` (60s, 109.96 BPM; use first 28s)
- Music treatment: volume 0.34, start 0.0, short fade-out over the last ~1.5s
- Music cue guidance: preset at `.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`. Beat grid ≈ every 0.545s. Strong cues used: 3.5527s (scene 2 lock), 12.562s (scene 4 lock), 20.1898s (strongest; scene 8 slam energy). Sequential chips snap to every-other beat (≥1.09s apart) for readability.
- Audio-reactive treatment: subtle — pre-extracted data at `assets/music/audio-data.json` (1800 frames @ 30fps, 16 bands, RMS + band energies). Use bass/RMS to make the purple glow and card glow breathe. No waveform/equalizer visuals.
- Audio-coupled moments:
  - Scene 1 slam — impact punch; flash cut — glitch tick
  - Scene 2 logo — soft drop
  - Scene 3 counter — chips-stack ticks; badge stamp — chips-collide
  - Scene 4 — soft drop at caption
  - Scene 5 lock stamp — interface bong
  - Scene 7 chips — card-slide per chip
  - Scene 8 slam — impact bell
- SFX selection guidance: motion-matched, ≤1 sound per beat, coherent palette (impact + casino + interface only). Files staged in `assets/sfx/{impact,interface,casino,ui}/`.
- SFX analysis guidance: `.agents/skills/brag/assets/sfx/sfx-analysis.md` (skill dir); prefer low-HF-risk files for repeated moments.
- Exact SFX choice: Hyperframes chooses final filenames/timestamps/volumes from the staged set.
- Audio files: already copied into `output_new/composition/assets/`.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview or route into its generic promo workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI/copy/visual element from the source project (two real screenshots are staged at `assets/img/creator-match.png` and `assets/img/zerify-hero.png`; logo at `assets/img/logo.png`).
- Keep all text readable in the final render (respect reading-time floors).
- Include the planned music/SFX layer.
- Beat-lock 1–3 major reveals to strong cues (±0.15s, mark `// beat-locked`); snap sequential non-text events to consecutive beats (±0.10s, mark `// beat-grid`); sequential text snaps to every-other beat minimum.
- Use local assets only (fonts, music, SFX, images are all staged under `assets/`).
- Deterministic render: no unseeded randomness, no infinite repeats, single paused GSAP timeline registered at `window.__timelines["zerify-brag"]`.
- Run `npx hyperframes check` before render — brag's single gate.
