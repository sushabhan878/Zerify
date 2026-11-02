import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Authoring helper only: the generated HTML contains all its clips and assets.
// Rebuild after editing scenes.json. Preview and timeline edits can also be made
// directly to the generated scene HTML; rebuilding replaces those scene edits.
const project = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(project, process.argv[2] || 'scenes.json');
const captures = path.join(project, 'assets', 'captures');
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const attrJSON = value => esc(JSON.stringify(value));
const js = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const round = n => Math.round(n * 1000) / 1000;
const finite = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function imageSize(bytes) {
  if (bytes.toString('ascii', 1, 4) === 'PNG') return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  // Native captures may be JPEG data saved with a .png filename. Read the
  // actual encoding instead of altering the parent's original capture files.
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let p = 2;
    while (p < bytes.length - 8) {
      if (bytes[p++] !== 0xff) continue;
      while (bytes[p] === 0xff) p++;
      const marker = bytes[p++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = bytes.readUInt16BE(p);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return [bytes.readUInt16BE(p + 5), bytes.readUInt16BE(p + 3)];
      if (length < 2) break;
      p += length;
    }
  }
  throw new Error('Unsupported screenshot encoding: expected PNG or JPEG.');
}
let draft = false;
let usedFallback = false;
let manifest;
try {
  manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  draft = true;
  usedFallback = true;
  const labels = {
    '01-brand-overview': ['Start in the brand workspace', 'Brand dashboard'],
    '02-campaigns': ['Create a campaign', 'Campaigns'],
    '03-basic-info': ['Give creators a clear campaign brief', 'Campaign setup'],
    '04-product': ['Introduce the product', 'Campaign setup'],
    '05-creator-requirements': ['Define the right creator fit', 'Campaign setup'],
    '06-deliverables': ['Specify the content you need', 'Campaign setup'],
    '07-budget': ['Set the campaign budget', 'Campaign setup'],
    '08-review': ['Review the campaign before launch', 'Campaign setup'],
    '09-published-campaign': ['The campaign is live', 'Published campaign'],
    '10-discovery': ['Find a creator for the campaign', 'Creator discovery'],
    '12-linkedin-analytics': ['Review the creator’s LinkedIn metrics', 'Creator profile'],
    '13-instagram-analytics': ['Compare Instagram performance', 'Creator profile'],
    '14-youtube-analytics': ['Check the creator’s YouTube metrics', 'Creator profile'],
  };
  const names = (await fs.readdir(captures)).filter(n => n.endsWith('.png')).sort();
  manifest = {
    headline: 'Zerify product walkthrough', accent: '#902bf5', fps: 30,
    scenes: names.map(filename => {
      const stem = filename.slice(0, -4);
      const [title, subtitle] = labels[stem] || [stem.replace(/^\d+-/, '').replaceAll('-', ' '), 'Zerify walkthrough'];
      return { id: stem.replace(/^\d+-/, ''), file: stem, title, subtitle, seconds: 6, cropTop: /^(01|02)-/.test(stem) ? 0 : 80, cleanCursor: false,
        focus: { x: 0.57, y: 0.45, scale: /^(03|04|05|06|07|08)-/.test(stem) ? 1.2 : 1.08, at: 1.7 } };
    }),
  };
}
if (!Array.isArray(manifest.scenes) || !manifest.scenes.length) throw new Error('The manifest needs at least one scene.');
draft ||= /partial|draft|incomplete/i.test(String(manifest.status || ''));
if (!/^#[0-9a-f]{6}$/i.test(manifest.accent || '#902bf5')) throw new Error('accent must be a six-digit hex colour.');
const accent = manifest.accent || '#902bf5';
const fps = clamp(finite(manifest.fps, 30), 1, 60);
const rootId = 'zerify-demo';
await fs.mkdir(path.join(project, 'compositions', 'scenes'), { recursive: true });
await fs.mkdir(path.join(project, 'assets', 'vendor'), { recursive: true });
const gsapFile = path.join(project, 'assets', 'vendor', 'gsap.min.js');
try { await fs.access(gsapFile); }
catch { throw new Error('Missing assets/vendor/gsap.min.js. Keep the local GSAP asset with the project.'); }

const timeline = [];
let offset = 0;
const ids = new Set();
for (let i = 0; i < manifest.scenes.length; i++) {
  const scene = manifest.scenes[i];
  const id = String(scene.id || `scene-${i + 1}`).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (!id || ids.has(id) || id === rootId) throw new Error(`Duplicate, reserved or empty scene id: ${id}`);
  ids.add(id);
  const seconds = round(finite(scene.seconds, 6));
  if (seconds < 1) throw new Error(`${id}: seconds must be at least 1`);
  const asset = String(scene.file || '').replace(/\.png$/i, '');
  if (!/^[a-zA-Z0-9_-]+$/.test(asset)) throw new Error(`${id}: file must be a PNG filename stem, without directories`);
  const filename = path.join(captures, `${asset}.png`);
  const bytes = await fs.readFile(filename);
  const [rawW, rawH] = imageSize(bytes);
  const cropTop = clamp(finite(scene.cropTop, 80), 0, rawH - 1);
  const cropBottom = clamp(finite(scene.cropBottom, 0), 0, rawH - cropTop - 1);
  const cropH = rawH - cropTop - cropBottom;
  const baseScale = Math.min(1760 / rawW, 810 / cropH);
  const frameW = round(rawW * baseScale), frameH = round(cropH * baseScale);
  const frameX = round((1920 - frameW) / 2), frameY = round(190 + (810 - frameH) / 2);
  const imgH = round(rawH * baseScale), imgY = round(-cropTop * baseScale);
  const imageSrc = `assets/captures/${asset}.png`;
  const focus = scene.focus || {};
  const zoom = clamp(finite(focus.scale, 1.12), 1, 3);
  const fx = clamp(finite(focus.x, 0.5), 0, 1), fy = clamp(finite(focus.y, 0.5), 0, 1);
  const toX = round(clamp(frameW / 2 - fx * frameW * zoom, frameW - frameW * zoom, 0));
  const toY = round(clamp(frameH / 2 - fy * frameH * zoom, frameH - frameH * zoom, 0));
  const focusAt = clamp(finite(focus.at, 1.4), 0.4, Math.max(0.4, seconds - 1.5));
  const resetAt = Math.max(focusAt + 0.9, seconds - 1.1);
  const clicks = (scene.clicks || []).map((c, n) => ({
    at: clamp(finite(c.at, seconds - 0.35), 0.8, seconds - 0.15),
    x: round(clamp(finite(c.x, rawW * .8), 0, rawW) * baseScale),
    y: round((clamp(finite(c.y, cropTop + cropH * .75), cropTop, rawH - cropBottom) - cropTop) * baseScale),
    id: `${id}-click-${n + 1}`,
  })).sort((a, b) => a.at - b.at);
  const cursorOn = scene.cleanCursor === true && clicks.length > 0;
  const titleKey = i === 0 ? 'headline' : 'title';
  const title = scene.title || manifest.headline || 'Zerify walkthrough';
  const subtitle = (scene.note && scene.note.length <= 95 ? scene.note : scene.subtitle) || '';
  const vars = [
    { id: titleKey, type: 'string', label: 'Scene title', default: title, maxLength: 80 },
    { id: 'subtitle', type: 'string', label: 'Context', default: subtitle, maxLength: 100 },
    { id: 'capture', type: 'image', label: 'App capture', default: imageSrc },
  ];
  const pointer = cursorOn ? `
        <svg id="${id}-cursor" viewBox="0 0 24 24" aria-hidden="true" data-layout-ignore><path d="M5 3 L5 19 L9 15 L12 22 L15 20.5 L11.5 14 L18 14 Z" /></svg>
        ${clicks.map(c => `<div id="${c.id}" class="${id}-click-ring" data-layout-ignore></div>`).join('\n        ')}` : '';
  let cursorTweens = '';
  if (cursorOn) {
    let last = { x: frameW * .84, y: frameH * .82 };
    cursorTweens += `tl.set('#${id}-cursor',{x:${round(last.x - 8.33)},y:${round(last.y - 5)}} ,0);\n`;
    for (const click of clicks) {
      cursorTweens += `tl.fromTo('#${id}-cursor',{x:${round(last.x - 8.33)},y:${round(last.y - 5)}},{x:${round(click.x - 8.33)},y:${round(click.y - 5)},duration:0.65,ease:'power2.inOut',immediateRender:false},${round(click.at - .75)});\n`;
      cursorTweens += `tl.fromTo('#${id}-cursor',{scale:1},{scale:0.88,duration:0.07,ease:'power2.out',immediateRender:false},${click.at});\n`;
      cursorTweens += `tl.to('#${id}-cursor',{scale:1,duration:0.16,ease:'power2.out'},${round(click.at + .07)});\n`;
      cursorTweens += `tl.fromTo('#${click.id}',{x:${round(click.x - 22)},y:${round(click.y - 22)},opacity:0.6,scale:.25},{opacity:0,scale:1.3,duration:.32,ease:'power2.out',immediateRender:false},${click.at});\n`;
      last = click;
    }
  }
  const html = `<!doctype html>
<html lang="en" data-composition-variables="${attrJSON(vars)}">
<body><template>
  <style>
    #root { position:absolute; inset:0; overflow:hidden; font-family:Inter,sans-serif; color:#171326; }
    #${id}-ground { position:absolute; inset:0; background:#f4f2fa; }
    #${id}-context { position:absolute; left:192px; top:56px; width:1536px; height:42px; font-size:28px; line-height:42px; font-weight:400; color:#65586f; }
    #${id}-title { position:absolute; left:192px; top:103px; width:1536px; height:55px; margin:0; font-size:40px; line-height:55px; font-weight:700; letter-spacing:-1px; color:#171326; }
    #${id}-screen { position:absolute; left:${frameX}px; top:${frameY}px; width:${frameW}px; height:${frameH}px; overflow:hidden; border-radius:20px; box-shadow:0 18px 50px rgba(23,19,38,.12); background:white; }
    #${id}-camera { position:absolute; inset:0; width:100%; height:100%; transform-origin:0 0; }
    #${id}-capture { position:absolute; left:0; top:${imgY}px; width:${frameW}px; height:${imgH}px; max-width:none; object-fit:fill; }
    #${id}-cursor { position:absolute; left:0; top:0; width:40px; height:40px; transform-origin:8.33px 5px; z-index:3; }
    #${id}-cursor path { fill:#fff; stroke:#171326; stroke-width:1.35; stroke-linejoin:round; }
    .${id}-click-ring { position:absolute; left:0; top:0; width:44px; height:44px; border:2px solid var(--accent,${accent}); border-radius:50%; opacity:0; z-index:2; }
  </style>
  <div id="root" data-composition-id="${id}" data-duration="${seconds}" data-width="1920" data-height="1080">
    <div id="${id}-ground"></div>
    <div id="${id}-context" data-var-text="subtitle">${esc(subtitle)}</div>
    <h1 id="${id}-title" data-var-text="${titleKey}">${esc(title)}</h1>
    <div id="${id}-screen" data-layout-allow-overflow>
      <div id="${id}-camera">
        <img id="${id}-capture" class="clip" data-start="0" data-duration="${seconds}" data-track-index="1" data-var-src="capture" src="${imageSrc}" alt="${esc(title)}" />${pointer}
      </div>
    </div>
  </div>
  <script>
    (function(){
      var tl=gsap.timeline({paused:true});
      tl.fromTo('#${id}-camera',{x:0,y:0,scale:1},{x:${toX},y:${toY},scale:${zoom},duration:.85,ease:'power2.inOut',immediateRender:false},${focusAt});
      ${focus.hold === true ? '' : `tl.to('#${id}-camera',{x:0,y:0,scale:1,duration:.65,ease:'power2.inOut'},${round(resetAt)});`}
      ${cursorTweens}
      window.__timelines=window.__timelines||{};
      window.__timelines['${id}']=tl;
    })();
  </script>
</template></body></html>
`;
  await fs.writeFile(path.join(project, 'compositions', 'scenes', `${id}.html`), html);
  timeline.push({ id, title, subtitle, note: scene.note, start: round(offset), end: round(offset + seconds), seconds, file: `compositions/scenes/${id}.html`, capture: imageSrc, cropTop, cropBottom, cleanCursor: cursorOn });
  offset = round(offset + seconds);
}
const rootVars = [
  { id: 'headline', type: 'string', label: 'Opening headline', default: manifest.scenes[0].title || manifest.headline || 'Zerify walkthrough', maxLength: 80 },
  { id: 'accent', type: 'color', label: 'Zerify accent', default: accent },
];
const root = `<!doctype html>
<html lang="en" data-resolution="landscape" data-composition-variables="${attrJSON(rootVars)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1920,height=1080" />
  <title>${esc(manifest.headline || 'Zerify product walkthrough')}${draft ? ' — capture draft' : ''}</title>
  <script src="assets/vendor/gsap.min.js"></script>
  <style>
    *{box-sizing:border-box;} html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#f4f2fa;}
    :root{--accent:${accent};} #root{position:relative;width:100%;height:100%;overflow:hidden;}
    .clip{position:absolute;inset:0;width:100%;height:100%;}
  </style>
</head>
<body>
  <div id="root" data-composition-id="${rootId}" data-start="0" data-duration="${offset}" data-fps="${fps}" data-width="1920" data-height="1080">
    ${timeline.map((s, i) => `<div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="${s.file}" data-start="${s.start}" data-duration="${s.seconds}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join('\n    ')}
  </div>
  <script>window.__timelines=window.__timelines||{};window.__timelines[${js(rootId)}]=gsap.timeline({paused:true});</script>
</body></html>
`;
await fs.writeFile(path.join(project, 'index.html'), root);
await fs.writeFile(path.join(project, 'scene-timing.json'), JSON.stringify({ title: manifest.headline, status: manifest.status, draft, fps, duration: offset, scenes: timeline }, null, 2) + '\n');
const status = manifest.status || (draft ? 'Capture draft: only the available screens are assembled.' : 'Editable walkthrough assembled; review and check before delivery.');
const coverage = draft
  ? 'This partial draft demonstrates only the stages listed in scene-timing.json; uncaptured steps are not filled with invented screens.'
  : 'The full scene sequence and source capture for each stage are listed in scene-timing.json.';
await fs.writeFile(path.join(project, 'README.md'), `# Zerify demo video\n\n**Status:** ${status}\n\nCurrent assembly: ${timeline.length} scenes, ${offset} seconds, 1920 × 1080 at ${fps}fps. This is an editable composition made from real app screenshots, with camera and cursor animation.\n\n${coverage}\n\n## Edit and preview\n\nEdit scenes.json and run \`node build-video.mjs\`. Open with \`npx hyperframes@0.8.231 preview --background\`; the HyperFrames desktop app can also edit the project. See EDITING.md for camera, cursor, crop and timing fields. Rebuilding replaces generated HTML scene edits.\n\n## Validate and export\n\nRun \`npm run check\`, then \`npx hyperframes@0.8.231 snapshot --review\` and inspect the frames. Render only after reviewing the finished timeline: \`npx hyperframes@0.8.231 render --quality delivery -o zerify-demo.mp4\`.\n\nOriginal source captures are in assets/captures. scene-timing.json maps every scene to its capture and source HTML. The local GSAP asset is included for reproducible playback.\n`);
console.log(JSON.stringify({ ok: true, draft, scenes: timeline.length, duration: offset, frames: Math.round(offset * fps), manifest: usedFallback ? null : path.basename(manifestPath), timing: 'scene-timing.json' }));
