import React from 'react';
import {useCurrentFrame} from 'remotion';
import {pop, rand} from '../beat';
import {COLORS} from '../config';
import {ACCENT, DISPLAY, withEmoji} from '../fonts';

/**
 * Обёртка «в воздухе»: абсолютное позиционирование, появление пружиной
 * и постоянное лёгкое покачивание — чтобы ничего не стояло статично.
 */
export const Float: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  at?: number;
  seed?: number;
  amp?: number;
  scale?: number;
  parallax?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, rotate = 0, at = 0, seed = 1, amp = 14, scale = 1, parallax = 0, children, style}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  const t = frame / 30;
  const dx = Math.sin(t * 1.3 + seed * 2.1) * amp + parallax * frame;
  const dy = Math.cos(t * 1.1 + seed * 1.7) * amp;
  const r = rotate + Math.sin(t * 1.7 + seed) * 5;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${r}deg) scale(${s * scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Звезда-«взрыв» с n лучами. */
export const Burst: React.FC<{size?: number; color?: string; points?: number; spin?: number; stroke?: string}> = ({
  size = 160,
  color = COLORS.lime,
  points = 12,
  spin = 1,
  stroke = COLORS.ink,
}) => {
  const frame = useCurrentFrame();
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 50 : 34;
    pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
  }
  return (
    <svg width={size} height={size} viewBox="-4 -4 108 108" style={{transform: `rotate(${frame * spin}deg)`, overflow: 'visible'}}>
      <polygon points={pts.join(' ')} fill={color} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

/** Четырёхлучевая искра. */
export const Sparkle: React.FC<{size?: number; color?: string}> = ({size = 80, color = COLORS.white}) => {
  const frame = useCurrentFrame();
  const s = 0.75 + 0.25 * Math.sin(frame / 5 + size);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${s}) rotate(${frame * 2}deg)`}}>
      <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0Z" fill={color} />
    </svg>
  );
};

/** Стикер-бейдж: «NEW», «AI», «PRO»… Белая обводка и жёсткая тень как у наклейки. */
export const Badge: React.FC<{
  text: string;
  bg?: string;
  color?: string;
  size?: number;
  font?: string;
}> = ({text, bg = COLORS.pink, color = COLORS.white, size = 56, font = ACCENT}) => (
  <div
    style={{
      background: bg,
      color,
      fontFamily: withEmoji(font),
      fontSize: size,
      fontWeight: 900,
      padding: `${size * 0.18}px ${size * 0.45}px`,
      borderRadius: size * 0.5,
      border: `${Math.max(4, size * 0.09)}px solid ${COLORS.white}`,
      boxShadow: `${size * 0.1}px ${size * 0.12}px 0 ${COLORS.ink}`,
      whiteSpace: 'nowrap',
      lineHeight: 1.1,
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
);

/** Эмодзи-наклейка в белом круге. */
export const EmojiSticker: React.FC<{emoji: string; size?: number; bg?: string}> = ({emoji, size = 130, bg = COLORS.white}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.58,
      fontFamily: withEmoji('sans-serif'),
      boxShadow: `${size * 0.05}px ${size * 0.07}px 0 ${COLORS.ink}`,
      border: `${size * 0.04}px solid ${COLORS.ink}`,
    }}
  >
    {emoji}
  </div>
);

/** Жирная изогнутая стрелка. `wiggle` — покачивание острием к цели. */
export const Arrow: React.FC<{size?: number; color?: string; flip?: boolean}> = ({size = 220, color = COLORS.lime, flip = false}) => (
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 200 140"
    style={{transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible'}}
  >
    <path
      d="M10 30 C 70 10, 130 30, 160 95"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={30}
      strokeLinecap="round"
    />
    <path d="M10 30 C 70 10, 130 30, 160 95" fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" />
    <polygon points="125,90 190,80 165,138" fill={color} stroke={COLORS.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/** Разбросанные по кадру мелкие искры/звёзды — фоновый слой движения. */
export const SparkleField: React.FC<{count?: number; seed?: number; colors?: string[]; area?: [number, number, number, number]}> = ({
  count = 14,
  seed = 1,
  colors = [COLORS.white, COLORS.lime, COLORS.cyan, COLORS.pink],
  area = [0, 0, 1080, 1920],
}) => (
  <>
    {Array.from({length: count}).map((_, i) => {
      const x = area[0] + rand(seed * 100 + i) * (area[2] - area[0]);
      const y = area[1] + rand(seed * 200 + i * 3) * (area[3] - area[1]);
      const size = 30 + rand(seed * 300 + i) * 60;
      return (
        <Float key={i} x={x} y={y} seed={i + seed} amp={20} at={Math.floor(rand(i + seed) * 20)}>
          <Sparkle size={size} color={colors[i % colors.length]} />
        </Float>
      );
    })}
  </>
);

/** Клейкая лента-«скотч» для коллажа. */
export const Tape: React.FC<{width?: number; color?: string; rotate?: number}> = ({width = 180, color = '#FFF7A8', rotate = -8}) => (
  <div
    style={{
      width,
      height: width * 0.28,
      background: `${color}cc`,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 4px 10px #0003',
      backgroundImage: 'repeating-linear-gradient(90deg, #ffffff30 0 6px, transparent 6px 12px)',
    }}
  />
);

/** Большой заголовок-плашка на тёмной подложке (для коротких подписей). */
export const Label: React.FC<{text: string; bg?: string; color?: string; size?: number; font?: string}> = ({
  text,
  bg = COLORS.ink,
  color = COLORS.white,
  size = 44,
  font = DISPLAY,
}) => (
  <div
    style={{
      background: bg,
      color,
      fontFamily: withEmoji(font),
      fontWeight: 900,
      fontSize: size,
      padding: `${size * 0.3}px ${size * 0.55}px`,
      borderRadius: size * 0.35,
      whiteSpace: 'pre-line',
      textAlign: 'center',
      lineHeight: 1.15,
      boxShadow: `0 ${size * 0.2}px ${size * 0.6}px #0007`,
    }}
  >
    {text}
  </div>
);
