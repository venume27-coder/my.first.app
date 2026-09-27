import {loadFont as loadUnbounded} from '@remotion/google-fonts/Unbounded';
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {loadFont as loadRussoOne} from '@remotion/google-fonts/RussoOne';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadLobster} from '@remotion/google-fonts/Lobster';
import {loadFont as loadPressStart} from '@remotion/google-fonts/PressStart2P';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadEmoji} from '@remotion/google-fonts/NotoColorEmoji';

const cyr: ('cyrillic' | 'latin')[] = ['cyrillic', 'latin'];

/** Жирный гротеск для заголовков. */
export const DISPLAY = loadUnbounded('normal', {weights: ['700', '900'], subsets: cyr}).fontFamily;
/** Читаемый шрифт для мелкого текста. */
export const BODY = loadManrope('normal', {weights: ['500', '700', '800'], subsets: cyr}).fontFamily;
/** Акцентный гротеск (кнопки, бейджи). */
export const ACCENT = loadRussoOne('normal', {weights: ['400'], subsets: cyr}).fontFamily;

const emoji = loadEmoji('normal', {weights: ['400'], subsets: ['emoji']}).fontFamily;

/** Гарнитуры для сцены «выбор шрифта». */
export const SHOWCASE_FONTS = [
  {label: 'Unbounded', family: DISPLAY},
  {label: 'Playfair', family: loadPlayfair('normal', {weights: ['900'], subsets: cyr}).fontFamily},
  {label: 'Lobster', family: loadLobster('normal', {weights: ['400'], subsets: cyr}).fontFamily},
  {label: 'Pixel', family: loadPressStart('normal', {weights: ['400'], subsets: cyr}).fontFamily},
  {label: 'Caveat', family: loadCaveat('normal', {weights: ['700'], subsets: cyr}).fontFamily},
  {label: 'Russo', family: ACCENT},
];

/** Хвост font-family, чтобы эмодзи везде рендерились цветными. */
export const withEmoji = (family: string) => `${family}, ${emoji}, sans-serif`;
