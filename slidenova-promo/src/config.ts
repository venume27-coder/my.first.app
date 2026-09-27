/**
 * ЕДИНЫЙ КОНФИГ РОЛИКА.
 * Здесь меняются цвета, тексты и тайминги. Компоненты сцен берут всё отсюда.
 */

// ─── Видео ────────────────────────────────────────────────────────────────
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

/** 120 BPM → один бит = 0.5 с = 15 кадров. Все сцены начинаются ровно на бите. */
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM; // 15

/** Безопасная зона под интерфейс соцсетей (Reels / Shorts / TikTok / Stories). */
export const SAFE = {
  top: 120,
  bottom: 250,
  side: 70,
};

// ─── Бренд ────────────────────────────────────────────────────────────────
export const BRAND = {
  name: 'SlideNovaBot',
  handle: '@SlideNovaBot',
  link: 't.me/SlideNovaBot',
};

// ─── Палитра ──────────────────────────────────────────────────────────────
export const COLORS = {
  violet: '#7B2FF7',
  cyan: '#00D4FF',
  pink: '#FF2E93',
  lime: '#C6FF00',
  orange: '#FF6B00',
  red: '#FF1F3D',
  white: '#FFFFFF',
  ink: '#0B0620', // почти чёрный фиолетовый — для текста на светлом
  deep: '#12052E', // тёмная база фона
  // Telegram (тёмная тема)
  tgBg: '#0E1621',
  tgHeader: '#17212B',
  tgIn: '#182533',
  tgOut: '#2B5278',
  tgButton: '#1E2C3A',
  tgAccent: '#6AB2F2',
  tgText: '#F5F5F5',
  tgMuted: '#7F91A4',
};

/** Наборы цветов для mesh-градиента каждой сцены. */
export const MESH = {
  hook: [COLORS.red, COLORS.violet, COLORS.orange, COLORS.pink],
  solution: [COLORS.violet, COLORS.pink, COLORS.cyan, COLORS.lime],
  how: [COLORS.cyan, COLORS.violet, COLORS.pink, COLORS.deep],
  styles: [COLORS.pink, COLORS.orange, COLORS.violet, COLORS.lime],
  custom: [COLORS.lime, COLORS.cyan, COLORS.violet, COLORS.pink],
  images: [COLORS.orange, COLORS.pink, COLORS.violet, COLORS.cyan],
  transitions: [COLORS.cyan, COLORS.lime, COLORS.violet, COLORS.pink],
  premium: [COLORS.violet, COLORS.orange, COLORS.pink, COLORS.lime],
  cta: [COLORS.pink, COLORS.violet, COLORS.cyan, COLORS.lime],
} as const;

// ─── Тайминги (в битах; 1 бит = 15 кадров) ────────────────────────────────
// Сумма = 104 бита = 1560 кадров = 52 секунды.
export const SCENE_BEATS = {
  hook: 6, //        0–3 с
  solution: 8, //    3–7 с
  how: 14, //        7–14 с
  styles: 12, //    14–20 с
  custom: 12, //    20–26 с
  images: 12, //    26–32 с
  transitions: 10, // 32–37 с
  premium: 14, //   37–44 с
  cta: 16, //       44–52 с
} as const;

export type SceneKey = keyof typeof SCENE_BEATS;
export const SCENE_ORDER: SceneKey[] = [
  'hook',
  'solution',
  'how',
  'styles',
  'custom',
  'images',
  'transitions',
  'premium',
  'cta',
];

export const sceneFrames = (key: SceneKey) => SCENE_BEATS[key] * BEAT;

export const sceneStart = (key: SceneKey) => {
  let acc = 0;
  for (const k of SCENE_ORDER) {
    if (k === key) return acc;
    acc += sceneFrames(k);
  }
  return acc;
};

export const TOTAL_FRAMES = SCENE_ORDER.reduce((a, k) => a + sceneFrames(k), 0);

// ─── Музыка ───────────────────────────────────────────────────────────────
export const MUSIC = {
  file: 'music.mp3', // положите трек в public/music.mp3
  volume: 0.9,
  fadeOutFrames: 30,
};

// ─── Озвучка ──────────────────────────────────────────────────────────────
export const VOICE = {
  file: 'voice.mp3', // генерируется: python scripts/make_voiceover.py
  volume: 1,
  /** Во сколько раз приглушать музыку, пока звучит голос. */
  musicDuck: 0.4,
  /** Плавность приглушения (кадров). */
  duckRamp: 5,
};

// ─── Тексты ───────────────────────────────────────────────────────────────
export const MARQUEE_TEXT = 'ПРЕЗЕНТАЦИЯ ЗА МИНУТУ ✦ @SLIDENOVABOT ✦ ';

export const TEXTS = {
  hook: {
    slideTitle: 'Презентация\nк завтра?',
    timer: '00:59',
    panic: 'А СЛАЙДОВ НЕТ',
  },
  solution: {
    kicker: 'Есть решение',
    title: 'SlideNova',
    titleTail: 'Bot',
    sub: 'ИИ делает презентацию за тебя',
  },
  how: {
    headline: 'Просто\nнапиши тему',
    userMsg: 'Маркетинговая стратегия для кофейни ☕',
    botReply: 'Отлично! Готовлю презентацию на 10 слайдов…',
    progressLabel: 'Генерация слайдов',
    done: '✅ Готово! Твоя презентация:',
    file: 'Стратегия_кофейни.pptx',
    fileMeta: '10 слайдов · 2.4 МБ',
    caption: 'ГОТОВО',
  },
  styles: {
    headline: 'Выбери\nстиль',
    items: [
      {key: 'business', name: 'Бизнес', emoji: '💼'},
      {key: 'startup', name: 'Стартап', emoji: '🚀'},
      {key: 'edu', name: 'Образовательный', emoji: '🎓'},
      {key: 'social', name: 'Социальный', emoji: '💬'},
    ],
  },
  custom: {
    headline: 'Своё\nоформление',
    font: 'Шрифт',
    palette: 'Палитра',
    logo: 'Логотип',
    logoText: 'КОФЕ\nЛАБ',
    slideTitle: 'Кофейня\n2025',
  },
  images: {
    headline: 'Картинки\nот ИИ',
    command: '/image уютная кофейня, утро, неон',
    generating: 'Рисую изображение…',
    photos: 'Подбор фото',
    backgrounds: 'Декоративные фоны',
    backgroundsSub: 'слайды оформляются сами',
  },
  transitions: {
    headline: 'Переходы',
    names: ['FADE', 'PUSH', 'ZOOM'],
    caption: 'Анимации подбираются\nпод стиль',
  },
  premium: {
    headline: 'PREMIUM',
    free: {
      title: 'Бесплатно',
      items: ['Базовые изображения', 'Все 4 стиля', 'Генерация по теме'],
    },
    pro: {
      title: 'Premium',
      items: ['Изображения премиум-качества', 'Больше возможностей', 'Больше генераций'],
    },
    payBadge: 'Оплата через Click',
    auto: 'Premium включается\nавтоматически сразу\nпосле оплаты',
  },
  cta: {
    line1: 'ПРЕЗЕНТАЦИЯ',
    line2: 'ЗА МИНУТУ',
    button: 'Открыть в Telegram',
  },
} as const;

// ─── Демо-слайды «кофейня» (для макетов презентаций) ──────────────────────
export const DEMO_SLIDES = [
  {title: 'Маркетинг\nкофейни', kind: 'cover'},
  {title: 'Целевая\nаудитория', kind: 'bullets'},
  {title: 'Рост\nпродаж', kind: 'chart'},
  {title: 'Каналы\nпродвижения', kind: 'grid'},
  {title: 'Бюджет', kind: 'chart'},
  {title: 'План\nна квартал', kind: 'bullets'},
] as const;
