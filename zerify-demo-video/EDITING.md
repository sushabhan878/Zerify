# Editing the Zerify demo

The video uses authentic local-app screenshots, composed into an editable walkthrough. It is not a continuous screen recording. Each meaningful screen has its own HTML scene and a paused animation timeline.

Open the project preview with `npx hyperframes@0.8.231 preview --background`. The HyperFrames desktop app is another way to keep editing the same project.

## Edit the sequence

Use `scenes.json` as the source of truth. Each scene sets its PNG filename stem, title, context, seconds, browser-chrome crop, optional camera focus, and optional click positions. See `scene-manifest.schema.json` for the fields. Example:

```json
{
  "headline": "Zerify product walkthrough",
  "accent": "#902BF5",
  "fps": 30,
  "scenes": [
    {
      "id": "published-campaign",
      "file": "09-published-campaign",
      "title": "The campaign is live",
      "subtitle": "Brand workspace",
      "seconds": 6,
      "cropTop": 80,
      "cleanCursor": true,
      "focus": {"x": 0.56, "y": 0.27, "scale": 1.2, "at": 1.4},
      "clicks": [{"at": 5.65, "x": 110, "y": 305}]
    }
  ]
}
```

Run `node build-video.mjs` after changing the manifest. This regenerates `index.html`, the scenes under `compositions/scenes/`, and `scene-timing.json`. Rebuilding replaces edits made directly to those generated HTML files, so either keep your edits in the manifest/builder or keep editing the generated timeline without rebuilding.

`cropTop: 80` removes normal browser chrome; use 0 for a fullscreen app capture. `cropBottom` can exclude an unneeded footer. Both are raw screenshot pixels. Images keep their aspect ratio. Focus coordinates are fractions of the cropped app area; click coordinates are pixels in the original screenshot. A short `note` (up to95 characters) replaces the subtitle; longer notes remain in the timing manifest without crowding the video.

Set `cleanCursor: true` only if the native mouse pointer was parked in the cropped browser chrome. Existing captures with a baked pointer use false, so the composition does not add a second arrow.

If `scenes.json` is absent, the builder assembles an explicitly marked capture draft from existing PNGs. This draft is only a source/layout check; it does not mean the full requested workflow has been captured.

## Check and export

Run `npm run check`, then `npx hyperframes@0.8.231 snapshot --review` and inspect the frames. After review, render with `npx hyperframes@0.8.231 render --quality delivery -o zerify-demo.mp4`.

The original screenshots remain in `assets/captures/`. Keep `assets/vendor/gsap.min.js` with the project, so animation does not depend on a network-loaded script.
