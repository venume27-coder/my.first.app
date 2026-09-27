import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rand} from '../beat';
import {COLORS} from '../config';

/** Длина глитча вокруг склейки (кадров до / после). */
const PRE = 4;
const POST = 7;

/** Сила глитча 0…1 в текущем кадре относительно ближайшей склейки. */
export const glitchAmount = (frame: number, cuts: number[]) => {
  let g = 0;
  for (const c of cuts) {
    const d = frame - c;
    if (d >= -PRE && d < 0) g = Math.max(g, (d + PRE + 1) / (PRE + 1));
    if (d >= 0 && d < POST) g = Math.max(g, 1 - d / POST);
  }
  return g;
};

/**
 * SVG-фильтр хроматической аберрации: разводит R и B каналы в стороны.
 * Применяется к слою сцен через `filter: url(#chroma)`.
 */
export const ChromaDefs: React.FC<{amount: number}> = ({amount}) => {
  const d = amount * 26;
  return (
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id="chroma" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={d} dy={-d * 0.3} result="r2" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={-d} dy={d * 0.3} result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
    </svg>
  );
};

/** Цветные полосы-«срывы» и вспышка поверх кадра во время глитча. */
export const GlitchBars: React.FC<{amount: number; frame: number}> = ({amount, frame}) => {
  if (amount <= 0) return null;
  const colors = [COLORS.cyan, COLORS.pink, COLORS.lime, COLORS.violet, COLORS.white];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 9}).map((_, i) => {
        const r = rand(frame * 13 + i * 7);
        if (r > amount) return null;
        const top = rand(frame * 3 + i) * 1920;
        const h = 8 + rand(frame + i * 11) * 90;
        const x = (rand(frame * 5 + i) - 0.5) * 240 * amount;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top,
              width: 1080,
              height: h,
              background: colors[i % colors.length],
              opacity: 0.55 * amount,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: '#fff', opacity: amount > 0.85 ? 0.35 : 0}} />
    </AbsoluteFill>
  );
};

/** Сдвиг/тряска слоя сцен во время глитча. */
export const glitchTransform = (amount: number, frame: number) => {
  if (amount <= 0) return '';
  const x = (rand(frame * 17) - 0.5) * 60 * amount;
  const y = (rand(frame * 29) - 0.5) * 30 * amount;
  const skew = (rand(frame * 7) - 0.5) * 8 * amount;
  return `translate(${x}px, ${y}px) skewX(${skew}deg)`;
};
