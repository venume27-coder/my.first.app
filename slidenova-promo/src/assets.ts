import {getStaticFiles} from 'remotion';
import {MUSIC, VOICE} from './config';

const files = () => {
  try {
    return getStaticFiles();
  } catch {
    return [];
  }
};

/** Есть ли public/music.mp3. Если нет — ролик рендерится без звука. */
export const hasMusic = () => files().some((f) => f.name === MUSIC.file);

/** Есть ли public/voice.mp3 (озвучка). */
export const hasVoice = () => files().some((f) => f.name === VOICE.file);

/**
 * Скриншоты пользователя из public/screens/ (png/jpg/webp), по алфавиту.
 * Если папка пуста — сцены рисуют Telegram-интерфейс сами.
 */
export const userScreens = (): string[] =>
  files()
    .map((f) => f.name.replace(/\\/g, '/'))
    .filter((n) => /^screens\/.+\.(png|jpe?g|webp)$/i.test(n))
    .sort();
