import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS} from '../config';
import {DISPLAY} from '../fonts';

/**
 * Векторные иллюстрации: «сгенерированная ИИ» картинка кофейни,
 * «подобранные фото», декоративные фоны и демо-логотип.
 * Всё рисуется SVG — внешние файлы не нужны.
 */

/** «Уютная кофейня, утро, неон» — картинка, которую «рисует» ИИ. */
export const CoffeeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steam = (i: number) => `M${190 + i * 22} 250 q -14 -26 0 -52 q 14 -26 0 -52`;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A0F52" />
          <stop offset="0.55" stopColor="#FF6B8B" />
          <stop offset="1" stopColor="#FFB36B" />
        </linearGradient>
        <radialGradient id="cs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF2B8" />
          <stop offset="1" stopColor="#FFF2B800" />
        </radialGradient>
        <filter id="cs-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill="#1B0E2E" />
      {/* окно */}
      <rect x="30" y="24" width="200" height="160" rx="10" fill="url(#cs-sky)" />
      <circle cx="150" cy="120" r="60" fill="url(#cs-sun)" />
      <path d="M30 150 L80 110 L120 140 L170 95 L230 140 L230 184 L30 184Z" fill="#3B1E5E" opacity="0.8" />
      <line x1="130" y1="24" x2="130" y2="184" stroke="#1B0E2E" strokeWidth="6" />
      <line x1="30" y1="104" x2="230" y2="104" stroke="#1B0E2E" strokeWidth="6" />
      {/* неоновая вывеска */}
      <g filter="url(#cs-glow)">
        <text x="252" y="70" fill="none" stroke={COLORS.pink} strokeWidth="3" fontSize="34" fontFamily={DISPLAY} fontWeight="900">
          CAFE
        </text>
        <path d="M262 95 h110" stroke={COLORS.cyan} strokeWidth="4" strokeLinecap="round" opacity={0.75 + 0.25 * Math.sin(frame / 3)} />
      </g>
      {/* растение */}
      <path d="M330 190 q -30 -40 -6 -80 M330 190 q 20 -50 40 -60 M330 190 q -4 -60 16 -90" stroke="#3FBF7F" strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="310" y="185" width="44" height="40" rx="6" fill="#FF6B00" />
      {/* стол */}
      <rect x="0" y="222" width="400" height="78" fill="#5A2E1C" />
      <rect x="0" y="222" width="400" height="8" fill="#7A4128" />
      {/* чашка */}
      <path d="M170 218 h80 v-40 q0 -30 -40 -30 q-40 0 -40 30z" fill="#FFFFFF" />
      <path d="M250 188 q28 0 28 18 q0 18 -28 18" stroke="#FFFFFF" strokeWidth="9" fill="none" />
      <ellipse cx="210" cy="150" rx="38" ry="8" fill="#6B3A1E" />
      <ellipse cx="210" cy="224" rx="62" ry="8" fill="#E9E1F5" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={steam(i)}
          stroke="#FFFFFFAA"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          transform={`translate(0 ${-((frame * 0.8 + i * 10) % 20)})`}
          opacity={0.7}
        />
      ))}
    </svg>
  );
};

/** «Фото» латте-арта. */
export const PhotoLatte: React.FC = () => (
  <svg viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
      <radialGradient id="pl-bg" cx="0.3" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#C89B72" />
        <stop offset="1" stopColor="#4A2A17" />
      </radialGradient>
      <radialGradient id="pl-cup" cx="0.5" cy="0.45" r="0.55">
        <stop offset="0" stopColor="#D9A36F" />
        <stop offset="0.7" stopColor="#8A4B22" />
        <stop offset="1" stopColor="#5B2E12" />
      </radialGradient>
    </defs>
    <rect width="300" height="300" fill="url(#pl-bg)" />
    <circle cx="150" cy="150" r="118" fill="#F4EEE8" />
    <circle cx="150" cy="150" r="98" fill="url(#pl-cup)" />
    <path d="M150 205 C 95 160, 105 105, 150 128 C 195 105, 205 160, 150 205Z" fill="#FBF3E6" />
    <path d="M150 180 C 120 155, 125 130, 150 142 C 175 130, 180 155, 150 180Z" fill="#B87844" />
    <ellipse cx="110" cy="95" rx="40" ry="14" fill="#ffffff30" transform="rotate(-30 110 95)" />
  </svg>
);

/** «Фото» кофейных зёрен. */
export const PhotoBeans: React.FC = () => (
  <svg viewBox="0 0 300 300" width="100%" height="100%">
    <rect width="300" height="300" fill="#2B160B" />
    {Array.from({length: 26}).map((_, i) => {
      const x = (i * 67) % 300;
      const y = ((i * 113) % 300) + ((i % 3) - 1) * 8;
      const r = (i * 47) % 180;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <ellipse rx="30" ry="21" fill={i % 2 ? '#6B3A1E' : '#80471F'} />
          <path d="M-24 0 C -8 -8, 8 8, 24 0" stroke="#2B160B" strokeWidth="4" fill="none" />
          <ellipse rx="12" ry="5" cx="-6" cy="-10" fill="#ffffff22" />
        </g>
      );
    })}
  </svg>
);

/** «Фото» интерьера кофейни. */
export const PhotoCafe: React.FC = () => (
  <svg viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
      <linearGradient id="pc-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F2D7B6" />
        <stop offset="1" stopColor="#C99A6B" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#pc-wall)" />
    {[60, 150, 240].map((x) => (
      <g key={x}>
        <line x1={x} y1="0" x2={x} y2="70" stroke="#3A2616" strokeWidth="3" />
        <path d={`M${x - 26} 100 L${x - 14} 70 h28 L${x + 26} 100z`} fill="#2E2A26" />
        <circle cx={x} cy="106" r="14" fill="#FFE7A3" />
        <circle cx={x} cy="106" r="40" fill="#FFE7A340" />
      </g>
    ))}
    <rect x="0" y="190" width="300" height="110" fill="#5E3A22" />
    <rect x="0" y="190" width="300" height="12" fill="#8A5A36" />
    {[40, 110, 190, 255].map((x, i) => (
      <g key={x}>
        <rect x={x} y={160 - (i % 2) * 12} width="26" height={30 + (i % 2) * 12} rx="4" fill={['#FF6B00', '#FFFFFF', '#2FA36B', '#FF2E93'][i]} />
      </g>
    ))}
  </svg>
);

/** Декоративные фоны слайдов (тематические). */
export const DecoBackground: React.FC<{variant: 0 | 1 | 2; t?: number}> = ({variant, t = 0}) => {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 160 90" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
        <rect width="160" height="90" fill="#3B1D0E" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M0 ${40 + i * 14} Q 40 ${28 + i * 14 + Math.sin(t / 10 + i) * 6} 80 ${40 + i * 14} T 160 ${40 + i * 14} V 90 H 0Z`}
            fill={['#6B3A1E', '#8A4B22', '#B8733F', '#E0A36B'][i]}
            opacity={0.9}
          />
        ))}
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 160 90" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
        <rect width="160" height="90" fill="#12052E" />
        {Array.from({length: 18}).map((_, i) => (
          <polygon
            key={i}
            points="0,-8 7,4 -7,4"
            fill={[COLORS.pink, COLORS.cyan, COLORS.lime][i % 3]}
            opacity={0.7}
            transform={`translate(${(i * 37) % 160} ${(i * 23) % 90}) rotate(${i * 40 + t * 3}) scale(${1 + (i % 3) * 0.6})`}
          />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
      <rect width="160" height="90" fill="#F6E7D3" />
      {Array.from({length: 30}).map((_, i) => (
        <g key={i} transform={`translate(${(i * 29) % 170} ${(i * 17) % 95}) rotate(${i * 33 + t})`}>
          <ellipse rx="5" ry="3.5" fill="#8A4B22" opacity="0.5" />
          <path d="M-4 0 C -1 -1.5, 1 1.5, 4 0" stroke="#F6E7D3" strokeWidth="0.8" fill="none" />
        </g>
      ))}
    </svg>
  );
};

/** Демо-логотип компании «КОФЕ ЛАБ». */
export const DemoLogo: React.FC<{size?: number; text?: string}> = ({size = 120, text = 'КОФЕ\nЛАБ'}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#1B0E2E',
      border: `${size * 0.05}px solid ${COLORS.lime}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: COLORS.lime,
      fontFamily: DISPLAY,
      fontWeight: 900,
      fontSize: size * 0.17,
      lineHeight: 1.05,
      textAlign: 'center',
      whiteSpace: 'pre-line',
      boxShadow: `0 ${size * 0.05}px ${size * 0.15}px #0008`,
    }}
  >
    <div style={{fontSize: size * 0.26, marginBottom: size * 0.02}}>☕</div>
    {text}
  </div>
);

/** Простая «базовая» картинка для сравнения Бесплатно / Premium. */
export const BasicImage: React.FC = () => (
  <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width="200" height="120" fill="#9AA7C7" />
    <circle cx="150" cy="35" r="16" fill="#E9EEF8" />
    <path d="M0 120 L60 60 L100 95 L140 70 L200 120Z" fill="#6E7BA0" />
  </svg>
);

/** Детализированная «премиум» картинка. */
export const PremiumImage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A0CA3" />
          <stop offset="0.5" stopColor="#F72585" />
          <stop offset="1" stopColor="#FFB703" />
        </linearGradient>
        <linearGradient id="pi-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7209B7" />
          <stop offset="1" stopColor="#240046" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#pi-sky)" />
      <circle cx="120" cy="62" r="26" fill="#FFE8A3" opacity="0.95" />
      {Array.from({length: 12}).map((_, i) => (
        <circle key={i} cx={(i * 53) % 200} cy={(i * 19) % 50} r={0.8 + (i % 3) * 0.5} fill="#fff" opacity={0.5 + 0.5 * Math.sin(frame / 4 + i)} />
      ))}
      <path d="M0 120 L40 55 L70 85 L110 40 L150 80 L175 60 L200 90 V120Z" fill="url(#pi-m)" />
      <path d="M0 120 L50 85 L90 105 L130 80 L200 110 V120Z" fill="#10002B" />
      <rect y="108" width="200" height="12" fill="#F7258566" />
    </svg>
  );
};
