import React from 'react';
import {useCurrentFrame} from 'remotion';
import {lerpc, pop, rand} from '../beat';
import {COLORS} from '../config';
import {DISPLAY, withEmoji} from '../fonts';

type Mode = 'drop' | 'explode' | 'slam' | 'rise';

/**
 * Кинетический текст: буквы вылетают по одной, под заливкой — контурное «эхо»
 * (обводка + заливка, текст поверх текста). `exitAt` — кадр, когда буквы
 * разлетаются осколками.
 */
export const KineticText: React.FC<{
  text: string;
  size: number;
  at?: number;
  stagger?: number;
  mode?: Mode;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  echo?: string | null;
  echoOffset?: number;
  font?: string;
  weight?: number;
  lineHeight?: number;
  stretch?: number;
  exitAt?: number;
  seed?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  size,
  at = 0,
  stagger = 2,
  mode = 'drop',
  color = COLORS.white,
  stroke = COLORS.ink,
  strokeWidth,
  echo = COLORS.pink,
  echoOffset,
  font = DISPLAY,
  weight = 900,
  lineHeight = 1.02,
  stretch = 1,
  exitAt,
  seed = 1,
  letterSpacing = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const lines = text.split('\n');
  const sw = strokeWidth ?? Math.max(3, size * 0.045);
  const off = echoOffset ?? size * 0.07;

  let idx = 0;
  const letterTransform = (i: number) => {
    const p = pop(frame, at + i * stagger);
    const r1 = rand(seed * 31 + i) - 0.5;
    const r2 = rand(seed * 57 + i * 7) - 0.5;
    let tf = '';
    let opacity = Math.min(1, p * 3);
    switch (mode) {
      case 'drop':
        tf = `translateY(${(1 - p) * -size * 2.2}px) rotate(${(1 - p) * r1 * 70}deg)`;
        break;
      case 'explode':
        tf = `translate(${(1 - p) * r1 * 1400}px, ${(1 - p) * r2 * 1600}px) rotate(${(1 - p) * r1 * 360}deg) scale(${1 + (1 - p) * 2})`;
        break;
      case 'slam':
        tf = `scale(${1 + (1 - p) * 3.5}) rotate(${(1 - p) * r1 * 30}deg)`;
        break;
      case 'rise':
        tf = `translateY(${(1 - p) * size * 1.4}px) scaleY(${0.3 + p * 0.7})`;
        break;
    }
    if (exitAt !== undefined && frame > exitAt) {
      const e = lerpc(frame, [exitAt, exitAt + 12], [0, 1], (t) => t * t);
      tf += ` translate(${e * r1 * 1600}px, ${e * r2 * 1800}px) rotate(${e * r2 * 540}deg) scale(${1 - e * 0.5})`;
      opacity *= 1 - e;
    }
    return {transform: tf, opacity};
  };

  const renderLines = (layer: 'echo' | 'main') => {
    idx = 0;
    return lines.map((line, li) => (
      <div key={li} style={{display: 'flex', justifyContent: 'center', whiteSpace: 'pre'}}>
        {Array.from(line).map((ch, ci) => {
          const i = idx++;
          const {transform, opacity} = letterTransform(i);
          return (
            <span
              key={ci}
              style={{
                display: 'inline-block',
                transform,
                opacity,
                color: layer === 'echo' ? 'transparent' : color,
                WebkitTextStroke: layer === 'echo' ? `${sw}px ${echo}` : `${sw}px ${stroke}`,
                paintOrder: 'stroke fill',
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </div>
    ));
  };

  const base: React.CSSProperties = {
    fontFamily: withEmoji(font),
    fontWeight: weight,
    fontSize: size,
    lineHeight,
    letterSpacing,
    textAlign: 'center',
    transform: `scaleY(${stretch})`,
  };

  return (
    <div style={{position: 'relative', ...style}}>
      {echo ? (
        <div style={{...base, position: 'absolute', inset: 0, translate: `${off}px ${off * 1.2}px`}}>{renderLines('echo')}</div>
      ) : null}
      <div style={{...base, position: 'relative'}}>{renderLines('main')}</div>
    </div>
  );
};

/**
 * Заголовок сцены: всегда в верхней части safe-зоны, по центру.
 * Крупно и контрастно — читается за секунду.
 */
export const SceneHeadline: React.FC<{
  text: string;
  top?: number;
  size?: number;
  at?: number;
  color?: string;
  echo?: string;
  mode?: Mode;
  exitAt?: number;
}> = ({text, top = 150, size = 104, at = 0, color = COLORS.white, echo = COLORS.pink, mode = 'drop', exitAt}) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 9) * 1.5;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `rotate(${wobble}deg)`}}>
      <KineticText text={text} size={size} at={at} color={color} echo={echo} mode={mode} exitAt={exitAt} />
    </div>
  );
};
