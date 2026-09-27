import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(18);
Config.setOverwriteOutput(true);

// Если в системе есть готовый Chromium (например, в облачном окружении) — используем его,
// иначе Remotion сам скачает Chrome Headless Shell.
const localChrome = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}
