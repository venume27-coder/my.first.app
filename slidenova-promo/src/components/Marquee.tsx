import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, MARQUEE_TEXT, WIDTH} from '../config';
import {DISPLAY, withEmoji} from '../fonts';

/** Бегущая строка-лента «ПРЕЗЕНТАЦИЯ ЗА МИНУТУ ✦ @SLIDENOVABOT ✦». */
export const Marquee: React.FC<{
  top: number;
  rotate?: number;
  speed?: number;
  bg?: string;
  color?: string;
  size?: number;
  reverse?: boolean;
  text?: string;
}> = ({
  top,
  rotate = -6,
  speed = 7,
  bg = COLORS.lime,
  color = COLORS.ink,
  size = 54,
  reverse = false,
  text = MARQUEE_TEXT,
}) => {
  const frame = useCurrentFrame();
  const shift = frame * speed;
  return (
    <div
      style={{
        position: 'absolute',
        left: -300,
        top,
        width: WIDTH + 600,
        transform: `rotate(${rotate}deg)`,
        background: bg,
        borderTop: `6px solid ${COLORS.ink}`,
        borderBottom: `6px solid ${COLORS.ink}`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: `${size * 0.22}px 0`,
        boxShadow: '0 18px 40px #0006',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          transform: `translateX(${reverse ? shift - 3000 : -shift}px)`,
          fontFamily: withEmoji(DISPLAY),
          fontWeight: 900,
          fontSize: size,
          color,
          letterSpacing: 2,
        }}
      >
        {text.repeat(14)}
      </div>
    </div>
  );
};
