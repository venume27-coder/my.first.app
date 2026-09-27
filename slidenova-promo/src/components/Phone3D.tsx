import React from 'react';
import {Img, staticFile} from 'remotion';

export const PHONE_W = 560;
export const PHONE_H = 1160;

/**
 * 3D-макет телефона: толщина корпуса, мягкая тень и блик, который бежит
 * по стеклу в зависимости от угла поворота.
 */
export const Phone3D: React.FC<{
  x: number; // центр по X
  y: number; // центр по Y
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  children?: React.ReactNode;
  screenshot?: string | null; // путь в public/, если есть скриншот пользователя
}> = ({x, y, rotateX = 0, rotateY = 0, rotateZ = 0, scale = 1, children, screenshot}) => {
  const glare = 50 + rotateY * 2.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - PHONE_W / 2,
        top: y - PHONE_H / 2,
        width: PHONE_W,
        height: PHONE_H,
        perspective: 2600,
      }}
    >
      {/* тень на «полу» */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          bottom: -70,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, #000a 0%, #0000 70%)',
          transform: `scale(${scale}) translateX(${-rotateY * 3}px)`,
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        }}
      >
        {/* толщина корпуса */}
        {[18, 12, 6].map((z) => (
          <div
            key={z}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 92,
              background: z === 18 ? '#1a1030' : '#2c2346',
              transform: `translateZ(-${z}px)`,
              boxShadow: z === 18 ? '0 70px 140px #000b, 0 0 90px #7B2FF755' : undefined,
            }}
          />
        ))}
        {/* корпус */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 92,
            background: 'linear-gradient(145deg, #4b3f6b, #15102a 40%, #2d2450)',
            padding: 18,
            boxShadow: 'inset 0 0 0 3px #8a7fb0, inset 0 0 0 9px #0c0818',
          }}
        >
          {/* экран */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 76,
              overflow: 'hidden',
              background: '#000',
            }}
          >
            {screenshot ? (
              <Img src={staticFile(screenshot)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              children
            )}
            {/* динамический остров */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                width: 150,
                height: 42,
                marginLeft: -75,
                borderRadius: 30,
                background: '#000',
              }}
            />
            {/* блик */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(115deg, #ffffff00 ${glare - 18}%, #ffffff30 ${glare}%, #ffffff00 ${glare + 14}%)`,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
        {/* боковые кнопки */}
        <div style={{position: 'absolute', right: -7, top: 260, width: 8, height: 150, borderRadius: 4, background: '#3a3160'}} />
        <div style={{position: 'absolute', left: -7, top: 220, width: 8, height: 90, borderRadius: 4, background: '#3a3160'}} />
        <div style={{position: 'absolute', left: -7, top: 330, width: 8, height: 90, borderRadius: 4, background: '#3a3160'}} />
      </div>
    </div>
  );
};
