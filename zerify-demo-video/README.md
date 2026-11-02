# Zerify demo video

**Status:** Complete walkthrough: brand campaign, creator invitation, acceptance and submission history

Current assembly: 29 scenes, 191 seconds, 1920 × 1080 at 30fps. This is an editable composition made from real app screenshots, with camera and cursor animation.

The full scene sequence and source capture for each stage are listed in scene-timing.json.

## Edit and preview

Edit scenes.json and run `node build-video.mjs`. Open with `npx hyperframes@0.8.231 preview --background`; the HyperFrames desktop app can also edit the project. See EDITING.md for camera, cursor, crop and timing fields. Rebuilding replaces generated HTML scene edits.

## Validate and export

Run `npm run check`, then `npx hyperframes@0.8.231 snapshot --review` and inspect the frames. Render only after reviewing the finished timeline: `npx hyperframes@0.8.231 render --quality delivery -o zerify-demo.mp4`.

Original source captures are in assets/captures. scene-timing.json maps every scene to its capture and source HTML. The local GSAP asset is included for reproducible playback.
