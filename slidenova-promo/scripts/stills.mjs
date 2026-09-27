/**
 * Рендер превью (PNG) — по одному кадру из середины каждой сцены — в out/previews/.
 *
 *   npm run stills                 → чистые кадры
 *   npm run stills -- --guides     → с разметкой safe-зоны (красные поля)
 *   npm run stills -- --frames=100,450   → произвольные кадры
 */
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const BEAT = 15;
// Должно совпадать с SCENE_BEATS / SCENE_ORDER в src/config.ts
const SCENES = [
  ['01-hook', 6],
  ['02-solution', 8],
  ['03-how', 14],
  ['04-styles', 12],
  ['05-custom', 12],
  ['06-images', 12],
  ['07-transitions', 10],
  ['08-premium', 14],
  ['09-cta', 16],
];

const args = process.argv.slice(2);
const guides = args.includes('--guides');
const framesArg = args.find((a) => a.startsWith('--frames='));
const outDir = path.resolve('out/previews');
fs.mkdirSync(outDir, {recursive: true});

let jobs;
if (framesArg) {
  jobs = framesArg
    .slice('--frames='.length)
    .split(',')
    .map((f) => [`frame-${f}`, Number(f)]);
} else {
  let start = 0;
  jobs = SCENES.map(([name, beats]) => {
    const dur = beats * BEAT;
    const mid = start + Math.floor(dur / 2);
    start += dur;
    return [name, mid];
  });
}

const localChrome = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(localChrome) ? localChrome : null;

console.log('Сборка бандла…');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {showSafeZone: guides};
const composition = await selectComposition({serveUrl, id: 'SlideNovaPromo', inputProps, browserExecutable});

for (const [name, frame] of jobs) {
  const output = path.join(outDir, `${name}${guides ? '-guides' : ''}.png`);
  await renderStill({composition, serveUrl, output, frame, inputProps, browserExecutable, imageFormat: 'png'});
  console.log(`✓ ${path.relative(process.cwd(), output)} (кадр ${frame})`);
}
