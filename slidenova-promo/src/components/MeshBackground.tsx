import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../config';

/**
 * Анимированный mesh-градиент: несколько цветных «пятен» плавают по кругу,
 * поверх — медленно вращающийся конический блик.
 */
export const MeshBackground: React.FC<{
  colors: readonly string[];
  speed?: number;
  base?: string;
  rays?: boolean;
}> = ({colors, speed = 1, base = COLORS.deep, rays = false}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * speed;

  const blobs = colors.map((c, i) => {
    const x = 50 + 42 * Math.sin(t * 0.7 + i * 1.9);
    const y = 50 + 44 * Math.cos(t * 0.5 + i * 2.4);
    const r = 48 + 12 * Math.sin(t * 0.9 + i * 1.3);
    return `radial-gradient(circle at ${x}% ${y}%, ${c} 0%, ${c}00 ${r}%)`;
  });

  return (
    <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: blobs.join(', ')}} />
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${frame * 1.2}deg at 50% 45%, #ffffff00, #ffffff22, #ffffff00 25%, #ffffff18 50%, #ffffff00 70%)`,
          mixBlendMode: 'overlay',
        }}
      />
      {rays ? (
        <AbsoluteFill
          style={{
            left: -600,
            top: -400,
            width: 2280,
            height: 2720,
            background: `repeating-conic-gradient(from ${frame * 0.8}deg at 50% 50%, #ffffff1c 0deg 8deg, #ffffff00 8deg 18deg)`,
            mixBlendMode: 'overlay',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
