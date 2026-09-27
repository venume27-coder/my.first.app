import React from 'react';
import {COLORS} from '../config';
import {BODY, DISPLAY, SHOWCASE_FONTS, withEmoji} from '../fonts';

export type SlideStyle = 'business' | 'startup' | 'edu' | 'social' | 'neon';
export type SlideKind = 'cover' | 'bullets' | 'chart' | 'grid';

type Theme = {
  bg: string;
  fg: string;
  accent: string;
  accent2: string;
  font: string;
  radius: number;
  decor?: 'lines' | 'blobs' | 'grid' | 'bubbles' | 'glow';
};

export const THEMES: Record<SlideStyle, Theme> = {
  business: {bg: 'linear-gradient(135deg, #0F1B3D, #1D2F5E)', fg: '#FFFFFF', accent: '#F5B700', accent2: '#5B8DEF', font: BODY, radius: 10, decor: 'lines'},
  startup: {bg: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.pink})`, fg: '#FFFFFF', accent: COLORS.lime, accent2: COLORS.cyan, font: DISPLAY, radius: 26, decor: 'blobs'},
  edu: {bg: '#FFF4DA', fg: '#23324A', accent: COLORS.orange, accent2: '#2FA36B', font: SHOWCASE_FONTS[4].family, radius: 16, decor: 'grid'},
  social: {bg: `linear-gradient(135deg, ${COLORS.cyan}, #9B7BFF)`, fg: '#FFFFFF', accent: COLORS.lime, accent2: COLORS.pink, font: BODY, radius: 34, decor: 'bubbles'},
  neon: {bg: 'linear-gradient(135deg, #140A33, #2A0F52)', fg: '#FFFFFF', accent: COLORS.pink, accent2: COLORS.cyan, font: DISPLAY, radius: 18, decor: 'glow'},
};

const Decor: React.FC<{theme: Theme; w: number}> = ({theme, w}) => {
  switch (theme.decor) {
    case 'lines':
      return (
        <>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w * 0.02, background: theme.accent}} />
          <div style={{position: 'absolute', right: w * 0.05, bottom: w * 0.04, width: w * 0.2, height: 3, background: `${theme.accent}99`}} />
        </>
      );
    case 'blobs':
      return (
        <>
          <div style={{position: 'absolute', right: -w * 0.08, top: -w * 0.1, width: w * 0.4, height: w * 0.4, borderRadius: '50%', background: `${theme.accent}55`}} />
          <div style={{position: 'absolute', right: w * 0.18, bottom: -w * 0.12, width: w * 0.25, height: w * 0.25, borderRadius: '50%', background: `${theme.accent2}66`}} />
        </>
      );
    case 'grid':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(#23324A12 2px, transparent 2px), linear-gradient(90deg, #23324A12 2px, transparent 2px)',
            backgroundSize: `${w * 0.05}px ${w * 0.05}px`,
          }}
        />
      );
    case 'bubbles':
      return (
        <>
          {[0.12, 0.3, 0.55].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: w * (0.04 + i * 0.1),
                top: w * (0.05 + i * 0.12),
                width: w * s * 0.35,
                height: w * s * 0.25,
                borderRadius: w * 0.04,
                background: '#ffffff40',
              }}
            />
          ))}
        </>
      );
    case 'glow':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 80% 20%, ${theme.accent}66, transparent 45%), radial-gradient(circle at 10% 90%, ${theme.accent2}55, transparent 40%)`,
          }}
        />
      );
    default:
      return null;
  }
};

/**
 * Мини-слайд презентации (16:9). Используется во всех сценах:
 * стиль, шрифт, палитра, логотип и фон переопределяются пропсами.
 */
export const MiniSlide: React.FC<{
  width: number;
  styleKey?: SlideStyle;
  kind?: SlideKind;
  title: string;
  titleFont?: string;
  accent?: string;
  bg?: string;
  fg?: string;
  logo?: React.ReactNode;
  background?: React.ReactNode;
  image?: React.ReactNode;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({width: w, styleKey = 'startup', kind = 'cover', title, titleFont, accent, bg, fg, logo, background, image, shadow = true, style}) => {
  const theme = THEMES[styleKey];
  const h = (w * 9) / 16;
  const a = accent ?? theme.accent;
  const color = fg ?? theme.fg;
  const titleSize = w * (kind === 'cover' ? 0.085 : 0.062);

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: theme.radius * (w / 500),
        background: bg ?? theme.bg,
        overflow: 'hidden',
        boxShadow: shadow ? `0 ${w * 0.03}px ${w * 0.08}px #0008, 0 0 0 ${Math.max(2, w * 0.006)}px #ffffff55` : undefined,
        ...style,
      }}
    >
      {background ?? <Decor theme={theme} w={w} />}
      <div
        style={{
          position: 'absolute',
          left: w * 0.07,
          top: h * 0.12,
          width: kind === 'cover' ? w * 0.62 : w * 0.46,
          fontFamily: withEmoji(titleFont ?? theme.font),
          fontWeight: 900,
          fontSize: titleSize,
          lineHeight: 1.08,
          color,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
        <div style={{width: w * 0.12, height: Math.max(3, w * 0.012), background: a, marginTop: w * 0.025, borderRadius: 4}} />
      </div>

      {kind === 'cover' && !image ? (
        <div style={{position: 'absolute', left: w * 0.07, bottom: h * 0.13, display: 'flex', gap: w * 0.015}}>
          {[0.18, 0.1, 0.14].map((ww, i) => (
            <div key={i} style={{width: w * ww, height: w * 0.018, borderRadius: 6, background: i === 0 ? a : `${color}55`}} />
          ))}
        </div>
      ) : null}

      {kind === 'bullets' ? (
        <div style={{position: 'absolute', left: w * 0.07, top: h * 0.52, display: 'flex', flexDirection: 'column', gap: w * 0.022}}>
          {[0.3, 0.24, 0.34].map((ww, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: w * 0.018}}>
              <div style={{width: w * 0.022, height: w * 0.022, borderRadius: '50%', background: a}} />
              <div style={{width: w * ww, height: w * 0.016, borderRadius: 6, background: `${color}70`}} />
            </div>
          ))}
        </div>
      ) : null}

      {kind === 'chart' ? (
        <div style={{position: 'absolute', right: w * 0.07, bottom: h * 0.14, display: 'flex', alignItems: 'flex-end', gap: w * 0.022, height: h * 0.6}}>
          {[0.35, 0.55, 0.45, 0.75, 1].map((v, i) => (
            <div
              key={i}
              style={{
                width: w * 0.055,
                height: `${v * 100}%`,
                borderRadius: w * 0.008,
                background: i === 4 ? a : i % 2 ? theme.accent2 : `${color}88`,
              }}
            />
          ))}
        </div>
      ) : null}

      {kind === 'grid' ? (
        <div
          style={{
            position: 'absolute',
            right: w * 0.06,
            top: h * 0.14,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: w * 0.02,
            width: w * 0.4,
          }}
        >
          {[a, theme.accent2, `${color}66`, a].map((c, i) => (
            <div key={i} style={{height: h * 0.3, borderRadius: w * 0.02, background: c, opacity: 0.9}} />
          ))}
        </div>
      ) : null}

      {image ? (
        <div
          style={{
            position: 'absolute',
            right: w * 0.06,
            top: h * 0.12,
            width: w * 0.36,
            height: h * 0.76,
            borderRadius: w * 0.025,
            overflow: 'hidden',
            boxShadow: '0 6px 20px #0006',
          }}
        >
          {image}
        </div>
      ) : null}

      {logo ? <div style={{position: 'absolute', right: w * 0.035, top: w * 0.035}}>{logo}</div> : null}
    </div>
  );
};
