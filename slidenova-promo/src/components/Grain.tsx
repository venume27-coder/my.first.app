import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config';

/** Плёночное зерно + лёгкая виньетка поверх всего видео. Зерно меняется каждый кадр. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.2}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg
        width={WIDTH / 2}
        height={HEIGHT / 2}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'scale(2)',
          transformOrigin: '0 0',
          opacity,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #00000000 55%, #00000066 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
